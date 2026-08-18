from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

sources = [
    Path(r"D:\BaiduNetdiskDownload\良辰集无水印最终版"),
    Path(r"D:\BaiduNetdiskDownload\禧棠"),
]
files = [
    path
    for source in sources
    for path in sorted(source.iterdir())
    if path.suffix.lower() in {".jpg", ".jpeg", ".png"}
]

cell_w, cell_h = 190, 158
image_h = 128
columns = 5
rows = (len(files) + columns - 1) // columns
sheet = Image.new("RGB", (columns * cell_w, rows * cell_h), "white")
draw = ImageDraw.Draw(sheet)
font = ImageFont.load_default()

for index, path in enumerate(files):
    with Image.open(path) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        image.thumbnail((cell_w - 8, image_h - 8), Image.Resampling.LANCZOS)
        x = (index % columns) * cell_w
        y = (index // columns) * cell_h
        px = x + (cell_w - image.width) // 2
        py = y + (image_h - image.height) // 2
        sheet.paste(image, (px, py))
        draw.text((x + 5, y + image_h + 2), path.name, fill="black", font=font)
        draw.text((x + 5, y + image_h + 15), f"{opened.width}x{opened.height}", fill="#666666", font=font)

output = Path(r"E:\work\wedding-invitation\contact-sheet.jpg")
sheet.save(output, quality=88, optimize=True)
print(output)
