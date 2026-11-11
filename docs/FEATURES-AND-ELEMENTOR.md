# DaVinci Flora & Living: new features and the future Elementor rebuild

This note covers the three features added in November 2026: the flower vending machine, the monthly flower subscription and the Christmas promotion.

## Where everything lives

| Part | File |
|---|---|
| Christmas promotion settings (on/off, dates, text, offer, button) | `js/promo-config.js` |
| Vending machine, subscription and promotion: content, layout and behaviour | `js/features.js` |
| Styling for all three | `css/features.css` |
| Photo slots (`vend-*`, `subs-feature`, `vending-machine`) | `js/photos.js` |

`js/app.js` only calls the features in a few places (homepage sections, two routes, `FX.mount`). Remove `features.js`, `features.css` and `promo-config.js` from `index.html` and the site works exactly as before.

## Homepage order

1. Hero (unchanged)
2. **Christmas sale banner** (only when the promotion is on)
3. Two rooms, one house … From the garden and the rooms (unchanged)
4. **Flower vending machine section** → button "Choose your flowers" → `#vending`
5. **Flower subscription section**: moved to the Flora page, below the products → button "Explore our plans" → `#subscriptions`
6. Workshops, then one Projects section (feature room + three listed rooms, button to all projects). The former "Your next step" cards were merged into it.

## Christmas promotion: switching it on and off

Open `js/promo-config.js`:

- `active: false` removes the banner and the popup. No empty space is left.
- `start` / `end` (`'2026-12-01'` format) show the promotion only between those dates. `null` means no limit.
- `banner` and `popup` hold all text. Anything in `[square brackets]` is shown as a highlighted placeholder.
- `popup.cta.href` is where the button goes (now `#flora`; point it to a sale collection when one exists).
- `popup.image`: the key of a photo slot to use instead of the drawn wreath.
- `autoOpen` (off by default) opens the popup once by itself, then not again for `frequencyDays` days.
- For a future promotion, change `id` and `theme`, then copy the `.promo--christmas` colour block in `css/features.css`.

## What is a demo or a placeholder

- **Vending machine:** the 10 flowers are samples cut from the flower-shelf photo, and the prices are examples. No payment is taken, stock is not live, the machine is not connected, and no collection code is generated. The location and collection window show "to be confirmed". The machine drawing is replaced by a real photo when the `vending-machine` slot has files.
- **Subscriptions:** the plans are Tavolo, Salotto and Ingresso. Price, flower quantity, delivery method and some benefits are placeholders. The "Let me know" form saves nothing.
- **Christmas sale:** the discount, products, dates and message are placeholders.

## What will need a plugin or integration

| Feature | Needs |
|---|---|
| Vending checkout | WooCommerce + a payment provider (e.g. Mollie for iDEAL and cards) |
| Vending stock, compartment reservation, collection code | The vending machine supplier's API or plugin; a small custom integration that runs after payment |
| Collection email | WooCommerce emails (or the machine supplier's system) |
| Subscriptions with recurring payment | WooCommerce Subscriptions (or similar) + a payment provider that supports recurring payments |
| Pausing or cancelling a subscription | The customer account from the subscription plugin |
| "Let me know" email capture | A form plugin or the newsletter tool |
| Christmas popup | Elementor Pro Popup Builder (display conditions, dates and frequency are built in) |

## Rebuilding in Elementor

Every new section is one independent block with a flat structure that maps to standard widgets:

- **Christmas banner** = one Container (dark background) holding Image (sprig), Heading, Text and Button. The button opens an Elementor Popup.
- **Christmas popup** = Elementor Popup with two columns: Image on the left; Heading, Text, a bordered inner Container for the offer, Button and small Text on the right.
- **Vending section (homepage)** = two-column Container: Image (machine photo) on one side; Heading, Text, an Icon List or three small Containers (Choose / Pay / Collect) and a Button on the other.
- **Subscription section (homepage)** = two-column Container: Heading, Text, Icon List (3 points), Button; Image with an arch mask, a second small Image and a circular badge.
- **Vending page** = a WooCommerce product grid (Loop Grid) with quantity buttons and a mini-cart in a sticky column, followed by the WooCommerce checkout and the thank-you page holding the collection steps. The drawn machine and the step indicator are the only custom parts (use an Image and a simple Container row).
- **Subscriptions page** = three Containers side by side (Image group, Heading, Text, Price, an Icon List of details, Button). Each plan button adds that subscription product to the basket.

Colours, fonts and spacing use the same tokens as the rest of the site (ivory, cream, linen, olive, clay; Fraunces, Hanken Grotesk, DM Mono). Set these once as Elementor Global Colours and Global Fonts. Hover effects are simple CSS (lift, image zoom, shine) and can be recreated with Elementor's motion and hover settings or a few lines of custom CSS.
