import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  MessageSquare,
  MessageCircle,
  TrendingUp,
  Shield,
  Clock,
  Check,
  ArrowRight,
  Sparkles,
  Zap,
  Crown,
  ChevronDown,
  ChevronUp,
  Gift,
  Bot,
} from 'lucide-react';
import { useState } from 'react';

// FAQ Item
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="font-medium text-gray-800">{q}</span>
        {open ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {open && <p className="pb-4 text-gray-600 text-sm">{a}</p>}
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ========== HEADER ========== */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Beauty Manager</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Entrar
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
            >
              Comecar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* ========== HERO ========== */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full mb-6">
            <Gift className="w-4 h-4" />
            <span className="text-sm font-medium">14 dias gratis, sem cartao</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Seu salao no
            <span className="text-primary-600"> piloto automatico</span>
          </h1>

          <p className="text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
            Agenda, comandas, financeiro e WhatsApp automatico.
            <br />
            Confirmacao automatica que reduz faltas. Foque no que importa: seus clientes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30"
            >
              Comecar Teste Gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all"
            >
              Ver funcionalidades
            </a>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-6 mt-12">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span className="text-gray-600 font-medium">Dados protegidos</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
              <Clock className="w-5 h-5 text-primary-600" />
              <span className="text-gray-600 font-medium">Suporte humanizado</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section id="features" className="py-20 bg-gray-50 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Tudo que seu salao precisa
            </h2>
            <p className="text-gray-600 mt-2">
              Em uma unica plataforma simples e poderosa
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: 'Agenda Inteligente',
                desc: 'Agendamentos online 24/7. Seus clientes marcam, voce recebe notificacao.',
                color: 'bg-blue-500',
              },
              {
                icon: MessageSquare,
                title: 'WhatsApp Automatico',
                desc: 'Confirmacao, lembrete e reagendamento automatico. Reduza faltas significativamente.',
                color: 'bg-green-500',
              },
              {
                icon: Sparkles,
                title: 'Alexia IA',
                desc: 'Assistente que responde 24/7, agenda clientes e tira duvidas pelo WhatsApp.',
                color: 'bg-purple-500',
              },
              {
                icon: TrendingUp,
                title: 'Financeiro Completo',
                desc: 'Controle de caixa, comissoes automaticas e relatorios em tempo real.',
                color: 'bg-emerald-500',
              },
              {
                icon: Users,
                title: 'Gestao de Clientes',
                desc: 'Historico completo, preferencias, aniversarios e fidelizacao automatica.',
                color: 'bg-orange-500',
              },
              {
                icon: Shield,
                title: 'Seguro e Confiavel',
                desc: 'Seus dados criptografados, exportacao a qualquer momento e LGPD compliant.',
                color: 'bg-gray-700',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all"
              >
                <div
                  className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 mt-2">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== COMO FUNCIONA ========== */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Como funciona</h2>
            <p className="text-gray-600 mt-2">Simples, modular e sem surpresas.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Assine o sistema</h3>
              <p className="text-gray-600 text-sm">
                Agenda, comandas, financeiro e gestao de clientes.
                <span className="block mt-2 text-primary-600 font-medium">14 dias gratis.</span>
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Ative WhatsApp
                <span className="text-xs font-normal text-gray-500 ml-2">(opcional)</span>
              </h3>
              <p className="text-gray-600 text-sm">
                Confirmacoes e lembretes automaticos.
                <span className="block mt-2 text-green-600 font-medium">14 dias gratis para testar.</span>
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Ative Alexia IA
                <span className="text-xs font-normal text-gray-500 ml-2">(opcional)</span>
              </h3>
              <p className="text-gray-600 text-sm">
                Atendimento 24/7 que agenda clientes.
                <span className="block mt-2 text-purple-600 font-medium">14 dias gratis para testar.</span>
              </p>
            </div>
          </div>

          <p className="text-center text-gray-500 mt-8 text-sm">
            Voce paga so pelo que usar. Sem surpresas. Sem multa de cancelamento.
          </p>
        </div>
      </section>

      {/* ========== PRICING ========== */}
      <section id="pricing" className="py-20 bg-gray-50 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Planos para cada momento
            </h2>
            <p className="text-gray-600 mt-2">
              Comece gratis e cresca conosco
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Essencial */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 text-white flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Essencial</h3>
              <p className="text-gray-500 text-sm mt-1">Para comecar</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">R$ 59</span>
                <span className="text-gray-500">/mes</span>
              </div>
              <ul className="mt-6 space-y-3">
                {['3 usuarios', '200 clientes', 'Agenda + Comandas', 'Relatorios basicos'].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-emerald-500" />
                      {item}
                    </li>
                  )
                )}
              </ul>
              <Link
                to="/signup"
                className="w-full mt-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all block text-center"
              >
                Comecar Gratis
              </Link>
            </div>

            {/* Professional */}
            <div className="relative bg-white rounded-2xl border-2 border-primary-500 p-6 shadow-xl scale-[1.02]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                MAIS POPULAR
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center mb-4">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Professional</h3>
              <p className="text-gray-500 text-sm mt-1">Para crescer</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">R$ 99</span>
                <span className="text-gray-500">/mes</span>
              </div>
              <ul className="mt-6 space-y-3">
                {[
                  '10 usuarios',
                  '1.000 clientes',
                  'WhatsApp Automatico',
                  'Alexia IA',
                  'Comissoes automaticas',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className="w-full mt-6 py-3 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 transition-all block text-center"
              >
                Comecar Gratis
              </Link>
            </div>

            {/* Master */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Master</h3>
              <p className="text-gray-500 text-sm mt-1">Para escalar</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">R$ 169</span>
                <span className="text-gray-500">/mes</span>
              </div>
              <ul className="mt-6 space-y-3">
                {[
                  '50 usuarios',
                  '5.000+ clientes',
                  'Tudo do Professional',
                  'Relatorios avancados',
                  'Suporte prioritario',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className="w-full mt-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all block text-center"
              >
                Comecar Gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section className="py-20 bg-gray-50 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Duvidas Frequentes</h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <FAQItem
              q="Preciso de cartao para comecar?"
              a="Nao! Teste gratis por 14 dias sem cadastrar cartao. Depois aceita PIX, boleto ou cartao."
            />
            <FAQItem
              q="Posso cancelar quando quiser?"
              a="Sim, sem multa. Cancele pelo sistema e use ate o fim do periodo pago."
            />
            <FAQItem
              q="O WhatsApp funciona com meu numero?"
              a="Sim! Conectamos seu numero existente via Z-API. Nao precisa trocar de numero."
            />
            <FAQItem
              q="Meus dados ficam seguros?"
              a="Sim! Criptografia em transito, exportacao de dados e conformidade com LGPD."
            />
            <FAQItem
              q="Quanto tempo para configurar?"
              a="Menos de 10 minutos. Cadastre-se, adicione seus servicos e ja pode comecar a agendar."
            />
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para transformar seu salao?
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            Automatize sua gestao e recupere horas do seu dia
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg"
          >
            Comecar Teste Gratis de 14 Dias
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-primary-200 text-sm mt-4">
            Sem cartao de credito. Sem compromisso.
          </p>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-12 border-t border-gray-200 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Beauty Manager</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900">
              Termos de Uso
            </a>
            <a href="#" className="hover:text-gray-900">
              Privacidade
            </a>
            <a href="#" className="hover:text-gray-900">
              Contato
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span>Dados protegidos</span>
            <Clock className="w-4 h-4 ml-2" />
            <span>Suporte por WhatsApp</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
