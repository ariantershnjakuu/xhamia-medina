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

app.listen(PORT, () => {
  console.log(`[server] running on http://localhost:${PORT}`);
});
