import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Package, Calendar, MapPin, Phone, AlertCircle, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { StatusTimeline } from "@/components/StatusTimeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getOrder, getOrders, useOrdersChange, type Order } from "@/lib/orders";

export const Route = createFileRoute("/")({
  component: Index,
});

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
function fmtDay(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "long" });
}

function Index() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [sample, setSample] = useState<string[]>([]);

  useEffect(() => {
    const refresh = () => {
      setSample(getOrders().slice(0, 3).map((o) => o.id));
      if (submitted) setOrder(getOrder(submitted));
    };
    refresh();
    return useOrdersChange(refresh);
  }, [submitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = query.trim();
    if (!id) return;
    const found = getOrder(id);
    setSubmitted(id);
    setOrder(found);
    setError(found ? null : "No shipment found for this tracking ID.");
  };

  const tryDemo = (id: string) => {
    setQuery(id);
    setSubmitted(id);
    setOrder(getOrder(id));
    setError(null);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <section className="text-center animate-fade-in-up">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-primary" /> Real-time delivery tracking
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">
            Where's my <span className="text-gradient">package?</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Enter your tracking ID to see live status, route history, and estimated arrival.
          </p>
        </section>

        <Card className="mx-auto mt-10 max-w-2xl border-border/60 bg-gradient-card p-6 shadow-elegant animate-fade-in-up">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. TP240518ABCDEF"
                className="h-12 pl-10 text-base"
                aria-label="Tracking ID"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 bg-gradient-primary text-primary-foreground shadow-glow transition-smooth hover:opacity-90">
              Track package
            </Button>
          </form>
          {sample.length > 0 && !submitted && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Try demo:</span>
              {sample.map((id) => (
                <button
                  key={id}
                  onClick={() => tryDemo(id)}
                  className="rounded-md border border-border bg-muted/40 px-2 py-1 font-mono text-[11px] text-foreground transition-smooth hover:border-primary hover:text-primary"
                >
                  {id}
                </button>
              ))}
            </div>
          )}
        </Card>

        {submitted && error && (
          <Card className="mx-auto mt-6 max-w-2xl border-destructive/40 bg-destructive/10 p-4 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-foreground">Tracking ID not found</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {order && (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr] animate-fade-in-up">
            <Card className="border-border/60 bg-gradient-card p-6 shadow-elegant">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Tracking ID</span>
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {order.status}
                </span>
              </div>
              <p className="mt-1 font-mono text-lg font-semibold">{order.id}</p>

              <div className="mt-6 space-y-4 text-sm">
                <Detail icon={Package} label="Recipient" value={order.customerName} />
                <Detail icon={MapPin} label="Destination" value={order.address} />
                <Detail icon={Phone} label="Contact" value={order.contact} />
                <Detail icon={Calendar} label="Order placed" value={fmtDate(order.createdAt)} />
                <Detail icon={Calendar} label="Estimated delivery" value={fmtDay(order.estimatedDelivery)} />
                <Detail icon={MapPin} label="Current location" value={order.currentLocation} />
              </div>
            </Card>

            <Card className="border-border/60 bg-gradient-card p-6 shadow-elegant">
              <h2 className="text-lg font-semibold">Delivery progress</h2>
              <p className="mb-6 text-sm text-muted-foreground">Step-by-step journey of your package</p>
              <StatusTimeline order={order} />
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-foreground">{value}</p>
      </div>
    </div>
  );
}
