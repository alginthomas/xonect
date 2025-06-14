
-- Ensure all existing data is properly associated with authenticated users
-- This will fix data visibility issues after implementing RLS

DO $$
DECLARE
    current_user_id UUID;
    record_count INTEGER;
BEGIN
    -- Get the current authenticated user (if any exists)
    SELECT id INTO current_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    
    IF current_user_id IS NOT NULL THEN
        -- Update leads without user_id
        UPDATE public.leads 
        SET user_id = current_user_id 
        WHERE user_id IS NULL;
        
        GET DIAGNOSTICS record_count = ROW_COUNT;
        RAISE NOTICE 'Updated % leads with user_id', record_count;
        
        -- Update categories without user_id
        UPDATE public.categories 
        SET user_id = current_user_id 
        WHERE user_id IS NULL;
        
        GET DIAGNOSTICS record_count = ROW_COUNT;
        RAISE NOTICE 'Updated % categories with user_id', record_count;
        
        -- Update import_batches without user_id
        UPDATE public.import_batches 
        SET user_id = current_user_id 
        WHERE user_id IS NULL;
        
        GET DIAGNOSTICS record_count = ROW_COUNT;
        RAISE NOTICE 'Updated % import_batches with user_id', record_count;
        
        -- Update email_templates without user_id
        UPDATE public.email_templates 
        SET user_id = current_user_id 
        WHERE user_id IS NULL;
        
        GET DIAGNOSTICS record_count = ROW_COUNT;
        RAISE NOTICE 'Updated % email_templates with user_id', record_count;
        
        -- Update campaigns without user_id
        UPDATE public.campaigns 
        SET user_id = current_user_id 
        WHERE user_id IS NULL;
        
        GET DIAGNOSTICS record_count = ROW_COUNT;
        RAISE NOTICE 'Updated % campaigns with user_id', record_count;
        
        -- Update lead_lists without user_id
        UPDATE public.lead_lists 
        SET user_id = current_user_id 
        WHERE user_id IS NULL;
        
        GET DIAGNOSTICS record_count = ROW_COUNT;
        RAISE NOTICE 'Updated % lead_lists with user_id', record_count;
        
    ELSE
        RAISE NOTICE 'No authenticated users found in auth.users table';
    END IF;
END $$;

-- Also ensure the user_id columns are not nullable going forward for data integrity
ALTER TABLE public.leads ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.categories ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.import_batches ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.email_templates ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.campaigns ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.lead_lists ALTER COLUMN user_id SET NOT NULL;
