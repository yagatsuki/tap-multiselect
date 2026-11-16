# アイコン生成スクリプト（Pillow が必要）: python3 tools/make_icons.py
from PIL import Image, ImageDraw
import os

out_dir = os.path.join(os.path.dirname(__file__), "..", "icons")
os.makedirs(out_dir, exist_ok=True)
for size in (16, 32, 48, 128):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    m = max(1, size // 16)
    d.rounded_rectangle([m, m, size - m, size - m], radius=size // 5, fill=(26, 115, 232, 255))
    bw = size // 3
    x0, y0 = size // 7, size // 7
    d.rectangle([x0, y0, x0 + bw, y0 + bw], outline=(255, 255, 255, 255), width=max(1, size // 16))
    lw = max(1, size // 12)
    d.line([x0 + bw * 0.2, y0 + bw * 0.55, x0 + bw * 0.42, y0 + bw * 0.78], fill=(255, 255, 255, 255), width=lw)
    d.line([x0 + bw * 0.42, y0 + bw * 0.78, x0 + bw * 0.85, y0 + bw * 0.22], fill=(255, 255, 255, 255), width=lw)
    x1, y1 = size - size // 7 - bw, size - size // 7 - bw
    d.rectangle([x1, y1, x1 + bw, y1 + bw], outline=(255, 255, 255, 255), width=max(1, size // 16))
    img.save(os.path.join(out_dir, f"icon{size}.png"))
print("icons written to", out_dir)
