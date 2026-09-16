/**
 * Cliente HTTP base para comunicação com o Backend MySQL (API REST).
 * Quando a API estiver pronta, defina a URL base abaixo ou via .env (ex: import.meta.env.VITE_API_URL).
 */
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://api.sigec.local/v1';

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Erro na API MySQL: ${response.status} ${response.statusText}`);
    }

    return await response.json() as T;
  } catch (error) {
    // Modo offline / fallback enquanto o backend MySQL está sendo elaborado
    console.warn(`[API MySQL Offline/Em Desenvolvimento] Falha ao conectar em ${url}. Usando armazenamento local/mock.`);
    throw error;
  }
}
