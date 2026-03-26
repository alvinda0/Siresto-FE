// app/qris-payment/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  QrCode, 
  RotateCcw, 
  AlertCircle,
  RefreshCw,
  Info
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { paymentService } from "@/services/payment.service";
import { credentialsService } from "@/services/credentials.service";
import { SelectInput } from "@/components/SelectInput";
import { getErrorMessage } from "@/lib/utils";
import type { CreateQRISPaymentResponse } from "@/types/payment";
import type { AgentCredential } from "@/types/credentials";

export default function QRISPaymentPage() {
  const [loading, setLoading] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [response, setResponse] = useState<CreateQRISPaymentResponse | null>(null);

  // Agent selection
  const [agents, setAgents] = useState<AgentCredential[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");

  // Form fields
  const [amount, setAmount] = useState<string>("");
  const [timeout, setTimeout] = useState<string>("30");
  const [orderId, setOrderId] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [metadata, setMetadata] = useState<string>("");

  // Fetch agents on mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoadingAgents(true);
        const response = await credentialsService.getAgentCredentials({
          page: 1,
          limit: 100,
          status: "active",
        });
        setAgents(response.data);

        if (response.data.length > 0) {
          setSelectedAgentId(response.data[0].agent_id);
        }
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error("Failed to load agents", {
          description: errorMessage,
        });
        setAgents([]);
      } finally {
        setLoadingAgents(false);
      }
    };

    fetchAgents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAgentId) {
      toast.error("Please select an agent");
      return;
    }

    const selectedAgent = agents.find((a) => a.agent_id === selectedAgentId);
    if (!selectedAgent) {
      toast.error("Selected agent not found");
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      let parsedMetadata = undefined;
      if (metadata.trim()) {
        try {
          parsedMetadata = JSON.parse(metadata);
        } catch {
          toast.error("Invalid JSON format in metadata");
          setLoading(false);
          return;
        }
      }

      const requestBody = {
        amount: parseInt(amount),
        timeout: parseInt(timeout),
        ...(orderId.trim() && { order_id: orderId }),
        ...(username.trim() && { username: username }),
        ...(description.trim() && { description: description }),
        ...(webhookUrl.trim() && { webhook_url: webhookUrl }),
        ...(parsedMetadata && { metadata: parsedMetadata }),
      };

      const data = await paymentService.createQRISPayment(
        selectedAgent.api_key,
        selectedAgent.secret_key,
        requestBody
      );
      setResponse(data);

      if (data.success) {
        toast.success("QRIS Payment created successfully!", {
          description: `Transaction ID: ${data.data?.transaction_id}`,
          duration: 5000,
        });
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error("Failed to create QRIS payment", {
        description: errorMessage,
        duration: 5000,
      });

      setResponse({
        success: false,
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleReset = () => {
    setAmount("");
    setTimeout("30");
    setOrderId("");
    setUsername("");
    setDescription("");
    setWebhookUrl("");
    setMetadata("");
    setResponse(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3 py-8">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl">
              <QrCode className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              QRIS Payment Gateway
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Create and test QRIS payment transactions. Select an agent and fill the payment details.
          </p>
        </div>

        {/* Refresh Page Note */}
        <Alert className="max-w-2xl mx-auto bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200 flex items-center">
            <span>
              <strong>Note:</strong> After testing a payment, please refresh the page before creating a new transaction.
            </span>
          </AlertDescription>
        </Alert>

        {/* Agent Not Available Warning */}
        {!loadingAgents && agents.length === 0 && (
          <Alert className="max-w-4xl mx-auto bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              No active agents available. Please activate at least one agent in the credentials page.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Card */}
          <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Payment Details
              </h2>
              <p className="text-xs text-slate-500">
                <span className="text-red-500">*</span> Required fields
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Agent Selection */}
                <div className="space-y-2">
                  <Label htmlFor="agent" className="text-sm font-medium">
                    Select Agent <span className="text-red-500">*</span>
                  </Label>
                  <SelectInput
                    data={agents}
                    value={selectedAgentId}
                    onChange={setSelectedAgentId}
                    valueKey="agent_id"
                    labelKey="name"
                    placeholder={loadingAgents ? "Loading agents..." : "Select agent"}
                    searchPlaceholder="Search agent..."
                    emptyText="No active agents found"
                    disabled={loadingAgents || agents.length === 0}
                    className="bg-white/70 dark:bg-slate-800/70"
                  />
                  {selectedAgentId && (
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-xs text-slate-500">
                        Using{" "}
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {agents.find((a) => a.agent_id === selectedAgentId)?.name}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Amount & Timeout - Grid 2 Columns */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-medium">
                      Amount (Rp) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="10000"
                      required
                      min="1"
                      disabled={!selectedAgentId}
                      className="bg-white/70 dark:bg-slate-800/70"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeout" className="text-sm font-medium">
                      Timeout (min) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="timeout"
                      type="number"
                      value={timeout}
                      onChange={(e) => setTimeout(e.target.value)}
                      placeholder="30"
                      required
                      min="1"
                      max="1440"
                      disabled={!selectedAgentId}
                      className="bg-white/70 dark:bg-slate-800/70"
                    />
                  </div>
                </div>

                {/* Order ID & Username - Grid 2 Columns */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderId" className="text-sm font-medium">
                      Order ID <span className="text-slate-400">(optional)</span>
                    </Label>
                    <Input
                      id="orderId"
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="ORD-2024-001"
                      disabled={!selectedAgentId}
                      className="bg-white/70 dark:bg-slate-800/70"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                      Username <span className="text-slate-400">(optional)</span>
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="customer@email.com"
                      disabled={!selectedAgentId}
                      className="bg-white/70 dark:bg-slate-800/70"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description <span className="text-slate-400">(optional)</span>
                  </Label>
                  <Input
                    id="description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Payment for order"
                    disabled={!selectedAgentId}
                    className="bg-white/70 dark:bg-slate-800/70"
                  />
                </div>

                {/* Webhook URL */}
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl" className="text-sm font-medium">
                    Webhook URL <span className="text-slate-400">(optional)</span>
                  </Label>
                  <Input
                    id="webhookUrl"
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://example.com/webhook"
                    disabled={!selectedAgentId}
                    className="bg-white/70 dark:bg-slate-800/70"
                  />
                </div>

                {/* Metadata */}
                <div className="space-y-2">
                  <Label htmlFor="metadata" className="text-sm font-medium">
                    Metadata (JSON) <span className="text-slate-400">(optional)</span>
                  </Label>
                  <Textarea
                    id="metadata"
                    value={metadata}
                    onChange={(e) => setMetadata(e.target.value)}
                    placeholder='{"product_id": "123", "customer_name": "John Doe"}'
                    rows={2}
                    disabled={!selectedAgentId}
                    className="bg-white/70 dark:bg-slate-800/70 font-mono text-xs"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={loading || !selectedAgentId}
                    className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Payment...
                      </>
                    ) : (
                      "Create QRIS Payment"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={!selectedAgentId}
                    className="bg-white/70 dark:bg-slate-800/70"
                    title="Reset form"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Response Card */}
          <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Payment Response
              </h2>
              <p className="text-xs text-slate-500">
                Scan the QR code to complete payment
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {response?.success && response.data && (
                <div className="space-y-4">
                  <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      {response.message}
                    </AlertDescription>
                  </Alert>

                  {response.data.qris_image && (
                    <div className="space-y-3">
                      <div className="flex justify-center p-6 bg-white rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-lg">
                        <Image
                          src={`data:image/png;base64,${response.data.qris_image}`}
                          alt="QRIS Code"
                          width={300}
                          height={300}
                          className="w-full max-w-[300px] h-auto"
                          priority
                        />
                      </div>
                      <p className="text-center text-sm text-slate-600 dark:text-slate-400 font-medium">
                        Scan with any QRIS-compatible app
                      </p>
                    </div>
                  )}

                  <div className="space-y-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <DetailRow
                      label="Transaction ID"
                      value={response.data.transaction_id}
                      copyable
                      onCopy={copyToClipboard}
                    />
                    <DetailRow label="Order ID" value={response.data.order_id} />
                    <DetailRow label="Merchant" value={response.data.merchant_name} />
                    <DetailRow
                      label="Amount"
                      value={new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(response.data.amount)}
                    />
                  </div>

                  {response.data.qris_string && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">QRIS String</Label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-3 text-xs bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-x-auto font-mono">
                          {response.data.qris_string.substring(0, 60)}...
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(response.data!.qris_string)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Reminder to Refresh */}
                  <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 dark:text-amber-200">
                      <strong>Reminder:</strong> Please refresh the page before creating another payment.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {response && !response.success && (
                <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-1">Payment Failed</div>
                    <div className="text-sm">{response.message}</div>
                  </AlertDescription>
                </Alert>
              )}

              {!response && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4">
                    <QrCode className="h-16 w-16 opacity-50" />
                  </div>
                  <div className="text-sm font-medium mb-1">No QR code yet</div>
                  <div className="text-xs">Select agent and create payment</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-xs text-slate-500 dark:text-slate-400 py-6">
          <p>Powered by QRIS Payment Gateway</p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  copyable = false,
  onCopy,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  onCopy?: (text: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (onCopy) {
      onCopy(value);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start justify-between text-sm gap-4 py-2">
      <span className="font-medium text-slate-600 dark:text-slate-400 shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-2 flex-1 justify-end">
        <span className="text-slate-900 dark:text-slate-100 text-right break-all font-mono text-xs">
          {value}
        </span>
        {copyable && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-6 w-6 p-0 shrink-0"
          >
            {copied ? (
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}