import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const app = express();
const PORT = Number(process.env.API_PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || "change-me";

app.use(cors());
app.use(express.json());

const historySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    at: { type: String, required: true },
    note: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true },
    address: { type: String, required: true },
    contact: { type: String, default: "" },
    status: { type: String, required: true },
    createdAt: { type: String, required: true },
    estimatedDelivery: { type: String, required: true },
    currentLocation: { type: String, required: true },
    history: { type: [historySchema], default: [] },
  },
  { versionKey: false }
);

const Order = mongoose.model("Order", orderSchema);

const STATUS_STEPS = [
  "Order Placed",
  "Processing",
  "Dispatched",
  "In Transit",
  "Out for Delivery",
  "Delivered",
];

function genId() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  return `TP${date}${rand}`;
}

function seedOrders() {
  const now = Date.now();
  const mk = (i, status, name, addr) => {
    const created = new Date(now - i * 86400000).toISOString();
    const eta = new Date(now + (3 - i) * 86400000).toISOString();
    const idx = STATUS_STEPS.indexOf(status);
    const history = STATUS_STEPS.slice(0, idx + 1).map((s, k) => ({
      status: s,
      at: new Date(now - (i + (idx - k)) * 43200000).toISOString(),
    }));
    return {
      id: genId(),
      customerName: name,
      address: addr,
      contact: `+1 555-0${100 + i}`,
      status,
      createdAt: created,
      estimatedDelivery: eta,
      currentLocation:
        status === "Delivered"
          ? addr.split(",")[0]
          : ["Warehouse Hub", "Sorting Center", "Regional Depot", "Local Facility"][i % 4],
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

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ message: "Missing auth token" });
  try {
    jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid auth token" });
  }
}

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;

  if (!adminUser || !adminPass) {
    return res.status(500).json({ message: "Server admin credentials are not configured" });
  }

  if (username !== adminUser || password !== adminPass) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "8h" });
  return res.json({ token });
});

app.get("/api/orders", async (_req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).lean();
  res.json(orders);
});

app.get("/api/orders/:id", async (req, res) => {
  const order = await Order.findOne({ id: req.params.id }).lean();
  if (!order) return res.status(404).json({ message: "Not found" });
  return res.json(order);
});

app.post("/api/orders", authRequired, async (req, res) => {
  const payload = req.body || {};
  const nowIso = new Date().toISOString();
  const order = await Order.create({
    id: genId(),
    customerName: payload.customerName,
    address: payload.address,
    contact: payload.contact || "",
    status: "Order Placed",
    createdAt: nowIso,
    estimatedDelivery: payload.estimatedDelivery || new Date(Date.now() + 3 * 86400000).toISOString(),
    currentLocation: "Warehouse Hub",
    history: [{ status: "Order Placed", at: nowIso }],
  });
  res.status(201).json(order);
});

app.patch("/api/orders/:id", authRequired, async (req, res) => {
  const { id } = req.params;
  const patch = req.body || {};
  delete patch._id;
  const updated = await Order.findOneAndUpdate({ id }, patch, { new: true }).lean();
  if (!updated) return res.status(404).json({ message: "Not found" });
  return res.json(updated);
});

app.patch("/api/orders/:id/status", authRequired, async (req, res) => {
  const { id } = req.params;
  const { newStatus, location } = req.body || {};
  const order = await Order.findOne({ id });
  if (!order) return res.status(404).json({ message: "Not found" });
  if (order.status !== newStatus) {
    order.status = newStatus;
    if (location) order.currentLocation = location;
    order.history = [...order.history, { status: newStatus, at: new Date().toISOString() }];
    await order.save();
  }
  return res.json(order);
});

app.delete("/api/orders/:id", authRequired, async (req, res) => {
  await Order.deleteOne({ id: req.params.id });
  res.json({ ok: true });
});

async function bootstrap() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required in .env");
  }
  await mongoose.connect(mongoUri);

  const count = await Order.countDocuments();
  if (count === 0) {
    await Order.insertMany(seedOrders());
  }

  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
