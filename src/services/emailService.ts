import { Order, User } from '../types';
import { formatCurrency } from '../utils/format';

export class EmailService {
  private static instance: EmailService;
  private readonly FROM_EMAIL = 'noreply@srv685290.hstgr.cloud';
  private readonly SMTP_CONFIG = {
    host: 'srv685290.hstgr.cloud',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: import.meta.env.VITE_HOSTINGER_SMTP_USER,
      pass: import.meta.env.VITE_HOSTINGER_SMTP_PASSWORD
    }
  };

  private constructor() {}

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendOrderConfirmation(order: Order, user: User) {
    const subject = `Order Confirmation #${order.id}`;
    const html = this.generateOrderEmail(order, user);
    
    await this.sendEmail(user.email, subject, html);
  }

  async sendPasswordReset(email: string, resetToken: string) {
    const resetLink = `https://srv685290.hstgr.cloud/reset-password?token=${resetToken}`;
    const subject = 'Reset Your Password - Metal Aloud';
    const html = `
      <h2>Reset Your Password</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire in 1 hour.</p>
    `;

    await this.sendEmail(email, subject, html);
  }

  async sendInvoice(order: Order, user: User) {
    const subject = `Invoice for Order #${order.id}`;
    const html = this.generateInvoiceEmail(order, user);
    const pdfBuffer = await this.generateInvoicePDF(order);

    await this.sendEmail(user.email, subject, html, [{
      filename: `invoice-${order.id}.pdf`,
      content: pdfBuffer
    }]);
  }

  private async sendEmail(
    to: string, 
    subject: string, 
    html: string,
    attachments: Array<{ filename: string; content: Buffer }> = []
  ) {
    try {
      // In development, log the email
      if (import.meta.env.DEV) {
        console.log('Email sent:', { to, subject, html });
        return;
      }

      // In production, use SMTP
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        ...this.SMTP_CONFIG,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: this.FROM_EMAIL,
        to,
        subject,
        html,
        attachments
      });
    } catch (err) {
      console.error('Failed to send email:', err);
      throw new Error('Failed to send email');
    }
  }

  private generateOrderEmail(order: Order, user: User): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Order Confirmation</h1>
        <p>Dear ${user.name},</p>
        <p>Thank you for your order! Here are your order details:</p>
        
        <div style="margin: 20px 0; padding: 20px; background: #f3f4f6;">
          <h3>Order #${order.id}</h3>
          <p>Status: ${order.status}</p>
          <p>Total: ${formatCurrency(order.totalAmount)}</p>
        </div>

        <h3>Order Items:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #dc2626; color: white;">
            <th style="padding: 10px; text-align: left;">Item</th>
            <th style="padding: 10px; text-align: right;">Quantity</th>
            <th style="padding: 10px; text-align: right;">Price</th>
          </tr>
          ${order.items.map(item => `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px;">${item.product.name}</td>
              <td style="padding: 10px; text-align: right;">${item.quantity}</td>
              <td style="padding: 10px; text-align: right;">
                ${formatCurrency(item.priceAtTime * item.quantity)}
              </td>
            </tr>
          `).join('')}
        </table>

        <p style="margin-top: 20px;">
          You can track your order status at: 
          <a href="https://srv685290.hstgr.cloud/orders/${order.id}" style="color: #dc2626;">
            Track Order
          </a>
        </p>
      </div>
    `;
  }

  private generateInvoiceEmail(order: Order, user: User): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Invoice</h1>
        <p>Dear ${user.name},</p>
        <p>Please find attached the invoice for your recent order.</p>
        
        <div style="margin: 20px 0;">
          <p>Order #: ${order.id}</p>
          <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p>Total Amount: ${formatCurrency(order.totalAmount)}</p>
        </div>

        <p>Thank you for shopping with Metal Aloud!</p>
      </div>
    `;
  }

  private async generateInvoicePDF(order: Order): Promise<Buffer> {
    try {
      const PDFDocument = await import('pdfkit');
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => Buffer.concat(chunks));

      // Add invoice content
      doc
        .fontSize(20)
        .text('INVOICE', { align: 'center' })
        .moveDown()
        .fontSize(12)
        .text(`Order #: ${order.id}`)
        .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`)
        .moveDown();

      // Add items table
      const tableTop = 200;
      doc
        .fontSize(10)
        .text('Item', 50, tableTop)
        .text('Quantity', 300, tableTop)
        .text('Price', 400, tableTop, { align: 'right' });

      let y = tableTop + 20;
      order.items.forEach(item => {
        doc
          .text(item.product.name, 50, y)
          .text(item.quantity.toString(), 300, y)
          .text(formatCurrency(item.priceAtTime * item.quantity), 400, y, { align: 'right' });
        y += 20;
      });

      // Add total
      doc
        .moveDown()
        .fontSize(12)
        .text(`Total: ${formatCurrency(order.totalAmount)}`, { align: 'right' });

      doc.end();

      return Buffer.concat(chunks);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      throw new Error('Failed to generate invoice PDF');
    }
  }
}