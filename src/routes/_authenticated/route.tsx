import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // getSession reads the persisted session locally first (no network round trip),
    // which keeps authenticated navigation instant.
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) return { user: data.session.user };

    const { data: u, error } = await supabase.auth.getUser();
    if (error || !u.user) throw redirect({ to: "/auth" });
    return { user: u.user };
  },
  component: () => <Outlet />,
});
