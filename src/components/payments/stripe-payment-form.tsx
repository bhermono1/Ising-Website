"use client";

import { useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Loader2, Lock } from "lucide-react";
import { getStripe } from "@/lib/stripe-client";
import { Button } from "@/components/ui/button";

function InnerForm({ returnUrl, label }: { returnUrl: string; label: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={!stripe || submitting}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
        {submitting ? "Processing..." : label}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Lock className="h-3 w-3" /> Payments are securely processed by Stripe.
      </p>
    </form>
  );
}

export function StripePaymentForm({
  clientSecret,
  returnUrl,
  label = "Confirm & Pay",
}: {
  clientSecret: string;
  returnUrl: string;
  label?: string;
}) {
  return (
    <Elements
      stripe={getStripe()}
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#ff2d78",
            colorBackground: "#1c1830",
            colorText: "#f4f2fa",
            colorDanger: "#ff5470",
            borderRadius: "12px",
          },
        },
      }}
    >
      <InnerForm returnUrl={returnUrl} label={label} />
    </Elements>
  );
}
