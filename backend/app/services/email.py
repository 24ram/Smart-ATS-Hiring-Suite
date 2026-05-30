import smtplib
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

SMTP_HOST = settings.SMTP_HOST
SMTP_PORT = settings.SMTP_PORT
SMTP_USER = settings.SMTP_USER
SMTP_PASS = settings.SMTP_PASS
SMTP_FROM_EMAIL = settings.SMTP_FROM_EMAIL or settings.SMTP_USER

def _send_email_sync(to_email: str, subject: str, html_content: str):
    """Synchronous function to send an email."""

    print("===== SMTP DEBUG =====")
    print("SMTP_HOST:", SMTP_HOST)
    print("SMTP_PORT:", SMTP_PORT)
    print("SMTP_USER:", SMTP_USER)
    print("SMTP_FROM_EMAIL:", SMTP_FROM_EMAIL)
    print("SMTP_PASS loaded:", bool(SMTP_PASS))
    print("======================")

    if not SMTP_USER or not SMTP_PASS:
        print(f"[EMAIL SIMULATION] Sending to: {to_email}")
        print(f"[EMAIL SIMULATION] Subject: {subject}")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_FROM_EMAIL
        msg["To"] = to_email

        part = MIMEText(html_content, "html")
        msg.attach(part)

        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_FROM_EMAIL, to_email, msg.as_string())
        server.quit()

        print(f"✅ Email sent successfully to {to_email}")
        return True

    except Exception as e:
        print(f"❌ Failed to send email to {to_email}: {e}")
        return False

async def send_email_async(to_email: str, subject: str, html_content: str):
    """Wrapper to run email sending asynchronously without blocking FastAPI."""
    return await asyncio.to_thread(_send_email_sync, to_email, subject, html_content)


# --- TEMPLATES & SENDERS ---

