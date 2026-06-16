"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";

export function ReviewForm({ roomId }: { roomId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit review");
      toast.success("Thanks for the review!");
      setSubmitted(true);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) return null;

  return (
    <Card className="mt-6 p-5">
      <h3 className="font-display text-lg text-foreground">Leave a review</h3>
      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        <StarRating rating={rating} onChange={setRating} size={22} />
        <Textarea
          rows={3}
          required
          minLength={5}
          placeholder="How was your night?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button type="submit" size="sm" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit review
        </Button>
      </form>
    </Card>
  );
}
