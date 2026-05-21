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
  preview?: string;
  ocrText?: string;
}

export type LayoutMode = 2 | 3 | 4;
