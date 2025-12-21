import { useState } from 'react';

interface TriageAnswer {
  id: string;
  answerValue: string;
  triggeredRisk: boolean;
  riskLevel?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  riskMessage?: string;
  questionText: string;
  category: string;
  categoryLabel: string;
}

interface TriageSummaryProps {
  triage: {
    id: string;
    status: string;
    hasRisks: boolean;
    riskSummary?: {
      critical: any[];
      high: any[];
      medium: any[];
      low: any[];
    };
    overallRiskLevel?: string;
    consentAccepted: boolean;
    consentAcceptedAt?: string;
    completedAt?: string;
    answers: TriageAnswer[];
  } | null;
  loading?: boolean;
  onRefresh?: () => void;
}

export function TriageSummary({ triage, loading, onRefresh }: TriageSummaryProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Loading
  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  // Sem triagem
  if (!triage) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 text-gray-500">
          <span className="text-xl">📋</span>
          <div>
            <p className="font-medium">Pré-avaliação não solicitada</p>
            <p className="text-sm">Este serviço não requer triagem prévia.</p>
          </div>
        </div>
      </div>
    );
  }

  // Triagem pendente
  if (triage.status === 'PENDING') {
    return (
      <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="font-bold text-yellow-800">Pré-avaliação PENDENTE</p>
              <p className="text-sm text-yellow-700">
                Cliente ainda não preencheu o formulário.
              </p>
            </div>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-1 text-sm bg-yellow-200 hover:bg-yellow-300 rounded-lg text-yellow-800"
            >
              ↻ Atualizar
            </button>
          )}
        </div>
        <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Atenção:</strong> Considere verificar com a cliente antes de iniciar
            procedimentos químicos sem a pré-avaliação preenchida.
          </p>
        </div>
      </div>
    );
  }

  // Contadores de risco
  const riskCounts = {
    critical: triage.riskSummary?.critical?.length || 0,
    high: triage.riskSummary?.high?.length || 0,
    medium: triage.riskSummary?.medium?.length || 0,
  };

  const hasBlockers = riskCounts.critical > 0;

  // Triagem completa
  return (
    <div className={`rounded-lg p-4 border-2 ${
      hasBlockers
        ? 'bg-red-50 border-red-300'
        : triage.hasRisks
          ? 'bg-yellow-50 border-yellow-300'
          : 'bg-green-50 border-green-300'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            {hasBlockers ? '🚫' : triage.hasRisks ? '⚠️' : '✅'}
          </span>
          <div>
            <p className={`font-bold ${
              hasBlockers
                ? 'text-red-800'
                : triage.hasRisks
                  ? 'text-yellow-800'
                  : 'text-green-800'
            }`}>
              {hasBlockers
                ? 'RISCOS CRÍTICOS DETECTADOS'
                : triage.hasRisks
                  ? 'Atenção: Riscos Identificados'
                  : 'Pré-avaliação OK'}
            </p>
            <p className="text-sm text-gray-600">
              Preenchida em {new Date(triage.completedAt!).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Badges de contagem */}
        <div className="flex gap-2">
          {riskCounts.critical > 0 && (
            <span className="px-2 py-1 bg-red-200 text-red-800 rounded-full text-sm font-bold">
              🔴 {riskCounts.critical}
            </span>
          )}
          {riskCounts.high > 0 && (
            <span className="px-2 py-1 bg-orange-200 text-orange-800 rounded-full text-sm font-bold">
              🟠 {riskCounts.high}
            </span>
          )}
          {riskCounts.medium > 0 && (
            <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-bold">
              🟡 {riskCounts.medium}
            </span>
          )}
        </div>
      </div>

      {/* Alertas Críticos (sempre visíveis) */}
      {hasBlockers && (
        <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-3">
          <p className="font-bold text-red-800 mb-2">🚫 PROCEDIMENTO PODE SER CONTRAINDICADO:</p>
          <ul className="space-y-1">
            {triage.riskSummary?.critical?.map((risk: any, idx: number) => (
              <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                <span>•</span>
                <span>{risk.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Alertas Altos (sempre visíveis se houver) */}
      {riskCounts.high > 0 && (
        <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 mb-3">
          <p className="font-bold text-orange-800 mb-2">🟠 REQUER ATENÇÃO ESPECIAL:</p>
          <ul className="space-y-1">
            {triage.riskSummary?.high?.map((risk: any, idx: number) => (
              <li key={idx} className="text-sm text-orange-700 flex items-start gap-2">
                <span>•</span>
                <span>{risk.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Botão para ver detalhes */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
      >
        {showDetails ? '▼' : '▶'} Ver todas as respostas ({triage.answers?.length || 0})
      </button>

      {/* Detalhes expandidos */}
      {showDetails && triage.answers && (
        <div className="mt-3 border-t pt-3">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {triage.answers.map((answer, idx) => (
              <div
                key={answer.id || idx}
                className={`p-2 rounded text-sm ${
                  answer.triggeredRisk
                    ? answer.riskLevel === 'CRITICAL'
                      ? 'bg-red-100 border-l-4 border-red-500'
                      : answer.riskLevel === 'HIGH'
                        ? 'bg-orange-100 border-l-4 border-orange-500'
                        : 'bg-yellow-100 border-l-4 border-yellow-500'
                    : 'bg-gray-50'
                }`}
              >
                <p className="text-gray-700">{answer.questionText}</p>
                <p className={`font-bold ${
                  answer.answerValue === 'SIM'
                    ? answer.triggeredRisk ? 'text-red-600' : 'text-gray-800'
                    : 'text-green-600'
                }`}>
                  Resposta: {answer.answerValue}
                </p>
                {answer.triggeredRisk && answer.riskMessage && (
                  <p className="text-xs mt-1 text-gray-600 italic">
                    ↳ {answer.riskMessage}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Termo de consentimento */}
      {triage.consentAccepted && (
        <div className="mt-3 pt-3 border-t text-xs text-gray-500">
          ✓ Termo de responsabilidade aceito em{' '}
          {new Date(triage.consentAcceptedAt!).toLocaleString('pt-BR')}
        </div>
      )}
    </div>
  );
}

export default TriageSummary;
