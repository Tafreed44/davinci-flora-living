/* DaVinci Flora & Living: photo slots (Version 1.2).
   Every image on the site has a slot here. A slot shows a labelled illustration until its photo files exist
   in img/ and its name is listed in `ready`.
   Files per slot: img/<slot>-<width>.webp (heroes: 800, 1600, 2400; others: 600, 1200).
   Heroes also have a mobile crop: img/<slot>-m-600.webp and img/<slot>-m-1200.webp.
   fx = focal point on desktop, fxm = focal point on phones (CSS object-position). */
window.DV_PHOTOS = {
  ready: {'flora-hero': 1, 'home-bridge': 1, 'home-door-flora': 1, 'home-door-living': 1, 'home-flora-detail': 1, 'home-flora-feature': 1, 'home-hero': 1, 'home-hero2': 1, 'home-living-detail': 1, 'home-living-feature': 1, 'living-hero': 1},
  slots: {
    'home-hero2': { hero: 1, fx: '58% 60%', fxm: '62% 70%', alt: 'A plant studio with orchids, potting tools and trailing pothos against an olive-green wall' },
    'home-hero': { hero: 1, fx: '50% 58%', fxm: '38% 55%', alt: 'Potted plants on warm wooden shelves with a linen apron and a straw hat, against a soft white wall' },
    'flora-hero': { hero: 1, fx: '50% 42%', fxm: '50% 45%', alt: 'A wooden shelf of flowering plants in pots against a red patterned wall' },
    'living-hero': { hero: 1, fx: '50% 50%', fxm: '45% 55%', alt: 'A dining room with a weathered lime-plaster wall, pale wooden floor and wooden chairs, seen through tall white doors' },
    'workshops-hero': { hero: 1, fx: '68% 50%', fxm: '60% 50%', alt: 'Hands at a workshop table with plaster samples, colour swatches and olive cuttings' },

    'home-door-flora': { fx: '40% 38%', alt: 'Ripe oranges on a citrus tree against a soft cloudy sky' },
    'home-door-living': { fx: '45% 52%', alt: 'An arched entrance with a cream door, a curved stone balustrade and potted plants on the steps' },
    'home-bridge': { fx: '48% 62%', alt: 'A rosemary plant in a metal pot beside bottles of olive oil, with an olive branch, on a wooden table' },
    'home-flora-feature': { fx: '50% 48%', alt: 'A gardener in a straw hat potting succulents and other plants at a sunny outdoor table' },
    'home-living-feature': { fx: '51% 50%', alt: 'A living room with a cream panelled wall, dark navy mouldings, brass wall lights and a light linen sofa' },
    'home-flora-detail': { fx: '52% 58%', alt: 'A money tree in a pale blue pot on a sunny wooden table with a watering can and pruning shears' },
    'home-living-detail': { fx: '50% 55%', alt: 'A fan palm in an engraved green pot against a pink plaster wall with green zellige tiles' },
    'home-nextstep': { fx: '50% 50%', alt: 'A styled corner with an olive tree and plastered wall' },
    'flora-care': { alt: 'Pruning an olive tree in winter light' },

    'projects-hero': { hero: 1, fx: '50% 55%', fxm: '50% 60%', alt: 'A stone loggia opening onto a garden of olive trees' },
    'projects-cta': { fx: '50% 45%', alt: 'An olive tree in a courtyard in late light' },
    'project-p1-b': { alt: 'Lime plaster wall, detail' }, 'project-p2-b': { alt: 'Aged terracotta pots, detail' },
    'project-p3-b': { alt: 'Microcement surface, detail' },

    'showroom-hero': { hero: 1, fx: '45% 50%', fxm: '35% 55%', alt: 'Inside the DaVinci showroom: material samples, a long table and olive trees', label: 'Illustration · showroom photo to come' },
    'showroom-flora': { alt: 'Olive and citrus trees in the showroom', label: 'Illustration · showroom photo to come' },
    'showroom-living': { alt: 'The material wall with plaster and tile samples', label: 'Illustration · showroom photo to come' },
    'showroom-table': { alt: 'The workshop table in the showroom', label: 'Illustration · showroom photo to come' },
    'advice-plants': { alt: 'Choosing an olive tree' }, 'advice-materials': { alt: 'Tile and plaster samples' },
    'advice-colour': { alt: 'Paint colour swatches' }, 'advice-finishes': { alt: 'A decorative lime plaster finish' },
    'advice-projects': { alt: 'A finished interior with a plant' },

    'cat-flora-olive': { alt: 'Olive trees' }, 'cat-flora-citrus': { alt: 'Citrus and fruit trees' },
    'cat-flora-mediterranean': { alt: 'Mediterranean plants' }, 'cat-flora-pots': { alt: 'Terracotta pots and planters' },
    'cat-flora-combos': { alt: 'Plants paired with pots' },
    'cat-living-paint': { alt: 'Mineral paint colours' }, 'cat-living-finishes': { alt: 'Decorative plaster wall finishes' },
    'cat-living-tiles': { alt: 'Tiles and microcement' }, 'cat-living-tools': { alt: 'Trowels and application tools' },
    'cat-living-other': { alt: 'Interior objects in stone' },

    'project-p1': { fx: '50% 50%', alt: 'A lime-washed living room with a terracotta floor and an olive tree by the window' },
    'project-p2': { fx: '50% 50%', alt: 'A courtyard with three olive trees in aged terracotta' },
    'project-p3': { fx: '50% 50%', alt: 'A seamless microcement bathroom with a travertine shelf' },
    'project-p4': { fx: '50% 50%', alt: 'A garden room with lemon trees against a warm mineral wall' },

    'workshop-w-olive': { alt: 'Pruning an olive tree in a workshop' },
    'workshop-w-plaster': { alt: 'Trowelling lime plaster onto a sample board' },
    'workshop-w-colour': { alt: 'Comparing paint colour samples in daylight' },
    'workshop-w-styling': { alt: 'Styling a room with plants and pots' },
    'workshop-w-micro': { alt: 'Applying microcement with a steel trowel' },
    'workshop-w-terrace': { alt: 'Planting a terrace with Mediterranean plants' }
  }
};
