#!/usr/bin/env python3
"""POST only new or changed site URLs to IndexNow after a deploy.

The IndexNow key is read from the existing repo key file. Never print or
log the key, the key filename, or the keyLocation.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://smallspacegreens.com"
INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"

SKIP_PREFIXES = ("assets/", "css/", "js/", "src/", "scripts/", "docs/", ".github/")
SKIP_NAMES = {"CNAME", ".nojekyll", "404.html", "feed.xml", "README.md", ".gitignore"}
KEY_FILE_NAME = re.compile(r"^[0-9a-f]{32}\.txt$")


def load_key() -> tuple[str, str]:
    text = (ROOT / "scripts" / "build_site.py").read_text()
    match = re.search(r'^INDEXNOW = "([0-9a-f]+)"$', text, flags=re.M)
    if not match:
        raise SystemExit("IndexNow key assignment was not found")
    key = match.group(1)
    key_file = ROOT / f"{key}.txt"
    if not key_file.is_file():
        raise SystemExit("IndexNow key file is missing")
    if key_file.read_text().strip() != key:
        raise SystemExit("IndexNow key file does not match the build script")
    return key, f"{SITE}/{key}.txt"


def rel_to_url(rel: str) -> str | None:
    rel = rel.strip()
    if not rel or rel in SKIP_NAMES:
        return None
    if KEY_FILE_NAME.match(Path(rel).name) and "/" not in rel:
        return None
    if any(rel.startswith(prefix) for prefix in SKIP_PREFIXES):
        return None
    if rel.endswith(".py") or rel.endswith(".md") or rel.endswith(".yml") or rel.endswith(".yaml"):
        return None
    if rel == "index.html":
        return f"{SITE}/"
    if rel.endswith("/index.html"):
        return f"{SITE}/{rel[:-10]}"
    if rel in {"sitemap.xml", "robots.txt", "llms.txt"}:
        return f"{SITE}/{rel}"
    if rel.endswith(".html"):
        return f"{SITE}/{rel}"
    return None


def changed_files(base: str) -> list[str]:
    if base:
        commands = [["git", "diff", "--name-only", "--diff-filter=AM", base, "HEAD"]]
    else:
        commands = [
            ["git", "diff", "--name-only", "--diff-filter=AM", "HEAD"],
            ["git", "ls-files", "--others", "--exclude-standard"],
        ]
    names: list[str] = []
    seen: set[str] = set()
    for spec in commands:
        result = subprocess.run(spec, cwd=ROOT, capture_output=True, text=True)
        if result.returncode != 0:
            raise SystemExit("Could not list changed files for IndexNow")
        for line in result.stdout.splitlines():
            rel = line.strip()
            if rel and rel not in seen:
                seen.add(rel)
                names.append(rel)
    return names


def ping(urls: list[str], key: str, key_location: str) -> int:
    payload = {
        "host": "smallspacegreens.com",
        "key": key,
        "keyLocation": key_location,
        "urlList": urls,
    }
    request = urllib.request.Request(
        INDEXNOW_ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.getcode()
    except urllib.error.HTTPError as exc:
        return exc.code


def main() -> None:
    parser = argparse.ArgumentParser(description="Ping IndexNow for changed URLs only.")
    parser.add_argument(
        "--base",
        default=os.environ.get("SSG_INDEXNOW_BASE", ""),
        help="Git ref to diff against HEAD, for example HEAD~1",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="List URLs that would be submitted without posting",
    )
    args = parser.parse_args()
    urls = []
    seen = set()
    for rel in changed_files(args.base):
        url = rel_to_url(rel)
        if url and url not in seen:
            seen.add(url)
            urls.append(url)
    if not urls:
        print("indexnow: no changed URLs")
        return
    print(f"indexnow: {len(urls)} URL(s)")
    for url in urls:
        print(url)
    if args.dry_run:
        print("indexnow: dry run, not posted")
        return
    key, key_location = load_key()
    status = ping(urls, key, key_location)
    # Do not print the request body. Status and count are enough.
    if status in {200, 202}:
        print(f"indexnow: post accepted ({status})")
        return
    print(f"indexnow: post failed ({status})", file=sys.stderr)
    sys.exit(1)


if __name__ == "__main__":
    main()
