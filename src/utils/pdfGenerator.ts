import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import type { Invoice } from '../types/invoice';

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

export async function generatePDF(invoices: Invoice[], layout: 2 | 3 | 4) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const cols = layout;
  const rows = Math.ceil(invoices.length / cols);
  const cellWidth = (A4_WIDTH - 40) / cols;
  const cellHeight = (A4_HEIGHT - 40) / rows;

  for (let i = 0; i < invoices.length; i++) {
    const inv = invoices[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 20 + col * cellWidth;
    const y = A4_HEIGHT - 40 - (row + 1) * cellHeight;

    const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);

    page.drawRectangle({
      x, y,
      width: cellWidth - 4,
      height: cellHeight - 4,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
    });

    if (inv.preview) {
      try {
        const imageBytes = Uint8Array.from(atob(inv.preview.split(',')[1]), c => c.charCodeAt(0));
        let image;
        if (inv.type.startsWith('image/')) {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          image = await pdfDoc.embedJpg(imageBytes);
        }

        const scale = Math.min(
          (cellWidth - 8) / image.width,
          (cellHeight - 8) / image.height
        );

        page.drawImage(image, {
          x: x + 2, y: y + 2,
          width: image.width * scale,
          height: image.height * scale,
        });
      } catch (e) {
        page.drawText('图片加载失败', {
          x: x + 10, y: y + cellHeight / 2,
          size: 12, font, color: rgb(1, 0, 0),
        });
      }
    }

    if (inv.amount) {
      page.drawText(`¥${inv.amount.toFixed(2)}`, {
        x: x + 10, y: y + cellHeight - 15,
        size: 10, font: fontBold, color: rgb(0.9, 0.2, 0.2),
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
