#!/usr/bin/env python3
"""Generate seven small, cropped historical references from the seven archived PDFs.

This script deliberately extracts only one limited crop from each volume.
It does not publish the full PDFs or full-page facsimiles.
Run from the repository root: python scripts/extract_wishbook.py
"""
from pathlib import Path
import fitz

SOURCE = Path("Catalogue")
DEST = Path("holiday-catalog/wishbook-excerpts")
DEST.mkdir(parents=True, exist_ok=True)

for part in range(1, 8):
    pdf = SOURCE / f"1989 Sears Christmas Wishbook Catalog_Part{part}.pdf"
    if not pdf.exists():
        raise FileNotFoundError(pdf)
    with fitz.open(pdf) as doc:
        if not len(doc):
            raise ValueError(f"No pages in {pdf}")
        # Sample an interior page, not the cover or index.
        page_no = min(len(doc) - 1, max(0, len(doc) // 2))
        page = doc[page_no]
        rect = page.rect
        # Cropped region, less than one quarter of the original page.
        crop = fitz.Rect(rect.x0 + rect.width * .12,
                         rect.y0 + rect.height * .22,
                         rect.x0 + rect.width * .57,
                         rect.y0 + rect.height * .61)
        pix = page.get_pixmap(matrix=fitz.Matrix(1.2, 1.2), clip=crop, alpha=False)
        dest = DEST / f"part-{part}.webp"
        # Pillow is used for controlled web-friendly compression.
        from PIL import Image
        import io
        img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
        img.thumbnail((800, 700))
        img.save(dest, "WEBP", quality=74, method=6)
        print(f"{dest}: source part {part}, page {page_no + 1}/{len(doc)} ({dest.stat().st_size} bytes)")
