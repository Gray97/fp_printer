import React from 'react';
import type { Invoice } from '../types/invoice';
import { Printer, Download, BarChart3 } from 'lucide-react';

interface Props {
  invoices: Invoice[];
  layout: 2 | 3 | 4;
  onPrint: () => void;
  onDownload: () => void;
}

export const PrintControl: React.FC<Props> = ({ invoices, layout, onPrint, onDownload }) => {
  const confirmed = invoices.filter(i => i.status === 'confirmed' || i.status === 'done');
  const totalAmount = confirmed.reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalCount = confirmed.length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-blue-600">{totalCount}</p>
          <p className="text-xs text-blue-500 mt-1">发票总数</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-red-600">¥{totalAmount.toFixed(2)}</p>
          <p className="text-xs text-red-500 mt-1">总金额</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-green-600">{layout}</p>
          <p className="text-xs text-green-500 mt-1">每页张数</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-purple-600">{Math.ceil(totalCount / layout)}</p>
          <p className="text-xs text-purple-500 mt-1">总页数</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onPrint}
          disabled={confirmed.length === 0}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          <Printer size={20} />
          直接打印
        </button>
        <button
          onClick={onDownload}
          disabled={confirmed.length === 0}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-medium"
        >
          <Download size={20} />
          下载 PDF
        </button>
      </div>

      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
        <BarChart3 size={18} className="text-gray-500" />
        <span className="text-sm text-gray-600">排版模式：</span>
        {[2, 3, 4].map(n => (
          <button
            key={n}
            onClick={() => window.location.reload()}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              layout === n ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'
            }`}
          >
            A4 {n}合1
          </button>
        ))}
      </div>
    </div>
  );
};
