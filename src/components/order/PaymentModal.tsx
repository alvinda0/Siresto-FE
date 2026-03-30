"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/order.service";
import { promoService } from "@/services/promo.service";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Wallet, 
  CreditCard, 
  Smartphone,
  QrCode,
  Banknote,
  Gift,
  Tag,
  Receipt,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Order } from "@/types/order";
import type { Promo } from "@/services/promo.service";
import { cn } from "@/lib/utils";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSuccess?: () => void;
}

const PAYMENT_METHODS = [
  { value: "TUNAI", label: "Tunai", icon: Banknote, color: "bg-green-50 border-green-200 hover:bg-green-100 text-green-700" },
  { value: "QRIS", label: "QRIS", icon: QrCode, color: "bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700" },
  { value: "DEBIT", label: "Debit", icon: CreditCard, color: "bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700" },
  { value: "CREDIT", label: "Credit", icon: CreditCard, color: "bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700" },
  { value: "GOPAY", label: "GoPay", icon: Smartphone, color: "bg-teal-50 border-teal-200 hover:bg-teal-100 text-teal-700" },
  { value: "OVO", label: "OVO", icon: Smartphone, color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-700" },
  { value: "COMPLIMENTARY", label: "Complimentary", icon: Gift, color: "bg-pink-50 border-pink-200 hover:bg-pink-100 text-pink-700" },
];

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000];

