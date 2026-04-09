import express from "express";
import cors from "cors";
import prayersRouter from "./routes/prayers.js";

const PORT = Number(process.env.PORT ?? 3001);

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api/prayers", prayersRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

const server = app.listen(PORT, () => {
  console.log(`[server] running on http://localhost:${PORT}`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
