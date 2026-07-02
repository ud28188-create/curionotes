import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Settings, Crown, User as UserIcon, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

// Plan is stubbed to "Free" for now — replace with a real column when billing exists.
const PLAN_LABEL = "Free";
const PLAN_STYLES: Record<string, string> = {
  Free: "bg-secondary text-foreground/70",
  Pro: "bg-gradient-to-r from-emerald-500 to-blue-500 text-white",
  Business: "bg-gradient-to-r from-blue-600 to-purple-600 text-white",
};

function initials(name: string | null | undefined, email: string | null | undefined) {
  const src = (name || email || "?").trim();
  const parts = src.split(/\s+|@/).filter(Boolean);
  return (parts[0]?.[0] ?? "?").toUpperCase() + (parts[1]?.[0]?.toUpperCase() ?? "");
}

export function ProfileMenu() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("id,email,display_name,avatar_url")
        .eq("id", u.user.id)
        .maybeSingle();
      if (mounted) {
        setProfile(
          data ?? {
            id: u.user.id,
            email: u.user.email ?? null,
            display_name: (u.user.user_metadata?.display_name as string) ?? null,
            avatar_url: (u.user.user_metadata?.avatar_url as string) ?? null,
          },
        );
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const name = profile?.display_name || profile?.email?.split("@")[0] || "You";
  const email = profile?.email ?? "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-1.5 py-1 pr-2.5 transition hover:border-border hover:shadow-sm">
          <span className="inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 text-[11px] font-semibold text-white">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(profile?.display_name, profile?.email)
            )}
          </span>
          <span className="hidden min-w-0 max-w-[120px] truncate text-[13px] font-medium sm:inline">{name}</span>
          <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:inline" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
        <DropdownMenuLabel className="px-2 pt-1.5 pb-1">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 text-sm font-semibold text-white">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                initials(profile?.display_name, profile?.email)
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13.5px] font-semibold">{name}</div>
              <div className="truncate text-[11.5px] font-normal text-muted-foreground">{email}</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl border border-border/60 bg-secondary/40 px-2.5 py-2">
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground">
              <Crown className="h-3.5 w-3.5" /> Current plan
            </span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${PLAN_STYLES[PLAN_LABEL]}`}>
              {PLAN_LABEL}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem asChild>
          <Link to="/settings" className="cursor-pointer gap-2 rounded-lg">
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/#pricing" className="cursor-pointer gap-2 rounded-lg">
            <Crown className="h-4 w-4" /> Upgrade plan
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/notebooks" className="cursor-pointer gap-2 rounded-lg">
            <UserIcon className="h-4 w-4" /> My notebooks
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem onSelect={signOut} className="cursor-pointer gap-2 rounded-lg text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