export function PaymentModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [displayPaidAmount, setDisplayPaidAmount] = useState<string>("");
  const [promoCode, setPromoCode] = useState<string>("");
  const [paymentNote, setPaymentNote] = useState<string>("");
  const [validatedPromo, setValidatedPromo] = useState<Promo | null>(null);
  const [promoValidationStatus, setPromoValidationStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const queryClient = useQueryClient();

  // Reset form when modal opens with new order
  useEffect(() => {
    if (isOpen && order) {
      setPaymentMethod("");
      setPaidAmount(order.total_amount.toString());
      setDisplayPaidAmount(formatNumber(order.total_amount));
      setPromoCode("");
      setPaymentNote("");
      setValidatedPromo(null);
      setPromoValidationStatus("idle");
    }
  }, [isOpen, order]);

  const formatNumber = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const parseFormattedNumber = (value: string): string => {
    // Remove all dots (thousand separators) and replace comma with dot for decimal
    const cleaned = value.replace(/\./g, '').replace(',', '.');
    return cleaned;
  };

  const handlePaidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow only numbers, dots, and commas
    if (value === '' || /^[\d.,]*$/.test(value)) {
      setDisplayPaidAmount(value);
      
      // Parse to actual number for calculation
      const parsed = parseFormattedNumber(value);
      if (parsed === '' || !isNaN(parseFloat(parsed))) {
        setPaidAmount(parsed);
      }
    }
  };

  const handlePaidAmountBlur = () => {
    // Format on blur
    if (paidAmount) {
      const num = parseFloat(paidAmount);
      if (!isNaN(num)) {
        setDisplayPaidAmount(formatNumber(num));
      }
    }
  };

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) {
      toast.error("Masukkan kode promo terlebih dahulu");
      return;
    }

    // Check if promo code is already used in the order
    if (order?.promo_code && order.promo_code.toUpperCase() === promoCode.trim().toUpperCase()) {
      toast.error("Kode promo ini sudah digunakan di order ini");
      setPromoValidationStatus("invalid");
      return;
    }

    setIsValidatingPromo(true);
    try {
      const result = await promoService.validatePromo(promoCode.trim());
      
      if (result.valid && result.promo) {
        setValidatedPromo(result.promo);
        setPromoValidationStatus("valid");
        
        toast.success(result.message || "Kode promo valid!");
        
        // Update paid amount to new calculated total
        setTimeout(() => {
          if (order && result.promo) {
            // Recalculate with the new promo
            const existingDiscount = Array.isArray(order.promo_details) && order.promo_details.length > 0
              ? order.promo_details.reduce((sum, promo) => sum + (promo.discount_amount || 0), 0)
              : 0;
            
            let additionalDiscount = 0;
            
            if (result.promo.type === "percentage") {
              const calculatedDiscount = (order.subtotal_amount * result.promo.value) / 100;
              
              if (result.promo.max_discount && calculatedDiscount > result.promo.max_discount) {
                additionalDiscount = result.promo.max_discount;
              } else {
                additionalDiscount = calculatedDiscount;
              }
            } else {
              additionalDiscount = result.promo.value;
            }
            
            const totalDiscount = existingDiscount + additionalDiscount;
            const amountAfterDiscount = order.subtotal_amount - totalDiscount;
            
            // Recalculate taxes
            let runningTotal = amountAfterDiscount;
            
            if (order.tax_details && Array.isArray(order.tax_details) && order.tax_details.length > 0) {
              const sortedTaxes = [...order.tax_details].sort((a, b) => a.priority - b.priority);
              
              sortedTaxes.forEach((tax) => {
                const taxAmount = (runningTotal * tax.percentage) / 100;
                runningTotal = runningTotal + taxAmount;
              });
            }
            
            const finalTotal = runningTotal;
            
            setPaidAmount(finalTotal.toString());
            setDisplayPaidAmount(formatNumber(finalTotal));
          }
        }, 100);
      } else {
        setValidatedPromo(null);
        setPromoValidationStatus("invalid");
        toast.error(result.message || "Kode promo tidak valid");
      }
    } catch (error: any) {
      setValidatedPromo(null);
      setPromoValidationStatus("invalid");
      toast.error(error?.response?.data?.message || "Gagal memvalidasi promo");
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const calculateDiscount = (): number => {
    if (!order || !validatedPromo || promoValidationStatus !== "valid") return 0;
    
    let discount = 0;
    
    // Calculate discount from subtotal (before any promo/tax)
    if (validatedPromo.type === "percentage") {
      discount = (order.subtotal_amount * validatedPromo.value) / 100;
      if (validatedPromo.max_discount && discount > validatedPromo.max_discount) {
        discount = validatedPromo.max_discount;
      }
    } else {
      discount = validatedPromo.value;
    }
    
    return discount;
  };

  const calculateFinalTotal = (): number => {
    if (!order) return 0;
    
    // If no additional promo or order already has promo, return current total
    if (!validatedPromo || promoValidationStatus !== "valid" || order.promo_code) {
      return order.total_amount;
    }
    
    // Recalculate everything with both promos
    const existingDiscount = Array.isArray(order.promo_details) && order.promo_details.length > 0
      ? order.promo_details.reduce((sum, promo) => sum + (promo.discount_amount || 0), 0)
      : 0;
    
    const additionalDiscount = calculateDiscount();
    const totalDiscount = existingDiscount + additionalDiscount;
    
    // Amount after all discounts
    const amountAfterDiscount = order.subtotal_amount - totalDiscount;
    
    // Recalculate taxes on the new discounted amount
    let runningTotal = amountAfterDiscount;
    
    if (order.tax_details && order.tax_details.length > 0) {
      // Sort by priority and apply taxes sequentially
      const sortedTaxes = [...order.tax_details].sort((a, b) => a.priority - b.priority);
      
      for (const tax of sortedTaxes) {
        const taxAmount = (runningTotal * tax.percentage) / 100;
        runningTotal += taxAmount;
      }
    }
    
    return runningTotal;
  };

  const paymentMutation = useMutation({
    mutationFn: (payload: {
      payment_method: string;
      paid_amount: number;
      promo_code?: string;
      payment_note?: string;
    }) => {
      if (!order) throw new Error("Order is required");
      return orderService.processPayment(order.id, payload);
    },
    onSuccess: () => {
      toast.success("Pembayaran berhasil diproses");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      if (order) {
        queryClient.invalidateQueries({ queryKey: ["order", order.id] });
      }
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal memproses pembayaran");
    },
  });

  const handleSubmit = () => {
    if (!paymentMethod) {
      toast.error("Pilih metode pembayaran");
      return;
    }

    const amount = parseFloat(paidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Masukkan jumlah pembayaran yang valid");
      return;
    }

    // Calculate final total using the new function
    const finalTotal = calculateFinalTotal();

    if (paymentMethod === "TUNAI" && amount < finalTotal) {
      toast.error("Jumlah pembayaran kurang dari total");
      return;
    }

    const payload: any = {
      payment_method: paymentMethod,
      paid_amount: amount,
    };

    // Only send promo code if validated and order doesn't have existing promo
    if (promoCode.trim() && promoValidationStatus === "valid" && !order?.promo_code) {
      payload.promo_code = promoCode.trim();
    }

    if (paymentNote.trim()) {
      payload.payment_note = paymentNote.trim();
    }

    paymentMutation.mutate(payload);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateChange = () => {
    if (!order || paymentMethod !== "TUNAI") return 0;
    const amount = parseFloat(paidAmount);
    if (isNaN(amount)) return 0;
    
    // Calculate against final total
    const finalTotal = calculateFinalTotal();
    
    return Math.max(0, amount - finalTotal);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Wallet className="h-5 w-5" />
            Proses Pembayaran
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Order ID: <span className="font-mono font-semibold">{order?.id.substring(0, 8)}...</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Total Amount Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 shadow-sm">
            {/* Subtotal */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 font-medium">Subtotal</span>
              <span className="text-lg font-semibold text-gray-800">
                {order && formatCurrency(order.subtotal_amount)}
              </span>
            </div>
            
            {/* Existing Promo from Order */}
            {order?.promo_details && Array.isArray(order.promo_details) && order.promo_details.length > 0 && (
              <>
                {order.promo_details.map((promo, index) => (
                  <div key={index} className="flex justify-between items-center mb-2 text-green-600">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      Promo: {promo.promo_name}
                    </span>
                    <span className="text-base font-semibold">
                      - {formatCurrency(promo.discount_amount)}
                    </span>
                  </div>
                ))}
              </>
            )}
            
            {/* Additional Promo (if validated) */}
            {validatedPromo && promoValidationStatus === "valid" && !order?.promo_code && (
              <div className="flex justify-between items-center mb-2 text-green-600 animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  Promo Tambahan: {validatedPromo.name}
                </span>
                <span className="text-base font-semibold">
                  - {formatCurrency(calculateDiscount())}
                </span>
              </div>
            )}
            
            {/* Subtotal After Discount */}
            {((order?.promo_details && Array.isArray(order.promo_details) && order.promo_details.length > 0) || (validatedPromo && promoValidationStatus === "valid" && !order?.promo_code)) && (
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-blue-200">
                <span className="text-sm text-gray-600 font-medium">Subtotal Setelah Diskon</span>
                <span className="text-base font-semibold text-gray-800">
                  {order && formatCurrency(
                    order.subtotal_amount - 
                    (Array.isArray(order.promo_details) && order.promo_details.length > 0
                      ? order.promo_details.reduce((sum, promo) => sum + (promo.discount_amount || 0), 0)
                      : 0) - 
                    (validatedPromo && promoValidationStatus === "valid" && !order.promo_code ? calculateDiscount() : 0)
                  )}
                </span>
              </div>
            )}
            
            {/* Tax Details (sorted by priority) */}
            {order?.tax_details && order.tax_details.length > 0 && (
              <div className="space-y-2 mb-2">
                {(() => {
                  // If additional promo is applied, recalculate taxes
                  if (validatedPromo && promoValidationStatus === "valid" && !order.promo_code) {
                    const existingDiscount = Array.isArray(order.promo_details) && order.promo_details.length > 0
                      ? order.promo_details.reduce((sum, promo) => sum + (promo.discount_amount || 0), 0)
                      : 0;
                    
                    const amountAfterDiscount = order.subtotal_amount - 
                      existingDiscount - 
                      calculateDiscount();
                    
                    let runningTotal = amountAfterDiscount;
                    const recalculatedTaxes = order.tax_details
                      .sort((a, b) => a.priority - b.priority)
                      .map(tax => {
                        const taxAmount = (runningTotal * tax.percentage) / 100;
                        runningTotal += taxAmount;
                        return { ...tax, tax_amount: taxAmount };
                      });
                    
                    return recalculatedTaxes.map((tax) => (
                      <div key={tax.tax_id} className="flex justify-between items-center text-orange-600">
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Receipt className="h-3 w-3" />
                          {tax.tax_name} ({tax.percentage}%) - P{tax.priority}
                        </span>
                        <span className="text-base font-semibold">
                          + {formatCurrency(tax.tax_amount)}
                        </span>
                      </div>
                    ));
                  }
                  
                  // Otherwise show original taxes
                  return order.tax_details
                    .sort((a, b) => a.priority - b.priority)
                    .map((tax) => (
                      <div key={tax.tax_id} className="flex justify-between items-center text-orange-600">
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Receipt className="h-3 w-3" />
                          {tax.tax_name} ({tax.percentage}%) - P{tax.priority}
                        </span>
                        <span className="text-base font-semibold">
                          + {formatCurrency(tax.tax_amount)}
                        </span>
                      </div>
                    ));
                })()}
              </div>
            )}
            
            {/* Total Pembayaran */}
            <div className="border-t-2 border-blue-300 pt-3 flex justify-between items-center">
              <span className="text-base font-bold text-gray-800">Total Pembayaran</span>
              <span className={cn(
                "text-2xl font-bold flex items-center gap-1",
                (validatedPromo && promoValidationStatus === "valid" && !order?.promo_code) || order?.promo_details
                  ? "text-green-600"
                  : "text-blue-600"
              )}>
                {(validatedPromo && promoValidationStatus === "valid" && !order?.promo_code) || order?.promo_details ? (
                  <Sparkles className="h-5 w-5" />
                ) : null}
                {order && formatCurrency(calculateFinalTotal())}
              </span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Metode Pembayaran *
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setPaymentMethod(method.value)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200",
                      paymentMethod === method.value
                        ? `${method.color} border-current ring-2 ring-offset-2 ring-current/20 scale-[1.02]`
                        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5",
                      paymentMethod === method.value ? "" : "text-gray-500"
                    )} />
                    <span className={cn(
                      "font-medium text-sm",
                      paymentMethod === method.value ? "" : "text-gray-700"
                    )}>
                      {method.label}
                    </span>
                    {paymentMethod === method.value && (
                      <CheckCircle2 className="h-4 w-4 ml-auto animate-in zoom-in duration-200" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paid Amount */}
          <div className="space-y-3">
            <Label htmlFor="paid_amount" className="text-base font-semibold">
              Jumlah Dibayar *
            </Label>
            <Input
              id="paid_amount"
              type="text"
              placeholder="Masukkan jumlah"
              value={displayPaidAmount}
              onChange={handlePaidAmountChange}
              onBlur={handlePaidAmountBlur}
              className="text-lg h-12 font-semibold"
            />
            
            {/* Quick Amount Buttons for TUNAI */}
            {paymentMethod === "TUNAI" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="text-xs text-gray-500 font-medium">Nominal Cepat:</span>
                <div className="grid grid-cols-4 gap-2">
                  {QUICK_AMOUNTS.map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const finalTotal = calculateFinalTotal();
                        const newAmount = finalTotal + amount;
                        setPaidAmount(newAmount.toString());
                        setDisplayPaidAmount(formatNumber(newAmount));
                      }}
                      className="text-xs font-medium hover:bg-green-50 hover:border-green-300"
                    >
                      +{formatCurrency(amount).replace('Rp', '')}
                    </Button>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const finalTotal = calculateFinalTotal();
                    setPaidAmount(finalTotal.toString());
                    setDisplayPaidAmount(formatNumber(finalTotal));
                  }}
                  className="w-full text-xs font-medium hover:bg-blue-50 hover:border-blue-300"
                >
                  Uang Pas
                </Button>
              </div>
            )}
          </div>

          {/* Change (for TUNAI only) */}
          {paymentMethod === "TUNAI" && calculateChange() > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700 font-semibold flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Kembalian
                </span>
                <span className="text-2xl font-bold text-green-700">
                  {formatCurrency(calculateChange())}
                </span>
              </div>
            </div>
          )}

          {/* Promo Code */}
          <div className="space-y-3">
            <Label htmlFor="promo_code" className="text-base font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Kode Promo (Opsional)
            </Label>
            {order?.promo_code && (
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700 border border-blue-200 animate-in fade-in duration-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Order ini sudah menggunakan promo: <strong>{order.promo_code}</strong>
                </span>
              </div>
            )}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  id="promo_code"
                  type="text"
                  placeholder="Masukkan kode promo"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    setPromoValidationStatus("idle");
                    setValidatedPromo(null);
                    if (order) {
                      setPaidAmount(order.total_amount.toString());
                      setDisplayPaidAmount(formatNumber(order.total_amount));
                    }
                  }}
                  className={cn(
                    "h-11 pr-10 font-mono uppercase",
                    promoValidationStatus === "valid" && "border-green-500 bg-green-50",
                    promoValidationStatus === "invalid" && "border-red-500 bg-red-50"
                  )}
                />
                {promoValidationStatus === "valid" && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 animate-in zoom-in duration-200" />
                )}
                {promoValidationStatus === "invalid" && (
                  <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500 animate-in zoom-in duration-200" />
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleValidatePromo}
                disabled={isValidatingPromo || !promoCode.trim()}
                className="h-11 px-6 font-semibold hover:bg-green-50 hover:border-green-300"
              >
                {isValidatingPromo ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Pakai"
                )}
              </Button>
            </div>
            
            {/* Promo Details */}
            {validatedPromo && promoValidationStatus === "valid" && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-3">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-green-800 mb-1 text-base">{validatedPromo.name}</div>
                    <div className="text-green-700 font-medium">
                      {validatedPromo.type === "percentage" 
                        ? `Diskon ${validatedPromo.value}%` 
                        : `Diskon ${formatCurrency(validatedPromo.value)}`}
                      {validatedPromo.max_discount && (
                        <span className="text-sm"> (Maks. {formatCurrency(validatedPromo.max_discount)})</span>
                      )}
                    </div>
                    {validatedPromo.min_transaction && (
                      <div className="text-green-600 text-xs mt-1">
                        Min. transaksi: {formatCurrency(validatedPromo.min_transaction)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Note */}
          <div className="space-y-3">
            <Label htmlFor="payment_note" className="text-base font-semibold">
              Catatan Pembayaran (Opsional)
            </Label>
            <Textarea
              id="payment_note"
              placeholder="Tambahkan catatan pembayaran..."
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={paymentMutation.isPending}
            className="flex-1 sm:flex-none"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={paymentMutation.isPending}
            className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {paymentMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Proses Pembayaran
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
