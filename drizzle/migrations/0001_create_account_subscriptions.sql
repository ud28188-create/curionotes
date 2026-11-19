CREATE TABLE public.account_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
  status text NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'created', 'authenticated', 'active', 'pending', 'halted', 'cancelled', 'completed', 'expired')),
  razorpay_subscription_id text UNIQUE,
  razorpay_plan_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.account_subscriptions TO authenticated;
GRANT ALL ON public.account_subscriptions TO service_role;
ALTER TABLE public.account_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own subscription" ON public.account_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER account_subscriptions_updated BEFORE UPDATE ON public.account_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX account_subscriptions_user_idx ON public.account_subscriptions(user_id);
