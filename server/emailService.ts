import nodemailer from 'nodemailer';
import type { EmailSettings } from '@shared/schema';

export class EmailService {
  private static async createTransporter(settings: EmailSettings) {
    if (!settings || settings.isActive !== 'true') {
      throw new Error('Email service is not configured or inactive');
    }

    const config: any = {
      host: settings.smtpHost,
      port: parseInt(settings.smtpPort || '587'),
      secure: parseInt(settings.smtpPort || '587') === 465,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword,
      },
    };

    return nodemailer.createTransport(config);
  }

  static async sendTestEmail(settings: EmailSettings, recipientEmail: string): Promise<void> {
    const transporter = await this.createTransporter(settings);

    const mailOptions = {
      from: `"${settings.senderName}" <${settings.senderEmail}>`,
      to: recipientEmail,
      subject: '🧪 Teste de Conexão SMTP - Operlist',
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 8px;
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .success-badge {
              display: inline-block;
              background: #10b981;
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: 600;
              margin-bottom: 20px;
            }
            .info-box {
              background: white;
              border-left: 4px solid #667eea;
              padding: 15px;
              margin: 15px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              color: #6b7280;
              font-size: 14px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
            .config-list {
              list-style: none;
              padding: 0;
            }
            .config-list li {
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .config-list li:last-child {
              border-bottom: none;
            }
            strong {
              color: #667eea;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✅ Email Enviado com Sucesso!</h1>
          </div>
          
          <div class="content">
            <div class="success-badge">✓ Conexão SMTP Confirmada</div>
            
            <p>Parabéns! Sua configuração de email SMTP está funcionando perfeitamente.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0;">📧 Configurações Testadas:</h3>
              <ul class="config-list">
                <li><strong>Servidor SMTP:</strong> ${settings.smtpHost}</li>
                <li><strong>Porta:</strong> ${settings.smtpPort}</li>
                <li><strong>Usuário:</strong> ${settings.smtpUser}</li>
                <li><strong>Remetente:</strong> ${settings.senderName} &lt;${settings.senderEmail}&gt;</li>
                <li><strong>Status:</strong> Ativo</li>
              </ul>
            </div>
            
            <p>Este é um email de teste enviado pela plataforma <strong>Operlist</strong> para verificar a conectividade do servidor SMTP.</p>
            
            <p>Agora você pode usar o sistema de email para:</p>
            <ul>
              <li>Notificações de novas candidaturas</li>
              <li>Alertas de novas vagas</li>
              <li>Recuperação de senha</li>
              <li>Confirmação de cadastro</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>Enviado automaticamente pela plataforma Operlist</p>
            <p style="font-size: 12px; color: #9ca3af;">
              Data: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
Teste de Conexão SMTP - Operlist

✅ Conexão SMTP Confirmada!

Parabéns! Sua configuração de email SMTP está funcionando perfeitamente.

Configurações Testadas:
- Servidor SMTP: ${settings.smtpHost}
- Porta: ${settings.smtpPort}
- Usuário: ${settings.smtpUser}
- Remetente: ${settings.senderName} <${settings.senderEmail}>
- Status: Ativo

Este é um email de teste enviado pela plataforma Operlist para verificar a conectividade do servidor SMTP.

---
Enviado automaticamente pela plataforma Operlist
Data: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
  }

  static async sendEmail(
    settings: EmailSettings,
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<void> {
    const transporter = await this.createTransporter(settings);

    const mailOptions = {
      from: `"${settings.senderName}" <${settings.senderEmail}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    };

    await transporter.sendMail(mailOptions);
  }
}
