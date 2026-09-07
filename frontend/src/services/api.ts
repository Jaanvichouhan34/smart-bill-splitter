import type { BillData } from '../types/bill';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface HealthResponse {
  status: string;
  provider?: string;
  gemini_configured?: boolean;
  groq_configured?: boolean;
}

export async function checkBackendHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      return await res.json();
    }
    return { status: 'unreachable' };
  } catch {
    return { status: 'offline' };
  }
}

export async function extractBillFromImage(file: File): Promise<BillData> {
  const formData = new FormData();
  formData.append('file', file);

  const endpoint = `${API_BASE_URL}/extract-bill`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Extraction failed with status ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson?.detail) {
          errorMessage = errorJson.detail;
        }
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    const data: BillData = await response.json();
    return data;
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(
        'Could not connect to the DigiValet Backend API (http://127.0.0.1:8000). Please ensure the FastAPI server is running.'
      );
    }
    throw err;
  }
}
