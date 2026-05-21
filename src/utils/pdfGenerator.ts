import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import type { Invoice } from '../types/invoice';

const A4_WIDTH = 595.28;  // pt
const A4_HEIGHT = 841.89; // pt

export async function generatePDF(
  invoices: Invoice[],
  layout: 2 | 3 | 4
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // 每张发票的尺寸（A4竖向均分）
  const cols = layout;
  const rows = Math.ceil(invoices.length / cols);
  
  const cellWidth = (A4_WIDTH - 40) / cols; // 减去边距
  const cellHeight = (A4_HEIGHT - 40) / rows;

  for (let i = 0; i < invoices.length; i++) {
    const invoice = invoices[i];
    const col = i % cols;
    const row = Math.floor(i / cols);

    const x = 20 + col * cellWidth;
    const y = A4_HEIGHT - 40 - (row + 1) * cellHeight;

    const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);

    // 绘制边框
    page.drawRectangle({
      x,
      y,
      width: cellWidth - 4,
      height: cellHeight - 4,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
    });

    // 嵌入发票图片
    if (invoice.preview) {
      try {
        const imageBytes = Uint8Array.from(atob(invoice.preview.split(',')[1]), c => c.charCodeAt(0));
        let image;
        
        if (invoice.type.startsWith('image/')) {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          image = await pdfDoc.embedJpg(imageBytes);
        }

        const scale = Math.min(
          (cellWidth - 8) / image.width,
          (cellHeight - 8) / image.height
        );

        page.drawImage(image, {
          x: x + 2,
          y: y + 2,
          width: image.width * scale,
          height: image.height * scale,
        });
      } catch (e) {
        console.error('嵌入图片失败:', e);
        page.drawText('图片加载失败', {
          x: x + 10,
          y: y + cellHeight / 2,
          size: 12,
          font,
          color: rgb(1, 0, 0),
        });
      }
    } else {
      page.drawText(invoice.name, {
        x: x + 10,
        y: y + cellHeight / 2,
        size: 10,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }

    // 金额标注
    if (invoice.amount) {
      page.drawText(`¥${invoice.amount.toFixed(2)}`, {
        x: x + 10,
        y: y + cellHeight - 15,
        size: 10,
        font: fontBold,
        color: rgb(0.9, 0.2, 0.2),
      });
    }
  }

  return pdfDoc.save();
}

export function downloadPDF(data: Uint8Array, filename: string) {
  const blob = new Blob([data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
