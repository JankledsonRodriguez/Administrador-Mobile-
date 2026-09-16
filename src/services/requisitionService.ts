import { Requisition } from '../types';
import { initialRequisitions } from '../mockData';
import { apiClient } from './apiClient';

export const requisitionService = {
  async getRequisitions(): Promise<Requisition[]> {
    try {
      return await apiClient<Requisition[]>('/requisitions');
    } catch {
      const saved = localStorage.getItem('sigec_requisitions');
      return saved ? JSON.parse(saved) : initialRequisitions;
    }
  },

  async saveRequisitions(requisitions: Requisition[]): Promise<void> {
    try {
      await apiClient('/requisitions', {
        method: 'PUT',
        body: JSON.stringify(requisitions),
      });
    } catch {
      localStorage.setItem('sigec_requisitions', JSON.stringify(requisitions));
    }
  }
};
