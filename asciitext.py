#!/usr/bin/env python3
# Minimal, face-clear ASCII (8-char ramp, denoise + sharpen, smart crop)
# pip install pillow numpy

from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import numpy as np
from pathlib import Path

# ========= CONFIG =========
IMAGE_PATH = "WhatsApp Image 2025-11-11 at 00.50.11_67ce1ac4b2.png"

# widths in characters (columns)
WIDTHS = {"small": 90, "medium": 120, "large": 150}

# mono terminal aspect fix (characters are taller than wide)
ASPECT_CORRECTION = 0.62  # <-- for output TXT only; webpage will use CSS

# simple 8-char ramp (dark -> light) for clean faces
RAMP = "@#*+=:. "          # tweak order if you want stronger highlights

# tone / clarity
BRIGHTNESS = 1.75
CONTRAST   = 1.45
GAMMA      = 0.9           # <1 brightens midtones a touch
UNSHARP    = (1.0, 1.0, 0) # (radius, amount, threshold) unsharp mask
DENOISE    = 0.6           # Gaussian blur sigma before mapping (0–1.2)

# smart crop
BRIGHT_BIAS = 20           # subject mask threshold offset from mean
PAD_RATIO   = 0.12         # padding around crop


# ========= HELPERS =========
def load_grayscale(path):
    img = Image.open(path).convert("RGBA")
    bg  = Image.new("RGBA", img.size, (255, 255, 255, 255))
    img = Image.alpha_composite(bg, img).convert("L")
    return img

def tone_map(img):
    # brightness/contrast first
    img = ImageEnhance.Brightness(img).enhance(BRIGHTNESS)
    img = ImageEnhance.Contrast(img).enhance(CONTRAST)
    # gentle equalize for midtone separation
    img = ImageOps.autocontrast(img, cutoff=1)
    # gamma
    arr = np.asarray(img, dtype=np.float32) / 255.0
    arr = np.clip(arr, 0, 1) ** GAMMA
    img = Image.fromarray((arr * 255).astype(np.uint8), mode="L")
    # light denoise then subtle sharpen
    if DENOISE > 0:
        img = img.filter(ImageFilter.GaussianBlur(DENOISE))
    r, a, t = UNSHARP
    if a > 0:
        img = img.filter(ImageFilter.UnsharpMask(radius=r, percent=int(a*100), threshold=int(t)))
    return img

def smart_autocrop(img):
    arr = np.array(img, dtype=np.int16)
    h, w = arr.shape
    # brightness mask around subject
    m = arr > (arr.mean() + BRIGHT_BIAS)
    ys, xs = np.where(m)
    if xs.size == 0 or ys.size == 0:
        return img
    x1, x2 = xs.min(), xs.max()
    y1, y2 = ys.min(), ys.max()
    pad = int(max(w, h) * PAD_RATIO)
    x1 = max(0, x1 - pad); y1 = max(0, y1 - pad)
    x2 = min(w, x2 + pad); y2 = min(h, y2 + pad)
    if x2 - x1 < 20 or y2 - y1 < 20:
        return img
    return img.crop((x1, y1, x2, y2))

def resize_for_ascii(img, width):
    w, h = img.size
    new_h = max(1, int((h / w) * width * ASPECT_CORRECTION))
    return img.resize((width, new_h), resample=Image.BILINEAR)

def to_ascii(img, ramp):
    arr = np.asarray(img, dtype=np.uint8)
    idx = (arr.astype(np.float32) / 255 * (len(ramp) - 1)).astype(np.int32)
    return "\n".join("".join(ramp[i] for i in row) for row in idx)

def main():
    outdir = Path("ascii_out"); outdir.mkdir(exist_ok=True)
    img = load_grayscale(IMAGE_PATH)
    img = tone_map(img)
    img = smart_autocrop(img)

    outputs = {}
    for name, width in WIDTHS.items():
        imr = resize_for_ascii(img, width)
        art = to_ascii(imr, RAMP)
        outputs[name] = art
        (outdir / f"ascii_{name}.txt").write_text(art, encoding="utf-8")

    # the one your site fetches by default
    Path("ascii_art_refined.txt").write_text(outputs["medium"], encoding="utf-8")

    print("Wrote:")
    for k in outputs: print(" -", outdir / f"ascii_{k}.txt")
    print(" - ascii_art_refined.txt  (use this for your site)")

if __name__ == "__main__":
    main()
