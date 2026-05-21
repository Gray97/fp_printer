import React from 'react';
import type { Invoice } from '../types/invoice';
import { Trash2, CheckCircle, Clock, Check, X } from 'lucide-react';

interface Props {
  invoices: Invoice[];
  onDelete: (id: string) => void;
  onConfirm: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  selectedIds: Set<string>;
}

export const InvoiceList: React.FC<Props> = ({
  invoices, onDelete, onConfirm, onToggleSelect, onSelectAll, selectedIds,
}) => {
  const allSelected = invoices.length > 0 && selectedIds.size === invoices.length;

  const statusConfig = {
    pending: { label: '待确认', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    confirmed: { label: '已确认', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    processing: { label: '识别中', color: 'bg-blue-100 text-blue-800', icon: Clock },
    done: { label: '已完成', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
  };

  return (
    <div className="space-y-3">
      {invoices.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onSelectAll}
              className="w-4 h-4 accent-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">全选</span>
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => selectedIds.forEach(id => onConfirm(id))}
              disabled={selectedIds.size === 0}
              className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              批量确认 ({selectedIds.size})
            </button>
            <button
              onClick={() => selectedIds.forEach(id => onDelete(id))}
              disabled={selectedIds.size === 0}
              className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              批量删除 ({selectedIds.size})
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {invoices.map((inv) => {
          const config = statusConfig[inv.status];
          const StatusIcon = config.icon;

          return (
            <div
              key={inv.id}
              className={`
                flex items-center gap-3 p-3 bg-white border rounded-xl
                ${selectedIds.has(inv.id) ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-200'}
              `}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(inv.id)}
                onChange={() => onToggleSelect(inv.id)}
                className="w-4 h-4 accent-blue-500"
              />

              <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                {inv.preview ? (
                  <img src={inv.preview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FileImage size={20} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{inv.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  {inv.amount && (
                    <span className="text-xs text-red-600 font-semibold">¥{inv.amount.toFixed(2)}</span>
                  )}
                  {inv.date && (
                    <span className="text-xs text-gray-500">{inv.date}</span>
                  )}
                </div>
              </div>

              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
                <StatusIcon size={12} />
                {config.label}
              </span>

              <div className="flex gap-1 flex-shrink-0">
                {inv.status === 'pending' && (
                  <button onClick={() => onConfirm(inv.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg">
                    <Check size={16} />
                  </button>
                )}
                <button onClick={() => onDelete(inv.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {invoices.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <FileImage size={48} className="mx-auto mb-4 opacity-50" />
          <p>暂无发票，请上传文件</p>
        </div>
      )}
    </div>
  );
};

const FileImage = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
