import apiClient from './client';
import type { Wallet, WalletTransaction, CashbackEvent, WithdrawalRequest, PaginatedResponse } from '@/types';

export const walletAPI = {
  getWallet: async (): Promise<Wallet> => {
    const response = await apiClient.get('/wallet');
    return response.data;
  },

  getTransactions: async (
    page: number = 1,
    pageSize: number = 20,
    type?: 'credit' | 'debit',
    category?: string
  ): Promise<PaginatedResponse<WalletTransaction>> => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('page_size', String(pageSize));
    if (type) params.append('type', type);
    if (category) params.append('category', category);

    const response = await apiClient.get(`/wallet/transactions?${params.toString()}`);
    return response.data;
  },

  getCashbackEvents: async (
    status?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<CashbackEvent>> => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('page_size', String(pageSize));
    if (status) params.append('status', status);

    const response = await apiClient.get(`/wallet/cashback?${params.toString()}`);
    return response.data;
  },

  getWithdrawalRequests: async (
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<WithdrawalRequest>> => {
    const response = await apiClient.get(`/wallet/withdrawals?page=${page}&page_size=${pageSize}`);
    return response.data;
  },

  requestWithdrawal: async (
    amount: number,
    method: string,
    accountDetails: Record<string, string>
  ): Promise<WithdrawalRequest> => {
    const response = await apiClient.post('/wallet/withdraw', {
      amount,
      withdrawal_method: method,
      account_details: accountDetails,
    });
    return response.data;
  },

  claimMissingCashback: async (data: {
    merchant_id: number;
    order_date: string;
    order_amount: number;
    order_id?: string;
    description?: string;
  }): Promise<void> => {
    await apiClient.post('/wallet/claim-cashback', data);
  },

  // Admin endpoints
  getAllWithdrawals: async (
    status?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<WithdrawalRequest>> => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('page_size', String(pageSize));
    if (status) params.append('status', status);

    const response = await apiClient.get(`/admin/withdrawals?${params.toString()}`);
    return response.data;
  },

  processWithdrawal: async (
    withdrawalId: number,
    action: 'approve' | 'reject',
    reason?: string
  ): Promise<WithdrawalRequest> => {
    const response = await apiClient.post(`/admin/withdrawals/${withdrawalId}/${action}`, { reason });
    return response.data;
  },

  adjustWallet: async (
    userId: number,
    amount: number,
    type: 'credit' | 'debit',
    reason: string
  ): Promise<Wallet> => {
    const response = await apiClient.post(`/admin/wallet/${userId}/adjust`, { amount, type, reason });
    return response.data;
  },
};
