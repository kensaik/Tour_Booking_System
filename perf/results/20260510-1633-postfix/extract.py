import json, glob, os
rows = []
for f in sorted(glob.glob(os.path.join(os.path.dirname(__file__), "*.json"))):
    d = json.load(open(f))
    m = d["metrics"]["http_req_duration"]
    r = d["metrics"]["http_reqs"]
    fr = d["metrics"]["http_req_failed"]
    name = os.path.splitext(os.path.basename(f))[0]
    rows.append({
        "name": name,
        "p50": m.get("med"),
        "p95": m.get("p(95)"),
        "p99": m.get("p(99)"),
        "max": m.get("max"),
        "reqs": r.get("count"),
        "rps": r.get("rate"),
        "err": fr.get("rate", 0) * 100,
    })
print(f"{'scenario':40} {'p50':>10} {'p95':>10} {'p99':>10} {'max':>10} {'reqs':>8} {'rps':>7} {'err%':>6}")
for r in rows:
    p99 = r['p99'] if r['p99'] is not None else 0
    print(f"{r['name']:40} {r['p50']:>10.1f} {r['p95']:>10.1f} {p99:>10.1f} {r['max']:>10.1f} {r['reqs']:>8} {r['rps']:>7.1f} {r['err']:>6.2f}")
