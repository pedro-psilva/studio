import nodemailer from 'nodemailer';

/**
 * Cria e retorna um transporter do nodemailer configurado com as credenciais SMTP do Brevo.
 * 
 * @throws Error se as variáveis de ambiente SMTP não estiverem configuradas
 * @returns Transporter do nodemailer
 * 
 * @example
 * ```typescript
 * const transporter = createEmailTransporter();
 * await transporter.sendMail({
 *   from: FROM_EMAIL,
 *   to: 'user@example.com',
 *   subject: 'Test',
 *   html: '<p>Hello</p>',
 * });
 * ```
 */
export function createEmailTransporter() {
    const smtpHost = process.env.BREVO_SMTP_HOST;
    const smtpPort = Number(process.env.BREVO_SMTP_PORT || 587);
    const smtpUser = process.env.BREVO_SMTP_USER;
    const smtpPass = process.env.BREVO_SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
        throw new Error(
            'Configuração SMTP incompleta. Verifique BREVO_SMTP_HOST, BREVO_SMTP_USER e BREVO_SMTP_PASS no .env.local'
        );
    }

    return nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: false, // Use TLS
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
    });
}

/**
 * Valida se a configuração SMTP está presente
 * @returns true se configurado, false caso contrário
 */
export function isSmtpConfigured(): boolean {
    return !!(
        process.env.BREVO_SMTP_HOST &&
        process.env.BREVO_SMTP_USER &&
        process.env.BREVO_SMTP_PASS
    );
}
