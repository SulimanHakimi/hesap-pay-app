import nodemailer from 'nodemailer';

export type PaymentEmailDetails = {
  orderId: string;
  itemName: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  transactionId: string;
};

export async function sendPaymentEmail(details: PaymentEmailDetails) {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpSecure = process.env.SMTP_SECURE === 'true';
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  console.log('─── Payment Email Details ───');
  console.log(`To: afgsuliman50@gmail.com`);
  console.log(`Subject: Payment Successful - ${details.amount} AFN`);
  console.log(`Order ID: ${details.orderId}`);
  console.log(`Transaction ID: ${details.transactionId}`);
  console.log(`Customer: ${details.customerName} <${details.customerEmail}>`);
  console.log(`Item: ${details.itemName}`);
  console.log(`Amount: ${details.amount} AFN`);
  console.log('─────────────────────────────');

  if (!smtpUser || !smtpPass) {
    console.warn('[mailer] SMTP_USER or SMTP_PASS environment variables are not set. Skipping real email transmission. Check console log above for details.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const mailOptions = {
    from: `"Payment Gateway" <${smtpUser}>`,
    to: 'afgsuliman50@gmail.com',
    subject: `Payment Successful: ؋${details.amount.toLocaleString()} from ${details.customerName}`,
    text: `
Payment Successful
------------------
A payment has been successfully completed via HesabPay.

Payment Details:
- Order ID: ${details.orderId}
- Transaction ID: ${details.transactionId}
- Amount: ${details.amount} AFN
- Item: ${details.itemName}
- Customer Name: ${details.customerName}
- Customer Email: ${details.customerEmail}
- Date: ${new Date().toLocaleString()}

Secured by HesabPay Gateway
    `,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 30px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 24px; background-color: #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 50px; height: 50px; border-radius: 16px; background-color: #f0fdf4; margin-bottom: 12px;">
            <span style="font-size: 24px; color: #15803d; line-height: 50px; vertical-align: middle;">✓</span>
          </div>
          <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; tracking: -0.025em;">Payment Successful</h2>
          <p style="font-size: 13px; color: #64748b; margin: 4px 0 0 0;">A transaction has been completed via Sheen Payment Gateway</p>
        </div>
        
        <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 18px; padding: 20px; margin-bottom: 25px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Order ID</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 700; font-family: monospace; text-align: right;">${details.orderId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Transaction ID</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 700; font-family: monospace; text-align: right;">${details.transactionId}</td>
            </tr>
            <tr style="border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 0; color: #64748b; font-weight: 500;">Amount Paid</td>
              <td style="padding: 12px 0; color: #2563eb; font-weight: 900; font-size: 18px; text-align: right;">؋${details.amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500; padding-top: 12px;">Customer Name</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600; text-align: right; padding-top: 12px;">${details.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Customer Email</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600; text-align: right;">${details.customerEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Date</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600; text-align: right;">${new Date().toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; font-size: 11px; color: #94a3b8; font-weight: 500;">
          Secured by HesabPay • Suliman Hakimi Payments
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[mailer] Successful payment notification email sent to afgsuliman50@gmail.com for order ${details.orderId}`);
  } catch (error) {
    console.error('[mailer] Failed to send payment email using nodemailer:', error);
  }
}
