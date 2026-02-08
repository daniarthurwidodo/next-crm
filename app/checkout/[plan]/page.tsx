"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";

/**
 * Dynamic checkout page. It receives the plan identifier from the URL
 * (e.g. /checkout/pro) and creates a Stripe Checkout Session via the API.
 * While waiting, a simple loading indicator is shown. On success the user
 * is redirected to the Stripe hosted checkout page.
 */
export default function CheckoutPage({ params }: { params: Promise<{ plan: string }> }) {
  const router = useRouter();
  const { plan } = use(params);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function createSession() {
      try {
        const res = await fetch("/api/stripe/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to create session");
        }
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } catch (e: unknown) {
        // eslint prefers avoiding "any" – we treat the error as unknown and extract a message safely
        const message = e instanceof Error ? e.message : String(e);
        // Client-side logging - console.error is appropriate for browser environments
        console.error('[Checkout] Failed to create Stripe session:', { plan, error: message, stack: e instanceof Error ? e.stack : undefined });
        setError(message);
      }
    }
    createSession();
  }, [plan]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600">Error: {error}</p>
        <button
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
          onClick={() => router.back()}
        >
          Go Back
        </button>
      </div>
    );
  }

  // Simple loading UI while the session is being created
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting to Stripe…</p>
    </div>
  );
}

