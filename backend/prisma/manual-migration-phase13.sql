-- Phase 13: Reviews & Ratings System - Database Migration
-- Add seller responses, moderation fields, and helpful votes tracking

-- Add new columns to reviews table
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS flagged BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS seller_response TEXT,
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP;

-- Add index for approved status
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);

-- Create helpful_votes table
CREATE TABLE IF NOT EXISTS helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT helpful_votes_user_review_unique UNIQUE (user_id, review_id)
);

-- Create indexes for helpful_votes
CREATE INDEX IF NOT EXISTS idx_helpful_votes_review_id ON helpful_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_helpful_votes_user_id ON helpful_votes(user_id);

-- Update existing reviews to be approved by default (if needed)
UPDATE reviews SET approved = true WHERE approved IS NULL;
UPDATE reviews SET flagged = false WHERE flagged IS NULL;

-- Comments for documentation
COMMENT ON COLUMN reviews.approved IS 'Moderation status - true if review is approved and visible';
COMMENT ON COLUMN reviews.flagged IS 'Whether review has been flagged for admin review';
COMMENT ON COLUMN reviews.seller_response IS 'Response from the seller to this review';
COMMENT ON COLUMN reviews.responded_at IS 'Timestamp when seller responded to the review';
COMMENT ON TABLE helpful_votes IS 'Tracks which users found which reviews helpful';
