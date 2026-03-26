// components/ReasonModal.tsx
import React, { useState, useRef } from "react";
import Image from "next/image";
import { X, Upload, Image as ImageIcon } from "lucide-react";

interface ReasonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string, image?: File, pin?: string) => void;
    title: string;
    type: "approve" | "reject";
    isLoading?: boolean;
}

export const ReasonModal: React.FC<ReasonModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    type,
    isLoading = false,
}) => {
    const [reason, setReason] = useState("");
    const [pin, setPin] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should not exceed 5MB');
                return;
            }

            setImage(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = () => {
        if (!reason.trim()) {
            alert("Please enter a reason");
            return;
        }

        if (type === "approve") {
            if (!pin.trim()) {
                alert("Please enter your PIN");
                return;
            }
            if (!image) {
                alert("Please upload an image for approval");
                return;
            }
            // For approve: pass all three parameters explicitly
            onSubmit(reason, image, pin);
        } else {
            // For reject: only pass reason
            onSubmit(reason);
        }
        setReason("");
        setPin("");
        setImage(null);
        setImagePreview(null);
    };

    const handleClose = () => {
        setReason("");
        setPin("");
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={isLoading}
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">

                    {/* Image Upload (only for approve) */}
                    {type === "approve" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Image: <span className="text-red-500">*</span>
                            </label>

                            {!imagePreview ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                                >
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 mb-1">
                                        Click to upload image
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        PNG, JPG, JPEG up to 5MB
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        disabled={isLoading}
                                    />
                                </div>
                            ) : (
                                <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
                                    <div className="relative w-full h-48">
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                    <button
                                        onClick={handleRemoveImage}
                                        disabled={isLoading}
                                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="p-3 bg-gray-50 border-t border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-700 truncate">
                                                {image?.name}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {(image!.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {/* Reason Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter {type === "approve" ? "approval" : "rejection"} reason:
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={`Enter ${type === "approve" ? "approval" : "rejection"} reason...`}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                            rows={4}
                            disabled={isLoading}
                            autoFocus
                        />
                    </div>

                    {/* PIN Input (only for approve) */}
                    {type === "approve" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                PIN: <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2 justify-center">
                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                    <input
                                        key={index}
                                        id={`pin-${index}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={pin[index] || ''}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, '');
                                            if (value.length <= 1) {
                                                const newPin = pin.split('');
                                                newPin[index] = value;
                                                setPin(newPin.join(''));
                                                
                                                // Auto focus next input
                                                if (value && index < 5) {
                                                    document.getElementById(`pin-${index + 1}`)?.focus();
                                                }
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            // Handle backspace
                                            if (e.key === 'Backspace' && !pin[index] && index > 0) {
                                                document.getElementById(`pin-${index - 1}`)?.focus();
                                            }
                                        }}
                                        onPaste={(e) => {
                                            e.preventDefault();
                                            const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
                                            setPin(pastedData);
                                            
                                            // Focus last filled input or next empty
                                            const nextIndex = Math.min(pastedData.length, 5);
                                            document.getElementById(`pin-${nextIndex}`)?.focus();
                                        }}
                                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        disabled={isLoading}
                                    />
                                ))}
                            </div>
                        </div>
                    )}


                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200">
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !reason.trim() || (type === "approve" && (!image || !pin.trim()))}
                        className={`px-6 py-2.5 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${type === "approve"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-600 hover:bg-red-700"
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <span>Oke</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};