import React from 'react';
import type { Invoice } from '../types/invoice';

interface Props {
  invoices: Invoice[];
  layout: 2 | 3 | 4;
}

export const InvoicePreview: React.FC<Props> = ({ invoices, layout }) => {
  if (invoices.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <p>暂无预览</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl border">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        📄 排版预览（A4 {layout}合1 竖向）
      </h3>
      <div className="bg-gray-100 p-4 rounded-lg overflow-auto" style={{ maxHeight: '400px' }}>
        <div
          className="mx-auto bg-white shadow-lg"
          style={{
            width: '210mm',
            minHeight: '297mm',
            transform: 'scale(0.4)',
            transformOrigin: 'top left',
          }}
        >
          {Array.from({ length: Math.ceil(invoices.length / layout) }).map((_, rowIdx) => (
            <div key={rowIdx} className="flex" style={{ minHeight: `${100 / Math.ceil(invoices.length / layout)}%` }}>
              {Array.from({ length: layout }).map((_, colIdx) => {
                const idx = rowIdx * layout + colIdx;
                const inv = invoices[idx];
                if (!inv) return <div key={colIdx} className="flex-1 border border-dashed border-gray-300 m-1" />;

                return (
                  <div key={colIdx} className="flex-1 border border-gray-200 m-1 p-2 bg-white rounded">
                    {inv.preview ? (
                      <img src={inv.preview} alt="" className="w-full h-auto" />
                    ) : (
                      <div className="w-full h-24 flex items-center justify-center text-gray-400 text-xs">
                        {inv.name}
                      </div>
                    )}
                    {inv.amount && (
                      <p className="text-xs text-red-600 font-bold mt-1">¥{inv.amount.toFixed(2)}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
