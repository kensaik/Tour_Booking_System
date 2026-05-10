# Backend — Tour Booking System

Flask + SQLAlchemy + JWT API. See repo root `README.md` for full project overview.

## Tests

### Unit + Integration (Tier A + Tier B)

```bash
cd backend
pip install -r requirements.txt -r requirements-dev.txt
pytest tests/ --cov=src --cov-report=term-missing --cov-fail-under=70
```

Uses sqlite `:memory:` (no MySQL required). Coverage gate enforced in CI (`.github/workflows/ci.yml`).

## Running automation tests

The Phase 6 API automation suite (`tests_e2e/`) runs **black-box** against a live Flask server backed by real MySQL. Use it to validate end-to-end flows for the rubric +20% bonus.

### Prerequisites

- MySQL 8 reachable locally (Docker example below)
- A test database (e.g. `tour_booking_test`)

```bash
docker run --rm -d --name tb-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=tour_booking_test \
  -p 3306:3306 mysql:8
```

### Local run

```bash
cd backend
export DATABASE_URL="mysql+pymysql://root:root@127.0.0.1:3306/tour_booking_test"
export JWT_SECRET_KEY="local-test-jwt-secret"
export SECRET_KEY="local-test-secret"
export FLASK_APP=src

python -c "from src import create_app; from src.extensions import db; \
  app=create_app(); ctx=app.app_context(); ctx.push(); db.create_all()"
python -m database.seed

flask run --host=127.0.0.1 --port=5000 &
FLASK_PID=$!

pytest tests_e2e/ --html=report.html --self-contained-html

kill $FLASK_PID
```

Open `report.html` in a browser to see the per-test report.

### Seeded accounts (test-only)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@test.com` | `Admin@123` |
| Company (approved) | `abc@travel.com` | `Company@123` |
| Company (pending) | `pending@travel.com` | `Company@123` |
| Guest | `a@gmail.com` | `Guest@123` |

`database/seed.py` refuses to run when `FLASK_ENV=production`. Never point it at a production DB.

### CI

Manual-dispatch workflow at `.github/workflows/automation-tests.yml` runs the suite against an ephemeral MySQL service container and uploads `automation-report` as an artifact. Trigger from the Actions tab → `Automation Tests` → `Run workflow`.

Repository secret `JWT_SECRET_KEY_TEST` must be set (any non-empty value).
