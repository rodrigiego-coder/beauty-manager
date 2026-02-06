export type ServiceCategory = 'HAIR' | 'BARBER' | 'NAILS' | 'SKIN' | 'MAKEUP' | 'OTHER';

export interface Service {
  id: number;
  salonId: string;
  name: string;
  description: string | null;
  category: ServiceCategory;
  durationMinutes: number;
  basePrice: string;
  commissionPercentage: string;
  totalSessions: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceData {
  name: string;
  description?: string;
  category?: ServiceCategory;
  durationMinutes?: number;
  basePrice: number;
  commissionPercentage?: number;
  totalSessions?: number;
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  category?: ServiceCategory;
  durationMinutes?: number;
  basePrice?: number;
  commissionPercentage?: number;
  totalSessions?: number;
}

export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string; color: string }[] = [
  { value: 'HAIR', label: 'Cabelo', color: 'bg-purple-100 text-purple-800' },
  { value: 'BARBER', label: 'Barbearia', color: 'bg-blue-100 text-blue-800' },
  { value: 'NAILS', label: 'Unhas', color: 'bg-pink-100 text-pink-800' },
  { value: 'SKIN', label: 'Pele/Estetica', color: 'bg-green-100 text-green-800' },
  { value: 'MAKEUP', label: 'Maquiagem', color: 'bg-rose-100 text-rose-800' },
  { value: 'OTHER', label: 'Outros', color: 'bg-gray-100 text-gray-800' },
];

export function getCategoryInfo(category: ServiceCategory) {
  return SERVICE_CATEGORIES.find((c) => c.value === category) || SERVICE_CATEGORIES[5];
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}min`;
}
