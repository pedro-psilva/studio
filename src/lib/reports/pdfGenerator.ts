import { OrderDocument } from '@/lib/orderService';

export interface ExportFields {
    id: boolean;
    date: boolean;
    customer: boolean;
    products: boolean;
    status: boolean;
    paymentStatus: boolean;
    subtotal: boolean;
    shipping: boolean;
    discount: boolean;
    total: boolean;
    paymentProvider: boolean;
    itemsCount: boolean;
}

interface ReportFilters {
    startDate?: string;
    endDate?: string;
    statusFilter?: string;
    paymentFilter?: string;
}

interface ReportData {
    orders: OrderDocument[];
    serviceNames: Record<string, string>;
    userNames: Record<string, string>;
    paidRevenue: number;
    pendingRevenue: number;
    totalOrdersCount: number;
    paidOrdersCount: number;
    conversionRate: number;
    salesByProductData: Array<{ name: string; total: number }>;
}

/**
 * Exporta tabela simples em PDF com campos selecionados
 */
export function exportTablePDF(
    data: ReportData,
    exportFields: ExportFields,
    filters: ReportFilters
): void {
    const formatCurrency = (value: number) =>
        value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const formatDate = (date: Date) =>
        new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const formatStatus = (status: string) => {
        const statusMap: Record<string, string> = {
            'pending_payment': 'Aguardando',
            'paid': 'Pago',
            'in_production': 'Produção',
            'shipped': 'Enviado',
            'delivered': 'Entregue',
            'canceled': 'Cancelado',
        };
        return statusMap[status] || status;
    };

    const now = new Date();
    const reportDate = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`;

    const filterInfo = [];
    if (filters.startDate) filterInfo.push(`Início: ${formatDate(new Date(filters.startDate))}`);
    if (filters.endDate) filterInfo.push(`Fim: ${formatDate(new Date(filters.endDate))}`);
    if (filters.statusFilter && filters.statusFilter !== 'all') filterInfo.push(`Status: ${formatStatus(filters.statusFilter)}`);
    if (filters.paymentFilter && filters.paymentFilter !== 'all') filterInfo.push(`Pagamento: ${filters.paymentFilter}`);
    const filterText = filterInfo.length > 0 ? filterInfo.join(' | ') : 'Sem filtros';

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Permita pop-ups para exportar o PDF');
        return;
    }

    // Construir colunas baseado nos campos selecionados
    const columns: string[] = [];
    if (exportFields.id) columns.push('ID');
    if (exportFields.date) columns.push('Data');
    if (exportFields.customer) columns.push('Cliente');
    if (exportFields.products) columns.push('Produtos');
    if (exportFields.status) columns.push('Status');
    if (exportFields.paymentStatus) columns.push('Pagamento');
    if (exportFields.total) columns.push('Total');

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Relatório de Pedidos - ${formatDate(now)}</title>
      <style>
        @media print {
          @page { margin: 1cm; size: landscape; }
          body { margin: 0; }
        }
        body {
          font-family: Arial, sans-serif;
          padding: 15px;
          color: #333;
          font-size: 11px;
        }
        h1 {
          color: #1a1a1a;
          border-bottom: 2px solid #4f46e5;
          padding-bottom: 8px;
          margin-bottom: 5px;
          font-size: 20px;
        }
        .subtitle {
          color: #666;
          margin-bottom: 8px;
          font-size: 11px;
        }
        .filters {
          background: #f0f0f0;
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 15px;
          font-size: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 10px;
        }
        th {
          background-color: #4f46e5;
          color: white;
          padding: 8px 5px;
          text-align: left;
          font-weight: 600;
        }
        td {
          padding: 6px 5px;
          border-bottom: 1px solid #e0e0e0;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
      </style>
    </head>
    <body>
      <h1>📄 Relatório de Pedidos</h1>
      <div class="subtitle">Gerado em: ${reportDate}</div>
      <div class="filters">${filterText} | ${data.orders.length} pedido(s)</div>

      <table>
        <thead>
          <tr>
            ${columns.map(col => `<th>${col}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.orders.map(order => {
        const productNames = order.items?.map(item => {
            const name = data.serviceNames[item.productId || ''] || 'N/A';
            return item.quantity && item.quantity > 1 ? `${name} (${item.quantity}x)` : name;
        }).join(', ') || 'N/A';

        return `
              <tr>
                ${exportFields.id ? `<td>${order.id || '-'}</td>` : ''}
                ${exportFields.date ? `<td>${order.createdAt ? formatDate(order.createdAt) : '-'}</td>` : ''}
                ${exportFields.customer ? `<td>${data.userNames[order.userId || ''] || 'N/A'}</td>` : ''}
                ${exportFields.products ? `<td>${productNames}</td>` : ''}
                ${exportFields.status ? `<td>${formatStatus(order.status || '')}</td>` : ''}
                ${exportFields.paymentStatus ? `<td>${order.paymentStatus === 'approved' ? '✓ Aprovado' : order.paymentStatus || '-'}</td>` : ''}
                ${exportFields.total ? `<td><strong>${formatCurrency(order.total || 0)}</strong></td>` : ''}
              </tr>
            `;
    }).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
        printWindow.print();
    };
}

