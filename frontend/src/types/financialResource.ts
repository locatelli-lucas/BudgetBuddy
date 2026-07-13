import { Institution } from './investment';
import { Category } from './transaction';

export type FinancialResourceType =
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'CHECKING_ACCOUNT'
  | 'SAVINGS_ACCOUNT'
  | 'DIGITAL_WALLET'
  | 'CASH_WALLET';

export interface FinancialResource {
  id: string;
  name: string;
  type: FinancialResourceType;
  brand?: string;
  color?: string;
  lastFourDigits?: string;
  creditLimit?: number;
  currentBalance?: number;
  invoiceClosingDay?: number;
  invoiceDueDay?: number;
  isActive: boolean;
  financialInstitution?: Institution;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialResourceRequest {
  financialInstitutionId?: string;
  name: string;
  type: FinancialResourceType;
  brand?: string;
  color?: string;
  lastFourDigits?: string;
  creditLimit?: number;
  currentBalance?: number;
  invoiceClosingDay?: number;
  invoiceDueDay?: number;
  isActive: boolean;
}

export type InstallmentStatus = 'PAID' | 'PENDING' | 'FUTURE';

export interface InstallmentEntry {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: InstallmentStatus;
  paidAt?: string;
}

export interface InstallmentPurchase {
  id: string;
  description: string;
  totalAmount: number;
  installmentsCount: number;
  purchaseDate: string;
  category: Category;
  financialResource: FinancialResource;
  installments: InstallmentEntry[];
}

export interface InstallmentPurchaseRequest {
  description: string;
  totalAmount: number;
  installmentsCount: number;
  purchaseDate: string;
  categoryId: string;
  financialResourceId: string;
  isHistorical?: boolean;
  firstInstallmentNumber?: number;
}

export interface GroupedFinancialResources {
  netWorth: number;
  institutions: FinancialInstitutionGroup[];
}

export interface FinancialInstitutionGroup {
  institutionName: string;
  logoUrl?: string;
  totalBalance: number;
  resourceCount: number;
  financialResources: FinancialResource[];
}
