# MAMBA STRIKE MMA

Static site for **MAMBA STRIKE** — MMA / Striking / Grappling / Self-Defense training center in Afula, Israel.

Head coach: Yotam Zafrani.

## Stack

Zero-build static HTML/CSS/JS. Deployed on **GitHub Pages** from `main` / root.

- `index.html` — single-page site (Hebrew RTL)
- `styles/` — design tokens + component CSS
- `app.js` — vanilla-JS interactions (scroll bar, mobile menu, reveal-on-scroll, FAQ accordion, contact form → WhatsApp handoff)
- `assets/` — photography, logo, favicon
- `CNAME` — binds the mambastrike.co.il custom domain. Required by Pages; deleting it drops the site back to the default github.io host.
- `.nojekyll` — skips Jekyll processing on deploy
- `vercel.json` — leftover from an earlier Vercel setup. Pages does not read it and does not support custom headers at all, so its cache rules are inert. Asset versioning is done with `?v=` query strings on the CSS/JS links instead.

## Local dev

```bash
python3 -m http.server 4321 --bind 127.0.0.1
```

Then open http://127.0.0.1:4321/

## Contact

- Address: המגל 9, עפולה
- Phone: 052-447-9512
- WhatsApp: <https://wa.me/972524479512>
- Trial booking: <https://letts.co.il/payment/L3hwazRqajlrZ2l1L0EwcWF5SWk5dz09>
