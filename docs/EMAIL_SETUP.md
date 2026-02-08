# Email Setup Guide

This document provides setup instructions for the email functionality in Next CRM using nodemailer and Mailtrap.

## Overview

Next CRM uses nodemailer for sending transactional emails with environment-aware SMTP configuration:
- **Development/Testing**: Mailtrap sandbox (safe email testing without sending to real addresses)
- **Production**: Configurable SMTP service (SendGrid, AWS SES, Mailgun, etc.)

## Email Features

The application sends emails for the following scenarios:

1. **Welcome Email** - Sent when a new user registers
2. **Upload Notifications** - Sent when someone uploads a file via the user's shortcode
3. **Subscription Lifecycle**:
   - Subscription confirmed (after successful payment)
   - Payment failed (with retry information)
   - Subscription cancelled (with end date)
4. **Password Reset** - Sent when user requests password reset

## Environment Variables

Add these environment variables to your `.env.local` (development) or production environment:

```bash
# Email Configuration (Required)
SMTP_HOST=sandbox.smtp.mailtrap.io    # Mailtrap sandbox for dev/test
SMTP_PORT=2525                         # Mailtrap port (or 465/587 for production)
SMTP_USER=your_mailtrap_username       # Get from Mailtrap inbox settings
SMTP_PASS=your_mailtrap_password       # Get from Mailtrap inbox settings
SMTP_SECURE=false                      # Set to 'true' for port 465 (SSL)
EMAIL_FROM="Next CRM <noreply@nextcrm.com>"  # Sender address

# Application URL (Required for links in emails)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to production URL when deployed
```

## Development Setup (Mailtrap)

### 1. Create a Mailtrap Account

