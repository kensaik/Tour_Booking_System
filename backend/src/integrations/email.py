
from flask import current_app, has_app_context


def send_email(to: str, subject: str, body: str) -> bool:
    """Simulate sending an email. Returns True on success."""
    if has_app_context():
        current_app.logger.debug(
            "send_email to=%s subject=%s body_len=%s",
            to,
            subject,
            len(body or ""),
        )
    return True
