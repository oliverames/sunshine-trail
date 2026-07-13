## 2026-07-13 - Public release readiness pass

**What changed**: Added hosted Playwright and secret-scan CI, corrected package metadata to `UNLICENSED`, documented the reuse boundary, restored visible OpenStreetMap and CARTO attribution, and added a private security reporting policy. The site metadata now identifies Oliver Ames as the author and labels the work as an independent concept. The prototype form no longer asks for location or claims to submit data, modeled impact figures are labeled as projections, and unsourced first-person testimonials were removed. Two images with explicit restrictive metadata were removed from the current tree.

**Verification target**: Run the maintained Playwright feature suites locally and on representative phone, tablet, and desktop projects in GitHub Actions. Scan the current tree and full history with gitleaks, then confirm the custom-domain Pages deployment serves the new commit over HTTPS.

**Release boundary**: This repository is not open source. Third-party brand assets and photographs still need a complete permission or replacement review before production or commercial use. Earlier copies also remain in Git history, which was not rewritten during this pass.

---

## 2026-06-02 - Restore GitHub Pages domain DNS

**What changed**: Restored Cloudflare DNS for `thesunshinetrail.com` so GitHub Pages can verify and serve the custom domain. Added the missing GitHub Pages ownership TXT record, then added GitHub Pages routing records for the apex domain and `www`.

**Decisions made**: Kept all Cloudflare routing records DNS-only (`proxied: false`) with TTL `3600`, matching GitHub Pages guidance. Used apex `A` and `AAAA` records plus `www.thesunshinetrail.com CNAME oliverames.github.io`.

**Left off at**: GitHub Pages API reports `protected_domain_state: verified` and HTTPS certificate `approved`. Cloudflare authoritative DNS and `1.1.1.1` return the expected TXT, A, AAAA, and CNAME records. `https://thesunshinetrail.com/` returns `HTTP/2 200` and `https://www.thesunshinetrail.com/` redirects to the apex when bypassing the local resolver cache.

**Open questions**: Local macOS/router DNS still had a stale NXDOMAIN cache immediately after the records were created. Public Cloudflare DNS was already correct; plain local resolution should recover as caches expire.

---