/**
 * Gera relatório executivo completo com análise detalhada
 */
export function generateFullReport(
    data: ReportData,
    filters: ReportFilters
): void {
    const formatCurrency = (value: number) =>
        value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const formatDate = (date: Date) =>
        new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const now = new Date();
    const reportDate = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`;

    const filterInfo = [];
    if (filters.startDate || filters.endDate) {
        const start = filters.startDate ? formatDate(new Date(filters.startDate)) : 'início';
        const end = filters.endDate ? formatDate(new Date(filters.endDate)) : 'atual';
        filterInfo.push(`Período: ${start} a ${end}`);
    }
    if (filters.statusFilter && filters.statusFilter !== 'all') filterInfo.push(`Status: ${filters.statusFilter}`);
    if (filters.paymentFilter && filters.paymentFilter !== 'all') filterInfo.push(`Pagamento: ${filters.paymentFilter}`);
    const filterText = filterInfo.length > 0 ? `Filtros Aplicados: ${filterInfo.join(' | ')}` : 'Todos os pedidos';

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Permita pop-ups para gerar o relatório');
        return;
    }

    const approvedOrders = data.orders.filter(o => o.paymentStatus === 'approved');
    const ticketMedio = data.paidOrdersCount > 0 ? data.paidRevenue / data.paidOrdersCount : 0;
    const totalItems = data.orders.reduce((acc, o) => acc + (o.items?.length || 0), 0);

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Relatório Executivo - ${formatDate(now)}</title>
      <style>
        @media print {
          @page { margin: 1.5cm; }
          body { margin: 0; }
          .page-break { page-break-after: always; }
        }
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #333;
        }
        h1 {
          color: #1a1a1a;
          border-bottom: 3px solid #4f46e5;
          padding-bottom: 10px;
          margin-bottom: 5px;
        }
        h2 {
          color: #4f46e5;
          margin-top: 30px;
          margin-bottom: 15px;
          font-size: 18px;
        }
        .subtitle {
          color: #666;
          margin-bottom: 10px;
          font-size: 14px;
        }
        .filters {
          background: #f0f0f0;
          padding: 12px;
          border-radius: 5px;
          margin-bottom: 20px;
          font-size: 12px;
        }
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }
        .card {
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 15px;
          background: #f9f9f9;
        }
        .card.highlight {
          border-color: #4f46e5;
          background: #f5f3ff;
        }
        .card-title {
          font-size: 11px;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 8px;
          font-weight: 600;
        }
        .card-value {
          font-size: 28px;
          font-weight: bold;
          color: #1a1a1a;
        }
        .card-desc {
          font-size: 11px;
          color: #999;
          margin-top: 5px;
        }
        .metric-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .metric-label {
          font-weight: 600;
          color: #555;
        }
        .metric-value {
          color: #1a1a1a;
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          font-size: 11px;
        }
        th {
          background-color: #4f46e5;
          color: white;
          padding: 10px 8px;
          text-align: left;
          font-weight: 600;
        }
        td {
          padding: 8px;
          border-bottom: 1px solid #e0e0e0;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .highlight-row {
          background-color: #e8e5ff !important;
          font-weight: bold;
        }
        .note-box {
          margin-top: 40px;
          padding: 15px;
          background: #f9f9f9;
          border-left: 4px solid #4f46e5;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <h1>📊 Relatório Executivo de Vendas</h1>
      <div class="subtitle">Gerado em: ${reportDate}</div>
      <div class="filters">${filterText}</div>

      <h2>Resumo Financeiro</h2>
      <div class="summary-cards">
        <div class="card highlight">
          <div class="card-title">Faturamento Realizado</div>
          <div class="card-value">${formatCurrency(data.paidRevenue)}</div>
          <div class="card-desc">Pedidos aprovados (${data.paidOrdersCount})</div>
        </div>
        <div class="card">
          <div class="card-title">Valor Pendente</div>
          <div class="card-value">${formatCurrency(data.pendingRevenue)}</div>
          <div class="card-desc">Aguardando aprovação (${data.totalOrdersCount - data.paidOrdersCount})</div>
        </div>
        <div class="card">
          <div class="card-title">Total de Pedidos</div>
          <div class="card-value">${data.totalOrdersCount}</div>
          <div class="card-desc">Todos os status</div>
        </div>
        <div class="card">
          <div class="card-title">Taxa de Conversão</div>
          <div class="card-value">${data.conversionRate.toFixed(1)}%</div>
          <div class="card-desc">${data.paidOrdersCount} convertidos</div>
        </div>
      </div>

      <h2>Análise por Período</h2>
      <div>
        <div class="metric-row">
          <span class="metric-label">Ticket Médio (Aprovados):</span>
          <span class="metric-value">${formatCurrency(ticketMedio)}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Total de Itens Vendidos:</span>
          <span class="metric-value">${totalItems}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Pedidos Aprovados:</span>
          <span class="metric-value">${data.paidOrdersCount} (${data.conversionRate.toFixed(1)}%)</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Pedidos Pendentes:</span>
          <span class="metric-value">${data.totalOrdersCount - data.paidOrdersCount}</span>
        </div>
      </div>

      <h2>Faturamento por Produto (Apenas Aprovados)</h2>
      <table>
        <thead>
          <tr>
            <th>Produto/Serviço</th>
            <th style="text-align: right;">Receita</th>
            <th style="text-align: right;">% do Total</th>
          </tr>
        </thead>
        <tbody>
          ${data.salesByProductData
            .sort((a, b) => b.total - a.total)
            .map(item => {
                const percentage = data.paidRevenue > 0 ? (item.total / data.paidRevenue * 100).toFixed(1) : '0.0';
                return `
                <tr>
                  <td>${item.name}</td>
                  <td style="text-align: right;"><strong>${formatCurrency(item.total)}</strong></td>
                  <td style="text-align: right;">${percentage}%</td>
                </tr>
              `;
            }).join('')}
          <tr class="highlight-row">
            <td>TOTAL FATURADO</td>
            <td style="text-align: right;">${formatCurrency(data.paidRevenue)}</td>
            <td style="text-align: right;">100%</td>
          </tr>
        </tbody>
      </table>

      <div class="page-break"></div>

      <h2>Detalhes dos Pedidos Aprovados</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Data</th>
            <th>Cliente</th>
            <th>Produtos</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${approvedOrders.map(order => {
                const products = order.items?.map(item => {
                    const name = data.serviceNames[item.productId || ''] || 'N/A';
                    return item.quantity && item.quantity > 1 ? `${name} (${item.quantity}x)` : name;
                }).join(', ') || 'N/A';

                return `
              <tr>
                <td>${order.id || '-'}</td>
                <td>${order.createdAt ? formatDate(order.createdAt) : '-'}</td>
                <td>${data.userNames[order.userId || ''] || 'N/A'}</td>
                <td style="font-size: 10px;">${products}</td>
                <td style="text-align: right;"><strong>${formatCurrency(order.total || 0)}</strong></td>
              </tr>
            `;
            }).join('')}
        </tbody>
      </table>

      <div class="note-box">
        <strong>Observações:</strong><br>
        • Este relatório considera apenas pedidos com pagamento aprovado para cálculo de faturamento.<br>
        • Valores pendentes não estão incluídos no faturamento total.<br>
        • Ticket médio calculado sobre pedidos aprovados apenas.<br>
        • Relatório gerado automaticamente pelo sistema.
      </div>
    </body>
    </html>
  `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
        printWindow.print();
    };
}
