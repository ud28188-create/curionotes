CREATE OR REPLACE FUNCTION public.reserve_pro_checkout()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_row public.account_subscriptions%ROWTYPE;
  v_inserted boolean := false;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  INSERT INTO public.account_subscriptions (user_id, plan, status)
  VALUES (v_user_id, 'pro', 'created')
  ON CONFLICT (user_id) DO NOTHING
  RETURNING true INTO v_inserted;

  SELECT * INTO v_row
  FROM public.account_subscriptions
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unable to reserve checkout';
  END IF;

  IF v_inserted THEN
    RETURN jsonb_build_object('reserved', true, 'subscriptionId', NULL);
  END IF;

  IF v_row.razorpay_subscription_id IS NOT NULL THEN
    RETURN jsonb_build_object('reserved', false, 'subscriptionId', v_row.razorpay_subscription_id);
  END IF;

  IF v_row.status = 'created' AND v_row.updated_at > now() - interval '5 minutes' THEN
    RETURN jsonb_build_object('reserved', false, 'subscriptionId', NULL);
  END IF;

  UPDATE public.account_subscriptions
  SET plan = 'pro', status = 'created', razorpay_plan_id = NULL,
      current_period_start = NULL, current_period_end = NULL, updated_at = now()
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object('reserved', true, 'subscriptionId', NULL);
END;
$$;

CREATE OR REPLACE FUNCTION public.save_pro_subscription(p_subscription_id text, p_plan_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_rows integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_subscription_id IS NULL OR p_subscription_id !~ '^sub_[A-Za-z0-9]+$' OR p_plan_id <> 'plan_U1A1DfKZG7xGAm' THEN
    RAISE EXCEPTION 'Invalid subscription reference';
  END IF;

  UPDATE public.account_subscriptions
  SET plan = 'pro', status = 'created', razorpay_subscription_id = p_subscription_id,
      razorpay_plan_id = p_plan_id, current_period_start = NULL, current_period_end = NULL,
      updated_at = now()
  WHERE user_id = v_user_id AND status = 'created' AND razorpay_subscription_id IS NULL;

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows <> 1 THEN
    RAISE EXCEPTION 'Checkout reservation not found';
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_pro_checkout() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reserve_pro_checkout() TO authenticated;
REVOKE ALL ON FUNCTION public.save_pro_subscription(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_pro_subscription(text, text) TO authenticated;