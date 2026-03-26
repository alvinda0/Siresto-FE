// components/disburement-platform/UploadProofDialog.tsx
import React, { useState, useRef } from "react";
import { X, Upload, FileImage } from "lucide-react";

interface UploadProofDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (formData: FormData) => Promise<void>;
    disbursementId: string;
    platformName: string;
    isLoading: boolean;
}

export const UploadProofDialog: React.FC<UploadProofDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    disbursementId,
    platformName,
    isLoading,
}) => {
    const [reason, setReason] = useState("");
    const [pin, setPin] = useState<string[]>(Array(6).fill(""));
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handlePinChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // only digits
        const newPin = [...pin];
        newPin[index] = value.slice(-1); // only 1 char per box
        setPin(newPin);
        // auto focus next
        if (value && index < 5) {
            pinRefs.current[index + 1]?.focus();
        }
    };

    const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !pin[index] && index > 0) {
            pinRefs.current[index - 1]?.focus();
        }
    };

    const handlePinPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        const newPin = Array(6).fill("");
        pasted.split("").forEach((char, i) => { newPin[i] = char; });
        setPin(newPin);
        pinRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleSubmit = async () => {
        const pinValue = pin.join("");
        if (!reason || pinValue.length !== 6 || !image) return;
        const formData = new FormData();
        formData.append("reason", reason);
        formData.append("image", image);
        formData.append("pin", pinValue);
        await onConfirm(formData);
        handleClose();
    };

    const handleClose = () => {
        setReason("");
        setPin(Array(6).fill(""));
        setImage(null);
        setPreview(null);
        onClose();
    };

    const isValid = reason.trim() && pin.join("").length === 6 && image;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-800">Upload Proof</h2>
                    <button
                        onClick={handleClose}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                {/* Info */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-xs text-purple-700">
                    <span className="font-semibold">Platform:</span> {platformName}
                    <br />
                    <span className="font-semibold">ID:</span>{" "}
                    <span className="font-mono">{disbursementId}</span>
                </div>

                {/* Reason */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Reason</label>
                    <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. acc sidang"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                </div>

                {/* Image Upload */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Image (Proof)</label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-300 hover:border-purple-400 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors"
                    >
                        {preview ? (
                            <img src={preview} alt="preview" className="max-h-32 object-contain rounded" />
                        ) : (
                            <>
                                <FileImage className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-xs text-gray-500">Click to select image</span>
                            </>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    {image && <p className="text-xs text-gray-500 truncate">{image.name}</p>}
                </div>

                {/* PIN - 6 boxes */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">PIN</label>
                    <div className="flex gap-2 justify-center">
                        {pin.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { pinRefs.current[index] = el; }}
                                type="password"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handlePinChange(index, e.target.value)}
                                onKeyDown={(e) => handlePinKeyDown(index, e)}
                                onPaste={handlePinPaste}
                                className="w-10 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                            />
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid || isLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Upload className="w-4 h-4" />
                        )}
                        Upload
                    </button>
                </div>
            </div>
        </div>
    );
};