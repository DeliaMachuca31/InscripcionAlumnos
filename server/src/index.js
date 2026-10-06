import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { router as authRoutes } from "./routes/auth.routes.js";
import { router as inscripcionRoutes } from "./routes/inscripcion.routes.js";
import { router as adminRoutes } from "./routes/admin.routes.js";
import { HttpError } from "./lib/errors.js";

const app = express();
const { PORT = 4000, NODE_ENV = "development" } = process.env;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
if (NODE_ENV !== "test") app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/inscripcion", inscripcionRoutes);
app.use("/api/admin", adminRoutes);

app.use((_req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

app.use((err, _req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

export default app;

if (process.argv[1] && process.argv[1].endsWith("index.js")) {
  app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
}