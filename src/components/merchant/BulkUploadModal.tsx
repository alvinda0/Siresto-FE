// components/merchant/BulkUploadModal.tsx
import React from "react";
import { Upload, X } from "lucide-react";

interface BulkUploadModalProps {
  isOpen: boolean;
  selectedFile: File | null;
  isUploading: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  onClose: () => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  selectedFile,
  isUploading,
  onFileChange,
  onUpload,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            Bulk Upload Merchants
          </h2>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              Upload an Excel file to create multiple merchants at once.
            </p>
            <p className="text-xs text-gray-500">
              Make sure to download the template first and fill it with the
              correct format.
            </p>
          </div>

          {/* File Input */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
            <input
              type="file"
              id="bulk-upload-file"
              accept=".xlsx,.xls"
              onChange={onFileChange}
              className="hidden"
              disabled={isUploading}
            />
            <label
              htmlFor="bulk-upload-file"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="w-10 h-10 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {selectedFile ? selectedFile.name : "Click to select file"}
              </span>
              <span className="text-xs text-gray-500">
                Supported formats: .xlsx, .xls
              </span>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="flex-1 px-4 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onUpload}
            disabled={!selectedFile || isUploading}
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
