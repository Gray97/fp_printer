import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileImage } from 'lucide-react';

interface Props {
  onFilesAdded: (files: File[]) => void;
}

export const InvoiceUploader: React.FC<Props> = ({ onFilesAdded }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesAdded(acceptedFiles);
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/ofd': ['.ofd'],
    },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center
        transition-all duration-300 cursor-pointer
        ${isDragActive
          ? 'border-blue-500 bg-blue-50 scale-[1.02]'
          : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50'
        }
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-4">
        <div className={`
          w-16 h-16 rounded-full flex items-center justify-center
          ${isDragActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}
          transition-colors duration-300
        `}>
          {isDragActive ? <FileImage size={32} /> : <Upload size={32} />}
        </div>

        <div>
          <p className="text-lg font-semibold text-gray-700">
            {isDragActive ? '松开鼠标上传文件' : '拖拽发票文件到此处'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            支持 PDF / OFD / PNG / JPG，可多选追加
          </p>
        </div>

        <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          选择文件
        </button>
      </div>
    </div>
  );
};
