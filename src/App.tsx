import React, { useState, useCallback, useRef } from 'react';
import { InvoiceUploader } from './components/InvoiceUploader';
import { InvoiceList } from './components/InvoiceList';
import { InvoicePreview } from './components/InvoicePreview';
import { PrintControl } from './components/PrintControl';
import { extractInvoiceData } from './utils/ocr';
import { generatePDF, downloadPDF } from './utils/pdfGenerator';
import type { Invoice } from './types/invoice';
import { Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [layout, setLayout] = useState<2 | 3 | 4>(4);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesAdded = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    const newInvoices: Invoice[] = [];

    for (const file of files) {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      let preview: string | undefined;

      if (file.type.startsWith('image/')) {
        preview = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      newInvoices.push({
        id, file, name: file.name, size: file.size,
        type: file.type, status: 'pending', preview,
      });
    }

    setInvoices(prev => [...prev, ...newInvoices]);

    for (const inv of newInvoices) {
      try {
        const data = await extractInvoiceData(inv.file);
        setInvoices(prev =>
          prev.map(i =>
            i.id === inv.id
              ? { ...i, ...data, status: 'confirmed' as const, ocrText: data.rawText }
              : i
          )
        );
      } catch (e) {
        console.error('OCR 失败:', e);
        setInvoices(prev =>
          prev.map(i => (i.id === inv.id ? { ...i, status: 'done' as const } : i))
        );
      }
    }

    setIsProcessing(false);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleConfirm = useCallback((id: string) => {
    setInvoices(prev =>
      prev.map(i => (i.id === id ? { ...i, status: 'confirmed' as const } : i))
    );
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const allIds = new Set(invoices.map(i => i.id));
    setSelectedIds(prev => {
      if (prev.size === invoices.length) return new Set();
      return allIds;
    });
  }, [invoices]);

  const handlePrint = useCallback(() => {
    const confirmed = invoices.filter(i => i.status === 'confirmed' || i.status === 'done');
    if (confirmed.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
      <head><title>发票打印</title>
      <style>
        @page { size: A4; margin: 10mm; }
        body { margin: 0; padding: 0; }
        .page { 
          page-break-after: always; 
          width: 100%; 
          display: flex;
          flex-wrap: wrap;
          gap: 5mm;
          padding: 5mm;
          box-sizing: border-box;
        }
        .invoice { 
          flex: 1 1 calc(${100 / layout}% - 5mm); 
          max-width: calc(${100 / layout}% - 5mm);
          border: 1px solid #ddd;
          page-break-inside: avoid;
        }
        .invoice img { width: 100%; height: auto; }
      </style>
      </head>
      <body>
    `);

    for (let i = 0; i < confirmed.length; i += layout) {
      printWindow.document.write('<div class="page">');
      for (let j = 0; j < layout && i + j < confirmed.length; j++) {
        const inv = confirmed[i + j];
        printWindow.document.write(`
          <div class="invoice">
            <img src="${inv.preview}" alt="${inv.name}" />
            ${inv.amount ? `<p style="text-align:right;color:red;font-weight:bold;">¥${inv.amount.toFixed(2)}</p>` : ''}
          </div>
        `);
      }
      printWindow.document.write('</div>');
    }

    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  }, [invoices, layout]);

  const handleDownload = useCallback(async () => {
    const confirmed = invoices.filter(i => i.status === 'confirmed' || i.status === 'done');
    if (confirmed.length === 0) return;

    try {
      const pdfData = await generatePDF(confirmed, layout);
      downloadPDF(pdfData, `发票合并_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error('PDF 生成失败:', e);
      alert('PDF 生成失败，请重试');
    }
  }, [invoices, layout]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              🧾
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">发票打印合并工具</h1>
              <p className="text-xs text-gray-500">纯前端 · 零后端 · 隐私安全</p>
            </div>
          </div>
          {isProcessing && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">OCR 识别中...</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <InvoiceUploader onFilesAdded={handleFilesAdded} />
            <InvoiceList
              invoices={invoices}
              onDelete={handleDelete}
              onConfirm={handleConfirm}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              selectedIds={selectedIds}
            />
          </div>

          <div className="space-y-6">
            <InvoicePreview invoices={invoices} layout={layout} />
            <PrintControl
              invoices={invoices}
              layout={layout}
              onPrint={handlePrint}
              onDownload={handleDownload}
            />
          </div>
        </div>
      </main>

      <footer className="bg-white/50 border-t mt-12 py-6 text-center text-sm text-gray-400">
        <p>纯前端实现 · 数据不出浏览器 · 部署在 Vercel</p>
      </footer>
    </div>
  );
};
