/**
 * Email templates with HTML and text versions
 * All templates use inline CSS for maximum email client compatibility
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

const baseStyles = `
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background-color: #4F46E5; color: white; padding: 30px 20px; text-align: center; }
  .content { background-color: #ffffff; padding: 30px 20px; }
  .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
`;

export function welcomeEmail(userName: string, dashboardUrl: string): EmailTemplate {
  const subject = 'Welcome to Next CRM! 🎉';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Next CRM!</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName},</h2>
          <p>Thanks for joining Next CRM! We're excited to have you on board.</p>
          <p>Your account has been created successfully. You can now:</p>
          <ul>
            <li>Upload and manage files with custom shortcodes</li>
            <li>Receive notifications when files are uploaded</li>
            <li>Integrate with Google Drive for seamless storage</li>
            <li>Track your usage and subscriptions</li>
          </ul>
          <p style="text-align: center;">
            <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
          </p>
          <p>If you have any questions, feel free to reach out to our support team.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Next CRM. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Welcome to Next CRM!

Hi ${userName},

Thanks for joining Next CRM! We're excited to have you on board.

Your account has been created successfully. You can now:
- Upload and manage files with custom shortcodes
- Receive notifications when files are uploaded
- Integrate with Google Drive for seamless storage
- Track your usage and subscriptions

Access your dashboard: ${dashboardUrl}

If you have any questions, feel free to reach out to our support team.

© ${new Date().getFullYear()} Next CRM. All rights reserved.
  `;
  
  return { subject, html, text };
}

export interface UploadDetails {
  fileName: string;
  fileSize: number;
  shortcode: string;
  uploaderInfo?: string;
  timestamp: Date;
}

export function uploadNotificationEmail(details: UploadDetails): EmailTemplate {
  const { fileName, fileSize, shortcode, uploaderInfo, timestamp } = details;
  const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
  const formattedDate = timestamp.toLocaleString();
  
  const subject = `New Upload: ${fileName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📤 New File Upload</h1>
        </div>
        <div class="content">
          <h2>You've received a new file!</h2>
          <p>A file has been uploaded to your shortcode <strong>${shortcode}</strong>.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>File Name:</strong> ${fileName}</p>
            <p style="margin: 5px 0;"><strong>File Size:</strong> ${fileSizeMB} MB</p>
            <p style="margin: 5px 0;"><strong>Upload Time:</strong> ${formattedDate}</p>
            ${uploaderInfo ? `<p style="margin: 5px 0;"><strong>Uploaded By:</strong> ${uploaderInfo}</p>` : ''}
          </div>
          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">View in Dashboard</a>
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Next CRM. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
New File Upload

You've received a new file!

A file has been uploaded to your shortcode ${shortcode}.

File Details:
- File Name: ${fileName}
- File Size: ${fileSizeMB} MB
- Upload Time: ${formattedDate}
${uploaderInfo ? `- Uploaded By: ${uploaderInfo}` : ''}

View in your dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard

© ${new Date().getFullYear()} Next CRM. All rights reserved.
  `;
  
  return { subject, html, text };
}

export function subscriptionConfirmedEmail(planName: string, amount: number): EmailTemplate {
  const subject = `Subscription Confirmed: ${planName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Subscription Confirmed</h1>
        </div>
        <div class="content">
          <h2>Thank you for subscribing!</h2>
          <p>Your subscription to the <strong>${planName}</strong> plan has been confirmed.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Plan:</strong> ${planName}</p>
            <p style="margin: 5px 0;"><strong>Amount:</strong> $${(amount / 100).toFixed(2)}/month</p>
          </div>
          <p>Your subscription is now active and you have access to all premium features.</p>
          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">Go to Dashboard</a>
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Next CRM. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Subscription Confirmed

Thank you for subscribing!

Your subscription to the ${planName} plan has been confirmed.

Plan: ${planName}
Amount: $${(amount / 100).toFixed(2)}/month

Your subscription is now active and you have access to all premium features.

Go to your dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard

© ${new Date().getFullYear()} Next CRM. All rights reserved.
  `;
  
  return { subject, html, text };
}

export function paymentFailedEmail(planName: string, retryDate: Date): EmailTemplate {
  const subject = 'Payment Failed - Action Required';
  const formattedDate = retryDate.toLocaleDateString();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header" style="background-color: #dc2626;">
          <h1>⚠️ Payment Failed</h1>
        </div>
        <div class="content">
          <h2>We couldn't process your payment</h2>
          <p>Unfortunately, we were unable to process the payment for your <strong>${planName}</strong> subscription.</p>
          <p>We'll automatically retry the payment on <strong>${formattedDate}</strong>.</p>
          <p>To avoid service interruption, please:</p>
          <ul>
            <li>Verify your payment method has sufficient funds</li>
            <li>Update your payment method if needed</li>
            <li>Check that your card hasn't expired</li>
          </ul>
          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">Update Payment Method</a>
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Next CRM. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Payment Failed - Action Required

We couldn't process your payment

Unfortunately, we were unable to process the payment for your ${planName} subscription.

We'll automatically retry the payment on ${formattedDate}.

To avoid service interruption, please:
- Verify your payment method has sufficient funds
- Update your payment method if needed
- Check that your card hasn't expired

Update your payment method: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard

© ${new Date().getFullYear()} Next CRM. All rights reserved.
  `;
  
  return { subject, html, text };
}

export function subscriptionCancelledEmail(planName: string, endDate: Date): EmailTemplate {
  const subject = 'Subscription Cancelled';
  const formattedDate = endDate.toLocaleDateString();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Subscription Cancelled</h1>
        </div>
        <div class="content">
          <h2>Your subscription has been cancelled</h2>
          <p>Your <strong>${planName}</strong> subscription has been cancelled as requested.</p>
          <p>You'll continue to have access to premium features until <strong>${formattedDate}</strong>.</p>
          <p>We're sorry to see you go! If you have any feedback about your experience, we'd love to hear it.</p>
          <p>You can resubscribe at any time from your dashboard.</p>
          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">View Dashboard</a>
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Next CRM. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Subscription Cancelled

Your subscription has been cancelled

Your ${planName} subscription has been cancelled as requested.

You'll continue to have access to premium features until ${formattedDate}.

We're sorry to see you go! If you have any feedback about your experience, we'd love to hear it.

You can resubscribe at any time from your dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard

© ${new Date().getFullYear()} Next CRM. All rights reserved.
  `;
  
  return { subject, html, text };
}

export function passwordResetEmail(resetLink: string, expiresIn: string): EmailTemplate {
  const subject = 'Reset Your Password';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Reset your password</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <p style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </p>
          <p>This link will expire in <strong>${expiresIn}</strong>.</p>
          <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          <p style="color: #6b7280; font-size: 14px;">For security reasons, this link can only be used once.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Next CRM. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Password Reset Request

Reset your password

We received a request to reset your password. Click the link below to create a new password:

${resetLink}

This link will expire in ${expiresIn}.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

For security reasons, this link can only be used once.

© ${new Date().getFullYear()} Next CRM. All rights reserved.
  `;
  
  return { subject, html, text };
}
