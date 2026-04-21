export const STATUS_STEPS = [
  "Order Placed",
  "Processing",
  "Dispatched",
  "In Transit",
  "Out for Delivery",
  "Delivered",
] as const;

export type OrderStatus = (typeof STATUS_STEPS)[number];

export interface HistoryEntry {
  status: OrderStatus;
  at: string; // ISO
  note?: string;
}

export interface Order {
  id: string; // tracking id
  customerName: string;
  address: string;
  contact: string;
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery: string;
  currentLocation: string;
  history: HistoryEntry[];
}

const KEY = "trackpulse:orders:v1";

function genId() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  return `TP${date}${rand}`;
}

function seed(): Order[] {
  const now = Date.now();
  const mk = (i: number, status: OrderStatus, name: string, addr: string): Order => {
    const created = new Date(now - i * 86400000).toISOString();
    const eta = new Date(now + (3 - i) * 86400000).toISOString();
    const idx = STATUS_STEPS.indexOf(status);
    const history: HistoryEntry[] = STATUS_STEPS.slice(0, idx + 1).map((s, k) => ({
      status: s,
      at: new Date(now - (i + (idx - k)) * 43200000).toISOString(),
    }));
    return {
      id: genId(),
      customerName: name,
      address: addr,
      contact: "+1 555-0" + (100 + i),
      status,
      createdAt: created,
      estimatedDelivery: eta,
      currentLocation:
        status === "Delivered" ? addr.split(",")[0] : ["Warehouse Hub", "Sorting Center", "Regional Depot", "Local Facility"][i % 4],
      history,
    };
  };
  return [
    mk(0, "Out for Delivery", "Ava Chen", "221B Baker Street, London"),
    mk(1, "In Transit", "Marcus Reed", "55 Pine Ave, Brooklyn, NY"),
    mk(2, "Processing", "Lina Park", "9 Sakura Rd, Kyoto"),
    mk(3, "Delivered", "Diego Ruiz", "12 Calle Mayor, Madrid"),
  ];
}

export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    const s = seed();
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  }
  try {
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

function save(orders: Order[]) {
  localStorage.setItem(KEY, JSON.stringify(orders));
  window.dispatchEvent(new CustomEvent("orders:changed"));
}

export function getOrder(id: string): Order | undefined {
  return getOrders().find((o) => o.id.toLowerCase() === id.toLowerCase().trim());
}

export function createOrder(input: {
  customerName: string;
  address: string;
  contact: string;
  estimatedDelivery?: string;
}): Order {
  const orders = getOrders();
  const order: Order = {
    id: genId(),
    customerName: input.customerName,
    address: input.address,
    contact: input.contact,
    status: "Order Placed",
    createdAt: new Date().toISOString(),
    estimatedDelivery:
      input.estimatedDelivery || new Date(Date.now() + 3 * 86400000).toISOString(),
    currentLocation: "Warehouse Hub",
    history: [{ status: "Order Placed", at: new Date().toISOString() }],
  };
  save([order, ...orders]);
  return order;
}

export function updateOrder(id: string, patch: Partial<Order>): Order | undefined {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx < 0) return;
  orders[idx] = { ...orders[idx], ...patch };
  save(orders);
  return orders[idx];
}

export function advanceStatus(id: string, newStatus: OrderStatus, location?: string) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx < 0) return;
  const o = orders[idx];
  if (o.status === newStatus) return o;
  o.status = newStatus;
  if (location) o.currentLocation = location;
  o.history = [...o.history, { status: newStatus, at: new Date().toISOString() }];
  orders[idx] = o;
  save(orders);
  return o;
}

export function deleteOrder(id: string) {
  save(getOrders().filter((o) => o.id !== id));
}

export function useOrdersChange(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("orders:changed", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("orders:changed", handler);
    window.removeEventListener("storage", handler);
  };
}
