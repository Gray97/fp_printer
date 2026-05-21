import { createWorker, type Worker } from 'tesseract.js';

let worker: Worker | null = null;

export async function initOCR() {
  if (!worker) {
    worker = await createWorker('chi_sim+eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`OCR 进度: ${(m.progress * 100).toFixed(0)}%`);
        }
      }
    });
  }
  return worker;
}

export async function extractInvoiceData(file: File): Promise<{
  amount?: number;
  date?: string;
  code?: string;
  rawText: string;
}> {
  const w = await initOCR();
  
  // 将文件转为 ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const { data } = await w.recognize(arrayBuffer);
  await w.terminate();
  worker = null; // 释放资源

  const text = data.text;
  
  // 多策略提取
  const amount = extractAmount(text);
  const date = extractDate(text);
  const code = extractCode(text);

  return { amount, date, code, rawText: text };
}

function extractAmount(text: string): number | undefined {
  // 策略1: 匹配 "金额" 后面的数字
  const patterns = [
    /[合计金额|价税合计|总金额|金额][：:\s]*[¥￥]?\s*(\d+\.?\d*)/i,
    /[¥￥]\s*(\d+\.?\d*)/g,
    /(\d+\.\d{2})\s*元/g,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const num = parseFloat(match[1]);
      if (!isNaN(num) && num > 0 && num < 1000000) {
        return num;
      }
    }
  }
  return undefined;
}

function extractDate(text: string): string | undefined {
  const patterns = [
    /(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})[日]?/g,
    /(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})/g,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }
  return undefined;
}

function extractCode(text: string): string | undefined {
  // 发票代码：10位或12位数字
  const match = text.match(/\b\d{10,12}\b/);
  return match ? match[0] : undefined;
}