1. Visit [mailtrap.io](https://mailtrap.io) and sign up for a free account
2. Navigate to **Email Testing** → **Inboxes**
3. Create a new inbox or use the default "My Inbox"

### 2. Get SMTP Credentials

1. Click on your inbox
2. Go to **SMTP Settings** tab
3. Select **Nodemailer** from the integration dropdown
4. Copy the credentials shown:
   - Host: `sandbox.smtp.mailtrap.io`
   - Port: `2525`
   - Username: (your unique username)
   - Password: (your password)

### 3. Configure Environment Variables

Create or update `.env.local` in your project root:

```bash
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=abc123def456      # Replace with your username
SMTP_PASS=xyz789uvw012      # Replace with your password
SMTP_SECURE=false
EMAIL_FROM="Next CRM Dev <dev@nextcrm.com>"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Test Email Functionality

Start your development server:
```bash
npm run dev
```

Register a new user and check your Mailtrap inbox for the welcome email.

## Production Setup

For production, use a reliable SMTP service:

### Recommended Services

1. **SendGrid** (Free tier: 100 emails/day)
   ```bash
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your_sendgrid_api_key
   SMTP_SECURE=false
   ```

2. **AWS SES** (Pay as you go, very reliable)
   ```bash
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_USER=your_aws_access_key_id
   SMTP_PASS=your_aws_secret_access_key
   SMTP_SECURE=false
   ```

3. **Mailgun** (Free tier: 5,000 emails/month for 3 months)
   ```bash
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USER=postmaster@your-domain.mailgun.org
   SMTP_PASS=your_mailgun_password
   SMTP_SECURE=false
   ```

### Production Configuration

1. Choose an SMTP provider from the recommendations above
2. Set up your account and verify your domain (required by most providers)
3. Update your production environment variables (Vercel, Railway, etc.)
4. Update `EMAIL_FROM` to use your verified domain:
   ```bash
   EMAIL_FROM="Next CRM <noreply@yourdomain.com>"
   ```

## Email Templates

All email templates are located in [`lib/services/emailTemplates.ts`](../lib/services/emailTemplates.ts).

Templates include:
- **HTML version** with inline CSS for maximum compatibility
- **Plain text version** as fallback
- **Responsive design** that works on all email clients

### Customizing Templates

To customize email templates:

1. Edit [`lib/services/emailTemplates.ts`](../lib/services/emailTemplates.ts)
2. Modify the `baseStyles` constant for global styling
3. Update individual template functions for specific emails
4. Test changes in Mailtrap before deploying

## Testing Emails

### Manual Testing

1. Start dev server: `npm run dev`
2. Trigger email events:
   - Register: `POST /api/register` with email/password
   - Password reset: `POST /api/auth/forgot-password` with email
   - Upload: Use upload service when implemented
3. Check Mailtrap inbox for emails

### Automated Testing

Run unit tests for email service:
```bash
npm test tests/api/email.test.ts
```

Tests verify:
- Email sending with retries
- Correct template content
- HTML and text versions
- Error handling

## Troubleshooting

### Emails Not Sending

**Check SMTP credentials:**
```bash
# In your app, verify configuration is loaded
console.log(process.env.SMTP_HOST)
```

**Test SMTP connection:**
The email service automatically logs connection status. Check your server logs for:
```
Email transporter created { host: '...', port: ..., environment: '...' }
```

**Verify Mailtrap inbox:**
- Make sure you're checking the correct inbox
- Check the "Spam" tab in Mailtrap
- Verify API credentials haven't expired

### Common Errors

**Error: "Invalid login"**
- Double-check SMTP_USER and SMTP_PASS
- Regenerate credentials in Mailtrap if needed

**Error: "Connection timeout"**
- Check SMTP_HOST and SMTP_PORT
- Verify firewall isn't blocking SMTP ports
- Try using port 2525 (Mailtrap) or 587 (production)

**Error: "Email not found in logs"**
- Email sending is non-blocking (won't fail registration)
- Check application logs for email errors:
  ```
  Failed to send welcome email, but registration succeeded
  ```

### Debug Mode

Enable detailed email logging by setting log level:
```bash
LOG_LEVEL=debug npm run dev
```

This will show detailed email sending attempts and responses.

## Email Service Architecture

```
┌─────────────────────────────────────────┐
│  User Action (Register, Upload, etc.)  │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Service Layer                          │
│  (registerService, stripeWebhookService)│
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Email Service (lib/services/email...)  │
│  - emailService.ts (send functions)     │
│  - emailTemplates.ts (HTML/text)        │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Nodemailer (SMTP client)               │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  SMTP Server                            │
│  - Mailtrap (dev/test)                  │
│  - SendGrid/SES/etc (production)        │
└─────────────────────────────────────────┘
```

## Security Best Practices

1. **Never commit SMTP credentials** - Use environment variables only
2. **Use different credentials** for dev/test/production
3. **Rotate credentials** regularly (quarterly recommended)
4. **Monitor email sending** - Set up alerts for failed sends
5. **Rate limiting** - Most SMTP providers have rate limits; monitor usage
6. **Verified domains** - Use verified sender domains in production
7. **SPF/DKIM/DMARC** - Configure email authentication records

## API Reference

### Email Service Functions

Located in [`lib/services/emailService.ts`](../lib/services/emailService.ts):

- `sendWelcomeEmail(to: string, userName: string)` - Send welcome email
- `sendUploadNotification(to: string, details: UploadDetails)` - Notify on upload
- `sendSubscriptionConfirmed(to: string, planName: string, amount: number)` - Subscription confirmation
- `sendPaymentFailed(to: string, planName: string, retryDate: Date)` - Payment failure notice
- `sendSubscriptionCancelled(to: string, planName: string, endDate: Date)` - Cancellation confirmation
- `sendPasswordReset(to: string, resetToken: string, expiresIn: string)` - Password reset link
- `verifyEmailConfig()` - Test SMTP configuration

### Password Reset API

**Request Password Reset:**
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Reset Password:**
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "newpassword123"
}
```

## Migration from Supabase Email

The application previously used Supabase's automatic email system. This has been replaced with nodemailer to provide:

- ✅ **Custom templates** - Full control over email design
- ✅ **Better deliverability** - Use professional SMTP providers
- ✅ **Email tracking** - Monitor sends, opens, clicks (provider-dependent)
- ✅ **Cost control** - Choose provider based on volume and budget

No database migrations required. The change is purely in the application layer.

## Support

For issues or questions:
1. Check this guide's troubleshooting section
2. Review logs in your application
3. Check Mailtrap/SMTP provider dashboards
4. Open an issue in the project repository

## Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Mailtrap Documentation](https://mailtrap.io/docs/)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [Email Template Best Practices](https://www.campaignmonitor.com/resources/guides/email-design/)
