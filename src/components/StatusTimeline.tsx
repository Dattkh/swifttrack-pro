import { Check } from "lucide-react";
import { STATUS_STEPS, type Order, type OrderStatus } from "@/lib/orders";

function fmt(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StatusTimeline({ order }: { order: Order }) {
  const currentIdx = STATUS_STEPS.indexOf(order.status);
  const histMap = new Map<OrderStatus, string>(order.history.map((h) => [h.status, h.at]));

  return (
    <ol className="relative space-y-6">
      {STATUS_STEPS.map((step, i) => {
        const done = i < currentIdx;
        const current = i === currentIdx;
        const upcoming = i > currentIdx;
        return (
          <li
            key={step}
            className="relative flex gap-4 animate-fade-in-up"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            {i < STATUS_STEPS.length - 1 && (
              <span
                className={`absolute left-[18px] top-10 h-[calc(100%+8px)] w-px ${
                  done ? "bg-primary" : "bg-border"
                }`}
              />
            )}
            <div
              className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-smooth ${
                done
                  ? "border-primary bg-primary text-primary-foreground"
                  : current
                    ? "border-primary bg-primary/20 text-primary animate-pulse-ring"
                    : "border-border bg-muted text-muted-foreground"
              }`}
            >
              {done ? <Check className="h-4 w-4" /> : <span className="text-xs font-semibold">{i + 1}</span>}
            </div>
            <div className="flex-1 pb-1">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={`font-medium ${
                    upcoming ? "text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {step}
                </p>
                <span className="text-xs text-muted-foreground">{fmt(histMap.get(step))}</span>
              </div>
              {current && (
                <p className="mt-1 text-sm text-primary">In progress · {order.currentLocation}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
