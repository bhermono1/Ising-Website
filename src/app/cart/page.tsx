import type { Metadata } from "next";
import { Suspense } from "react";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = { title: "Your Cart" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-foreground sm:text-4xl">Your cart</h1>
      <div className="mt-10">
        <Suspense>
          <CartView />
        </Suspense>
      </div>
    </div>
  );
}
