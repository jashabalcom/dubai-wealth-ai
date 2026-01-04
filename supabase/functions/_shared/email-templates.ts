// Shared branded email templates for Dubai Real Estate Investor
// Domain: Uses SITE_URL environment variable for dynamic domain switching

const SITE_URL = Deno.env.get('SITE_URL') || 'https://dubairealestateinvestor.com';
const SITE_NAME = 'Dubai Real Estate Investor';

const BRAND_COLORS = {
  primary: '#0A0F1D',
  gold: '#CBB89E',
  goldDark: '#a89878',
  background: '#f8f8f8',
  text: '#333333',
  mutedText: '#666666',
  border: '#eeeeee',
};

const FOOTER_HTML = `
  <tr>
    <td style="padding: 30px 40px; background-color: ${BRAND_COLORS.primary}; border-radius: 0 0 8px 8px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color: ${BRAND_COLORS.gold}; font-size: 14px; font-weight: 600; padding-bottom: 15px;">
            ${SITE_NAME}
          </td>
        </tr>
        <tr>
          <td style="color: #999999; font-size: 12px; line-height: 1.6;">
            <p style="margin: 0 0 10px;">Balcom Privé LLC | Dubai, UAE</p>
            <p style="margin: 0 0 10px;">
              <a href="${SITE_URL}/privacy" style="color: #999999; text-decoration: underline;">Privacy Policy</a> · 
              <a href="${SITE_URL}/terms" style="color: #999999; text-decoration: underline;">Terms of Service</a> · 
              <a href="${SITE_URL}/settings" style="color: #999999; text-decoration: underline;">Unsubscribe</a>
            </p>
            <p style="margin: 0; color: #666666;">
              © ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
`;

