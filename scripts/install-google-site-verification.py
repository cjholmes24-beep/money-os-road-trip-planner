#!/usr/bin/env python3
"""Install explicit public Google ownership material; never generate or log a token."""
import argparse
from html.parser import HTMLParser
from pathlib import Path
import os
import re
import tempfile

ROOT = Path(__file__).resolve().parents[1]
NAME = re.compile(r'google[0-9a-f]{16}\.html\Z')
TOKEN = re.compile(r'[A-Za-z0-9_-]{32,128}\Z')
PLACEHOLDER = re.compile(r'placeholder|example|exact[_-]?google|your[_-]|token[_-]?here|changeme|dummy', re.I)


def validate_filename(name):
    if not isinstance(name, str) or not NAME.fullmatch(name):
        raise ValueError('Use the exact Google filename: google followed by 16 lowercase hexadecimal characters and .html; no path.')
    return name


def validate_content(name, content):
    validate_filename(name)
    expected = 'google-site-verification: ' + name
    if content not in (expected, expected + '\n', expected + '\r\n'):
        raise ValueError('HTML content must exactly match the Google verification marker and filename, with at most its original final newline.')
    return content.encode('utf-8')


def validate_token(token):
    if not isinstance(token, str) or not TOKEN.fullmatch(token) or PLACEHOLDER.search(token) or len(set(token)) < 8:
        raise ValueError('Supply the exact non-placeholder Google URL-safe meta value (32–128 characters); blank values, HTML and scripts are rejected.')
    return token


class Head(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.html = html
        self.offsets = [0]
        self.offsets += [m.end() for m in re.finditer('\n', html)]
        self.start = None
        self.end = None
        self.in_head = False
        self.tags = []
        self.head_count = 0
        self.feed(html)

    def absolute_position(self):
        line, column = self.getpos()
        return self.offsets[line - 1] + column

    def handle_starttag(self, tag, attrs):
        if tag == 'head':
            self.head_count += 1
            self.in_head = True
            self.start = self.absolute_position() + len(self.get_starttag_text())
        if tag == 'meta' and any(k == 'name' and v.lower() == 'google-site-verification' for k, v in attrs if v):
            if not self.in_head:
                raise ValueError('Existing verification tag is outside the homepage head.')
            if len([k for k, _ in attrs if k == 'content']) != 1 or len([k for k, _ in attrs if k == 'name']) != 1:
                raise ValueError('Existing verification meta content is ambiguous.')
            self.tags.append((self.absolute_position(), len(self.get_starttag_text()), dict(attrs).get('content')))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag):
        if tag == 'head':
            self.end = self.absolute_position()
            self.in_head = False


def meta_html(html, token):
    validate_token(token)
    parsed = Head(html)
    if parsed.head_count != 1 or parsed.start is None or parsed.end is None or parsed.start >= parsed.end:
        raise ValueError('Homepage must contain exactly one closed head.')
    if any(existing != token for _, _, existing in parsed.tags):
        raise ValueError('A different verification value already exists; resolve ownership deliberately before changing it.')
    if len(parsed.tags) == 1:
        return html
    if parsed.tags:
        # Preserve the first exact existing tag and all non-verification content.
        for start, length, _ in reversed(parsed.tags[1:]):
            html = html[:start] + html[start + length:]
        return html
    tag = '<meta name="google-site-verification" content="' + token + '">'
    return html[:parsed.start] + tag + html[parsed.start:]


def safe_target(root, name):
    root = Path(root).resolve(strict=True)
    target = root / name
    if target.is_symlink() or (target.exists() and not target.is_file()):
        raise ValueError('Refusing a symlink or non-file verification destination.')
    return target


def atomic_write(target, content):
    if target.exists() and target.read_bytes() == content:
        return False
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(dir=target.parent, prefix='.google-verification-', delete=False) as handle:
            temporary = Path(handle.name)
            handle.write(content)
        os.chmod(temporary, target.stat().st_mode & 0o777 if target.exists() else 0o644)
        os.replace(temporary, target)
        return True
    finally:
        if temporary and temporary.exists():
            temporary.unlink()


def install(root, *, html_file=None, html_content=None, meta_token=None, verify_only=False, published_root=None):
    if bool(html_file) == (meta_token is not None):
        raise ValueError('Choose exactly one HTML-file or meta-tag mode.')
    if html_file:
        content = validate_content(html_file, html_content)
        target = safe_target(root, html_file)
        if target.exists() and target.read_bytes() != content:
            raise ValueError('Existing file differs; refusing to overwrite another artifact.')
        mode = 'HTML file'
    else:
        validate_token(meta_token)
        target = safe_target(root, 'index.html')
        html = target.read_bytes().decode('utf-8')
        content = meta_html(html, meta_token).encode('utf-8')
        mode = 'homepage meta tag'
    if published_root and not verify_only:
        raise ValueError('Use --verify-only with --published-root to inspect an already produced static output.')
    if verify_only:
        if not target.exists() or target.read_bytes() != content:
            raise ValueError('Exact verification material is not installed in published source.')
        if published_root:
            published = safe_target(published_root, target.name)
            if html_file:
                if not published.exists() or published.read_bytes() != content:
                    raise ValueError('Exact HTML verification file is missing/different in static output.')
            else:
                parsed = Head(published.read_bytes().decode('utf-8'))
                if len(parsed.tags) != 1 or parsed.tags[0][2] != meta_token:
                    raise ValueError('Exact meta tag is missing/duplicated in static output.')
        return False, mode
    return atomic_write(target, content), mode


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--html-file')
    mode.add_argument('--meta-token')
    content = parser.add_mutually_exclusive_group()
    content.add_argument('--html-content')
    content.add_argument('--html-content-file', type=Path, help='Read the original downloaded contents without shell newline stripping.')
    parser.add_argument('--site-root', type=Path, default=ROOT)
    parser.add_argument('--verify-only', action='store_true')
    parser.add_argument('--published-root', type=Path)
    args = parser.parse_args()
    try:
        if args.meta_token is not None and (args.html_content is not None or args.html_content_file is not None):
            raise ValueError('HTML content is only valid in HTML-file mode.')
        supplied = args.html_content_file.read_bytes().decode('utf-8') if args.html_content_file else args.html_content
        changed, kind = install(args.site_root, html_file=args.html_file, html_content=supplied, meta_token=args.meta_token, verify_only=args.verify_only, published_root=args.published_root)
        print(('CHECKED' if args.verify_only else 'INSTALLED' if changed else 'UNCHANGED') + ': exact Google ' + kind + '; ownership/deployment/indexing are not asserted.')
    except (ValueError, OSError, UnicodeError) as error:
        parser.exit(1, 'BLOCKED: ' + str(error) + '\n')


if __name__ == '__main__':
    main()
