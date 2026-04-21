import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Package, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { isLoggedIn, logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function Header() {
  const loc = useLocation();
  const nav = useNavigate();
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    setAuthed(isLoggedIn());
  }, [loc.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow transition-smooth group-hover:scale-105">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Track<span className="text-gradient">Pulse</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-smooth hover:text-foreground"
            activeProps={{ className: "rounded-md px-3 py-2 text-sm text-foreground font-medium" }}
            activeOptions={{ exact: true }}
          >
            Track
          </Link>
          {authed ? (
            <>
              <Link
                to="/admin"
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-smooth hover:text-foreground"
                activeProps={{ className: "rounded-md px-3 py-2 text-sm text-foreground font-medium" }}
              >
                Dashboard
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  setAuthed(false);
                  nav({ to: "/" });
                }}
              >
                <LogOut className="mr-1 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <Link
              to="/login"
              className="ml-1 rounded-md bg-gradient-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-glow transition-smooth hover:opacity-90"
            >
              Admin Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