export function createEmailWrapper(content: string, preheader = ''): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${SITE_NAME}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    img { border: 0; display: block; }
    .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, ${BRAND_COLORS.gold} 0%, ${BRAND_COLORS.goldDark} 100%); color: ${BRAND_COLORS.primary}; text-decoration: none; font-weight: 600; border-radius: 8px; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 0 10px !important; }
      .content { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>` : ''}
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
    <tr>
      <td align="center">
        <table class="container" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px; background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, #1a2035 100%); border-radius: 8px 8px 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display: inline-block; width: 40px; height: 40px; background: ${BRAND_COLORS.gold}; border-radius: 8px; text-align: center; line-height: 40px; font-weight: bold; color: ${BRAND_COLORS.primary}; font-size: 16px;">DR</span>
                    <span style="color: #ffffff; font-size: 18px; font-weight: 600; margin-left: 12px; vertical-align: middle;">${SITE_NAME}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td class="content" style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          ${FOOTER_HTML}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export function welcomeEmailTemplate(name: string): string {
  const content = `
    <h1 style="margin: 0 0 20px; color: ${BRAND_COLORS.primary}; font-size: 28px; font-weight: 700;">
      Welcome to ${SITE_NAME}, ${name}! 🎉
    </h1>
    
    <p style="margin: 0 0 20px; color: ${BRAND_COLORS.text}; font-size: 16px; line-height: 1.6;">
      You've just taken the first step toward building wealth through Dubai real estate. 
      Our AI-powered platform gives you the edge that only the top investors have had—until now.
    </p>
    
    <div style="background: ${BRAND_COLORS.background}; border-radius: 8px; padding: 24px; margin: 24px 0;">
      <h2 style="margin: 0 0 16px; color: ${BRAND_COLORS.primary}; font-size: 18px;">Here's what you can do next:</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.text};">✓ Browse 1,300+ verified properties</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.text};">✓ Get AI-powered investment insights</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.text};">✓ Learn from our Dubai Investment Academy</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.text};">✓ Connect with 12,000+ global investors</td>
        </tr>
      </table>
    </div>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="${SITE_URL}/dashboard" class="btn">
        Go to Your Dashboard →
      </a>
    </p>
    
    <p style="margin: 0; color: ${BRAND_COLORS.mutedText}; font-size: 14px; line-height: 1.6;">
      Need help getting started? Reply to this email or reach our support team anytime.
    </p>
  `;

  return createEmailWrapper(content, `Welcome aboard, ${name}! Your Dubai investment journey starts now.`);
}

export function subscriptionConfirmedTemplate(name: string, tier: string): string {
  const tierName = tier === 'elite' ? 'Dubai Elite' : 'Dubai Investor';
  
  const content = `
    <h1 style="margin: 0 0 20px; color: ${BRAND_COLORS.primary}; font-size: 28px; font-weight: 700;">
      Welcome to ${tierName}! 🌟
    </h1>
    
    <p style="margin: 0 0 20px; color: ${BRAND_COLORS.text}; font-size: 16px; line-height: 1.6;">
      Congratulations, ${name}! Your ${tierName} membership is now active. 
      You now have access to our premium features designed to accelerate your investment success.
    </p>
    
    <div style="background: linear-gradient(135deg, ${BRAND_COLORS.gold}20 0%, ${BRAND_COLORS.goldDark}10 100%); border: 1px solid ${BRAND_COLORS.gold}40; border-radius: 8px; padding: 24px; margin: 24px 0;">
      <h2 style="margin: 0 0 16px; color: ${BRAND_COLORS.primary}; font-size: 18px;">Your ${tierName} Benefits:</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${tier === 'elite' ? `
          <tr><td style="padding: 8px 0; color: ${BRAND_COLORS.text};">⭐ Unlimited AI analysis queries</td></tr>
          <tr><td style="padding: 8px 0; color: ${BRAND_COLORS.text};">⭐ Priority access to off-plan launches</td></tr>
          <tr><td style="padding: 8px 0; color: ${BRAND_COLORS.text};">⭐ 1-on-1 investment consultations</td></tr>
          <tr><td style="padding: 8px 0; color: ${BRAND_COLORS.text};">⭐ Exclusive deal alerts</td></tr>
        ` : `
          <tr><td style="padding: 8px 0; color: ${BRAND_COLORS.text};">✓ 50 AI queries per month</td></tr>
          <tr><td style="padding: 8px 0; color: ${BRAND_COLORS.text};">✓ Full Academy access</td></tr>
          <tr><td style="padding: 8px 0; color: ${BRAND_COLORS.text};">✓ Community events access</td></tr>
          <tr><td style="padding: 8px 0; color: ${BRAND_COLORS.text};">✓ Deal alerts</td></tr>
        `}
      </table>
    </div>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="${SITE_URL}/dashboard" class="btn">
        Explore Your Benefits →
      </a>
    </p>
  `;

  return createEmailWrapper(content, `Your ${tierName} membership is active!`);
}

export function contactConfirmationTemplate(name: string, subject: string): string {
  const content = `
    <h1 style="margin: 0 0 20px; color: ${BRAND_COLORS.primary}; font-size: 28px; font-weight: 700;">
      Thank you for reaching out, ${name}!
    </h1>
    
    <p style="margin: 0 0 20px; color: ${BRAND_COLORS.text}; font-size: 16px; line-height: 1.6;">
      We've received your message regarding "<strong>${subject}</strong>" and our team will get back to you within 24-48 business hours.
    </p>
    
    <div style="background: ${BRAND_COLORS.background}; border-radius: 8px; padding: 24px; margin: 24px 0;">
      <p style="margin: 0; color: ${BRAND_COLORS.text}; font-size: 14px; line-height: 1.6;">
        In the meantime, explore our free resources:
      </p>
      <ul style="margin: 16px 0 0; padding-left: 20px; color: ${BRAND_COLORS.text};">
        <li style="padding: 4px 0;"><a href="${SITE_URL}/academy" style="color: ${BRAND_COLORS.goldDark};">Dubai Investment Academy</a></li>
        <li style="padding: 4px 0;"><a href="${SITE_URL}/tools" style="color: ${BRAND_COLORS.goldDark};">Investment Calculators</a></li>
        <li style="padding: 4px 0;"><a href="${SITE_URL}/properties" style="color: ${BRAND_COLORS.goldDark};">Property Listings</a></li>
      </ul>
    </div>
    
    <p style="margin: 0; color: ${BRAND_COLORS.mutedText}; font-size: 14px;">
      Best regards,<br>
      <strong>The ${SITE_NAME} Team</strong>
    </p>
  `;

  return createEmailWrapper(content, `We received your message - ${SITE_NAME}`);
}

export function paymentFailedTemplate(name: string): string {
  const content = `
    <h1 style="margin: 0 0 20px; color: #dc2626; font-size: 28px; font-weight: 700;">
      Payment Issue Detected
    </h1>
    
    <p style="margin: 0 0 20px; color: ${BRAND_COLORS.text}; font-size: 16px; line-height: 1.6;">
      Hi ${name}, we were unable to process your subscription payment. 
      To avoid service interruption, please update your payment method.
    </p>
    
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 24px; margin: 24px 0;">
      <p style="margin: 0; color: #991b1b; font-size: 14px;">
        ⚠️ Your premium features may be limited until payment is resolved.
      </p>
    </div>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="${SITE_URL}/settings" class="btn" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);">
        Update Payment Method →
      </a>
    </p>
    
    <p style="margin: 0; color: ${BRAND_COLORS.mutedText}; font-size: 14px;">
      Need help? Contact us at support@dubairealestateinvestor.com
    </p>
  `;

  return createEmailWrapper(content, `Action required: Payment issue with your ${SITE_NAME} subscription`);
}
