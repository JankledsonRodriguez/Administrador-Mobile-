import { StockItem } from '../types';
import { initialStockItems } from '../mockData';
import { apiClient } from './apiClient';

export const stockService = {
  async getItems(): Promise<StockItem[]> {
    try {
      return await apiClient<StockItem[]>('/stock');
    } catch {
      // Fallback local enquanto a API MySQL não está ativa
      const saved = localStorage.getItem('sigec_stock_items');
      return saved ? JSON.parse(saved) : initialStockItems;
    }
  },

  async saveItems(items: StockItem[]): Promise<void> {
    try {
      await apiClient('/stock', {
        method: 'PUT',
        body: JSON.stringify(items),
      });
    } catch {
      // Fallback local
      localStorage.setItem('sigec_stock_items', JSON.stringify(items));
    }
  }
};
