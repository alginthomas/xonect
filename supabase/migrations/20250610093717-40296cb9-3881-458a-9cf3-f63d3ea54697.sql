
-- Drop the existing unique constraint on category name
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_name_key;

-- Add a new unique constraint that combines user_id and name
-- This allows different users to have categories with the same name
ALTER TABLE public.categories ADD CONSTRAINT categories_user_name_unique UNIQUE (user_id, name);
