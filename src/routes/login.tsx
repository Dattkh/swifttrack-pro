import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { login, ADMIN_USER, ADMIN_PASS } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(u, p)) {
      nav({ to: "/admin" });
    } else {
      setErr("Invalid credentials. Use the demo account below.");
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto flex max-w-md flex-col px-4 py-16">
        <Card className="border-border/60 bg-gradient-card p-8 shadow-elegant animate-fade-in-up">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Lock className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Admin sign in</h1>
              <p className="text-sm text-muted-foreground">Manage shipments and statuses</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="u">Username</Label>
              <Input id="u" value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" />
            </div>
            <div>
              <Label htmlFor="p">Password</Label>
              <Input id="p" type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" />
            </div>
            {err && <p className="text-sm text-destructive">{err}</p>}
            <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
              Sign in
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 text-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">Demo credentials</span>
            </div>
            <p className="mt-1 font-mono">{ADMIN_USER} / {ADMIN_PASS}</p>
          </div>
        </Card>
      </main>
    </div>
  );
}
