// components/settlement/BulkSettlementPlatformModal.tsx
"use client";

import React, { useState, useRef } from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, AlertCircle, Eye, EyeOff } from "lucide-react";

interface BulkSettlementPlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File, pin: string) => Promise<void>;
  isLoading: boolean;
}

export function BulkSettlementPlatformModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: BulkSettlementPlatformModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];
      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
      } else {
        alert("Please select a valid Excel file (.xlsx or .xls)");
        e.target.value = "";
      }
    }
  };

  const handleSubmit = async () => {
    if (!file || !pin) return;
    await onSubmit(file, pin);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setPin("");
    setShowPin(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Platform Settlement Upload" size="lg">
      <div className="space-y-6">
        {/* Info Box */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Upload Excel File for Platform Settlement
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Please upload an Excel file (.xlsx or .xls) containing platform settlement data.
              Make sure to download and use the provided template.
            </p>
          </div>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="file" className="text-gray-900 dark:text-white">
            Excel File <span className="text-red-500">*</span>
          </Label>
          
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              id="file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading}
            />
            
            <Button
              type="button"
              onClick={handleBrowseClick}
              variant="outline"
              className="flex-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
              disabled={isLoading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </div>

          {file && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-900 dark:text-green-100 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                type="button"
              >
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* PIN Input */}
        <div className="space-y-2">
          <Label htmlFor="pin" className="text-gray-900 dark:text-white">
            PIN <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="pin"
              type={showPin ? "text" : "password"}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter your 6-digit PIN"
              maxLength={6}
              className="pr-10 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              {showPin ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Enter your 6-digit security PIN to authorize this bulk platform settlement
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || pin.length !== 6 || isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload & Process
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}