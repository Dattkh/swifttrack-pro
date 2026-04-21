import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, ArrowRight, Package2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  advanceStatus, createOrder, deleteOrder, getOrders, STATUS_STEPS, updateOrder,
  useOrdersChange, type Order, type OrderStatus,
} from "@/lib/orders";
import { isLoggedIn } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const nav = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState<Order | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      nav({ to: "/login" });
      return;
    }
    setAuthChecked(true);
    const refresh = async () => setOrders(await getOrders());
    void refresh();
    return useOrdersChange(() => {
      void refresh();
    });
  }, [nav]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const okStatus = statusFilter === "all" || o.status === statusFilter;
      const ql = q.trim().toLowerCase();
      const okQ =
        !ql ||
        o.id.toLowerCase().includes(ql) ||
        o.customerName.toLowerCase().includes(ql) ||
        o.address.toLowerCase().includes(ql);
      return okStatus && okQ;
    });
  }, [orders, q, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      transit: orders.filter((o) => ["Dispatched", "In Transit", "Out for Delivery"].includes(o.status)).length,
      delivered: orders.filter((o) => o.status === "Delivered").length,
      pending: orders.filter((o) => ["Order Placed", "Processing"].includes(o.status)).length,
    };
  }, [orders]);

  if (!authChecked) return null;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Operations dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage all shipments in real time.</p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
          >
            <Plus className="mr-1 h-4 w-4" /> New order
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total orders" value={stats.total} />
          <Stat label="Pending" value={stats.pending} />
          <Stat label="In transit" value={stats.transit} />
          <Stat label="Delivered" value={stats.delivered} />
        </div>

        <Card className="mt-6 border-border/60 bg-gradient-card p-4 shadow-elegant">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ID, name, or address"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_STEPS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Tracking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                      <Package2 className="mx-auto mb-2 h-6 w-6 opacity-50" />
                      No orders match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((o) => (
                    <TableRow key={o.id} className="transition-smooth hover:bg-muted/30">
                      <TableCell className="font-mono text-xs">{o.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{o.customerName}</div>
                        <div className="text-xs text-muted-foreground">{o.contact}</div>
                      </TableCell>
                      <TableCell className="hidden max-w-[260px] truncate text-sm text-muted-foreground md:table-cell">
                        {o.address}
                      </TableCell>
                      <TableCell>
                        <StatusSelect order={o} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setEditing(o)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleting(o)} aria-label="Delete">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>

      <OrderDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create new order"
        onSubmit={async (d) => {
          await createOrder(d);
          setCreateOpen(false);
        }}
      />

      <OrderDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title="Edit order"
        initial={editing ?? undefined}
        onSubmit={async (d) => {
          if (editing) {
            await updateOrder(editing.id, d);
            setEditing(null);
          }
        }}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove order <span className="font-mono">{deleting?.id}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleting) {
                  void deleteOrder(deleting.id);
                }
                setDeleting(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border-border/60 bg-gradient-card p-4 shadow-elegant">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </Card>
  );
}

function StatusSelect({ order }: { order: Order }) {
  return (
    <Select
      value={order.status}
      onValueChange={(v) => {
        void advanceStatus(order.id, v as OrderStatus);
      }}
    >
      <SelectTrigger className="h-8 w-44 border-primary/30 bg-primary/10 text-xs font-medium text-primary">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_STEPS.map((s) => (
          <SelectItem key={s} value={s} className="text-sm">
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface FormData {
  customerName: string;
  address: string;
  contact: string;
  estimatedDelivery: string;
}

function OrderDialog({
  open, onOpenChange, title, initial, onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  initial?: Order;
  onSubmit: (d: FormData) => void | Promise<void>;
}) {
  const [form, setForm] = useState<FormData>({
    customerName: "",
    address: "",
    contact: "",
    estimatedDelivery: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        customerName: initial?.customerName ?? "",
        address: initial?.address ?? "",
        contact: initial?.contact ?? "",
        estimatedDelivery: initial?.estimatedDelivery
          ? initial.estimatedDelivery.slice(0, 10)
          : new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      });
    }
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.customerName.trim() || !form.address.trim()) return;
            void onSubmit({
              ...form,
              estimatedDelivery: new Date(form.estimatedDelivery).toISOString(),
            });
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="cn">Customer name</Label>
            <Input id="cn" value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="ad">Address</Label>
            <Input id="ad" value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ct">Contact</Label>
              <Input id="ct" value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="ed">Est. delivery</Label>
              <Input id="ed" type="date" value={form.estimatedDelivery}
                onChange={(e) => setForm({ ...form, estimatedDelivery: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
              {initial ? "Save changes" : "Create order"} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
