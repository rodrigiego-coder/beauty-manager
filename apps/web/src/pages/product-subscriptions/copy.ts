/**
 * Centralized CRO Copy for Product Subscriptions Page
 * All user-facing strings in pt-BR for /assinaturas-produtos
 *
 * NOTE: This is about PHYSICAL PRODUCT subscriptions (home care kits),
 * NOT the SaaS system subscription (which is in /meu-plano).
 */

export const COPY = {
  // ==================== HERO ====================
  hero: {
    badge: 'Assinatura de Produtos',
    headline: 'Venda no piloto automatico',
    headlineHighlight: 'piloto automatico',
    subheadline: 'Assinatura de kits home care: seu cliente recebe os produtos em casa (ou retira no salao) e voce garante receita recorrente todo mes.',
    ctaButton: 'Ver planos disponiveis',
    ctaScrollTo: '#plans',
  },

  // ==================== TRUST BADGES ====================
  badges: [
    { text: 'Sem fidelidade', icon: 'Shield' },
    { text: 'Pausar quando quiser', icon: 'Pause' },
    { text: 'Entrega ou retirada', icon: 'Truck' },
    { text: 'Cobranca automatica', icon: 'CreditCard' },
  ],

  // ==================== ANTI-CONFUSION NOTE ====================
  antiConfusion: {
    title: 'O que e isso?',
    text: 'Esta pagina e para assinatura de PRODUTOS FISICOS (kits home care com entrega/retirada). A assinatura do sistema (SaaS/faturamento mensal) fica em',
    linkText: 'Meu Plano',
    linkHref: '/meu-plano',
  },

  // ==================== BENEFITS ====================
  benefits: {
    title: 'Por que oferecer assinatura de produtos?',
    subtitle: 'Beneficios para o salao e para o cliente',
    items: [
      {
        icon: 'TrendingUp',
        title: 'Receita previsivel',
        description: 'Faturamento recorrente todo mes, sem depender apenas de agendamentos.',
      },
      {
        icon: 'ShoppingBag',
        title: 'Aumento de ticket',
        description: 'Cliente que assina gasta mais e volta com frequencia.',
      },
      {
        icon: 'Heart',
        title: 'Fidelizacao por resultado',
        description: 'Uso continuo do home care = cabelo melhor = cliente satisfeito.',
      },
      {
        icon: 'ClipboardList',
        title: 'Operacao organizada',
        description: 'Voce sabe quantos kits separar todo mes. Sem surpresas.',
      },
      {
        icon: 'Clock',
        title: 'Menos retrabalho',
        description: 'Cobranca e lembrete automaticos. Secretaria so separa o kit.',
      },
      {
        icon: 'Gift',
        title: 'Exclusividade',
        description: 'Ofereca descontos ou brindes para assinantes.',
      },
    ],
  },

  // ==================== HOW IT WORKS ====================
  howItWorks: {
    title: 'Como funciona',
    subtitle: 'Assinatura de produtos em 3 passos simples',
    steps: [
      {
        number: 1,
        icon: 'ShoppingBag',
        title: 'Cliente escolhe o plano',
        description: 'Voce mostra os kits disponiveis. O cliente escolhe o que combina com o cabelo dele.',
      },
      {
        number: 2,
        icon: 'Truck',
        title: 'Define entrega ou retirada',
        description: 'O PRODUTO FISICO e entregue no endereco ou retirado no salao. Voce escolhe o dia do mes.',
      },
      {
        number: 3,
        icon: 'RefreshCw',
        title: 'Reposicao automatica',
        description: 'Todo mes o sistema cobra e avisa. Voce separa o kit. Cliente feliz, caixa cheio.',
      },
    ],
    note: 'Entrega/retirada refere-se ao PRODUTO (kit home care), nao ao sistema.',
  },

  // ==================== SECRETARY ROUTINE ====================
  routine: {
    title: 'Rotina da secretaria',
    subtitle: 'Checklist mensal para assinaturas de produtos',
    items: [
      { text: 'Verificar lista de assinaturas ativas do mes', done: false },
      { text: 'Separar kits conforme plano de cada cliente', done: false },
      { text: 'Confirmar forma de recebimento (entrega ou retirada)', done: false },
      { text: 'Avisar cliente quando kit estiver pronto', done: false },
      { text: 'Registrar entrega/retirada no sistema', done: false },
    ],
    tip: 'Dica: Use o painel para ver todas as entregas do mes em um so lugar.',
  },

  // ==================== EXAMPLES ====================
  examples: {
    title: 'Exemplos de assinaturas que mais vendem',
    subtitle: 'Inspire-se para criar seus planos',
    items: [
      {
        name: 'Kit Manutencao Loiro',
        description: 'Shampoo desamarelador + mascara matizadora + oleo finalizador',
        frequency: 'Mensal',
        priceRange: 'R$ 89 - R$ 149',
      },
      {
        name: 'Kit Hidratacao Intensa',
        description: 'Shampoo + condicionador + mascara de tratamento',
        frequency: 'Mensal',
        priceRange: 'R$ 79 - R$ 129',
      },
      {
        name: 'Kit Reconstrucao Capilar',
        description: 'Linha completa para cabelos danificados',
        frequency: 'Bimestral',
        priceRange: 'R$ 149 - R$ 249',
      },
    ],
  },

  // ==================== PLANS SECTION ====================
  plans: {
    title: 'Planos disponiveis',
    subtitle: 'Escolha o plano ideal para seu cliente',
    emptyState: {
      title: 'Nenhum plano cadastrado',
      description: 'Cadastre planos de assinatura em Configuracoes > Assinaturas de Produtos.',
    },
    card: {
      frequencyLabel: {
        MONTHLY: 'Mensal',
        BIMONTHLY: 'Bimestral',
        QUARTERLY: 'Trimestral',
      },
      benefitsTitle: 'Beneficios inclusos:',
      benefits: [
        'Reposicao automatica do kit',
        'Prioridade no atendimento',
        'Desconto exclusivo de assinante',
      ],
      productsTitle: 'Produtos do kit:',
      productsFallback: 'Produtos conforme plano selecionado',
      ctaSubscribe: 'Assinar este plano',
      ctaAlreadySubscribed: 'Ja assinado',
      savingsLabel: 'Economia de',
      perMonth: '/ mes',
      frictionLine: 'Sem fidelidade - Pause ou cancele quando quiser',
    },
  },

  // ==================== FAQ ====================
  faq: {
    title: 'Duvidas frequentes',
    subtitle: 'Tire suas duvidas sobre assinatura de produtos',
    items: [
      {
        question: 'Isso e a assinatura do sistema (SaaS)?',
        answer: 'Nao. Esta pagina e para assinatura de PRODUTOS FISICOS (kits home care). A assinatura do sistema (mensalidade do software) fica em "Meu Plano" no menu.',
      },
      {
        question: 'O cliente pode cancelar a qualquer momento?',
        answer: 'Sim. Nao ha fidelidade. O cliente pode pausar, retomar ou cancelar direto no painel ou com a secretaria.',
      },
      {
        question: 'Como funciona a cobranca?',
        answer: 'O sistema cobra automaticamente no cartao/Pix no dia escolhido. Se falhar, voce recebe alerta para cobrar manualmente.',
      },
      {
        question: 'Posso criar planos personalizados?',
        answer: 'Sim. Em Configuracoes > Assinaturas de Produtos voce monta kits com os produtos que quiser e define preco/desconto.',
      },
      {
        question: 'E se o cliente quiser trocar o kit?',
        answer: 'Basta cancelar a assinatura atual e criar uma nova com o plano desejado. Ou voce pode editar o plano se for exclusivo dele.',
      },
      {
        question: 'Entrega ou retirada: quem decide?',
        answer: 'O cliente escolhe na hora de assinar. Se escolher entrega, ele informa o endereco. Se escolher retirada, ele busca no salao.',
      },
    ],
  },

  // ==================== WIZARD ====================
  wizard: {
    title: 'Assinar plano de produtos',
    steps: {
      delivery: {
        title: 'Como o cliente vai receber o kit?',
        subtitle: 'Escolha a forma de recebimento do PRODUTO FISICO',
        options: {
          pickup: {
            title: 'Retirada no salao',
            description: 'Cliente busca o kit quando estiver pronto',
          },
          delivery: {
            title: 'Entrega no endereco',
            description: 'Kit enviado para o endereco informado',
          },
        },
        addressLabel: 'Endereco de entrega do kit',
        addressPlaceholder: 'Rua, numero, complemento, bairro, cidade, CEP',
        addressRequired: 'Informe o endereco completo para entrega',
      },
      schedule: {
        title: 'Quando enviar/disponibilizar?',
        subtitle: 'Escolha o dia do mes para reposicao do kit',
        dayLabel: 'Dia do mes',
        firstDeliveryLabel: 'Primeira reposicao prevista para:',
        frequencyNote: 'Frequencia do plano:',
        frequencyDays: 'a cada {days} dias',
      },
      summary: {
        title: 'Confirmar assinatura',
        subtitle: 'Revise os dados antes de confirmar',
        planLabel: 'Plano',
        deliveryTypeLabel: 'Forma de recebimento',
        deliveryTypePickup: 'Retirada no salao',
        deliveryTypeDelivery: 'Entrega',
        addressLabel: 'Endereco',
        dayLabel: 'Dia do mes',
        nextDeliveryLabel: 'Proxima reposicao',
        nextChargeLabel: 'Proxima cobranca',
        controlBlock: {
          title: 'Voce tem controle total',
          items: [
            'Pausar ou cancelar a qualquer momento',
            'Trocar dia ou forma de recebimento depois',
            'Sem multa ou fidelidade',
          ],
        },
      },
    },
    buttons: {
      cancel: 'Cancelar',
      back: 'Voltar',
      next: 'Continuar',
      confirm: 'Confirmar assinatura',
      confirming: 'Confirmando...',
    },
    errors: {
      generic: 'Erro ao processar. Tente novamente.',
      addressRequired: 'Informe o endereco de entrega.',
    },
  },

  // ==================== MY SUBSCRIPTIONS ====================
  mySubscriptions: {
    title: 'Minhas assinaturas de produtos',
    statusLabels: {
      ACTIVE: 'Ativa',
      PAUSED: 'Pausada',
      CANCELLED: 'Cancelada',
      EXPIRED: 'Expirada',
    },
    nextDeliveryLabel: 'Proxima reposicao:',
    deliveryTypeLabel: {
      DELIVERY: 'Entrega',
      PICKUP: 'Retirada',
    },
    actions: {
      pause: 'Pausar',
      resume: 'Retomar',
      cancel: 'Cancelar',
    },
    confirmPause: 'Deseja pausar esta assinatura? O cliente nao recebera o kit ate retomar.',
    confirmCancel: 'Deseja cancelar esta assinatura? Esta acao nao pode ser desfeita.',
  },

  // ==================== FINAL CTA ====================
  finalCta: {
    title: 'Pronto para comecar?',
    subtitle: 'Escolha um plano e ative a primeira assinatura de produtos.',
    button: 'Ver planos disponiveis',
  },
} as const;

export default COPY;
