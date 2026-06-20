# Variáveis de Ambiente - Documentação

## Novas Variáveis Adicionadas

### Email Configuration

```bash
# Email de origem para notificações do sistema
# Se não configurado, usa o padrão: ferramentas@itsolutionlabdigital.com.br
FROM_EMAIL=ferramentas@itsolutionlabdigital.com.br
```

### Webhook Security (Opcional)

```bash
# Lista de IPs permitidos para webhook do InfinitePay (separados por vírgula)
# Se não configurado, todas as requisições são aceitas
# Exemplo: INFINITEPAY_ALLOWED_IPS=192.168.1.1,10.0.0.1
INFINITEPAY_ALLOWED_IPS=
```

## Instruções

1. Adicione a variável `FROM_EMAIL` ao seu arquivo `.env.local`
2. Opcionalmente, configure `INFINITEPAY_ALLOWED_IPS` se desejar validação de IP no webhook
3. Reinicie o servidor após adicionar novas variáveis

## Exemplo de .env.local

```bash
# ... suas outras variáveis existentes ...

# Email Configuration
FROM_EMAIL=ferramentas@itsolutionlabdigital.com.br

# Webhook Security (opcional)
# INFINITEPAY_ALLOWED_IPS=192.168.1.1,10.0.0.1
```
