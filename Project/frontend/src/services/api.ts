// API service for backend communication

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7860';

export interface Patient {
  id?: number;
  patient_uid: string;
  name?: string;
  age?: number;
  gender?: string;
  extra?: any;
  clinical_notes?: string;
  icd10_code?: string;
  icd10_description?: string;
}

export interface PatientCreate {
  patient_uid?: string;
  name?: string;
  age?: number;
  gender?: string;
  extra?: any;
  clinical_notes?: string;
  icd10_code?: string;
  icd10_description?: string;
}

export interface SummaryRequest {
  patient_uid?: string;
  clinical_text: string;
  images?: string[]; // base64 encoded images
  use_hf?: boolean;
}

export interface ICDSuggestion {
  code: string;
  desc: string;
  score: number;
}

export interface SummaryResponse {
  model_output: string;
  icd_suggestions: ICDSuggestion[];
  images_info: any[];
  patient: Patient | null;
  patient_data_enriched?: any;
  ai_model_used?: string;
}

export interface ImageUploadResponse {
  filename: string;
  size: number;
  base64: string;
  content_type: string;
}

export interface ReportRecord {
  report_uid: string;
  patient_uid: string;
  patient_name?: string;
  doctor_name?: string;
  clinical_summary?: string;
  icd10_code?: string;
  icd10_description?: string;
  icd10_category?: string;
  confidence_score?: number;
  findings: string[];
  recommendations: string[];
  image_caption?: string;
  ai_model_used?: string;
  created_at?: string;
  report_data?: any;
}

export interface ReportPayload {
  report_uid?: string;
  patient_uid: string;
  patient_name?: string;
  patient_age?: number;
  patient_gender?: string;
  doctor_name?: string;
  clinical_summary: string;
  icd10_code?: string;
  icd10_description?: string;
  icd10_category?: string;
  confidence_score?: number;
  findings?: string[];
  recommendations?: string[];
  image_caption?: string;
  ai_model_used?: string;
  report_data?: any;
}

// Helper function to handle API errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Patient API
export const patientAPI = {
  create: async (patient: PatientCreate): Promise<Patient> => {
    const response = await fetch(`${API_BASE_URL}/api/patient`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient),
    });
    return handleResponse<Patient>(response);
  },

  get: async (patient_uid: string): Promise<Patient> => {
    const response = await fetch(`${API_BASE_URL}/api/patient/${patient_uid}`);
    return handleResponse<Patient>(response);
  },

  getAll: async (skip: number = 0, limit: number = 100): Promise<Patient[]> => {
    const response = await fetch(`${API_BASE_URL}/api/patients?skip=${skip}&limit=${limit}`);
    return handleResponse<Patient[]>(response);
  },

  update: async (patient_uid: string, patient: Partial<PatientCreate>): Promise<Patient> => {
    const response = await fetch(`${API_BASE_URL}/api/patient/${patient_uid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient),
    });
    return handleResponse<Patient>(response);
  },

  delete: async (patient_uid: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/patient/${patient_uid}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
  },
};

// Summary/Report API
export const summaryAPI = {
  generate: async (request: SummaryRequest): Promise<SummaryResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/generate-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return handleResponse<SummaryResponse>(response);
  },
};

// Patient Data API (from EHR)
export const patientDataAPI = {
  getFromEHR: async (patientId: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/patient-data/${patientId}`);
    return handleResponse(response);
  },
};

// Image API
export const imageAPI = {
  upload: async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/api/upload-image`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<ImageUploadResponse>(response);
  },
};

// Health check
export const healthCheck = async (): Promise<{ status: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  return handleResponse<{ status: string }>(response);
};

export const reportAPI = {
  create: async (payload: ReportPayload): Promise<ReportRecord> => {
    const response = await fetch(`${API_BASE_URL}/api/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<ReportRecord>(response);
  },

  get: async (reportUid: string): Promise<ReportRecord> => {
    const response = await fetch(`${API_BASE_URL}/api/report/${reportUid}`);
    return handleResponse<ReportRecord>(response);
  },

  list: async (params: { patient_uid?: string; doctor_name?: string; skip?: number; limit?: number } = {}): Promise<ReportRecord[]> => {
    const query = new URLSearchParams();
    if (params.patient_uid) query.append('patient_uid', params.patient_uid);
    if (params.doctor_name) query.append('doctor_name', params.doctor_name);
    if (typeof params.skip === 'number') query.append('skip', params.skip.toString());
    if (typeof params.limit === 'number') query.append('limit', params.limit.toString());

    const queryString = query.toString();
    const response = await fetch(
      queryString ? `${API_BASE_URL}/api/reports?${queryString}` : `${API_BASE_URL}/api/reports`
    );
    return handleResponse<ReportRecord[]>(response);
  },

  delete: async (reportUid: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/report/${reportUid}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
  },
};

// Helper to convert image file to base64
export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix if present
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper to convert base64 to data URL
export const base64ToDataURL = (base64: string, contentType: string = 'image/jpeg'): string => {
  return `data:${contentType};base64,${base64}`;
};

