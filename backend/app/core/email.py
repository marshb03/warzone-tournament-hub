# app/core/email.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Any, Dict
from app.core.config import settings
import logging

# Update send_email function
async def send_email(
    email_to: str,
    subject: str,
    html_content: str,
) -> None:
    """Send email using configured SMTP server"""
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = settings.EMAIL_FROM_ADDRESS
        message["To"] = email_to

        html_part = MIMEText(html_content, "html")
        message.attach(html_part)

        # Create SMTP connection
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(message)
            
        logging.info(f"Email sent successfully to {email_to}")
        
    except Exception as e:
        logging.error(f"Failed to send email: {str(e)}")
        raise

# app/core/email.py
async def send_password_reset_email(email_to: str, token: str, username: str) -> None:
    """Send password reset email with token"""
    reset_url = f"{settings.FRONTEND_URL}/reset-password/{token}"
    subject = f"{settings.PROJECT_NAME} - Password Recovery"
    
    html_content = f"""
        <p>Hi {username},</p>
        <p>You have requested to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="{reset_url}">Reset Password</a></p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 24 hours.</p>
    """
    
    # Add await here
    await send_email(
        email_to=email_to,
        subject=subject,
        html_content=html_content
    )

# app/core/email.py
async def send_verification_email(email_to: str, token: str, username: str) -> None:
    """Send email verification link"""
    verify_url = f"{settings.FRONTEND_URL}/verify-email/{token}"
    
    subject = f"{settings.PROJECT_NAME} - Verify Your Email"
    
    html_content = f"""
        <p>Hi {username},</p>
        <p>Thanks for registering with {settings.PROJECT_NAME}! Please verify your email address by clicking the link below:</p>
        <p><a href="{verify_url}">Verify Email Address</a></p>
        <p>Or copy and paste this URL into your browser:</p>
        <p>{verify_url}</p>
        <p>This link will expire in 48 hours.</p>
        <p>If you didn't register for an account, you can safely ignore this email.</p>
        <br>
        <p>Best regards,</p>
        <p>The {settings.PROJECT_NAME} Team</p>
    """
    
    await send_email(
        email_to=email_to,
        subject=subject,
        html_content=html_content
    )