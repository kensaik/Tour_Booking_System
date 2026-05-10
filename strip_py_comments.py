#!/usr/bin/env python3
"""Strip # line comments from Python files using the tokenize module.
Preserves: docstrings, shebang lines, type: ignore comments, noqa comments.
"""

import io
import os
import sys
import tokenize
from pathlib import Path

ROOT = Path(__file__).parent

EXCLUDE_DIRS = {
    "node_modules", ".venv", "venv", "dist", "coverage",
    "__pycache__", ".pytest_cache", "build", "tests", "tests_e2e", "e2e"
}


def should_skip_comment(text: str) -> bool:
    """Return True if this comment should be preserved."""
    stripped = text.lstrip("#").strip()
    # Keep shebang
    if text.startswith("#!"):
        return True
    # Keep type: ignore
    if "type: ignore" in stripped or "type:ignore" in stripped:
        return True
    # Keep noqa
    if stripped.lower().startswith("noqa"):
        return True
    return False


def strip_comments_from_source(source: str) -> tuple[str, int]:
    """Return (new_source, comments_removed_count)."""
    try:
        tokens = list(tokenize.generate_tokens(io.StringIO(source).readline))
    except tokenize.TokenError as e:
        raise ValueError(f"tokenize error: {e}")

    # Build a set of (row, col) for comment tokens we want to remove
    remove_ranges = []  # list of (start_row, start_col, end_col)
    comments_removed = 0

    for tok in tokens:
        if tok.type == tokenize.COMMENT:
            text = tok.string
            if should_skip_comment(text):
                continue
            # Record line/col info
            start_row, start_col = tok.start
            end_row, end_col = tok.end
            remove_ranges.append((start_row, start_col, end_col))
            comments_removed += 1

    if not remove_ranges:
        return source, 0

    lines = source.splitlines(keepends=True)
    result_lines = list(lines)

    # Process in reverse order to not mess up indices
    for (row, start_col, end_col) in sorted(remove_ranges, reverse=True):
        line_idx = row - 1
        if line_idx >= len(result_lines):
            continue
        line = result_lines[line_idx]
        # Remove from start_col to end (but keep newline)
        newline = ""
        if line.endswith("\r\n"):
            newline = "\r\n"
        elif line.endswith("\n"):
            newline = "\n"
        elif line.endswith("\r"):
            newline = "\r"
        new_line = line[:start_col].rstrip() + newline
        result_lines[line_idx] = new_line

    return "".join(result_lines), comments_removed


def process_file(path: Path) -> tuple[bool, int, str | None]:
    """Process a single Python file. Returns (changed, count_removed, error)."""
    try:
        source = path.read_text(encoding="utf-8")
    except Exception as e:
        return False, 0, f"read error: {e}"

    try:
        new_source, count = strip_comments_from_source(source)
    except ValueError as e:
        return False, 0, str(e)

    if count > 0:
        try:
            path.write_text(new_source, encoding="utf-8")
        except Exception as e:
            return False, 0, f"write error: {e}"
        return True, count, None

    return False, 0, None


def find_py_files(base: Path) -> list[Path]:
    """Find all .py files excluding forbidden dirs."""
    results = []
    for root, dirs, files in os.walk(base):
        # Prune excluded directories in-place
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            if f.endswith(".py"):
                results.append(Path(root) / f)
    return results


def main():
    backend_src = ROOT / "backend" / "src"
    if not backend_src.exists():
        print(f"ERROR: {backend_src} does not exist")
        sys.exit(1)

    py_files = find_py_files(backend_src)
    print(f"Found {len(py_files)} Python files to process")

    total_files_changed = 0
    total_comments = 0
    errors = []

    for path in sorted(py_files):
        changed, count, err = process_file(path)
        rel = path.relative_to(ROOT)
        if err:
            errors.append((rel, err))
            print(f"  ERROR  {rel}: {err}")
        elif changed:
            total_files_changed += 1
            total_comments += count
            print(f"  STRIP  {rel}: removed {count} comment(s)")
        else:
            print(f"  OK     {rel}: no comments")

    print()
    print("=" * 60)
    print(f"Python files processed : {len(py_files)}")
    print(f"Files modified         : {total_files_changed}")
    print(f"Comments removed       : {total_comments}")
    print(f"Errors                 : {len(errors)}")
    if errors:
        for path, err in errors:
            print(f"  - {path}: {err}")


if __name__ == "__main__":
    main()
