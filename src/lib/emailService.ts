import nodemailer from 'nodemailer';

// --- Tipos para os parâmetros dos e-mails ---

export type OrderConfirmationEmailParams = {
  to: string;
  customerName: string;
  orderId: string;
  orderDate: string;
  totalAmount: string;
};

export type OrderStatusUpdateEmailParams = {
  to: string;
  customerName: string;
  orderId: string;
  newStatus: string;
};

// --- Configuração do Transporter (usando variáveis de ambiente) ---

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: Number(process.env.BREVO_SMTP_PORT || 587),
  secure: false, // true para 465, false para outras portas
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

const FROM_EMAIL = 'ferramentas@itsolutionlabdigital.com.br';

// --- Função genérica para envio de e-mail ---

async function sendEmail(options: { to: string; subject: string; html: string }) {
  const mailOptions = {
    from: `"IT Lab" <${FROM_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail enviado com sucesso:', info.messageId);
    return info;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw new Error('Falha no envio do e-mail.');
  }
}

// --- Funções específicas para cada tipo de notificação ---

export async function sendOrderConfirmationEmail(params: OrderConfirmationEmailParams) {
  const subject = `Confirmação do seu Pedido #${params.orderId}`;
  const html = `
    <h1>Olá, ${params.customerName}!</h1>
    <p>Seu pedido <strong>#${params.orderId}</strong> foi recebido com sucesso em ${params.orderDate}.</p>
    <p>Valor Total: <strong>${params.totalAmount}</strong></p>
    <p>Você pode acompanhar o status do seu pedido na sua área do cliente.</p>
    <br>
    <p>Atenciosamente,</p>
    <p>Equipe IT Lab</p>
  `;

  return sendEmail({ to: params.to, subject, html });
}

export async function sendOrderStatusUpdateEmail(params: OrderStatusUpdateEmailParams) {
  const subject = `Atualização do seu Pedido #${params.orderId}`;
  const html = `
    <h1>Olá, ${params.customerName}!</h1>
    <p>O status do seu pedido <strong>#${params.orderId}</strong> foi atualizado para: <strong>${params.newStatus}</strong>.</p>
    <p>Acesse sua conta para ver mais detalhes.</p>
    <br>
    <p>Atenciosamente,</p>
    <p>Equipe IT Lab</p>
  `;

  return sendEmail({ to: params.to, subject, html });
}

export async function sendPaymentConfirmedEmail(params: { to: string, customerName: string, orderId: string }) {
  const subject = `Pagamento Confirmado - Pedido #${params.orderId}`;
  const html = `
    <h1>Olá, ${params.customerName}!</h1>
    <p>Ótimas notícias! O pagamento do seu pedido <strong>#${params.orderId}</strong> foi confirmado.</p>
    <p>Já estamos iniciando a produção e em breve você receberá novas atualizações.</p>
    <br>
    <p>Atenciosamente,</p>
    <p>Equipe IT Lab</p>
  `;
  return sendEmail({ to: params.to, subject, html });
}
