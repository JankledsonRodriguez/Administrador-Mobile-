import { ClassGroup } from '../types';
import { initialClasses } from '../mockData';
import { apiClient } from './apiClient';

export const classService = {
  async getClasses(): Promise<ClassGroup[]> {
    try {
      return await apiClient<ClassGroup[]>('/classes');
    } catch {
      const saved = localStorage.getItem('sigec_classes');
      return saved ? JSON.parse(saved) : initialClasses;
    }
  },

  async saveClasses(classes: ClassGroup[]): Promise<void> {
    try {
      await apiClient('/classes', {
        method: 'PUT',
        body: JSON.stringify(classes),
      });
    } catch {
      localStorage.setItem('sigec_classes', JSON.stringify(classes));
    }
  }
};
