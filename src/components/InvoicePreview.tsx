import React from 'react';
import type { Invoice } from '../types/invoice';

interface Props {
  invoices: Invoice[];
  perColumn: 1 | 2 | 3 | 4;
}

export const InvoicePreview: React.FC<Props> = ({ invoices, perColumn }) => {
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
        📄 排版预览（A4 {perColumn}张/列 · 纵向排列 · 虚线分割）
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
          {/* 按列排列 */}
          {Array.from({ length: Math.ceil(invoices.length / perColumn) }).map((_, colIdx) => (
            <div key={colIdx} className="flex flex-col" style={{ gap: '10px', padding: '10px' }}>
              {Array.from({ length: perColumn }).map((_, rowIdx) => {
                const idx = colIdx * perColumn + rowIdx;
                const inv = invoices[idx];
                if (!inv) return <div key={rowIdx} className="border-2 border-dashed border-gray-300 h-32" />;

                return (
                  <div
                    key={rowIdx}
                    className="border-2 border-dashed border-gray-400 p-3 bg-white rounded relative"
                    style={{ height: '120px' }}
                  >
                    {inv.preview ? (
                      <img src={inv.preview} alt="" className="w-full h-auto" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        {inv.name}
                      </div>
                    )}
                    {inv.amount && (
                      <p className="absolute bottom-2 right-3 text-xs text-red-600 font-bold bg-white px-1">
                        ¥{inv.amount.toFixed(2)}
                      </p>
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
