
import { Link } from "@tanstack/react-router";
import { Github, Twitter } from "lucide-react";
import { ProfileMenu } from "@/components/ProfileMenu";
import { useSession } from "@/hooks/use-session";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-9 w-9">
        <img
          src="/curionotes-logo.png"
          alt="CurioNotes logo"
          className="h-full w-full object-contain"
        />
      </div>
      <span className="text-[20px] font-bold tracking-tight text-foreground">
        CurioNotes
      </span>
    </div>
  );
}

export function Navbar() {
  const { session, loading } = useSession();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-6">
        <Logo />

        <nav className="hidden items-center gap-9 md:flex">
          <Link
            to="/"
            className="text-[15px] font-semibold text-foreground"
          >
            Overview
          </Link>

        <a
        href="/#features"
        className="text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
        Features
        </a>

        <a
        href="/#pricing"
        className="text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
        Pricing
        </a>
        </nav>

        <div className="flex items-center gap-5">
          <a
            href="#"
            aria-label="GitHub"
            className="hidden text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            <Github className="h-5 w-5" />
          </a>

          <a
            href="#"
            aria-label="Twitter"
            className="hidden text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            <Twitter className="h-[18px] w-[18px]" />
          </a>

          {loading ? (
            <span className="h-10 w-[112px] animate-pulse rounded-full bg-secondary" />
          ) : session ? (
            <div className="flex items-center gap-3">
              <Link
                to="/notebooks"
                preload="intent"
                className="hidden h-10 items-center rounded-full bg-foreground px-5 text-[14px] font-semibold text-background transition-transform hover:scale-[1.02] sm:inline-flex"
              >
                My notebooks
              </Link>
              <ProfileMenu />
            </div>
          ) : (
            <Link
              to="/auth"
              preload="intent"
              className="inline-flex h-10 items-center rounded-full bg-foreground px-5 text-[14px] font-semibold text-background transition-transform hover:scale-[1.02]"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
