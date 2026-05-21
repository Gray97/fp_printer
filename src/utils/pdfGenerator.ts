import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { Invoice } from '../types/invoice';

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 40;

export async function generatePDF(
  invoices: Invoice[],
  perColumn: 1 | 2 | 3 | 4  // 每列发票数（纵向排列）
) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const rows = perColumn;  // 纵向排列的行数
  const cols = Math.ceil(invoices.length / rows);  // 需要多少列

  // 每张发票的尺寸（横向占满，纵向均分）
  const cellWidth = A4_WIDTH - MARGIN * 2;
  const cellHeight = (A4_HEIGHT - MARGIN * 2 - (rows - 1) * 15) / rows;

  for (let i = 0; i < invoices.length; i++) {
    const inv = invoices[i];
    const col = Math.floor(i / rows);  // 第几列
    const row = i % rows;              // 第几行（纵向位置）

    const x = MARGIN + col * cellWidth;
    const y = A4_HEIGHT - MARGIN - (row + 1) * cellHeight;

    const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);

    // 绘制虚线边框
    drawDashedBorder(page, x, y, cellWidth, cellHeight);

    // 嵌入发票图片
    if (inv.preview) {
      try {
        const imageBytes = Uint8Array.from(
          atob(inv.preview.split(',')[1]),
          c => c.charCodeAt(0)
        );

        let image;
        if (inv.type.startsWith('image/png')) {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          image = await pdfDoc.embedJpg(imageBytes);
        }

        // 图片缩放（保持比例，横向占满）
        const scale = (cellWidth - 16) / image.width;
        const scaledHeight = image.height * scale;

        // 垂直居中
        const imageY = y + (cellHeight - scaledHeight) / 2;

        page.drawImage(image, {
          x: x + 8,
          y: imageY,
          width: image.width * scale,
          height: scaledHeight,
        });

        // 金额标注（右下角）
        if (inv.amount) {
          page.drawText(`¥${inv.amount.toFixed(2)}`, {
            x: x + cellWidth - 15,
            y: y + 15,
            size: 12,
            font: fontBold,
            color: rgb(0.9, 0.2, 0.2),
          });
        }
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
      page.drawText(inv.name, {
        x: x + 10,
        y: y + cellHeight / 2,
        size: 10,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }

    // 日期标注（左下角）
    if (inv.date) {
      page.drawText(inv.date, {
        x: x + 10,
        y: y + 15,
        size: 8,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
    }
  }

  return pdfDoc.save();
}

// 绘制虚线边框
function drawDashedBorder(
  page: any,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const dashLength = 4;
  const gapLength = 3;
  const borderWidth = 0.8;

  // 上边框
  for (let i = 0; i < width; i += dashLength + gapLength) {
    page.drawLine({
      start: { x: x + i, y: y + height },
      end: { x: Math.min(x + i + dashLength, x + width), y: y + height },
      thickness: borderWidth,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  // 下边框
  for (let i = 0; i < width; i += dashLength + gapLength) {
    page.drawLine({
      start: { x: x + i, y: y },
      end: { x: Math.min(x + i + dashLength, x + width), y: y },
      thickness: borderWidth,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  // 左边框
  for (let i = 0; i < height; i += dashLength + gapLength) {
    page.drawLine({
      start: { x: x, y: y + i },
      end: { x: x, y: Math.min(y + i + dashLength, y + height) },
      thickness: borderWidth,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  // 右边框
  for (let i = 0; i < height; i += dashLength + gapLength) {
    page.drawLine({
      start: { x: x + width, y: y + i },
      end: { x: x + width, y: Math.min(y + i + dashLength, y + height) },
      thickness: borderWidth,
      color: rgb(0.6, 0.6, 0.6),
    });
  }
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
