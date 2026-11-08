# DaVinci Flora & Living: website prototype

A static site (HTML, CSS and JavaScript). No build step, no server.

## Folders
- index.html: the page shell
- css/site.css: all styles (design tokens at the top)
- js/data.js: example products, workshops, projects
- js/photos.js: every image slot, its focal points, and the `ready` list
- js/art.js: the placeholder illustrations
- js/app.js: pages, basket, forms, animations
- tools/prepare_photos.py: turns your photos into the site's image files (not deployed)

## Adding photos
1. Name each photo by its slot, for example `projects-hero.jpg`, and put them in one folder.
2. Run: `python3 tools/prepare_photos.py <photo folder> .` (needs Pillow: `pip install pillow`)
3. This creates `img/` and switches those slots on in `js/photos.js`. Deploy again.

## Search engines
`vercel.json` tells search engines not to index the site while it is a prototype
(example products and prices). Delete the X-Robots-Tag block before launch.

## 3D studio (Version 3)
- js/studio3d.js builds the 3D product scenes in the browser (three.js, in js/vendor).
  It only loads on pages that show 3D; without WebGL the site shows the still renders instead.
- img/3d-*.webp are still renders of those scenes, used on product cards and as fallbacks.
  When a real photo for a product is added (p-<id>-1 via tools/prepare_photos.py), it replaces the render automatically.
- To re-render the stills after changing a scene: serve this folder locally (python3 -m http.server 8765),
  then run tools/render_3d_posters.py (needs Python Playwright). It writes into img/.
- Everything in 3D is an illustrative render of the product type, not the actual product.
