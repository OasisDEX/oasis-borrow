ALTER TABLE public.merkle_tree
ADD COLUMN start_block decimal(78, 0),
ADD COLUMN end_block decimal(78, 0);
ALTER TABLE public.user
    RENAME COLUMN "createdAt" TO timestamp;
ALTER TABLE public.user DROP COLUMN total_amount;
ALTER TABLE public.merkle_tree
ADD COLUMN timestamp TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.weekly_claim
ADD COLUMN timestamp TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.merkle_tree
ADD COLUMN snapshot text;