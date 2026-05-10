from __future__ import annotations

import argparse
import json
import statistics
from collections import defaultdict
from pathlib import Path


def load_summary(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def fmt_ms(v: float | None) -> str:
    return "—" if v is None else f"{v:.0f}"


def fmt_pct(v: float | None) -> str:
    return "—" if v is None else f"{v * 100:.2f}%"


def summary_row(scenario: str, profile: str, summary: dict) -> dict:
    metrics = summary.get("metrics", {})
    dur = metrics.get("http_req_duration", {})
    failed = metrics.get("http_req_failed", {})
    reqs = metrics.get("http_reqs", {})

    values = dur.get("values") or dur
    fvalues = failed.get("values") or failed
    rvalues = reqs.get("values") or reqs

    return {
        "scenario": scenario,
        "profile": profile,
        "p50": values.get("med") or values.get("p(50)"),
        "p95": values.get("p(95)"),
        "p99": values.get("p(99)"),
        "rps": rvalues.get("rate"),
        "err_rate": fvalues.get("rate"),
        "count": rvalues.get("count"),
    }


def jsonl_route_stats(jsonl: Path) -> list[dict]:
    groups: dict[str, list[dict]] = defaultdict(list)
    with jsonl.open("r", encoding="utf-8") as f:
        for line in f:
            try:
                d = json.loads(line)
            except json.JSONDecodeError:
                continue
            groups[d["rule"]].append(d)

    rows: list[dict] = []
    for rule, entries in groups.items():
        durs = sorted(e["duration_ms"] for e in entries)
        if not durs:
            continue
        p95_idx = max(0, int(len(durs) * 0.95) - 1)
        p99_idx = max(0, int(len(durs) * 0.99) - 1)
        statuses = defaultdict(int)
        for e in entries:
            statuses[e["status"]] += 1
        rows.append(
            {
                "rule": rule,
                "count": len(entries),
                "p50": statistics.median(durs),
                "p95": durs[p95_idx],
                "p99": durs[p99_idx],
                "max": durs[-1],
                "status_mix": dict(statuses),
            }
        )
    rows.sort(key=lambda r: r["p95"], reverse=True)
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("run_dir")
    parser.add_argument("--out", default=None)
    args = parser.parse_args()

    run_dir = Path(args.run_dir)
    out_lines: list[str] = []

    out_lines.append(f"# Results — {run_dir.name}\n")
    out_lines.append("## k6 summary table\n")
    out_lines.append("| scenario | profile | p50 (ms) | p95 (ms) | p99 (ms) | RPS | err rate | reqs |")
    out_lines.append("|---|---|---|---|---|---|---|---|")

    summaries = sorted(run_dir.glob("*-*.json"))
    for sp in summaries:
        if "summary" in sp.stem and "-" not in sp.stem.replace("-summary", ""):
            continue
        stem = sp.stem
        parts = stem.rsplit("-", 1)
        if len(parts) != 2:
            continue
        scenario, profile = parts
        try:
            summary = load_summary(sp)
        except Exception as e:  # noqa: BLE001
            out_lines.append(f"| {scenario} | {profile} | error: {e} |")
            continue
        row = summary_row(scenario, profile, summary)
        out_lines.append(
            f"| {row['scenario']} | {row['profile']} | "
            f"{fmt_ms(row['p50'])} | {fmt_ms(row['p95'])} | {fmt_ms(row['p99'])} | "
            f"{(row['rps'] or 0):.1f} | {fmt_pct(row['err_rate'])} | {int(row['count'] or 0)} |"
        )

    out_lines.append("\n## Top routes by p95 (from JSONL)\n")
    for jsonl in sorted(run_dir.glob("requests-*.jsonl")):
        out_lines.append(f"\n### {jsonl.name}")
        out_lines.append("| rule | count | p50 (ms) | p95 (ms) | p99 (ms) | max (ms) | statuses |")
        out_lines.append("|---|---|---|---|---|---|---|")
        rows = jsonl_route_stats(jsonl)
        for r in rows[:10]:
            sm = ",".join(f"{k}:{v}" for k, v in sorted(r["status_mix"].items()))
            out_lines.append(
                f"| `{r['rule']}` | {r['count']} | "
                f"{r['p50']:.1f} | {r['p95']:.1f} | {r['p99']:.1f} | {r['max']:.1f} | {sm} |"
            )

    text = "\n".join(out_lines) + "\n"
    if args.out:
        Path(args.out).write_text(text, encoding="utf-8")
        print(f"wrote {args.out}")
    else:
        print(text)


if __name__ == "__main__":
    main()
