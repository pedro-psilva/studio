'use client';
import { useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const notificationTemplates = [
  { 
    id: "pedido-criado", 
    title: "Confirmação de Pedido", 
    description: "Enviado ao cliente assim que um novo pedido é registrado no sistema.", 
    channels: { email: true } 
  },
  { 
    id: "pagamento-confirmado", 
    title: "Pagamento Confirmado", 
    description: "Enviado quando o gateway de pagamento confirma a transação.", 
    channels: { email: true } 
  },
  { 
    id: "pedido-atualizado", 
    title: "Atualização de Status do Pedido", 
    description: "Enviado sempre que o status de produção do pedido (ex: Em Produção, Finalizado) é alterado.", 
    channels: { email: true } 
  },
  { 
    id: "pedido-enviado", 
    title: "Pedido Enviado", 
    description: "Enviado quando o pedido sai para entrega, incluindo o código de rastreio.", 
    channels: { email: true } 
  },
];

export default function NotificationsPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testToEmail, setTestToEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  const activeMeta = useMemo(() => {
    if (!activeTemplateId) return null;
    return notificationTemplates.find((t) => t.id === activeTemplateId) ?? null;
  }, [activeTemplateId]);

  async function loadTemplate(id: string) {
    if (!user) {
      toast({
        title: 'Sessão expirada',
        description: 'Faça login novamente para editar templates.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoadingTemplate(true);
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/notification-templates/${encodeURIComponent(id)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = payload?.error || 'Não foi possível carregar o template.';
        toast({ title: 'Erro', description: msg, variant: 'destructive' });
        return;
      }

      setSubject(typeof payload?.subject === 'string' ? payload.subject : '');
      setHtml(typeof payload?.html === 'string' ? payload.html : '');
    } catch (err) {
      console.error('Erro ao carregar template:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o template. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoadingTemplate(false);
    }
  }

  async function saveTemplate() {
    if (!user || !activeTemplateId) return;

    try {
      setSaving(true);
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/notification-templates/${encodeURIComponent(activeTemplateId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject, html }),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = payload?.error || 'Não foi possível salvar o template.';
        toast({ title: 'Erro ao salvar', description: msg, variant: 'destructive' });
        return;
      }

      toast({ title: 'Template salvo', description: 'As alterações foram salvas com sucesso.' });
      setOpen(false);
    } catch (err) {
      console.error('Erro ao salvar template:', err);
      toast({
        title: 'Erro ao salvar',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  function openEditor(id: string) {
    setActiveTemplateId(id);
    setSubject('');
    setHtml('');
    setOpen(true);
    void loadTemplate(id);
  }

  async function sendTestEmail() {
    if (!user || !activeTemplateId) return;

    const to = testToEmail.trim();
    if (!to) {
      toast({
        title: 'E-mail obrigatório',
        description: 'Preencha o e-mail de destino para enviar o teste.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSendingTest(true);
      const token = await user.getIdToken();
      const res = await fetch(
        `/api/admin/notification-templates/${encodeURIComponent(activeTemplateId)}/send-test`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ to }),
        }
      );

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = payload?.error || 'Não foi possível enviar o e-mail de teste.';
        toast({ title: 'Erro ao enviar teste', description: msg, variant: 'destructive' });
        return;
      }

      toast({ title: 'Teste enviado', description: `E-mail enviado para ${to}.` });
      setTestOpen(false);
    } catch (err) {
      console.error('Erro ao enviar teste:', err);
      toast({
        title: 'Erro ao enviar teste',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setSendingTest(false);
    }
  }

  function openTest(id: string) {
    setActiveTemplateId(id);
    setTestToEmail('');
    setTestOpen(true);
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Notificações Transacionais</CardTitle>
          <CardDescription>
            Gerencie os templates e canais de notificação para seus clientes. As notificações são enviadas via E-mail (Brevo).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8">
          {notificationTemplates.map((template) => (
            <div key={template.id} className="flex flex-col md:flex-row items-start md:items-center justify-between rounded-lg border p-4">
              <div className="flex-1 mb-4 md:mb-0">
                <h3 className="font-semibold">{template.title}</h3>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <Badge variant={template.channels.email ? 'default' : 'outline'}>
                    {template.channels.email ? <Check className="h-4 w-4 mr-1" /> : <X className="h-4 w-4 mr-1" />}
                    E-mail
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditor(template.id)}>
                    Editar Template
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openTest(template.id)}>
                    Enviar teste
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar template</DialogTitle>
            <DialogDescription>
              {activeMeta ? activeMeta.title : 'Edite o assunto e o HTML do e-mail.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="template-subject">Assunto</Label>
              <Input
                id="template-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Confirmação do seu Pedido #{{orderId}}"
                disabled={loadingTemplate || saving}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="template-html">HTML</Label>
              <Textarea
                id="template-html"
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder={'Cole aqui o HTML. Ex: <h1>Olá, {{customerName}}!</h1>'}
                className="min-h-[360px] font-mono"
                disabled={loadingTemplate || saving}
              />
              <p className="text-xs text-muted-foreground">
                Variáveis disponíveis: {'{{customerName}}'}, {'{{orderId}}'}, {'{{orderDate}}'}, {'{{totalAmount}}'}, {'{{newStatus}}'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={saveTemplate} disabled={saving || loadingTemplate || !activeTemplateId}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={testOpen} onOpenChange={setTestOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar e-mail de teste</DialogTitle>
            <DialogDescription>
              Informe o e-mail de destino para receber um teste do template.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="test-email">E-mail</Label>
            <Input
              id="test-email"
              type="email"
              value={testToEmail}
              onChange={(e) => setTestToEmail(e.target.value)}
              placeholder="email@dominio.com"
              disabled={sendingTest}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTestOpen(false)} disabled={sendingTest}>
              Cancelar
            </Button>
            <Button onClick={sendTestEmail} disabled={sendingTest || !activeTemplateId}>
              {sendingTest ? 'Enviando...' : 'Enviar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
