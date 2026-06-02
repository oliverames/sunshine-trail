## 2026-06-02 - Restore GitHub Pages domain DNS

**What changed**: Restored Cloudflare DNS for `thesunshinetrail.com` so GitHub Pages can verify and serve the custom domain. Added the missing GitHub Pages ownership TXT record, then added GitHub Pages routing records for the apex domain and `www`.

**Decisions made**: Kept all Cloudflare routing records DNS-only (`proxied: false`) with TTL `3600`, matching GitHub Pages guidance. Used apex `A` and `AAAA` records plus `www.thesunshinetrail.com CNAME oliverames.github.io`.

**Left off at**: GitHub Pages API reports `protected_domain_state: verified` and HTTPS certificate `approved`. Cloudflare authoritative DNS and `1.1.1.1` return the expected TXT, A, AAAA, and CNAME records. `https://thesunshinetrail.com/` returns `HTTP/2 200` and `https://www.thesunshinetrail.com/` redirects to the apex when bypassing the local resolver cache.

**Open questions**: Local macOS/router DNS still had a stale NXDOMAIN cache immediately after the records were created. Public Cloudflare DNS was already correct; plain local resolution should recover as caches expire.

---
