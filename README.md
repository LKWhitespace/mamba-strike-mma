# MAMBA STRIKE MMA

Static site for **MAMBA STRIKE** — MMA / Striking / Grappling / Self-Defense training center in Afula, Israel.

Head coach: Yotam Zafrani.

## Stack

Zero-build static HTML/CSS/JS. Deployed on **GitHub Pages** from `main` / root.

- `index.html` — single-page site (Hebrew RTL)
- `accessibility.html` — הצהרת נגישות (linked from the footer of every page)
- `privacy.html` — מדיניות פרטיות (linked from the footer and from the contact form)
- `robots.txt` / `sitemap.xml` — both were 404 before; the sitemap lists the three pages
- `academy/` — the Academy course site, served at `mambastrike.co.il/academy/`. Vendored
  from the `mamba-strike-academy` repo, which was previously deployed on its own Vercel
  host. Its asset paths were rewritten from root-absolute (`/assets/…`) to **relative**
  (`assets/…`) so the folder works at any mount point; keep them relative or the page
  breaks the moment it is not at a domain root. Its canonical and OG urls point at
  `https://mambastrike.co.il/academy/`.
  **This copy is the one that ships.** Edits made in the `mamba-strike-academy` repo do
  not reach the live site — either treat this folder as the source of truth, or re-vendor
  from there and re-run the path rewrite.
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

## Analytics (not live yet)

`app.js` pushes one `window.dataLayer` event per conversion tap, delegated off the
link's href, so no markup attributes are needed:

| event | fires on |
| --- | --- |
| `ms_trial_click` | any link to the letts.co.il trial booking |
| `ms_whatsapp_click` | any `wa.me` link (header, hero, cards, coach, CTA block, FAB) |
| `ms_phone_click` | any `tel:` link |
| `ms_waze_click` / `ms_map_click` / `ms_gbp_click` | the Waze, Google Maps and Google Business Profile links |
| `ms_form_submit` | the contact form, on successful validation |

With no tag on the page these just queue in the array and nothing leaves the
browser. To start reporting: put the real GA4 Measurement ID into the commented
gtag block at the bottom of `index.html` and uncomment it. Google Search Console
needs the property verified separately (DNS TXT record, or the meta tag GSC
issues, pasted into `<head>`).

## Content rules that must not regress

Client-approved wording — do not "improve" these back:

- The coach bio in `#coach` is supplied verbatim by the client, with one deletion
  the client asked for afterwards ("והקרב מגע"). No shortening, no re-ordering, no
  credentials/achievements chips alongside it.
- The only approved phrasing for the מג״ב role is **ראש תחום הלחימה הקרובה במג״ב**.
  Never "קצין לחימה קרובה בכיר לשעבר".
- The trial session is **not free**: 50 ₪, credited on joining. That is stated next
  to both "קבע אימון ניסיון" buttons and in the FAQ, and must stay consistent with
  the share card. No copy may say "אימון ניסיון חינם".
- **"קרב מגע" appears nowhere on the site** — not as a marketing label (title, meta,
  share card, splash, schema) and not in the bio.
- Group cap is 16, not 12.
- "למחוק את הפחדים" must not come back.

## Contact

- Address: המגל 9, עפולה
- Phone: 052-447-9512
- WhatsApp: <https://wa.me/972524479512>
- Trial booking: <https://letts.co.il/payment/L3hwazRqajlrZ2l1L0EwcWF5SWk5dz09>
