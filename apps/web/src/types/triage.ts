export interface TriageQuestion {
  id: string;
  category: string;
  categoryLabel: string;
  questionText: string;
  helpText?: string;
  answerType: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  riskTriggerValue: string;
  riskMessage?: string;
  blocksProcedure: boolean;
  isRequired: boolean;
  sortOrder: number;
}

export interface TriageForm {
  id: string;
  name: string;
  description?: string;
  consentTitle: string;
  consentText: string;
  requiresConsent: boolean;
  questions: TriageQuestion[];
  groupedQuestions: {
    category: string;
    label: string;
    questions: TriageQuestion[];
  }[];
}

export interface TriagePublicResponse {
  response?: {
    id: string;
    status: string;
    expiresAt?: string;
  };
  form?: TriageForm;
  error?: string;
  completed?: boolean;
  expired?: boolean;
  message?: string;
}

export interface TriageAnswer {
  questionId: string;
  value: string;
}

export interface TriageSubmitResult {
  success: boolean;
  hasRisks: boolean;
  overallRiskLevel?: string;
  canProceed: boolean;
  blockers: string[];
  message: string;
}
