import { createWorker } from 'tesseract.js';

let worker: any = null;

export async function initOCR() {
  if (!worker) {
    worker = await createWorker('chi_sim+eng', 1, {
      logger: (m: any) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR: ${(m.progress * 100).toFixed(0)}%`);
        }
      }
    });
  }
  return worker;
}

export async function extractInvoiceData(file: File) {
  const w = await initOCR();
  const arrayBuffer = await file.arrayBuffer();
  const { data } = await w.recognize(arrayBuffer);
  await w.terminate();
  worker = null;

  const text = data.text;
  const amount = extractAmount(text);
  const date = extractDate(text);
  const code = extractCode(text);

  return { amount, date, code, rawText: text };
}

function extractAmount(text: string): number | undefined {
  const patterns = [
    /[合计金额|价税合计|总金额|金额][：:\s]*[¥￥]?\s*(\d+\.?\d*)/i,
    /[¥￥]\s*(\d+\.?\d*)/g,
    /(\d+\.\d{2})\s*元/g,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const num = parseFloat(match[1]);
      if (!isNaN(num) && num > 0 && num < 1000000) return num;
    }
  }
  return undefined;
}

function extractDate(text: string): string | undefined {
  const match = text.match(/(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})[日]?/);
  return match ? match[0] : undefined;
}

function extractCode(text: string): string | undefined {
  const match = text.match(/\b\d{10,12}\b/);
  return match ? match[0] : undefined;
}
