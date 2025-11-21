import nodemailer from 'nodemailer';
import type { EmailSettings } from '@shared/schema';

export class EmailService {
  private settings: EmailSettings;

  constructor(settings: EmailSettings) {
    this.settings = settings;
  }

  private async createTransporter() {
    if (!this.settings || this.settings.isActive !== 'true') {
      throw new Error('Email service is not configured or inactive');
    }

    const config: any = {
      host: this.settings.smtpHost,
      port: parseInt(this.settings.smtpPort || '587'),
      secure: parseInt(this.settings.smtpPort || '587') === 465,
      auth: {
        user: this.settings.smtpUser,
        pass: this.settings.smtpPassword,
      },
    };

    return nodemailer.createTransport(config);
  }

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

  async sendPasswordResetCode(email: string, code: string, userName: string): Promise<void> {
    const transporter = await this.createTransporter();

    const mailOptions = {
      from: `"${this.settings.senderName}" <${this.settings.senderEmail}>`,
      to: email,
      subject: '🔐 Código de Recuperação de Senha - Operlist',
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
              background-color: #f8f9fa;
            }
            .container {
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              margin-bottom: 20px;
              color: #1f2937;
            }
            .code-container {
              background: #f3f4f6;
              border: 2px dashed #dc2626;
              border-radius: 8px;
              padding: 30px;
              text-align: center;
              margin: 30px 0;
            }
            .code {
              font-size: 48px;
              font-weight: 700;
              letter-spacing: 8px;
              color: #dc2626;
              font-family: 'Courier New', monospace;
            }
            .code-label {
              font-size: 14px;
              color: #6b7280;
              margin-top: 10px;
            }
            .info-box {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .info-box strong {
              color: #92400e;
            }
            .warning-box {
              background: #fee2e2;
              border-left: 4px solid #dc2626;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              color: #991b1b;
            }
            .footer {
              text-align: center;
              color: #6b7280;
              font-size: 14px;
              padding: 30px;
              background: #f9fafb;
              border-top: 1px solid #e5e7eb;
            }
            .button {
              display: inline-block;
              background: #dc2626;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Recuperação de Senha</h1>
            </div>
            
            <div class="content">
              <div class="greeting">
                Olá, <strong>${userName}</strong>!
              </div>
              
              <p>Recebemos uma solicitação para redefinir a senha da sua conta na plataforma <strong>Operlist</strong>.</p>
              
              <p>Use o código abaixo para continuar com a recuperação:</p>
              
              <div class="code-container">
                <div class="code">${code}</div>
                <div class="code-label">Código de Verificação</div>
              </div>
              
              <div class="info-box">
                <strong>⏱️ Atenção:</strong> Este código é válido por <strong>15 minutos</strong>.
              </div>
              
              <p>Após inserir o código, você poderá criar uma nova senha para sua conta.</p>
              
              <div class="warning-box">
                <strong>🔒 Segurança:</strong> Se você não solicitou esta recuperação de senha, ignore este email. Sua senha permanecerá inalterada.
              </div>
              
              <p style="margin-top: 30px;">Se tiver qualquer dúvida, entre em contato com nosso suporte.</p>
            </div>
            
            <div class="footer">
              <p><strong>Operlist</strong> - Plataforma de Vagas para Operadores</p>
              <p style="font-size: 12px; color: #9ca3af; margin-top: 10px;">
                Email enviado em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
🔐 Recuperação de Senha - Operlist

Olá, ${userName}!

Recebemos uma solicitação para redefinir a senha da sua conta na plataforma Operlist.

Use o código abaixo para continuar com a recuperação:

CÓDIGO: ${code}

⏱️ Atenção: Este código é válido por 15 minutos.

Após inserir o código, você poderá criar uma nova senha para sua conta.

🔒 Segurança: Se você não solicitou esta recuperação de senha, ignore este email. Sua senha permanecerá inalterada.

Se tiver qualquer dúvida, entre em contato com nosso suporte.

---
Operlist - Plataforma de Vagas para Operadores
Email enviado em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
  }
}
