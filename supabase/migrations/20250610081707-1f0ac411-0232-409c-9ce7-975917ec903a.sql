
-- Create categories table for organizing leads
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  criteria JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create import_batches table to track CSV imports
CREATE TABLE public.import_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  source_file TEXT,
  total_leads INTEGER DEFAULT 0,
  successful_imports INTEGER DEFAULT 0,
  failed_imports INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Add category_id and import_batch_id to leads table
ALTER TABLE public.leads 
ADD COLUMN category_id UUID REFERENCES public.categories(id),
ADD COLUMN import_batch_id UUID REFERENCES public.import_batches(id);

-- Create lead_lists table for saved filters and dynamic lists
CREATE TABLE public.lead_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL DEFAULT '{}',
  is_smart BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default categories
INSERT INTO public.categories (name, description, color) VALUES
('General', 'Default category for uncategorized leads', '#6B7280'),
('High Priority', 'C-level and executive contacts', '#DC2626'),
('Tech Companies', 'Technology sector leads', '#2563EB'),
('Healthcare', 'Healthcare industry contacts', '#059669'),
('Finance', 'Financial services leads', '#7C3AED'),
('Startups', 'Early-stage companies', '#EA580C'),
('Enterprise', 'Large enterprise contacts', '#0891B2');

-- Create updated_at trigger for categories
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for lead_lists  
CREATE TRIGGER update_lead_lists_updated_at
  BEFORE UPDATE ON public.lead_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_lists ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for categories (public read, admin write for now)
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anyone can manage categories" ON public.categories FOR ALL USING (true);

-- Create RLS policies for import_batches 
CREATE POLICY "Anyone can view import batches" ON public.import_batches FOR SELECT USING (true);
CREATE POLICY "Anyone can manage import batches" ON public.import_batches FOR ALL USING (true);

-- Create RLS policies for lead_lists
CREATE POLICY "Anyone can view lead lists" ON public.lead_lists FOR SELECT USING (true);
CREATE POLICY "Anyone can manage lead lists" ON public.lead_lists FOR ALL USING (true);
