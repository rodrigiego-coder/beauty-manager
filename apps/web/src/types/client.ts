export interface Client {
  id: string;
  salonId: string | null;
  name: string | null;
  phone: string;
  email: string | null;
  aiActive: boolean;
  technicalNotes: string | null;
  preferences: string | null;
  lastVisitDate: string | null;
  totalVisits: number;
  churnRisk: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientData {
  name: string;
  phone: string;
  email?: string;
  technicalNotes?: string;
  preferences?: string;
  aiActive?: boolean;
}

export interface UpdateClientData {
  name?: string;
  phone?: string;
  email?: string;
  technicalNotes?: string;
  preferences?: string;
  aiActive?: boolean;
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  newThisMonth: number;
  recurringClients: number;
  churnRiskCount: number;
}

export interface ClientCommand {
  id: string;
  code: string | null;
  cardNumber: string;
  status: string;
  totalNet: string | null;
  openedAt: string;
  closedAt: string | null;
}

export interface ClientHistory {
  commands: ClientCommand[];
  totalSpent: number;
  averageTicket: number;
  totalVisits: number;
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function getInitials(name: string | null): string {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function getStatusBadge(client: Client): { label: string; color: string } {
  if (!client.active) {
    return { label: 'Inativo', color: 'bg-gray-100 text-gray-800' };
  }
  if (client.churnRisk) {
    return { label: 'Risco de Perda', color: 'bg-amber-100 text-amber-800' };
  }
  return { label: 'Ativo', color: 'bg-green-100 text-green-800' };
}
