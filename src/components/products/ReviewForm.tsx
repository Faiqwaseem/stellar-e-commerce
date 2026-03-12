import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ReviewFormProps {
  productId: string;
  onReviewAdded: () => void;
}

export function ReviewForm({ productId, onReviewAdded }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="bg-muted/50 rounded-lg p-4 text-center">
        <p className="text-muted-foreground">
          Please <a href="/login" className="text-primary hover:underline">sign in</a> to write a review.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('reviews').insert({
      product_id: productId,
      user_id: user.id,
      rating,
      comment: comment.trim() || null,
    });

    if (error) {
      toast.error('Failed to submit review', { description: error.message });
    } else {
      toast.success('Review submitted!');
      setRating(0);
      setComment('');
      onReviewAdded();
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl border p-6 space-y-4">
      <h3 className="font-semibold">Write a Review</h3>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-0.5"
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                star <= (hoveredRating || rating)
                  ? 'fill-accent text-accent'
                  : 'text-muted-foreground/30'
              }`}
            />
          </button>
        ))}
        {rating > 0 && <span className="text-sm text-muted-foreground ml-2">{rating}/5</span>}
      </div>
      <Textarea
        placeholder="Share your experience with this product (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
      />
      <Button type="submit" className="gradient-primary border-0" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}
