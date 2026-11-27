# NextYou storefront

Local storefront reconstruction using NextYou's supplied product imagery and source-site content, with Seed-inspired section staging. Run `npm install`, then `npm run dev`. Build with `npm run build`. Deploy `dist` to static hosting.

The storefront connects to the existing NextYou Supabase project. The bag remains a local preview; live payment processing and dispatch are not connected.

## Commerce CMS

Open `/admin` on the local site to sign in to NextYou Studio. Use an account already listed as an administrator in Supabase. An owner or administrator can invite staff from **Team access**; the invitation is sent through Supabase Auth and the invite role is applied after the invited email is confirmed.

The CMS includes overview reporting, product and category editing, variants, product SEO, image uploads, stock adjustments with an audit ledger, orders and partial shipments, customer records, discount codes, shipping zones, homepage copy, pages, journal articles, FAQs, review moderation, business settings, and role-based staff access.

The schema is versioned in `supabase/migrations/20261127090000_cms_foundation.sql`. The authenticated commerce API source is in `supabase/functions/store-api`. The CMS uses a publishable key and Supabase Auth; the service-role key stays inside the Edge Function runtime. RLS policies protect CMS tables and the media bucket.

The product page, product cards, article routes, FAQs, and custom content pages read published content from Supabase. Netlify's `public/_redirects` keeps the `/admin` route available on static hosting. Optional local overrides are in `.env.local`; see `.env.example`.

Checkout intentionally stays disabled because no payment provider is configured. Add a payment integration, webhook verification, carrier labels/rates, and a production test order before accepting real orders. Current shipping-zone rules and shipment tracking records are managed in the CMS.

## Review graph workflow

The project MCP configuration registers `uvx code-review-graph serve`. Restart the MCP client to load it. CLI access works immediately. Run `npm run graph:build` initially, `npm run graph:update` after each change, and `npm run graph:review` for change impact before handoff. Use `uvx code-review-graph architecture` and `uvx code-review-graph query --help` for targeted inspection. Graph output is ignored by Git.

## Asset provenance and remaining fidelity work

Logo, bottle and box images are user-supplied. `ritual.mp4` comes from the user's original Netlify site's public assets. The hero, revolving bottle, and upright capsule clips were generated in the user's logged-in Google Flow project. The revolving clip plays only on hover or keyboard focus over the product, resets on leave or blur, and toggles on touch. The capsule breakdown uses a transparent VP9 cutout and its progress follows scroll. `circaden-packaging-film.mp4` is a separate motion edit from the supplied box and bottle photos; this keeps the label legible in close-ups. `science-profile.webp` and `evening-ritual.webp` are original generated editorial images. Flow project: https://flow.google.com/u/1/project/c0bc3790-02d7-46d4-abcb-22baefc8dab9 .

The page uses measured reference geometry in `docs/reference-audit.md`, with one product as requested. Only NextYou bottle, box, logo and original-site assets are used; reference screenshots are not used in the site. Exact visual parity is still limited by different brand typography and the absence of NextYou testimonials. Seed's promotions, probiotic claims, reviews and catalogue were not applied to CIRCADEN.

The CIRCADEN product gallery includes a separate Flow studio film, manually downloaded by the user and saved as circaden-studio.mp4. It is available only through the Studio film gallery option. Its small generated label lettering is not authoritative; the supplied product photograph remains the default. Audio was removed and MP4 streaming metadata moved to the start; the generated video frames were preserved.
