"""Email integration using Gmail SMTP.

Requires the following environment variables:
- EMAIL_HOST: smtp.gmail.com
- EMAIL_HOST_USER: your-email@gmail.com
- EMAIL_HOST_PASSWORD: your-app-password (NOT your regular password!)
- EMAIL_PORT: 587 (default)
- EMAIL_USE_TLS: true
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app, has_app_context


def send_email(to: str, subject: str, body: str, html_body: str = None) -> bool:
    """
    Send an email via Gmail SMTP.
    
    Args:
        to: Recipient email address
        subject: Email subject
        body: Plain text body
        html_body: Optional HTML body
        
    Returns:
        True if sent successfully, False otherwise
    """
    if has_app_context():
        current_app.logger.debug(
            "send_email to=%s subject=%s body_len=%s",
            to,
            subject,
            len(body or ""),
        )

    host = current_app.config.get("EMAIL_HOST")
    port = current_app.config.get("EMAIL_PORT", 587)
    user = current_app.config.get("EMAIL_HOST_USER")
    password = current_app.config.get("EMAIL_HOST_PASSWORD")
    use_tls = current_app.config.get("EMAIL_USE_TLS", True)

    if not all([host, user, password]):
        if has_app_context():
            current_app.logger.warning("Email not configured - missing credentials")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = user
        msg["To"] = to

        msg.attach(MIMEText(body, "plain"))
        if html_body:
            msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(host, port, timeout=30) as server:
            server.ehlo()
            if use_tls:
                server.starttls()
                server.ehlo()
            server.login(user, password)
            server.sendmail(user, [to], msg.as_string())

        if has_app_context():
            current_app.logger.info(f"Email sent successfully to {to}")
        return True

    except Exception as e:
        if has_app_context():
            current_app.logger.error(f"Failed to send email to {to}: {e}")
        return False


def send_booking_confirmation(to: str, booking_data: dict) -> bool:
    """Send booking confirmation email."""
    subject = f"Xác nhận đặt tour #{booking_data.get('booking_id', 'N/A')}"
    
    body = f"""
Xin chào {booking_data.get('guest_name', 'Quý khách')},

Đơn đặt tour của bạn đã được xác nhận!

Thông tin đặt tour:
- Mã đặt tour: #{booking_data.get('booking_id')}
- Tour: {booking_data.get('tour_name')}
- Ngày khởi hành: {booking_data.get('departure_date')}
- Số khách: {booking_data.get('guests_count')}
- Tổng tiền: {booking_data.get('total_price'):,} VNĐ

Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi!

Trân trọng,
Tour Booking System
"""

    html_body = f"""
<html>
<body>
<h2>Xác nhận đặt tour</h2>
<p>Xin chào <strong>{booking_data.get('guest_name', 'Quý khách')}</strong>,</p>
<p>Đơn đặt tour của bạn đã được xác nhận!</p>

<h3>Thông tin đặt tour:</h3>
<ul>
    <li><strong>Mã đặt tour:</strong> #{booking_data.get('booking_id')}</li>
    <li><strong>Tour:</strong> {booking_data.get('tour_name')}</li>
    <li><strong>Ngày khởi hành:</strong> {booking_data.get('departure_date')}</li>
    <li><strong>Số khách:</strong> {booking_data.get('guests_count')}</li>
    <li><strong>Tổng tiền:</strong> {booking_data.get('total_price'):,} VNĐ</li>
</ul>

<p>Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi!</p>

<p>Trân trọng,<br>Tour Booking System</p>
</body>
</html>
"""
    return send_email(to, subject, body, html_body)


def send_booking_cancellation(to: str, booking_data: dict) -> bool:
    """Send booking cancellation email."""
    subject = f"Thông báo hủy đặt tour #{booking_data.get('booking_id', 'N/A')}"
    
    body = f"""
Xin chào {booking_data.get('guest_name', 'Quý khách')},

Đơn đặt tour #{booking_data.get('booking_id')} của bạn đã bị hủy.

Thông tin tour đã hủy:
- Tour: {booking_data.get('tour_name')}
- Ngày khởi hành: {booking_data.get('departure_date')}

Nếu bạn đã thanh toán, chúng tôi sẽ hoàn tiền trong 5-7 ngày làm việc.

Mọi thắc mắc, xin liên hệ với chúng tôi.

Trân trọng,
Tour Booking System
"""

    html_body = f"""
<html>
<body>
<h2>Thông báo hủy đặt tour</h2>
<p>Xin chào <strong>{booking_data.get('guest_name', 'Quý khách')}</strong>,</p>
<p>Đơn đặt tour <strong>#{booking_data.get('booking_id')}</strong> của bạn đã bị hủy.</p>

<h3>Thông tin tour đã hủy:</h3>
<ul>
    <li><strong>Tour:</strong> {booking_data.get('tour_name')}</li>
    <li><strong>Ngày khởi hành:</strong> {booking_data.get('departure_date')}</li>
</ul>

<p>Nếu bạn đã thanh toán, chúng tôi sẽ hoàn tiền trong 5-7 ngày làm việc.</p>

<p>Mọi thắc mắc, xin liên hệ với chúng tôi.</p>

<p>Trân trọng,<br>Tour Booking System</p>
</body>
</html>
"""
    return send_email(to, subject, body, html_body)
