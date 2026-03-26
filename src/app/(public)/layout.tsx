import { Toaster } from "sonner";

export const metadata = {
  title: "QRIS Payment",
  description: "Public QRIS payment gateway",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Langsung render children tanpa html/body wrapper */}
      <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
        {children}
      </main>
      <Toaster position="top-right" richColors />
    </>
  );
}