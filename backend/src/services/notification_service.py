import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime


class NotificationService:
    _config = {
        "smtp_host": "smtp.gmail.com",
        "smtp_port": 587,
        "smtp_user": "your_email@gmail.com",
        "smtp_password": "your_app_password",
        "from_name": "TourGo System",
        "enabled": False,  # Bật lên khi đã cấu hình SMTP
    }

    @classmethod
    def configure(cls, smtp_host=None, smtp_port=None, smtp_user=None, 
                 smtp_password=None, from_name=None, enabled=None):
        """Cấu hình SMTP - gọi trong app setup"""
        if smtp_host: cls._config["smtp_host"] = smtp_host
        if smtp_port: cls._config["smtp_port"] = smtp_port
        if smtp_user: cls._config["smtp_user"] = smtp_user
        if smtp_password: cls._config["smtp_password"] = smtp_password
        if from_name: cls._config["from_name"] = from_name
        if enabled is not None: cls._config["enabled"] = enabled

    @classmethod
    def _send_email(cls, to_email: str, subject: str, html_body: str, text_body: str = None):
        """Gửi email thực sự"""
        if not cls._config["enabled"]:
            print(f"[Email Mock] To: {to_email}")
            print(f"[Email Mock] Subject: {subject}")
            print(f"[Email Mock] Body: {html_body[:200]}...")
            return True

        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{cls._config['from_name']} <{cls._config['smtp_user']}>"
            msg['To'] = to_email

            if text_body:
                msg.attach(MIMEText(text_body, 'plain'))
            msg.attach(MIMEText(html_body, 'html'))

            with smtplib.SMTP(cls._config["smtp_host"], cls._config["smtp_port"]) as server:
                server.starttls()
                server.login(cls._config["smtp_user"], cls._config["smtp_password"])
                server.send_message(msg)
            
            return True
        except Exception as e:
            print(f"Email error: {e}")
            return False

    @classmethod
    def send_booking_confirmation(cls, booking, guest_email: str):
        """Gửi email xác nhận đặt tour cho khách"""
        departure = booking.departure
        tour = departure.tour
        
        subject = f"Xác nhận đặt tour #{booking.id} - TourGo"
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .info-box {{ background: white; padding: 20px; border-radius: 8px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                .label {{ color: #666; font-size: 12px; text-transform: uppercase; }}
                .value {{ font-size: 18px; font-weight: bold; color: #333; }}
                .price {{ color: #667eea; font-size: 24px; }}
                .footer {{ text-align: center; padding: 20px; color: #999; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>TourGo</h1>
                    <p>Xác nhận đặt tour thành công!</p>
                </div>
                <div class="content">
                    <p>Xin chào <strong>{booking.contact_name}</strong>,</p>
                    <p>Cảm ơn bạn đã đặt tour! Dưới đây là thông tin đặt tour của bạn:</p>
                    
                    <div class="info-box">
                        <p class="label">Mã đặt tour</p>
                        <p class="value">#{booking.id}</p>
                    </div>
                    
                    <div class="info-box">
                        <p class="label">Tên tour</p>
                        <p class="value">{tour.name}</p>
                    </div>
                    
                    <div class="info-box">
                        <p class="label">Ngày khởi hành</p>
                        <p class="value">{departure.start_date.strftime('%d/%m/%Y')}</p>
                    </div>
                    
                    <div class="info-box">
                        <p class="label">Số khách</p>
                        <p class="value">{booking.num_people} người</p>
                    </div>
                    
                    <div class="info-box">
                        <p class="label">Tổng thanh toán</p>
                        <p class="value price">{booking.total_price:,.0f} VND</p>
                    </div>
                    
                    <p style="margin-top: 20px;">
                        <strong>Trạng thái thanh toán:</strong> 
                        {"Đã thanh toán" if booking.payment_status == "fully_paid" else "Chờ thanh toán"}
                    </p>
                    
                    <p>Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận thông tin chi tiết.</p>
                    <p> Hotline: 1900 xxxx | Email: support@tourgo.com</p>
                </div>
                <div class="footer">
                    <p>TourGo - Hệ thống đặt tour du lịch trực tuyến</p>
                    <p>© {datetime.now().year} TourGo. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return cls._send_email(guest_email, subject, html)

    @classmethod
    def send_payment_confirmation(cls, booking, guest_email: str):
        """Gửi email xác nhận thanh toán"""
        departure = booking.departure
        tour = departure.tour
        
        subject = f"Thanh toán thành công - Tour #{booking.id} - TourGo"
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .success-icon {{ font-size: 60px; text-align: center; margin: 20px 0; }}
                .info-box {{ background: white; padding: 20px; border-radius: 8px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                .price {{ color: #11998e; font-size: 24px; font-weight: bold; }}
                .footer {{ text-align: center; padding: 20px; color: #999; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>TourGo</h1>
                    <p>Thanh toán thành công!</p>
                </div>
                <div class="content">
                    <div class="success-icon">✓</div>
                    <p>Xin chào <strong>{booking.contact_name}</strong>,</p>
                    <p>Chúng tôi đã nhận được thanh toán của bạn cho tour <strong>{tour.name}</strong>.</p>
                    
                    <div class="info-box">
                        <p class="label">Mã đặt tour</p>
                        <p class="value">#{booking.id}</p>
                    </div>
                    
                    <div class="info-box">
                        <p class="label">Số tiền đã thanh toán</p>
                        <p class="price">{booking.total_price:,.0f} VND</p>
                    </div>
                    
                    <p>Vé và lịch trình chi tiết sẽ được gửi đến email của bạn trước ngày khởi hành.</p>
                    <p> Hotline: 1900 xxxx | Email: support@tourgo.com</p>
                </div>
                <div class="footer">
                    <p>TourGo - Hệ thống đặt tour du lịch trực tuyến</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return cls._send_email(guest_email, subject, html)

    @classmethod
    def send_booking_to_company(cls, booking, company_email: str):
        """Gửi email thông báo có booking mới cho công ty"""
        departure = booking.departure
        tour = departure.tour
        
        subject = f"[TourGo] Có đơn đặt tour mới - #{booking.id}"
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .info-box {{ background: white; padding: 20px; border-radius: 8px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                .label {{ color: #666; font-size: 12px; text-transform: uppercase; }}
                .value {{ font-size: 16px; font-weight: bold; color: #333; }}
                .urgent {{ background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; }}
                .footer {{ text-align: center; padding: 20px; color: #999; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>TourGo</h1>
                    <p>Đơn đặt tour mới!</p>
                </div>
                <div class="content">
                    <div class="urgent">
                        <strong>⚠️ Có đơn đặt tour mới cần xác nhận!</strong>
                    </div>
                    
                    <p style="margin-top: 20px;">
                        Công ty <strong>{tour.company.company_name}</strong> có đơn đặt tour mới:
                    </p>
                    
                    <div class="info-box">
                        <p class="label">Mã đặt tour</p>
                        <p class="value">#{booking.id}</p>
                    </div>
                    
                    <div class="info-box">
                        <p class="label">Tour</p>
                        <p class="value">{tour.name}</p>
                    </div>
                    
                    <div class="info-box">
                        <p class="label">Ngày khởi hành</p>
                        <p class="value">{departure.start_date.strftime('%d/%m/%Y')}</p>
                    </div>
                    
                    <div class="info-box">
                        <p class="label">Số khách</p>
                        <p class="value">{booking.num_people} người</p>
                    </div>
                    
                    <div class="info-box">
                        <p class="label">Tổng giá trị</p>
                        <p class="value" style="color: #f5576c; font-size: 20px;">{booking.total_price:,.0f} VND</p>
                    </div>
                    
                    <div class="info-box">
                        <p class="label">Thông tin khách hàng</p>
                        <p><strong>Tên:</strong> {booking.contact_name}</p>
                        <p><strong>Email:</strong> {booking.contact_email}</p>
                        <p><strong>Điện thoại:</strong> {booking.contact_phone}</p>
                    </div>
                    
                    <p style="margin-top: 20px;">
                        Vui lòng đăng nhập vào hệ thống TourGo để xác nhận đơn đặt tour này.
                    </p>
                </div>
                <div class="footer">
                    <p>TourGo - Hệ thống quản lý tour du lịch</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return cls._send_email(company_email, subject, html)

    @classmethod
    def send_booking_status_update(cls, booking, guest_email: str, new_status: str):
        """Gửi email cập nhật trạng thái booking cho khách"""
        departure = booking.departure
        tour = departure.tour
        
        status_text = {
            "confirmed": "đã được xác nhận",
            "cancelled": "đã bị hủy",
            "completed": "đã hoàn thành"
        }.get(new_status, f"đã được cập nhật thành {new_status}")
        
        subject = f"Cập nhật trạng thái đặt tour #{booking.id} - TourGo"
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #4776e6 0%, #8e54e9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .status-box {{ background: white; padding: 20px; border-radius: 8px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }}
                .status {{ font-size: 18px; font-weight: bold; color: #4776e6; }}
                .footer {{ text-align: center; padding: 20px; color: #999; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>TourGo</h1>
                    <p>Cập nhật trạng thái đặt tour</p>
                </div>
                <div class="content">
                    <p>Xin chào <strong>{booking.contact_name}</strong>,</p>
                    <p>Trạng thái đặt tour <strong>#{booking.id}</strong> của bạn {status_text}.</p>
                    
                    <div class="status-box">
                        <p class="label">Trạng thái mới</p>
                        <p class="status">{status_text.upper()}</p>
                    </div>
                    
                    <div class="info-box" style="background: white; padding: 20px; border-radius: 8px;">
                        <p><strong>Tour:</strong> {tour.name}</p>
                        <p><strong>Ngày khởi hành:</strong> {departure.start_date.strftime('%d/%m/%Y')}</p>
                        <p><strong>Số khách:</strong> {booking.num_people} người</p>
                    </div>
                    
                    <p>Nếu có thắc mắc, vui lòng liên hệ với chúng tôi:</p>
                    <p>Hotline: 1900 xxxx | Email: support@tourgo.com</p>
                </div>
                <div class="footer">
                    <p>TourGo - Hệ thống đặt tour du lịch trực tuyến</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return cls._send_email(guest_email, subject, html)