def build_email_template(title: str, body_html: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6; -webkit-font-smoothing: antialiased;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #111827; width: 100%; margin: 0; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #1f2937; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3);">
                        <!-- Header -->
                        <tr>
                            <td style="background-color: #111827; padding: 30px 40px; text-align: center; border-bottom: 1px solid #374151;">
                                <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: 1px;">SMART<span style="color: #60a5fa;">ATS</span></h1>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px; text-align: left; background-color: #1f2937;">
                                {body_html}
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #111827; padding: 30px 40px; text-align: center; border-top: 1px solid #374151;">
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #9ca3af;">SmartATS Hiring Suite</p>
                                <p style="margin: 0; font-size: 12px; color: #6b7280;">This is an automated message. Please do not reply directly to this email.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

async def send_application_received_email(to_email: str, candidate_name: str, job_title: str):
    subject = f"Application Received – {job_title}"
    body = f"""
    <h2 style="margin-top: 0; color: #f9fafb; font-size: 20px;">Hi {candidate_name},</h2>
    <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Thank you for applying for the <strong style="color: #ffffff;">{job_title}</strong> role at SmartATS.</p>
    <div style="background-color: #374151; padding: 20px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #60a5fa;">
        <p style="margin: 0; color: #e5e7eb; font-size: 15px; line-height: 1.5;">Our team has received your application and resume. We are currently reviewing your profile and will be in touch soon regarding the next steps.</p>
    </div>
    <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin-top: 30px;">Best regards,<br><strong style="color: #f9fafb;">The SmartATS Recruiting Team</strong></p>
    """
    html = build_email_template("Application Received", body)
    await send_email_async(to_email, subject, html)


async def send_interview_invitation_email(to_email: str, candidate_name: str, job_title: str, interviewer_name: str, scheduled_at: str, meeting_link: str):
    subject = f"Interview Invitation – {job_title}"
    body = f"""
    <h2 style="margin-top: 0; color: #f9fafb; font-size: 20px;">Hi {candidate_name},</h2>
    <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">We are excited to invite you to an interview for the <strong style="color: #ffffff;">{job_title}</strong> position.</p>
    
    <div style="background-color: #374151; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
        <h3 style="margin-top: 0; margin-bottom: 16px; color: #93c5fd; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Interview Details</h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td style="padding-bottom: 12px; width: 120px;"><strong style="color: #9ca3af; font-size: 14px;">Interviewer:</strong></td>
                <td style="padding-bottom: 12px; color: #f3f4f6; font-size: 15px;">{interviewer_name}</td>
            </tr>
            <tr>
                <td style="padding-bottom: 12px;"><strong style="color: #9ca3af; font-size: 14px;">Date & Time:</strong></td>
                <td style="padding-bottom: 12px; color: #f3f4f6; font-size: 15px;">{scheduled_at}</td>
            </tr>
        </table>
        
        <div style="margin-top: 20px; text-align: center;">
            <a href="{meeting_link}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 15px;">Join Meeting</a>
        </div>
    </div>
    
    <p style="color: #9ca3af; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">Please ensure you are in a quiet environment with a stable internet connection.</p>
    <p style="color: #d1d5db; font-size: 16px; line-height: 1.6;">Best regards,<br><strong style="color: #f9fafb;">The SmartATS Recruiting Team</strong></p>
    """
    html = build_email_template("Interview Invitation", body)
    await send_email_async(to_email, subject, html)


async def send_offer_sent_email(to_email: str, candidate_name: str, job_title: str, salary: str, joining_date: str, recruiter_name: str = "The SmartATS Recruiting Team"):
    subject = f"Official Offer Letter – {job_title}"
    body = f"""
    <h2 style="margin-top: 0; color: #f9fafb; font-size: 20px;">Congratulations {candidate_name}!</h2>
    <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">We are thrilled to extend an offer for the <strong style="color: #ffffff;">{job_title}</strong> position at SmartATS.</p>
    
    <div style="background-color: #374151; padding: 24px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #10b981;">
        <h3 style="margin-top: 0; margin-bottom: 16px; color: #6ee7b7; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Offer Details</h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td style="padding-bottom: 12px; width: 160px;"><strong style="color: #9ca3af; font-size: 14px;">Role:</strong></td>
                <td style="padding-bottom: 12px; color: #f3f4f6; font-size: 15px; font-weight: 600;">{job_title}</td>
            </tr>
            <tr>
                <td style="padding-bottom: 12px;"><strong style="color: #9ca3af; font-size: 14px;">Salary:</strong></td>
                <td style="padding-bottom: 12px; color: #f3f4f6; font-size: 15px; font-weight: 600;">{salary}</td>
            </tr>
            <tr>
                <td style="padding-bottom: 0;"><strong style="color: #9ca3af; font-size: 14px;">Proposed Joining Date:</strong></td>
                <td style="padding-bottom: 0; color: #f3f4f6; font-size: 15px;">{joining_date}</td>
            </tr>
        </table>
    </div>
    
    <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Please review the details in your candidate portal. Our recruiting team will follow up with the official contract shortly.</p>
    <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin-top: 30px;">We look forward to welcoming you to the team!</p>
    <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin-top: 30px;">Best regards,<br><strong style="color: #f9fafb;">{recruiter_name}</strong></p>
    """
    html = build_email_template("Job Offer", body)
    await send_email_async(to_email, subject, html)


async def send_status_update_email(to_email: str, candidate_name: str, job_title: str, new_status: str, recruiter_message: str = None):
    subject = f"Application Status Update – {job_title}"
    
    message_block = ""
    if recruiter_message:
        message_block = f"""
        <div style="background-color: #1f2937; padding: 16px; border-radius: 6px; margin-top: 16px; border: 1px solid #4b5563;">
            <p style="margin: 0; color: #d1d5db; font-size: 14px; font-style: italic;">"{recruiter_message}"</p>
        </div>
        """
        
    body = f"""
    <h2 style="margin-top: 0; color: #f9fafb; font-size: 20px;">Hi {candidate_name},</h2>
    <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">We are writing to inform you that your application status for the <strong style="color: #ffffff;">{job_title}</strong> role has been updated.</p>
    
    <div style="background-color: #374151; padding: 20px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
        <p style="margin: 0; color: #9ca3af; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">New Status</p>
        <div style="display: inline-block; background-color: #4b5563; color: #ffffff; padding: 8px 16px; border-radius: 9999px; font-weight: 600; font-size: 15px; letter-spacing: 0.5px; text-transform: uppercase;">
            {new_status}
        </div>
        {message_block}
    </div>
    
    <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">If you have any questions, please feel free to reach out to our team.</p>
    <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin-top: 30px;">Best regards,<br><strong style="color: #f9fafb;">The SmartATS Recruiting Team</strong></p>
    """
    html = build_email_template("Status Update", body)
    await send_email_async(to_email, subject, html)

async def send_offer_response_email(recruiter_email: str, candidate_name: str, job_title: str, response: str):
    subject = f"Offer {response.title()} – {candidate_name} ({job_title})"
    color = "#10b981" if response.lower() == "accepted" else "#ef4444"
    body = f"""
    <h2 style="margin-top: 0; color: #f9fafb; font-size: 20px;">Offer {response.title()}</h2>
    <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Candidate <strong style="color: #ffffff;">{candidate_name}</strong> has <strong style="color: {color};">{response.lower()}</strong> the offer for <strong style="color: #ffffff;">{job_title}</strong>.</p>
    <p style="color: #d1d5db; font-size: 16px; line-height: 1.6;">You can view the updated status in the SmartATS Recruiter Dashboard.</p>
    """
    html = build_email_template("Offer Response", body)
    await send_email_async(recruiter_email, subject, html)
