import { Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";

export type ReviewData = {
  id: string;
  rating: number;
  comment: string;
  user: { name: string | null };
  room?: { name: string } | null;
};

export function ReviewsSection({ reviews }: { reviews: ReviewData[] }) {
  if (reviews.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Guest Reviews</span>
        <h2 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">Standing ovations only</h2>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <Card key={review.id} className="p-6">
            <Quote className="h-6 w-6 text-primary/60" />
            <StarRating rating={review.rating} className="mt-3" />
            <p className="mt-3 text-sm text-muted-foreground">&ldquo;{review.comment}&rdquo;</p>
            <p className="mt-4 text-sm font-semibold text-foreground">
              {review.user.name ?? "Guest"}
              {review.room && <span className="text-muted-foreground"> · {review.room.name}</span>}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
