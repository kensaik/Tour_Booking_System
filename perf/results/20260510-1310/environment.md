# Run environment — 20260510-1310

## Hardware
- CPU: AMD Ryzen 9 8940HX (16 cores / 32 threads)
- RAM: 15.2 GB
- OS: Microsoft Windows 11 Pro 10.0.26200

## Stack
- Python: 3.13.13
- k6: v2.0.0-rc1 (windows/amd64)
- App server: waitress, threads=8 (perf/run-server.ps1)
- DB: MySQL 8.0.44 @ 127.0.0.1:3306 (local)
- Profiling middleware: PERF_PROFILING=1 (backend/src/__init__.py)
- Rate limiter: bypassed when PERF_PROFILING set (backend/src/utils/rate_limit.py)

## OS limits
- Dynamic ephemeral port range: 49152 + 16384 ports (Windows default)
- TIME_WAIT default 240s — at >68 conn/s sustained, port exhaustion is plausible

## Test rig disclosures
- Loopback (127.0.0.1) — zero network latency, masks real-world TCP overhead
- Single host: k6, waitress, MySQL all on the same laptop sharing CPU/IO
- Schema rebuilt from SQLAlchemy models (alembic drift) before seed
- Departure seats inflated to 200_000 before load runs to avoid measuring 400-rate
  on seat exhaustion instead of write throughput
- Power profile: not pinned (laptop default — thermal throttling possible on stress)
- No other heavy load on box at run time
- waitress is GIL-bound thread server; gunicorn alternative is WSL-only on Windows

## Profiles run
- smoke: 1 VU × 60s, 4 scenarios
- load: 50 VU × 5 min, 4 scenarios
- stress: 10→500 VU ramp × 10 min, scenarios 01 + 03 only
