import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Client {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  aiActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageResponse {
  response: string | null;
  aiActive: boolean;
  toolCalls?: unknown[];
}

// Busca status do cliente
export async function getClientStatus(phone: string): Promise<Client | null> {
  try {
    const { data } = await api.get(`/clients/${phone}`);
    return data;
  } catch {
    return null;
  }
}

// Toggle AI status
export async function toggleAiStatus(phone: string): Promise<Client> {
  const { data } = await api.patch(`/clients/${phone}/toggle-ai`);
  return data;
}

// Envia mensagem de teste
export async function sendMessage(phone: string, message: string): Promise<MessageResponse> {
  const { data } = await api.post('/ai/message', { phone, message });
  return data;
}

export default api;
