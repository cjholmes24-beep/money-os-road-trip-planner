"""Synthetic ownership fixtures only; never install a real token in the repository."""
import importlib.util
from pathlib import Path
import tempfile
import subprocess
import sys
import unittest

spec = importlib.util.spec_from_file_location('installer', Path(__file__).resolve().parents[1] / 'scripts/install-google-site-verification.py')
I = importlib.util.module_from_spec(spec)
spec.loader.exec_module(I)
NAME = 'google9c2e7a40d6b18f35.html'
TOKEN = 'TestOnly_9c2E7a40D6b18F35qWzYpLkN8xU0rV2tA7m'
HTML = '<!doctype html><html><head>\n<title>Preserve me</title></head><body>Original content</body></html>'

class VerificationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / 'index.html').write_bytes(HTML.encode())

    def test_valid_filename(self):
        self.assertEqual(I.validate_filename(NAME), NAME)

    def test_bad_filenames(self):
        for value in ['', '../' + NAME, '/tmp/' + NAME, 'other.html', 'googleabc.html', NAME + '/x', 'google<script>.html']:
            with self.subTest(value=value), self.assertRaises(ValueError):
                I.validate_filename(value)

    def test_bad_tokens(self):
        for value in ['', ' ', 'EXACT_GOOGLE_VALUE', 'your_google_token_placeholder_value_here', 'a'*43, '<script>alert(1)</script>' + 'x'*32, TOKEN + '"', TOKEN + '\n']:
            with self.subTest(value=value), self.assertRaises(ValueError):
                I.install(self.root, meta_token=value)
        self.assertEqual((self.root/'index.html').read_text(), HTML)

    def test_exact_file_bytes_and_idempotence(self):
        for newline in ['', '\n', '\r\n']:
            with tempfile.TemporaryDirectory() as root:
                content = 'google-site-verification: ' + NAME + newline
                self.assertTrue(I.install(root, html_file=NAME, html_content=content)[0])
                self.assertEqual((Path(root)/NAME).read_bytes(), content.encode())
                self.assertFalse(I.install(root, html_file=NAME, html_content=content)[0])
                self.assertEqual([p.name for p in Path(root).iterdir()], [NAME])

    def test_bad_file_contents(self):
        for value in [None, '', '<script>alert(1)</script>', 'google-site-verification: other.html', 'google-site-verification: '+NAME+'\n\n']:
            with self.subTest(value=value), self.assertRaises(ValueError):
                I.install(self.root, html_file=NAME, html_content=value)
        self.assertFalse((self.root/NAME).exists())

    def test_meta_once_preserves_other_content(self):
        self.assertTrue(I.install(self.root, meta_token=TOKEN)[0])
        result = (self.root/'index.html').read_text()
        tag = '<meta name="google-site-verification" content="'+TOKEN+'">'
        self.assertEqual(result.count(tag), 1)
        self.assertEqual(result.replace(tag, ''), HTML)
        self.assertFalse(I.install(self.root, meta_token=TOKEN)[0])

    def test_duplicate_same_tags_repaired(self):
        tag = '<meta name="google-site-verification" content="'+TOKEN+'">'
        result = I.meta_html(HTML.replace('<head>', '<head>'+tag+tag), TOKEN)
        self.assertEqual(result.count(tag), 1)
        self.assertEqual(result.replace(tag, ''), HTML)

    def test_other_owner_refused(self):
        html = I.meta_html(HTML, TOKEN)
        with self.assertRaises(ValueError):
            I.meta_html(html, TOKEN[::-1])

    def test_outside_head_and_malformed_head(self):
        tag = '<meta name="google-site-verification" content="'+TOKEN+'">'
        for html in [HTML.replace('<body>', '<body>'+tag), '<html>no head</html>', HTML.replace('</head>', ''), HTML.replace('<head>', '<head><head>')]:
            with self.subTest(html=html), self.assertRaises(ValueError):
                I.meta_html(html, TOKEN)

    def test_symlink_rejected(self):
        (self.root/NAME).symlink_to(self.root/'index.html')
        with self.assertRaises(ValueError):
            I.install(self.root, html_file=NAME, html_content='google-site-verification: '+NAME)
        self.assertEqual((self.root/'index.html').read_text(), HTML)

    def test_modes_exclusive(self):
        with self.assertRaises(ValueError):
            I.install(self.root, html_file=NAME, html_content='', meta_token=TOKEN)
        with self.assertRaises(ValueError):
            I.install(self.root)

    def test_static_output_file_verification(self):
        content = 'google-site-verification: '+NAME
        I.install(self.root, html_file=NAME, html_content=content)
        with tempfile.TemporaryDirectory() as output:
            with self.assertRaises(ValueError):
                I.install(self.root, html_file=NAME, html_content=content, verify_only=True, published_root=output)
            (Path(output)/NAME).write_bytes(content.encode())
            self.assertFalse(I.install(self.root, html_file=NAME, html_content=content, verify_only=True, published_root=output)[0])

    def test_static_output_meta_verification(self):
        I.install(self.root, meta_token=TOKEN)
        with tempfile.TemporaryDirectory() as output:
            page = Path(output)/'index.html'
            page.write_text(HTML)
            with self.assertRaises(ValueError):
                I.install(self.root, meta_token=TOKEN, verify_only=True, published_root=output)
            page.write_bytes((self.root/'index.html').read_bytes())
            self.assertFalse(I.install(self.root, meta_token=TOKEN, verify_only=True, published_root=output)[0])

    def test_ambiguous_existing_attributes_rejected(self):
        for attrs in ['name="robots" name="google-site-verification"', 'name="google-site-verification" content="other"']:
            with self.subTest(attrs=attrs), self.assertRaises(ValueError):
                I.meta_html(HTML.replace('<head>', '<head><meta '+attrs+' content="'+TOKEN+'">'), TOKEN)

    def test_cli_fail_closed_without_echoing_material(self):
        script = str(Path(I.__file__))
        invalid = TOKEN + '<script>'
        result = subprocess.run([sys.executable, script, '--site-root', str(self.root), '--meta-token', invalid], capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn(invalid, result.stdout + result.stderr)
        self.assertEqual((self.root/'index.html').read_text(), HTML)

    def test_output_check_cannot_modify(self):
        with self.assertRaises(ValueError):
            I.install(self.root, meta_token=TOKEN, published_root=self.root)
        self.assertEqual((self.root/'index.html').read_text(), HTML)

if __name__ == '__main__':
    unittest.main()
