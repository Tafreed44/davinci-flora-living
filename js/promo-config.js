/* =====================================================================
   SEASONAL PROMOTION: the one place to switch it on, off or change it.
   ---------------------------------------------------------------------
   - active: false   hides the homepage banner and the popup completely.
                     Nothing else on the page changes and no empty space is left.
   - start / end:    optional dates (YYYY-MM-DD). Outside them the promotion hides
                     itself. Leave as null for "no date limit".
   - theme:          'christmas' today. A future promotion can reuse this file with
                     another theme name (css/features.css has a .promo--<theme> block).
   - image:          optional photo slot key from js/photos.js. Empty = the drawn
                     evergreen wreath is shown instead.
   - autoOpen:       false = the popup only opens when someone clicks the banner.
                     true  = it also opens once on the homepage after `autoOpenDelay`
                     milliseconds, then not again for `frequencyDays` days.
   Text in [square brackets] is placeholder copy until DaVinci confirms the offer.
   ===================================================================== */
window.DV_PROMO = {
  active: true,
  id: 'christmas-2026',
  theme: 'christmas',
  start: null,
  end: null,
  autoOpen: false,
  autoOpenDelay: 6000,
  frequencyDays: 7,
  banner: {
    eyebrow: 'Christmas at DaVinci',
    text: 'Olive and lemon trees that outlive the holidays.',
    note: '[Offer details to be confirmed]',
    button: 'See the offer'
  },
  popup: {
    eyebrow: 'Christmas at DaVinci',
    title: 'The Christmas tree <em>you keep</em>',
    message: 'Olive and lemon trees to dress with lights this December and enjoy all year.',
    offer: '[Discount to be confirmed]',
    offerNote: 'on [selected products to be confirmed]',
    dates: '[Sale dates to be confirmed]',
    terms: 'Placeholder offer. Final discount, products and dates are confirmed before the sale starts.',
    image: '',
    cta: { label: 'Shop the Christmas selection', href: '#flora' }
  }
};
