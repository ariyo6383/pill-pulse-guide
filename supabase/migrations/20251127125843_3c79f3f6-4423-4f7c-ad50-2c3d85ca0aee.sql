-- Add age_limit column to tablets table
ALTER TABLE public.tablets 
ADD COLUMN age_limit text;

COMMENT ON COLUMN public.tablets.age_limit IS 'Age restriction or recommendation for tablet usage (e.g., "Adults only (18+)", "Not for children under 12", "All ages")';