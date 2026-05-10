# Development image for the Flask backend.
# Source is bind-mounted by docker-compose so edits hot-reload via `flask run --debug`.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    FLASK_APP=run.py \
    FLASK_DEBUG=1

WORKDIR /app

# System deps: default-mysql-client gives us `mysqladmin ping` for the wait loop.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

# requirements.txt is UTF-16 in this repo; normalize to UTF-8 before pip reads it.
COPY requirements.txt /tmp/requirements.txt
RUN python -c "import io; data=open('/tmp/requirements.txt','rb').read(); \
text=data.decode('utf-16') if data[:2] in (b'\xff\xfe', b'\xfe\xff') else data.decode('utf-8'); \
open('/tmp/requirements.utf8.txt','w',encoding='utf-8').write(text)" \
    && pip install -r /tmp/requirements.utf8.txt

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
