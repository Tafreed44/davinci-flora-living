import asyncio, sys, base64, io
from playwright.async_api import async_playwright
from PIL import Image
JOBS = []
ids = "olive-leccino olive-vecchio olive-frantoio lemon-meyer bergamot fig-brown lavender-trio rosemary agave cypress pot-impruneta pot-cilindro combo-pair combo-terrace paint-calce paint-samples plaster-lime stucco-veneziano tile-zellige tile-esagono micro-kit tool-trowels tool-kit other-tray".split()
for i in ids: JOBS.append((f'p=product&id={i}&a=.8', 640, 800, f'3d-p-{i}'))
JOBS += [('p=still', 1600, 820, '3d-still'), ('p=olive', 900, 1000, '3d-olive'), ('p=materials', 1000, 760, '3d-materials')]
only = sys.argv[1:]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        for q, w, h, name in JOBS:
            if only and name not in only: continue
            pg = await b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=1)
            await pg.goto('http://localhost:8765/t3d.html?' + q + '&cap=1')
            await pg.wait_for_function('document.querySelector("#a").dataset.rendered', timeout=120000)
            data = await pg.evaluate('document.querySelector("#a canvas").toDataURL("image/png")')
            im = Image.open(io.BytesIO(base64.b64decode(data.split(',')[1]))).convert('RGBA')
            im.save(f'/home/claude/davinci/img/{name}.webp', 'WEBP', quality=84, method=6)
            print(name, im.size); await pg.close()
        await b.close()
asyncio.run(main())
