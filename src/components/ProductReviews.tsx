import React, { useState } from 'react';
import { Star, User } from 'lucide-react';
import { Review } from '../types';
import { auth } from '../lib/auth';
import { toast } from 'react-hot-toast';
import { reviews, marketplaceItems } from '../lib/staticData';

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  averageRating: number;
}

export default function ProductReviews({ productId, reviews: initialReviews, averageRating }: ProductReviewsProps) {
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [localReviews, setLocalReviews] = useState(initialReviews);
  const user = auth.getSession()?.user;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to leave a review');
      return;
    }

    const review: Review = {
      id: (reviews.length + 1).toString(),
      productId,
      userId: user.id,
      userEmail: user.email,
      rating: newReview.rating,
      comment: newReview.comment,
      createdAt: new Date().toISOString()
    };

    // Add to static data
    reviews.push(review);
    
    // Update product's reviews and average rating
    const productIndex = marketplaceItems.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      marketplaceItems[productIndex].reviews.push(review);
      const ratings = marketplaceItems[productIndex].reviews.map(r => r.rating);
      marketplaceItems[productIndex].averageRating = 
        ratings.reduce((a, b) => a + b, 0) / ratings.length;
    }

    // Update local state
    setLocalReviews([...localReviews, review]);
    setNewReview({ rating: 5, comment: '' });
    toast.success('Review submitted successfully');
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
      
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= averageRating
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-gray-600">
            {averageRating.toFixed(1)} out of 5
          </span>
          <span className="ml-2 text-gray-500">
            ({localReviews.length} {localReviews.length === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      </div>

      {user && user.role !== 'guest' && (
        <form onSubmit={handleSubmitReview} className="mb-8 bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-4">Write a Review</h4>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= newReview.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment
            </label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              rows={4}
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Share your thoughts about this product..."
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Submit Review
          </button>
        </form>
      )}

      <div className="space-y-4">
        {localReviews.map((review) => (
          <div key={review.id} className="border-b pb-4">
            <div className="flex items-center mb-2">
              <div className="bg-gray-100 rounded-full p-2">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="font-medium">{review.userEmail}</p>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-700 ml-12">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}