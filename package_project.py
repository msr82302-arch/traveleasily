#!/usr/bin/env python3
"""
EasyTravels Local Deployment Packaging Script
Generates a clean, portable ZIP archive of the entire source code repository
excluding temporary files, node_modules, virtual environments, and secrets.
"""
import os
import zipfile
import shutil
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
ZIP_FILENAME = "EasyTravel_Local_Deployment.zip"
OUTPUT_PATH = ROOT_DIR / ZIP_FILENAME
PUBLIC_COPY_PATH = ROOT_DIR / "public" / ZIP_FILENAME

EXCLUDE_DIRS = {
    'node_modules',
    'venv',
    '.venv',
    '__pycache__',
    '.git',
    '.pytest_cache',
    'dist',
    '.turbo',
    '.next',
}

EXCLUDE_EXTENSIONS = {
    '.pyc',
    '.pyo',
    '.pyd',
    '.DS_Store',
    '.log',
}

EXCLUDE_FILES = {
    '.env',
    ZIP_FILENAME,
    'package_project.py',
}


def should_include(rel_path: Path) -> bool:
    # Check directory parts
    for part in rel_path.parts:
        if part in EXCLUDE_DIRS:
            return False
        if part.startswith('.') and part not in {'.gitignore', '.env.example'}:
            return False

    # Check file name
    if rel_path.name in EXCLUDE_FILES:
        return False

    # Check extension
    if rel_path.suffix in EXCLUDE_EXTENSIONS:
        return False

    return True


def create_deployment_zip():
    print(f"Creating {ZIP_FILENAME} from {ROOT_DIR}...")
    file_count = 0
    total_uncompressed_bytes = 0

    with zipfile.ZipFile(OUTPUT_PATH, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for root, dirs, files in os.walk(ROOT_DIR):
            # Prune excluded directories in-place
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not (d.startswith('.') and d != '.')]

            for file in files:
                file_path = Path(root) / file
                rel_path = file_path.relative_to(ROOT_DIR)

                if should_include(rel_path):
                    # Store inside an enclosing 'EasyTravel/' folder in the archive for clean extraction
                    archive_path = Path("EasyTravel") / rel_path
                    zip_file.write(file_path, arcname=str(archive_path).replace('\\', '/'))
                    file_count += 1
                    total_uncompressed_bytes += file_path.stat().st_size

    zip_size_mb = OUTPUT_PATH.stat().st_size / (1024 * 1024)
    print(f"Archive successfully created: {OUTPUT_PATH}")
    print(f"Total files packaged: {file_count}")
    print(f"Total uncompressed size: {total_uncompressed_bytes / (1024 * 1024):.2f} MB")
    print(f"Compressed ZIP size: {zip_size_mb:.2f} MB")

    # Also copy to public/ so it can be directly downloaded via web browser if desired
    try:
        shutil.copy2(OUTPUT_PATH, PUBLIC_COPY_PATH)
        print(f"Copied archive to public folder: {PUBLIC_COPY_PATH}")
    except Exception as e:
        print(f"Notice: Could not copy to public/: {e}")


if __name__ == '__main__':
    create_deployment_zip()
