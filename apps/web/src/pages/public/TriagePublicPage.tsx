import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTriagePublicForm, submitTriageAnswers } from '../../services/api';
import { TriageForm, TriageQuestion, TriageSubmitResult } from '../../types/triage';

export function TriagePublicPage() {
  const { token } = useParams<{ token: string }>();

  // Estados
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<TriageForm | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [result, setResult] = useState<TriageSubmitResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Riscos detectados em tempo real
  const [detectedRisks, setDetectedRisks] = useState<Record<string, TriageQuestion>>({});

  // Carrega formulário
  useEffect(() => {
    if (!token) return;

    const loadForm = async () => {
      try {
        const data = await getTriagePublicForm(token);

        if (data.error) {
          setError(data.error);
        } else if (data.completed) {
          setError('Este formulário já foi preenchido.');
        } else if (data.expired) {
          setError('Este formulário expirou.');
        } else if (data.form) {
          setForm(data.form);
        }
      } catch (err) {
        setError('Erro ao carregar formulário. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [token]);

  // Atualiza resposta e verifica risco
  const handleAnswer = (question: TriageQuestion, value: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }));

    // Verifica se disparou risco
    const triggerValue = (question.riskTriggerValue || 'SIM').toUpperCase();
    const answerUpper = value.toUpperCase();

    if (answerUpper === triggerValue || answerUpper === 'YES' || answerUpper === 'S') {
      setDetectedRisks(prev => ({ ...prev, [question.id]: question }));
    } else {
      setDetectedRisks(prev => {
        const updated = { ...prev };
        delete updated[question.id];
        return updated;
      });
    }
  };

  // Submete formulário
  const handleSubmit = async () => {
    if (!token || !form) return;

    // Valida respostas obrigatórias
    const unanswered = form.questions.filter(
      q => q.isRequired && !answers[q.id]
    );

    if (unanswered.length > 0) {
      setError(`Por favor, responda todas as perguntas obrigatórias. (${unanswered.length} pendentes)`);
      return;
    }

    if (form.requiresConsent && !consentAccepted) {
      setError('Você precisa aceitar o termo de responsabilidade para continuar.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const answersArray = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
      }));

      const submitResult = await submitTriageAnswers(token, answersArray, consentAccepted);
      setResult(submitResult);
    } catch (err) {
      setError('Erro ao enviar formulário. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Conta riscos por nível
  const riskCounts = {
    critical: Object.values(detectedRisks).filter(r => r.riskLevel === 'CRITICAL').length,
    high: Object.values(detectedRisks).filter(r => r.riskLevel === 'HIGH').length,
    medium: Object.values(detectedRisks).filter(r => r.riskLevel === 'MEDIUM').length,
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando formulário...</p>
        </div>
      </div>
    );
  }

  // Erro ou formulário não encontrado
  if (error && !form) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Ops!</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Resultado após submissão
  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          {result.canProceed ? (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-green-600 mb-2">Tudo Certo!</h1>
              <p className="text-gray-600">{result.message}</p>
              <p className="text-sm text-gray-500 mt-4">
                Você pode fechar esta página. Nos vemos no salão! 💜
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-orange-600 mb-2">Atenção!</h1>
              <p className="text-gray-600 mb-4">{result.message}</p>
              <div className="bg-orange-50 rounded-lg p-4 text-left text-sm">
                <p className="font-medium text-orange-800 mb-2">Próximos passos:</p>
                <ul className="list-disc list-inside text-orange-700 space-y-1">
                  <li>Nossa equipe vai analisar suas respostas</li>
                  <li>Entraremos em contato para orientações</li>
                  <li>Pode ser necessário reagendar ou ajustar o serviço</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Formulário
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-purple-800">{form?.name}</h1>
          <p className="text-sm text-gray-500">Preencha com atenção para sua segurança</p>
        </div>
      </header>

      {/* Indicador de riscos (se houver) */}
      {Object.keys(detectedRisks).length > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 sticky top-16 z-10">
          <div className="max-w-2xl mx-auto flex items-center gap-4 text-sm flex-wrap">
            <span className="font-medium text-yellow-800">Alertas detectados:</span>
            {riskCounts.critical > 0 && (
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full">
                🔴 {riskCounts.critical} crítico(s)
              </span>
            )}
            {riskCounts.high > 0 && (
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                🟠 {riskCounts.high} alto(s)
              </span>
            )}
            {riskCounts.medium > 0 && (
              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                🟡 {riskCounts.medium} médio(s)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Conteúdo */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Descrição */}
        {form?.description && (
          <div className="bg-purple-50 rounded-xl p-4 mb-6">
            <p className="text-purple-800 text-sm">{form.description}</p>
          </div>
        )}

        {/* Perguntas por categoria */}
        {form?.groupedQuestions.map((group) => (
          <div key={group.category} className="mb-8">
            {/* Título da categoria */}
            <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-purple-200">
              {group.label}
            </h2>

            {/* Perguntas */}
            <div className="space-y-4">
              {group.questions.map((question) => {
                const isAnswered = !!answers[question.id];
                const hasRisk = !!detectedRisks[question.id];

                return (
                  <div
                    key={question.id}
                    className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
                      hasRisk
                        ? question.riskLevel === 'CRITICAL'
                          ? 'border-red-300 bg-red-50'
                          : question.riskLevel === 'HIGH'
                            ? 'border-orange-300 bg-orange-50'
                            : 'border-yellow-300 bg-yellow-50'
                        : isAnswered
                          ? 'border-green-200'
                          : 'border-gray-100'
                    }`}
                  >
                    <div className="p-4">
                      {/* Pergunta */}
                      <p className="font-medium text-gray-800 mb-3">
                        {question.questionText}
                        {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                      </p>

                      {/* Help text */}
                      {question.helpText && (
                        <p className="text-sm text-gray-500 mb-3">{question.helpText}</p>
                      )}

                      {/* Botões SIM/NÃO para BOOLEAN */}
                      {question.answerType === 'BOOLEAN' ? (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => handleAnswer(question, 'SIM')}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                              answers[question.id] === 'SIM'
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAnswer(question, 'NAO')}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                              answers[question.id] === 'NAO'
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        /* Campo de texto para TEXT */
                        <input
                          type="text"
                          value={answers[question.id] || ''}
                          onChange={(e) => handleAnswer(question, e.target.value)}
                          placeholder="Digite sua resposta..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      )}

                      {/* Alerta de risco */}
                      {hasRisk && question.riskMessage && (
                        <div className={`mt-3 p-3 rounded-lg text-sm ${
                          question.riskLevel === 'CRITICAL'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : question.riskLevel === 'HIGH'
                              ? 'bg-orange-100 text-orange-800 border border-orange-200'
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                          <div className="flex items-start gap-2">
                            <span className="text-lg">
                              {question.riskLevel === 'CRITICAL' ? '🔴' : question.riskLevel === 'HIGH' ? '🟠' : '🟡'}
                            </span>
                            <div>
                              <p className="font-medium">
                                {question.blocksProcedure ? 'ALERTA CRÍTICO' : 'ATENÇÃO'}
                              </p>
                              <p>{question.riskMessage}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Termo de Responsabilidade */}
        {form?.requiresConsent && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border-2 border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3">{form.consentTitle}</h3>
            <div className="bg-white rounded-lg p-4 mb-4 text-sm text-gray-700 max-h-48 overflow-y-auto border">
              <p className="whitespace-pre-line">{form.consentText}</p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">
                <strong>Li, entendi e concordo</strong> com o termo de responsabilidade acima.
              </span>
            </label>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Botão de enviar */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || (form?.requiresConsent && !consentAccepted)}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            submitting || (form?.requiresConsent && !consentAccepted)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              Enviando...
            </span>
          ) : (
            '✓ Confirmar Pré-Avaliação'
          )}
        </button>

        {/* Progresso */}
        <div className="mt-4 text-center text-sm text-gray-500">
          {Object.keys(answers).length} de {form?.questions.length || 0} perguntas respondidas
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-8 py-4">
        <p className="text-center text-xs text-gray-400">
          Suas informações são confidenciais e protegidas.
        </p>
      </footer>
    </div>
  );
}

export default TriagePublicPage;
