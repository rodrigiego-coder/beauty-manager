import { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Eye,
  Clock,
  User,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditLog {
  id: number;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  entityId: string;
  description: string;
}

const mockAuditLogs: AuditLog[] = [
  { id: 1, timestamp: '2024-01-15T14:30:00', userId: '1', userName: 'Rodrigo Viana', action: 'CREATE', entity: 'appointments', entityId: '123', description: 'Criou agendamento para Maria Silva' },
  { id: 2, timestamp: '2024-01-15T14:15:00', userId: '1', userName: 'Rodrigo Viana', action: 'UPDATE', entity: 'products', entityId: '45', description: 'Atualizou estoque de Shampoo Profissional' },
  { id: 3, timestamp: '2024-01-15T13:45:00', userId: '2', userName: 'Ana Costa', action: 'CREATE', entity: 'transactions', entityId: '789', description: 'Lancou receita de R$ 280,00' },
  { id: 4, timestamp: '2024-01-15T12:30:00', userId: '1', userName: 'Rodrigo Viana', action: 'DELETE', entity: 'appointments', entityId: '120', description: 'Cancelou agendamento de Julia Santos' },
  { id: 5, timestamp: '2024-01-15T11:00:00', userId: '2', userName: 'Ana Costa', action: 'UPDATE', entity: 'clients', entityId: '55', description: 'Atualizou dados de Carla Lima' },
  { id: 6, timestamp: '2024-01-14T16:30:00', userId: '1', userName: 'Rodrigo Viana', action: 'CREATE', entity: 'products', entityId: '46', description: 'Cadastrou novo produto: Condicionador Premium' },
  { id: 7, timestamp: '2024-01-14T15:00:00', userId: '1', userName: 'Rodrigo Viana', action: 'CREATE', entity: 'transactions', entityId: '788', description: 'Lancou despesa de R$ 450,00' },
  { id: 8, timestamp: '2024-01-14T10:30:00', userId: '2', userName: 'Ana Costa', action: 'UPDATE', entity: 'appointments', entityId: '119', description: 'Remarcou agendamento de Pedro Henrique' },
];

const reportTypes = [
  { id: 'transactions', name: 'Transacoes Financeiras', description: 'Todas as receitas e despesas do periodo', icon: FileText },
  { id: 'invoices', name: 'Dados Fiscais', description: 'Relatorio para contabilidade com CNPJ e notas', icon: FileText },
  { id: 'appointments', name: 'Agendamentos', description: 'Historico de agendamentos e servicos', icon: Calendar },
  { id: 'clients', name: 'Clientes', description: 'Base de clientes com dados de contato', icon: User },
  { id: 'products', name: 'Estoque', description: 'Produtos, quantidades e movimentacoes', icon: FileText },
];

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'export' | 'audit'>('export');
  const [selectedReport, setSelectedReport] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [filterAction, setFilterAction] = useState<'all' | 'CREATE' | 'UPDATE' | 'DELETE'>('all');
  const [isExporting, setIsExporting] = useState(false);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-100 text-emerald-700';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-700';
      case 'DELETE':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Plus className="w-3.5 h-3.5" />;
      case 'UPDATE':
        return <Edit className="w-3.5 h-3.5" />;
      case 'DELETE':
        return <Trash2 className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'Criacao';
      case 'UPDATE':
        return 'Edicao';
      case 'DELETE':
        return 'Exclusao';
      default:
        return action;
    }
  };

  const filteredLogs = mockAuditLogs.filter((log) => {
    if (filterAction === 'all') return true;
    return log.action === filterAction;
  });

  const handleExport = async () => {
    setIsExporting(true);
    // Simula download
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsExporting(false);
    alert(`Relatorio exportado com sucesso em formato ${exportFormat.toUpperCase()}!`);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatorios</h1>
        <p className="text-gray-500 mt-1">Exporte dados e visualize logs de auditoria do sistema</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex gap-8 px-6">
            <button
              onClick={() => setActiveTab('export')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'export'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar Dados
              </div>
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'audit'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Logs de Auditoria
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'export' ? (
            <div className="space-y-6">
              {/* Report type selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Selecione o tipo de relatorio
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reportTypes.map((report) => (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReport(report.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedReport === report.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            selectedReport === report.id ? 'bg-primary-100' : 'bg-gray-100'
                          }`}
                        >
                          <report.icon
                            className={`w-5 h-5 ${
                              selectedReport === report.id ? 'text-primary-600' : 'text-gray-600'
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{report.name}</p>
                          <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>

              {/* Export format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Formato de exportacao
                </label>
                <div className="flex gap-4">
                  <label
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all ${
                      exportFormat === 'csv'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={() => setExportFormat('csv')}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">CSV</p>
                      <p className="text-sm text-gray-500">Compativel com Excel</p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all ${
                      exportFormat === 'json'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value="json"
                      checked={exportFormat === 'json'}
                      onChange={() => setExportFormat('json')}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">JSON</p>
                      <p className="text-sm text-gray-500">Para integracao com sistemas</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Export button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={handleExport}
                  disabled={!selectedReport || isExporting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Exportando...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Exportar Relatorio
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Audit filters */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Filtrar por acao:</span>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    {(['all', 'CREATE', 'UPDATE', 'DELETE'] as const).map((action) => (
                      <button
                        key={action}
                        onClick={() => setFilterAction(action)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          filterAction === action
                            ? 'bg-white shadow text-gray-900'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {action === 'all' ? 'Todas' : getActionLabel(action)}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  Atualizar
                </button>
              </div>

              {/* Audit logs list */}
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div
                      className={`p-2 rounded-lg ${getActionColor(log.action).replace(
                        'text-',
                        'bg-'
                      )}`}
                    >
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getActionColor(
                            log.action
                          )}`}
                        >
                          {getActionIcon(log.action)}
                          {getActionLabel(log.action)}
                        </span>
                        <span className="text-xs text-gray-400">em</span>
                        <span className="text-xs font-medium text-gray-600 bg-gray-200 px-2 py-0.5 rounded">
                          {log.entity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 font-medium">{log.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {log.userName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {format(new Date(log.timestamp), "dd/MM/yyyy 'as' HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredLogs.length === 0 && (
                <div className="text-center py-12">
                  <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum log encontrado para este filtro</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
