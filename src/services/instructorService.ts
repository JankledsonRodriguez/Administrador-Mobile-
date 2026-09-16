import { Instructor } from '../types';
import { initialInstructors } from '../mockData';
import { apiClient } from './apiClient';

export const instructorService = {
  async getInstructors(): Promise<Instructor[]> {
    try {
      return await apiClient<Instructor[]>('/instructors');
    } catch {
      const saved = localStorage.getItem('sigec_instructors');
      return saved ? JSON.parse(saved) : initialInstructors;
    }
  },

  async saveInstructors(instructors: Instructor[]): Promise<void> {
    try {
      await apiClient('/instructors', {
        method: 'PUT',
        body: JSON.stringify(instructors),
      });
    } catch {
      localStorage.setItem('sigec_instructors', JSON.stringify(instructors));
    }
  }
};
