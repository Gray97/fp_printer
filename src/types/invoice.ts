export interface Invoice {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'confirmed' | 'processing' | 'done';
  amount?: number;
  date?: string;
  code?: string;
  preview?: string; // base64
  ocrText?: string;
}

export type LayoutMode = 2 | 3 | 4; // 每页张数
