#!/usr/bin/env python3
"""Refresh Descent image inventory from all tracked /assets images."""
import json
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[1]
manifest_path = root / "descent" / "manifest.json"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
files = subprocess.check_output(["git", "ls-files", "-z", "--", "assets/"], cwd=root).decode("utf-8").split("\0")
extensions = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}
exclude_names = {"favicon", "placeholder", "sprite", "icon", "logo"}
images = sorted(path for path in files if path and Path(path).suffix.lower() in extensions
                and not any(term in Path(path).stem.lower() for term in exclude_names))
manifest["images"] = images
manifest["version"] = int(manifest.get("version", 1)) + (images != manifest.get("images", []))
manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"Indexed {len(images)} images from assets/")
