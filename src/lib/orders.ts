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
  at: string;
  note?: string;
}

export interface Order {
  id: string;
  customerName: string;
  address: string;
  contact: string;
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery: string;
  currentLocation: string;
  history: HistoryEntry[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function emitOrdersChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("orders:changed"));
}

export async function getOrders(): Promise<Order[]> {
  return request<Order[]>("/orders");
}

export async function getOrder(id: string): Promise<Order | undefined> {
  try {
    return await request<Order>(`/orders/${encodeURIComponent(id.trim())}`);
  } catch {
    return undefined;
  }
}

export async function createOrder(input: {
  customerName: string;
  address: string;
  contact: string;
  estimatedDelivery?: string;
}): Promise<Order> {
  const order = await request<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
  emitOrdersChanged();
  return order;
}

export async function updateOrder(id: string, patch: Partial<Order>): Promise<Order | undefined> {
  try {
    const updated = await request<Order>(`/orders/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
      });
    emitOrdersChanged();
    return updated;
  } catch {
    return undefined;
  }
}

export async function advanceStatus(id: string, newStatus: OrderStatus, location?: string) {
  const updated = await request<Order>(`/orders/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ newStatus, location }),
  });
  emitOrdersChanged();
  return updated;
}

export async function deleteOrder(id: string) {
  await request<{ ok: true }>(`/orders/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  emitOrdersChanged();
}

export function useOrdersChange(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("orders:changed", handler);
  return () => {
    window.removeEventListener("orders:changed", handler);
  };
}
