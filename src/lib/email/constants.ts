/**
 * Email de origem para todas as notificações do sistema
 * Configurável via variável de ambiente FROM_EMAIL
 */
export const FROM_EMAIL = process.env.FROM_EMAIL || 'ferramentas@itsolutionlabdigital.com.br';

/**
 * Nome de exibição para o remetente dos emails
 */
export const FROM_NAME = 'IT Solution';

/**
 * Email formatado para uso no campo 'from' do nodemailer
 */
export const FROM_ADDRESS = `"${FROM_NAME}" <${FROM_EMAIL}>`;
