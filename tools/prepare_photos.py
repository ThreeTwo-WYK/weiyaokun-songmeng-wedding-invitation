from pathlib import Path
from PIL import Image, ImageOps

sources = [
    Path(r"D:\BaiduNetdiskDownload\良辰集无水印最终版\CR5A3523.jpg"),
    Path(r"D:\BaiduNetdiskDownload\良辰集无水印最终版\CR5A3540.jpg"),
    Path(r"D:\BaiduNetdiskDownload\良辰集无水印最终版\CR5A3652jpg.jpg"),
    Path(r"D:\BaiduNetdiskDownload\良辰集无水印最终版\CR5A3700.jpg"),
    Path(r"D:\BaiduNetdiskDownload\良辰集无水印最终版\CR5A3786.jpg"),
    Path(r"D:\BaiduNetdiskDownload\良辰集无水印最终版\CR5A3816.jpg"),
    Path(r"D:\BaiduNetdiskDownload\禧棠\DSC00033.jpg"),
    Path(r"D:\BaiduNetdiskDownload\禧棠\DSC00044.jpg"),
    Path(r"D:\BaiduNetdiskDownload\禧棠\DSC00065.jpg"),
    Path(r"D:\BaiduNetdiskDownload\禧棠\DSC00153.jpg"),
    Path(r"D:\BaiduNetdiskDownload\禧棠\DSC00213.jpg"),
    Path(r"D:\BaiduNetdiskDownload\禧棠\DSC00272.jpg"),
]

output_dir = Path(r"E:\work\wedding-invitation\public\photos")
output_dir.mkdir(parents=True, exist_ok=True)

for index, source in enumerate(sources, start=1):
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        image = ImageOps.fit(
            image,
            (1080, 1620),
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.5),
        )
        destination = output_dir / f"slide-{index:02d}.webp"
        image.save(destination, "WEBP", quality=80, method=6)
        print(f"{destination.name}\t{destination.stat().st_size}")
