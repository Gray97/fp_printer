import React from 'react';
import type { Invoice } from '../types/invoice';
import { Printer, Download, LayoutGrid } from 'lucide-react';

interface Props {
  invoices: Invoice[];
  perColumn: 1 | 2 | 3 | 4;  // 纵向排列的行数
  onPrint: () => void;
  onDownload: () => void;
  onLayoutChange: (n: 1 | 2 | 3 | 4) => void;
}

export const PrintControl: React.FC<Props> = ({
  invoices,
  perColumn,
  onPrint,
  onDownload,
  onLayoutChange,
}) => {
  const confirmed = invoices.filter(
    i => i.status === 'confirmed' || i.status === 'done'
  );
  const totalAmount = confirmed.reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalCount = confirmed.length;
  const totalCols = Math.ceil(totalCount / perColumn);

  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-blue-600">{totalCount}</p>
          <p className="text-xs text-blue-500 mt-1">发票总数</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-red-600">
            ¥{totalAmount.toFixed(2)}
          </p>
          <p className="text-xs text-red-500 mt-1">总金额</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-green-600">{perColumn}</p>
          <p className="text-xs text-green-500 mt-1">纵向行数</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-purple-600">{totalCols}</p>
          <p className="text-xs text-purple-500 mt-1">总列数</p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={onPrint}
          disabled={confirmed.length === 0}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
        >
          <Printer size={20} />
          直接打印
        </button>
        <button
          onClick={onDownload}
          disabled={confirmed.length === 0}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
        >
          <Download size={20} />
          下载 PDF
        </button>
      </div>

      {/* 布局选择：纵向排列 */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
        <LayoutGrid size={18} className="text-gray-500" />
        <span className="text-sm text-gray-600">纵向排列：</span>
        {[1, 2, 3, 4].map(n => (
          <button
            key={n}
            onClick={() => onLayoutChange(n as 1 | 2 | 3 | 4)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              perColumn === n
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border'
            }`}
          >
            {n}张/列
          </button>
        ))}
      </div>

      {/* 打印说明 */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-800">
        💡 提示：发票<strong>按行纵向排列</strong>，每张发票横向占满，发票间使用<strong>虚线分割</strong>，方便裁剪。
      </div>
    </div>
  );
};
