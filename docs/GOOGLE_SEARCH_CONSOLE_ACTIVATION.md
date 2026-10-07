# Google Search Console activation

Property (URL-prefix, including the trailing slash):
**https://cjholmes24-beep.github.io/money-os-road-trip-planner/**

Use this exact project path. Do not use `sc-domain:github.io` or claim ownership of `github.io`. At task start, the owner reports GSC Wizard connected but zero Google properties; registration returned “Site not found in your Google Search Console account. Add it to GSC first, then retry.” No property, ownership, indexing or metrics are claimed by this repository.

1. In the intended Google account, add the exact URL-prefix property above. Google account ownership/OAuth verification is the external account step Codex cannot perform.
2. Select HTML file or HTML tag verification. Obtain the **actual** file/content or meta `content` value from Google. The installer never generates it.
3. On a task branch, from the repository root, run one installation command using Google's material. For a downloaded file, supply its filename and original downloaded bytes:

   ```bash
   read -r google_filename
   python3 scripts/install-google-site-verification.py --html-file "$google_filename" --html-content-file /tmp/google-verification-download.html
   ```

   Alternatively, supply the exact meta value, not the whole tag:

   ```bash
   read -r -s google_token
   python3 scripts/install-google-site-verification.py --meta-token "$google_token"
   unset google_token
   ```

   `--html-content` also accepts the exact marker as explicit CLI input. Downloaded-file mode preserves LF/CRLF without shell newline stripping. Never run with an illustrative or guessed value.
4. Run `node scripts/check-google-indexing-readiness.js`, the installer regression tests and `git diff --check`. Review and commit **only** the root Google file or homepage meta change, through a separate PR. No artifact is currently installed. This task does not merge or deploy.
5. After authorized review/merge and successful GitHub Pages deployment, confirm the published material. The repository root maps to the project URL above; do not create an extra `money-os-road-trip-planner/` directory. A root `google…html` file must return HTTP 200 at that property's project path with exact original bytes. Meta verification must appear once in the delivered homepage head. Neither artifact belongs in the sitemap or navigation.
6. To check an actual built static output directory, repeat the same installer arguments with `--verify-only --published-root /path/to/built/site`. Missing/different output fails closed; this reads existing output and makes no changes. For live HTML-file delivery, download the project URL file and compare its bytes with the original using `cmp`; do not execute any page scripts. For meta mode, download the homepage into a temporary output directory as `index.html`, then use `--verify-only --published-root` with the original token. Do not print the value unnecessarily.
7. Click **Verify** in Google. Only Google's successful response establishes ownership. Then follow [post-verification operations](GSC_POST_VERIFICATION_ACTIONS.md) in GSC Wizard.

The local installer is the supported one-action installation path. An optional write-enabled dispatch workflow is intentionally omitted: local input avoids workflow-input logging and automatically committing to main. Nothing scheduled installs or guesses verification material. Repeat installs are unchanged; identical duplicate meta tags are reduced to one; a different existing owner value is refused. Filenames, content and meta tokens are strictly validated before writes, including traversal/injection/symlink rejection. All other homepage bytes are preserved.

Sitemap: **https://cjholmes24-beep.github.io/money-os-road-trip-planner/sitemap.xml**

`node scripts/check-google-indexing-readiness.js --live --json` audits public HTML, HTTP responses, sitemap and robots without executing JavaScript, affiliate clicks or Google account operations. Google checks the origin `/robots.txt`; the project robots file additionally declares our sitemap. Origin HTTP 404 means no robots restrictions, not proof of indexing. Readiness checks cannot guarantee Google's crawl schedule or search visibility. Owner cost introduced: **$0**.
