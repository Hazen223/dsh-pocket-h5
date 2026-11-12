#!/usr/bin/env python3
"""把一张 iPhone 设备外框图处理成面板用的边框素材。

输入：带透明背景（或白底）的 PNG；屏幕开口必须是浅色纯色区域。
输出：
  src/client/assets/bezel.webp   仅保留外框（屏幕开口抠成透明），裁到外框 bbox
  src/client/assets/bezel.json   外框/屏幕开口的像素与逻辑几何（逻辑 = 像素/3，
                                 因为屏幕开口正好是 402x874 @3x）

用法：python3 tools/prepare-bezel.py path/to/frame.png
依赖：Pillow、numpy、scipy
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src/client/assets"


def main() -> None:
    src = Path(sys.argv[1] if len(sys.argv) > 1 else "")
    if not src.is_file():
        raise SystemExit("usage: python3 tools/prepare-bezel.py <frame.png>")
    image = Image.open(src).convert("RGBA")
    a = np.array(image)
    h, w = a.shape[:2]
    rgb = a[:, :, :3].astype(int)
    alpha = a[:, :, 3]
    # 屏幕开口：从画面中心泛洪浅色像素，再填掉灵动岛等内部孔洞
    whiteish = (alpha > 200) & (rgb.min(axis=2) >= 235)
    labels, _ = ndimage.label(whiteish)
    opening = labels == labels[h // 2, w // 2]
    opening = ndimage.binary_fill_holes(opening)
    a[opening, 3] = 0
    opaque = a[:, :, 3] > 0
    ys, xs = np.where(opaque)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    cropped = Image.fromarray(a[y0 : y1 + 1, x0 : x1 + 1], "RGBA")
    OUT.mkdir(parents=True, exist_ok=True)
    cropped.save(OUT / "bezel.webp", "WEBP", quality=92, method=6)

    # 屏幕开口在外框内的像素矩形（裁剪后的坐标）
    oy, ox = np.where(opening)
    screen = {
        "x": int(ox.min() - x0),
        "y": int(oy.min() - y0),
        "width": int(ox.max() - ox.min() + 1),
        "height": int(oy.max() - oy.min() + 1),
    }
    if screen["width"] != 1206 or screen["height"] != 2622:
        raise SystemExit(f"expected a 1206x2622 screen opening, got {screen}")
    ratio = 3  # 屏幕开口 = 402x874 逻辑像素 @3x
    logical = {
        "pixelRatio": ratio,
        "ppi": 460,
        "screenWidth": screen["width"] // ratio,
        "screenHeight": screen["height"] // ratio,
        "radius": round(270 / ratio, 4),
        "portrait": {
            "outerW": round(cropped.width / ratio, 4),
            "outerH": round(cropped.height / ratio, 4),
            "screenX": round(screen["x"] / ratio, 4),
            "screenY": round(screen["y"] / ratio, 4),
            "screenW": screen["width"] // ratio,
            "screenH": screen["height"] // ratio,
        },
        "landscape": {
            "outerW": round(cropped.height / ratio, 4),
            "outerH": round(cropped.width / ratio, 4),
            "screenX": round(screen["y"] / ratio, 4),
            "screenY": round((cropped.width - screen["x"] - screen["width"]) / ratio, 4),
            "screenW": screen["height"] // ratio,
            "screenH": screen["width"] // ratio,
        },
    }
    # 机身剪影（用于把矩形页面裁到手机外轮廓，圆角处不会露出页面）
    body = ndimage.binary_fill_holes(np.array(cropped.getchannel("A")) > 16)
    def save_mask(mask, path):
        out = np.zeros((mask.shape[0], mask.shape[1], 4), np.uint8)
        out[mask] = (255, 255, 255, 255)
        Image.fromarray(out, "RGBA").save(path, "WEBP", lossless=True, quality=100, method=6)
    save_mask(body, OUT / "bezel-mask.webp")
    save_mask(np.rot90(body, 1), OUT / "bezel-mask-landscape.webp")

    payload = {
        "source": "user-provided iPhone frame; screen opening cut to transparency, cropped to the frame",
        "image": {"width": cropped.width, "height": cropped.height, "screen": screen, "radius": 270},
        "logical": logical,
    }
    (OUT / "bezel.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
    print(f"wrote {OUT/'bezel.webp'} ({cropped.width}x{cropped.height}) and bezel.json")


if __name__ == "__main__":
    main()
