export interface CashRegister {
  id: string;
  salonId: string;
  status: 'OPEN' | 'CLOSED';
  openingBalance: string;
  closingBalance?: string;
  expectedBalance?: string;
  difference?: string;
  totalSales: string;
  totalCash: string;
  totalCard: string;
  totalPix: string;
  totalWithdrawals: string;
  totalDeposits: string;
  openedAt: string;
  openedById: string;
  closedAt?: string;
  closedById?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CashMovement {
  id: string;
  cashRegisterId: string;
  type: 'WITHDRAWAL' | 'DEPOSIT';
  amount: string;
  reason: string;
  performedById: string;
  performedAt: string;
  createdAt: string;
}
