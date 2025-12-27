import { z } from 'zod';

/**
 * Schema de validação para criação de usuário
 */
export const createUserSchema = z.object({
    email: z.string().email('Email inválido').trim().toLowerCase(),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    displayName: z.string().trim().optional(),
    tipo: z.enum(['cliente', 'colaborador', 'admin']).default('cliente'),
    forcePasswordReset: z.boolean().optional().default(false),
    adminAccess: z.record(z.enum(['reader', 'editor'])).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * Schema de validação para atualização de template de notificação
 */
export const updateNotificationTemplateSchema = z.object({
    subject: z.string().max(200, 'Assunto muito longo (máx 200 caracteres)').optional().default(''),
    html: z.string().max(200_000, 'HTML muito grande').optional().default(''),
});

export type UpdateNotificationTemplateInput = z.infer<typeof updateNotificationTemplateSchema>;

/**
 * Schema de validação para envio de email de teste
 */
export const sendTestEmailSchema = z.object({
    to: z.string().email('Email inválido').trim().toLowerCase(),
});

export type SendTestEmailInput = z.infer<typeof sendTestEmailSchema>;

/**
 * Schema de validação para criação de link de pagamento InfinitePay
 */
export const createPaymentLinkSchema = z.object({
    orderId: z.string().min(1, 'orderId é obrigatório'),
    total: z.number().positive('Total deve ser maior que zero').finite(),
    items: z
        .array(
            z.object({
                quantity: z.number().positive(),
                price: z.number().positive(),
                description: z.string().min(1),
            })
        )
        .optional(),
    customer: z
        .object({
            name: z.string().optional(),
            email: z.string().email().optional(),
            phone_number: z.string().optional(),
        })
        .optional(),
    address: z
        .object({
            cep: z.string().optional(),
            street: z.string().optional(),
            neighborhood: z.string().optional(),
            number: z.string().optional(),
            complement: z.string().optional(),
        })
        .optional(),
});

export type CreatePaymentLinkInput = z.infer<typeof createPaymentLinkSchema>;

/**
 * Schema de validação para verificação de status de pagamento InfinitePay
 */
export const paymentCheckSchema = z.object({
    orderNsu: z.string().min(1, 'order_nsu é obrigatório'),
    transactionNsu: z.string().min(1, 'transaction_nsu é obrigatório'),
    slug: z.string().min(1, 'slug é obrigatório'),
});

export type PaymentCheckInput = z.infer<typeof paymentCheckSchema>;

/**
 * Schema de validação para confirmação de pedido por email
 */
export const orderConfirmationEmailSchema = z.object({
    to: z.string().email('Email inválido'),
    customerName: z.string().min(1, 'Nome do cliente é obrigatório'),
    orderId: z.string().min(1, 'ID do pedido é obrigatório'),
    orderDate: z.string().min(1, 'Data do pedido é obrigatória'),
    totalAmount: z.string().min(1, 'Valor total é obrigatório'),
});

export type OrderConfirmationEmailInput = z.infer<typeof orderConfirmationEmailSchema>;

/**
 * Schema de validação para atualização de status do pedido por email
 */
export const orderStatusUpdateEmailSchema = z.object({
    to: z.string().email('Email inválido'),
    customerName: z.string().min(1, 'Nome do cliente é obrigatório'),
    orderId: z.string().min(1, 'ID do pedido é obrigatório'),
    newStatus: z.string().min(1, 'Novo status é obrigatório'),
});

export type OrderStatusUpdateEmailInput = z.infer<typeof orderStatusUpdateEmailSchema>;
