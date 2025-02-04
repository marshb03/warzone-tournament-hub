# app/core/email.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Any, Dict
from app.core.config import settings

def get_email_template(content: str) -> str:
    """Base template for all emails"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background-color: #2979FF;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }}
            .content {{
                background-color: #ffffff;
                padding: 20px;
                border: 1px solid #e0e0e0;
                border-radius: 0 0 8px 8px;
            }}
            .button {{
                display: inline-block;
                padding: 12px 24px;
                background-color: #2979FF;
                color: #ffffff !important;  /* Force white text color */
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
                font-weight: 500;  /* Slightly bolder text */
            }}
            /* Ensure link in button is also white */
            .button:link,
            .button:visited,
            .button:hover,
            .button:active {{
                color: #ffffff !important;
                text-decoration: none;
            }}
            .footer {{
                text-align: center;
                margin-top: 20px;
                color: #666;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1 style="color: #ffffff; margin: 0;">{settings.PROJECT_NAME}</h1>
        </div>
        <div class="content">
            {content}
        </div>
        <div class="footer">
            <p>© {settings.PROJECT_NAME}. All rights reserved.</p>
        </div>
    </body>
    </html>
    """

async def send_email(email_to: str, subject: str, html_content: str) -> None:
    """Send email using configured SMTP server"""
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM_ADDRESS}>"
        message["To"] = email_to

        html_part = MIMEText(get_email_template(html_content), "html")
        message.attach(html_part)

        print(f"Attempting to connect to {settings.SMTP_HOST}:{settings.SMTP_PORT}")
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            print("Connected to SMTP server, starting TLS")
            server.starttls()
            print("TLS started, attempting login")
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            print("Login successful, sending message")
            server.send_message(message)
            print("Message sent successfully")
            
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        print(f"SMTP Settings: Host={settings.SMTP_HOST}, Port={settings.SMTP_PORT}, User={settings.SMTP_USER}")
        raise

async def send_verification_email(email_to: str, token: str, username: str) -> None:
    """Send email verification link"""
    verify_url = f"{settings.FRONTEND_URL}/verify-email/{token}"
    
    subject = f"{settings.PROJECT_NAME} - Verify Your Email"
    
    content = f"""
        <h2>Welcome, {username}!</h2>
        <p>Thanks for registering with {settings.PROJECT_NAME}! Please verify your email address to get started.</p>
        <p><a href="{verify_url}" class="button">Verify Email Address</a></p>
        <p>If the button above doesn't work, you can copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; color: #666;">{verify_url}</p>
        <p>This link will expire in 48 hours.</p>
        <p>If you didn't register for an account, you can safely ignore this email.</p>
        <br>
        <p>Best regards,<br>The {settings.PROJECT_NAME} Team</p>
    """
    
    await send_email(email_to=email_to, subject=subject, html_content=content)

async def send_password_reset_email(email_to: str, token: str, username: str) -> None:
    """Send password reset email"""
    reset_url = f"{settings.FRONTEND_URL}/reset-password/{token}"
    subject = f"{settings.PROJECT_NAME} - Password Reset"
    
    content = f"""
        <h2>Hello {username},</h2>
        <p>We received a request to reset your password. Click the button below to choose a new password:</p>
        <p><a href="{reset_url}" class="button">Reset Password</a></p>
        <p>If the button above doesn't work, you can copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; color: #666;">{reset_url}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <br>
        <p>Best regards,<br>The {settings.PROJECT_NAME} Team</p>
    """

    await send_email(email_to=email_to, subject=subject, html_content=content)