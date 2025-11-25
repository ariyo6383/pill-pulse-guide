-- Create enum for tablet categories
CREATE TYPE public.tablet_category AS ENUM ('painkiller', 'antibiotic', 'vitamin', 'antacid', 'antihistamine', 'other');

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create tablets table
CREATE TABLE public.tablets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  uses TEXT NOT NULL,
  dosage TEXT,
  side_effects TEXT,
  category tablet_category NOT NULL DEFAULT 'other',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tablets
ALTER TABLE public.tablets ENABLE ROW LEVEL SECURITY;

-- Public can read all tablets
CREATE POLICY "Anyone can view tablets"
ON public.tablets
FOR SELECT
TO public
USING (true);

-- Create user_roles table for admin management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Function to check if user has specific role (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Only admins can insert/update/delete tablets
CREATE POLICY "Only admins can insert tablets"
ON public.tablets
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update tablets"
ON public.tablets
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete tablets"
ON public.tablets
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Only admins can manage roles
CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on tablets
CREATE TRIGGER update_tablets_updated_at
BEFORE UPDATE ON public.tablets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample tablets for demo
INSERT INTO public.tablets (name, uses, dosage, side_effects, category) VALUES
('Paracetamol', 'Used to treat mild to moderate pain and fever. Effective for headaches, muscle aches, arthritis, backache, toothaches, and common cold symptoms.', '500-1000mg every 4-6 hours, max 4000mg per day', 'Rare side effects include rash, allergic reactions. Overdose can cause liver damage.', 'painkiller'),
('Ibuprofen', 'Anti-inflammatory drug used to reduce fever, pain, and inflammation. Treats headaches, dental pain, menstrual cramps, muscle aches, and arthritis.', '200-400mg every 4-6 hours, max 1200mg per day', 'Stomach upset, nausea, heartburn. Long-term use may affect kidneys.', 'painkiller'),
('Amoxicillin', 'Broad-spectrum antibiotic used to treat bacterial infections including ear infections, pneumonia, bronchitis, and urinary tract infections.', '250-500mg three times daily for 7-10 days', 'Nausea, vomiting, diarrhea, rash. Allergic reactions possible in penicillin-sensitive individuals.', 'antibiotic'),
('Vitamin C', 'Essential vitamin that supports immune system, helps with wound healing, and acts as an antioxidant. Prevents and treats vitamin C deficiency.', '500-1000mg daily', 'High doses may cause stomach upset, diarrhea, kidney stones in susceptible individuals.', 'vitamin'),
('Omeprazole', 'Proton pump inhibitor that reduces stomach acid production. Treats heartburn, acid reflux, GERD, and stomach ulcers.', '20mg once daily before meals', 'Headache, nausea, diarrhea, stomach pain. Long-term use may affect calcium absorption.', 'antacid'),
('Cetirizine', 'Antihistamine used to relieve allergy symptoms including sneezing, runny nose, itchy eyes, and hives. Non-drowsy formula.', '10mg once daily', 'Mild drowsiness, dry mouth, headache, fatigue in some individuals.', 'antihistamine');