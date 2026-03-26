// app/api/payments/qris/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateHmacAuthHeaders } from "@/lib/hmac";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { api_key, secret_key, ...paymentData } = await request.json();

    // Validate credentials
    if (!api_key || !secret_key) {
      return NextResponse.json(
        {
          success: false,
          message: "Agent credentials are required.",
        },
        { status: 400 },
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACK_END_URL;
    if (!backendUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Backend URL not configured.",
        },
        { status: 500 },
      );
    }

    // Generate HMAC authentication headers
    const authHeaders = await generateHmacAuthHeaders(api_key, secret_key);

    // Call backend API (backend will detect agent from credentials)
    const response = await fetch(`${backendUrl}/public/payments/qris`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    // Log for debugging
    if (!response.ok) {
      console.error("QRIS Payment Error:", {
        status: response.status,
        statusText: response.statusText,
        data,
      });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("QRIS Payment API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      { status: 500 },
    );
  }
}
