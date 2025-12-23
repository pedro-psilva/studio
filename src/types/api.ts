/**
 * Classe de erro para requisições não autenticadas
 */
export class UnauthorizedError extends Error {
    constructor(message = 'Unauthorized') {
        super(message);
        this.name = 'UnauthorizedError';
    }
}

/**
 * Classe de erro para acesso negado
 */
export class ForbiddenError extends Error {
    constructor(message = 'Forbidden') {
        super(message);
        this.name = 'ForbiddenError';
    }
}

/**
 * Classe de erro para validação de dados
 */
export class ValidationError extends Error {
    constructor(message = 'Validation failed') {
        super(message);
        this.name = 'ValidationError';
    }
}

/**
 * Resposta de erro padronizada da API
 */
export interface ApiError {
    error: string;
}

/**
 * Resposta de sucesso padronizada da API
 */
export interface ApiSuccess {
    success: boolean;
    message?: string;
}
