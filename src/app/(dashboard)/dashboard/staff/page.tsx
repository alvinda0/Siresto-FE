"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuthMe } from "@/hooks/useAuthMe";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { FileText, Clock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const DashboardStaff = () => {
    usePageTitle("Dashboard Staff");
    const { data: user } = useAuthMe();
    const router = useRouter();

    const getCurrentGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    const handleNavigateToTransactions = () => {
        router.push("/transaction");
    };

    return (
        <div className="space-y-6">
            {/* Main Welcome Card */}
            <div className="backdrop-blur-md bg-white/40 border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
                {/* Greeting */}
                <div className="mb-6">
                    <h1 className="text-4xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        {getCurrentGreeting()}, {user?.name || "Staff"}!
                    </h1>
                    <p className="text-gray-600 text-lg">Welcome to your workspace</p>
                </div>

                {/* Role Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-300/30 mb-6">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-gray-700">
                        {user?.role_name || "Staff"}
                    </span>
                </div>

                {/* Info Text */}
                <p className="text-gray-600 leading-relaxed mb-8">
                    You have access to view and manage transactions. Click the button
                    below to get started with your daily tasks.
                </p>

                {/* Action Button */}
                <button
                    onClick={handleNavigateToTransactions}
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                    <FileText className="w-5 h-5" />
                    <span>View Transactions</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Access Info */}
                <div className="backdrop-blur-md bg-white/40 border border-white/20 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 shadow-md">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Your Access</h3>
                            <p className="text-sm text-gray-600">
                                View and manage all transaction records
                            </p>
                        </div>
                    </div>
                </div>

                {/* Current Time */}
                <div className="backdrop-blur-md bg-white/40 border border-white/20 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-linear-to-br from-purple-500 to-pink-600 shadow-md">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Current Time</h3>
                            <p className="text-sm text-gray-600">
                                {new Date().toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default withRoleProtection(DashboardStaff, [
    "StaffFinance", "StaffEntry"
]);
