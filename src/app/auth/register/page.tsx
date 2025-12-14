'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { signUpUser, AddressData } from '@/lib/authService';
import { validateCPF, validateCNPJ, formatCPF, formatCNPJ, validateEmail, validatePassword } from '@/lib/utils/validators';

interface FormData {
  fullName: string;
  cpfCnpj: string;
  phoneCountryCode: string;
  phoneDDD: string;
  phoneLocal: string;
  email: string;
  password: string;
  confirmPassword: string;
  clinicName: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
}

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<'pf' | 'pj'>('pf');

  const [form, setForm] = useState<FormData>({
    fullName: '',
    cpfCnpj: '',
    phoneCountryCode: '55',
    phoneDDD: '',
    phoneLocal: '',
    email: '',
    password: '',
    confirmPassword: '',
    clinicName: '',
    // Campos de endereço
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    pais: 'Brasil',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);

  async function fetchAddressByCEP(cep: string) {
    try {
      const cleanedCEP = cep.replace(/[^0-9]/g, '');
      if (cleanedCEP.length !== 8) return;
      
      const response = await fetch(`https://viacep.com.br/ws/${cleanedCEP}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setForm(prev => ({
          ...prev,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || '',
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  }

  function validateForm() {
    const newErrors: Record<string, string> = {};

    // Validação do nome
    if (!form.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    }

    // Validação do CPF/CNPJ
    const cpfCnpj = form.cpfCnpj.replace(/[\D]/g, '');
    if (accountType === 'pf') {
      if (!validateCPF(cpfCnpj)) {
        newErrors.cpfCnpj = 'CPF inválido';
      }
    } else {
      if (!validateCNPJ(cpfCnpj)) {
        newErrors.cpfCnpj = 'CNPJ inválido';
      }
    }

    // Validação do email
    if (!form.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(form.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validação da senha
    if (!form.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (!validatePassword(form.password)) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    }

    // Validação da confirmação de senha
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não conferem';
    }

    // Validação de telefone: código de país + DDD + número local
    const ccDigits = form.phoneCountryCode.replace(/\D/g, '');
    const dddDigits = form.phoneDDD.replace(/\D/g, '');
    const localDigits = form.phoneLocal.replace(/\D/g, '');

    if (!ccDigits || !dddDigits || !localDigits) {
      newErrors.phoneLocal = 'Informe código de país, DDD e telefone.';
    } else {
      if (ccDigits.length < 1 || ccDigits.length > 3) {
        newErrors.phoneCountryCode = 'Código de país inválido.';
      }
      if (dddDigits.length < 2 || dddDigits.length > 3) {
        newErrors.phoneDDD = 'DDD inválido.';
      }
      if (localDigits.length < 8) {
        newErrors.phoneLocal = 'Telefone inválido (mínimo 8 dígitos).';
      }
    }

    // Validação do nome da clínica (apenas para PJ)
    if (accountType === 'pj' && !form.clinicName.trim()) {
      newErrors.clinicName = 'Nome da clínica é obrigatório';
    }

    // Validação de endereço
    const requiredAddressFields = ['cep', 'logradouro', 'numero', 'bairro', 'cidade', 'estado'];
    for (const field of requiredAddressFields) {
      if (!form[field as keyof typeof form]) {
        newErrors[field] = 'Campo obrigatório';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const ccDigits = form.phoneCountryCode.replace(/\D/g, '');
      const dddDigits = form.phoneDDD.replace(/\D/g, '');
      const localDigits = form.phoneLocal.replace(/\D/g, '');
      const fullPhone = `+${ccDigits} ${dddDigits} ${localDigits}`;

      const endereco: AddressData = {
        cep: form.cep.replace(/[\D]/g, ''),
        logradouro: form.logradouro,
        numero: form.numero,
        complemento: form.complemento,
        bairro: form.bairro,
        cidade: form.cidade,
        estado: form.estado,
        pais: form.pais,
      };

      await signUpUser({
        nome: form.fullName.trim(),
        email: form.email.trim(),
        senha: form.password,
        cpfCnpj: form.cpfCnpj.replace(/[\D]/g, ''),
        pessoaTipo: accountType === 'pf' ? 'PF' : 'PJ',
        phone: fullPhone,
        clinicName: accountType === 'pj' ? form.clinicName.trim() : undefined,
        endereco,
      });

      alert('Conta criada com sucesso! Você será redirecionado para o login.');
      // Redirecionar para a página de login após 2 segundos
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
    } catch (err: any) {
      console.error('Erro ao criar conta:', err);
      let errorMessage = 'Erro ao criar a conta. Tente novamente.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso. Tente fazer login ou use outro email.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido. Verifique o endereço de email.';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // Atualiza o formato do CPF/CNPJ quando o tipo de conta muda
  useEffect(() => {
    if (form.cpfCnpj) {
      const digits = form.cpfCnpj.replace(/[\D]/g, '');
      const formatted = accountType === 'pf' 
        ? formatCPF(digits).slice(0, 14)
        : formatCNPJ(digits).slice(0, 18);
      setForm(prev => ({ ...prev, cpfCnpj: formatted }));
    }
  }, [accountType]);

  // Busca endereço quando o CEP é preenchido
  useEffect(() => {
    if (form.cep.replace(/[\D]/g, '').length === 8) {
      fetchAddressByCEP(form.cep);
    }
  }, [form.cep]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <CardHeader className="space-y-1 p-0 text-center">
          <CardTitle className="text-2xl font-bold">Criar uma conta</CardTitle>
          <CardDescription className="text-muted-foreground">
            Preencha os dados abaixo para criar sua conta
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
          <div className="grid gap-2">
            <Label>Account Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input 
                  type="radio" 
                  id="pf" 
                  name="accountType" 
                  value="pf" 
                  checked={accountType === 'pf'} 
                  onChange={(e) => setAccountType(e.target.value as 'pf' | 'pj')} 
                  className="peer sr-only"
                />
                <Label 
                  htmlFor="pf" 
                  className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  Pessoa Física
                </Label>
              </div>

              <div>
                <input 
                  type="radio" 
                  id="pj" 
                  name="accountType" 
                  value="pj" 
                  checked={accountType === 'pj'} 
                  onChange={(e) => setAccountType(e.target.value as 'pf' | 'pj')} 
                  className="peer sr-only"
                />
                <Label 
                  htmlFor="pj" 
                  className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  Pessoa Jurídica
                </Label>
              </div>
            </div>
          </div>

            {accountType === 'pj' && (
              <div className="space-y-2">
                <Label htmlFor="clinicName">Nome da Clínica</Label>
                <Input
                  id="clinicName"
                  placeholder="Nome da sua clínica"
                  value={form.clinicName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, clinicName: e.target.value }))
                  }
                  className={errors.clinicName ? 'border-destructive' : ''}
                />
                {errors.clinicName && (
                  <p className="text-sm text-destructive">{errors.clinicName}</p>
                )}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="fullName">
                {accountType === 'pf' ? 'Nome Completo' : 'Nome do Responsável'}
              </Label>
              <Input
                id="fullName"
                placeholder={accountType === 'pf' ? 'Seu nome completo' : 'Nome do responsável'}
                value={form.fullName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, fullName: e.target.value }))
                }
                className={errors.fullName ? 'border-destructive' : ''}
              />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpfCnpj">{accountType === 'pf' ? 'CPF' : 'CNPJ'}</Label>
              <Input
                id="cpfCnpj"
                placeholder={accountType === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}
                value={form.cpfCnpj}
                onChange={(e) => {
                  const value = e.target.value;
                  const formatted = accountType === 'pf' 
                    ? formatCPF(value) 
                    : formatCNPJ(value);
                  setForm(prev => ({ ...prev, cpfCnpj: formatted }));
                }}
                maxLength={accountType === 'pf' ? 14 : 18}
                className={errors.cpfCnpj ? 'border-destructive' : ''}
              />
              {errors.cpfCnpj && <p className="text-sm text-destructive">{errors.cpfCnpj}</p>}
            </div>

            <div className="grid gap-2">
              <Label>Telefone</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Input
                    id="phoneCountryCode"
                    placeholder="55"
                    value={form.phoneCountryCode}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, phoneCountryCode: e.target.value }))
                    }
                    className={errors.phoneCountryCode ? 'border-destructive' : ''}
                  />
                  {errors.phoneCountryCode && (
                    <p className="text-sm text-destructive">{errors.phoneCountryCode}</p>
                  )}
                </div>
                <div>
                  <Input
                    id="phoneDDD"
                    placeholder="11"
                    value={form.phoneDDD}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, phoneDDD: e.target.value }))
                    }
                    className={errors.phoneDDD ? 'border-destructive' : ''}
                  />
                  {errors.phoneDDD && (
                    <p className="text-sm text-destructive">{errors.phoneDDD}</p>
                  )}
                </div>
                <div>
                  <Input
                    id="phoneLocal"
                    placeholder="999999999"
                    value={form.phoneLocal}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, phoneLocal: e.target.value }))
                    }
                    className={errors.phoneLocal ? 'border-destructive' : ''}
                  />
                  {errors.phoneLocal && (
                    <p className="text-sm text-destructive">{errors.phoneLocal}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
          
          <div className="space-y-4 pt-2">
            <div className="space-y-2 border-t pt-4">
              <h3 className="text-lg font-medium">Endereço</h3>
              <p className="text-sm text-muted-foreground">
                Informe o endereço da {accountType === 'pf' ? 'sua residência' : 'sua clínica'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <div className="flex space-x-2">
                  <Input
                    id="cep"
                    placeholder="00000-000"
                    value={form.cep}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      const formatted = value.replace(/^(\d{5})(\d{1,3})?$/, (_, p1, p2) =>
                        p2 ? `${p1}-${p2}` : p1
                      );
                      setForm((prev) => ({ ...prev, cep: formatted }));
                    }}
                    maxLength={9}
                    className={errors.cep ? 'border-destructive' : ''}
                    onBlur={() => {
                      if (form.cep.replace(/\D/g, '').length === 8) {
                        fetchAddressByCEP(form.cep);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fetchAddressByCEP(form.cep)}
                    disabled={form.cep.replace(/\D/g, '').length !== 8}
                    className="shrink-0"
                  >
                    Buscar
                  </Button>
                </div>
                {errors.cep && <p className="text-sm text-destructive">{errors.cep}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="logradouro">Logradouro</Label>
                <Input
                  id="logradouro"
                  placeholder="Rua, Avenida, etc."
                  value={form.logradouro}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, logradouro: e.target.value }))
                  }
                  className={errors.logradouro ? 'border-destructive' : ''}
                />
                {errors.logradouro && <p className="text-sm text-destructive">{errors.logradouro}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  placeholder="Número"
                  required
                  value={form.numero}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, numero: e.target.value }))
                  }
                  className={errors.numero ? 'border-destructive' : ''}
                />
                {errors.numero && <p className="text-sm text-destructive">{errors.numero}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  placeholder="Apto, Bloco, etc."
                  value={form.complemento}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, complemento: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  placeholder="Bairro"
                  required
                  value={form.bairro}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, bairro: e.target.value }))
                  }
                  className={errors.bairro ? 'border-destructive' : ''}
                />
                {errors.bairro && <p className="text-sm text-destructive">{errors.bairro}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  placeholder="Cidade"
                  required
                  value={form.cidade}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, cidade: e.target.value }))
                  }
                  className={errors.cidade ? 'border-destructive' : ''}
                />
                {errors.cidade && <p className="text-sm text-destructive">{errors.cidade}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  placeholder="UF"
                  required
                  value={form.estado}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, estado: e.target.value }))
                  }
                  maxLength={2}
                  className={`uppercase ${errors.estado ? 'border-destructive' : ''}`}
                />
                {errors.estado && <p className="text-sm text-destructive">{errors.estado}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pais">País</Label>
                <Input
                  id="pais"
                  value={form.pais}
                  disabled
                  className="text-muted-foreground"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground mt-4"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Link href="/auth/login" className="font-medium text-foreground hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
