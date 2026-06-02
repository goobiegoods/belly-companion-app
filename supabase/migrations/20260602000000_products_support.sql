-- ============================================================
-- Products table — enables live CMS in admin
-- ============================================================
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🌿',
  category TEXT NOT NULL CHECK (category IN ('kit','remedy','tea')),
  stripe_price_id TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  tag TEXT,
  brand TEXT,
  unit TEXT,
  use_case TEXT,
  contents TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active products"  ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products"       ON public.products FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed from shopData.ts
INSERT INTO public.products (id, name, description, price, emoji, category, tag, brand, unit, use_case, contents, sort_order) VALUES
-- Kits
('kit-1','First Trimester Relief Kit','A curated trio for the early weeks — nausea, fatigue & emotional waves, all addressed naturally.',34.99,'🌿','kit',NULL,NULL,NULL,'Nausea, fatigue, mood shifts',ARRAY['Nux Vomica 30c','Sepia 30c','Ginger Blend Tea'],10),
('kit-2','Second Trimester Glow Kit','Energy, round ligament relief, and radiant skin support for your golden trimester.',32.99,'✨','kit',NULL,NULL,NULL,'Energy, round ligament pain, skin',ARRAY['Arnica Montana 30c','Chamomilla 30c','Rose Hip Tea'],20),
('kit-3','Third Trimester Prep Kit','Birth preparation, back pain relief, and deep rest for the home stretch.',36.99,'🌙','kit',NULL,NULL,NULL,'Birth prep, back pain, rest',ARRAY['Caulophyllum 30c','Cimicifuga 30c','Raspberry Leaf Tea'],30),
('kit-4','Labor & Birth Support Kit','Everything you need for labour support, sustained energy, and immediate recovery.',38.99,'🌸','kit',NULL,NULL,NULL,'Labor support, energy, recovery',ARRAY['Arnica 200c','Kali Phos 6x','Lavender Tea'],40),
-- Remedies
('rem-1','Nux Vomica 30c','For nausea, digestive upset, and irritability — the go-to first trimester remedy.',9.99,'💊','remedy',NULL,'Boiron','80 pellets','Nausea, digestive upset, irritability','{}',50),
('rem-2','Sepia 30c','For fatigue, mood swings, and feelings of detachment — deeply restorative.',9.99,'💊','remedy',NULL,'Boiron','80 pellets','Fatigue, mood swings, low libido','{}',60),
('rem-3','Arnica Montana 30c','For muscle soreness, bruising, and physical trauma — essential at every stage.',9.99,'💊','remedy',NULL,'Boiron','80 pellets','Muscle soreness, bruising, trauma','{}',70),
('rem-4','Pulsatilla 30c','For emotional sensitivity, shifting symptoms, and optimal baby positioning.',9.99,'💊','remedy',NULL,'Boiron','80 pellets','Emotional sensitivity, sinus congestion, baby positioning','{}',80),
('rem-5','Chamomilla 30c','For unbearable irritability, pain sensitivity, and broken sleep.',9.99,'💊','remedy',NULL,'Boiron','80 pellets','Irritability, pain sensitivity, insomnia','{}',90),
('rem-6','Caulophyllum 30c','For uterine toning and birth preparation — third trimester only.',9.99,'💊','remedy','Third trimester +','Boiron','80 pellets','Birth preparation, uterine toning','{}',100),
('rem-7','Kali Phos 6x','For nervous exhaustion, mental fog, and anxiety — the brain tonic of homeopathy.',9.99,'💊','remedy',NULL,'Boiron','80 pellets','Nervous exhaustion, anxiety, mental fatigue','{}',110),
('rem-8','Ignatia 30c','For grief, emotional shock, and anticipatory fear — profoundly gentle.',9.99,'💊','remedy',NULL,'Boiron','80 pellets','Grief, emotional shock, anticipatory anxiety','{}',120),
-- Teas
('tea-1','Ginger & Lemon Pregnancy Tea','The classic first trimester companion — nausea relief, gentle digestion, lifted energy.',14.99,'🍵','tea','First trimester favorite',NULL,'20 sachets','Nausea relief, digestion, energy','{}',130),
('tea-2','Raspberry Leaf Tea','Uterine toning and birth preparation — begin at 32 weeks for best results.',12.99,'🍵','tea','Third trimester only',NULL,'20 sachets','Uterine toning, birth prep','{}',140),
('tea-3','Chamomile & Lavender Calm Tea','Deep calm for anxious evenings and sleepless nights — safe throughout pregnancy.',13.99,'🍵','tea',NULL,NULL,'20 sachets','Anxiety, insomnia, relaxation','{}',150),
('tea-4','Nettle & Oat Straw Nourish Tea','More bioavailable iron and magnesium than most prenatal vitamins — steep overnight.',13.99,'🍵','tea',NULL,NULL,'20 sachets','Iron support, mineral boost, energy','{}',160);

-- ============================================================
-- Support tickets table
-- ============================================================
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general','order','billing','technical','account','other')),
  admin_reply TEXT,
  replied_at TIMESTAMPTZ,
  replied_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create tickets"    ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own tickets"  ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own tickets" ON public.support_tickets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all tickets"   ON public.support_tickets FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
