import html
import smtplib
import ssl
from email.message import EmailMessage

from app.config import (
    SMTP_FROM_EMAIL,
    SMTP_HOST,
    SMTP_PASSWORD,
    SMTP_PORT,
    SMTP_USE_SSL,
    SMTP_USERNAME,
)


def send_password_reset_email(recipient: str, reset_url: str) -> None:
    """Send a password-reset link using the configured SMTP account."""
    required_settings = {
        "SMTP_HOST": SMTP_HOST,
        "SMTP_USERNAME": SMTP_USERNAME,
        "SMTP_PASSWORD": SMTP_PASSWORD,
        "SMTP_FROM_EMAIL": SMTP_FROM_EMAIL,
    }
    missing = [name for name, value in required_settings.items() if not value]
    if missing:
        raise RuntimeError(f"Missing SMTP configuration: {', '.join(missing)}")

    message = EmailMessage()
    message["Subject"] = "Reset your To-Do app password"
    message["From"] = SMTP_FROM_EMAIL
    message["To"] = recipient
    message.set_content(
        "We received a request to reset your To-Do app password.\n\n"
        f"Use this link within 15 minutes to choose a new password:\n{reset_url}\n\n"
        "If you did not request this, you can ignore this email."
    )
    message.add_alternative(
        "<p>We received a request to reset your To-Do app password.</p>"
        "<p>This link expires in 15 minutes:</p>"
        f'<p><a href="{html.escape(reset_url, quote=True)}">Reset your password</a></p>'
        "<p>If you did not request this, you can ignore this email.</p>",
        subtype="html",
    )

    context = ssl.create_default_context()
    if SMTP_USE_SSL:
        with smtplib.SMTP_SSL(
            SMTP_HOST, SMTP_PORT, context=context, timeout=20
        ) as server:
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(message)
    else:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as server:
            server.ehlo()
            server.starttls(context=context)
            server.ehlo()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(message)
