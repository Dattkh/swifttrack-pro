import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { login } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(u, p);
    if (ok) {
      nav({ to: "/admin" });
    } else {
      setErr("Invalid username or password.");
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

        </Card>
      </main>
    </div>
  );
}
