import { DispatchRecord } from '../types';
import { initialDispatches } from '../mockData';
import { apiClient } from './apiClient';

export const dispatchService = {
  async getDispatches(): Promise<DispatchRecord[]> {
    try {
      return await apiClient<DispatchRecord[]>('/dispatches');
    } catch {
      const saved = localStorage.getItem('sigec_dispatches');
      return saved ? JSON.parse(saved) : initialDispatches;
    }
  },

  async saveDispatches(dispatches: DispatchRecord[]): Promise<void> {
    try {
      await apiClient('/dispatches', {
        method: 'PUT',
        body: JSON.stringify(dispatches),
      });
    } catch {
      localStorage.setItem('sigec_dispatches', JSON.stringify(dispatches));
    }
  }
};
