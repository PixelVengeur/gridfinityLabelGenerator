import express from "express";
import cors from "cors";
import generateRoute from "./routes/generate.js";
import batchRoute from "./routes/batch.js";
import predefinedRoute from "./routes/predefined.js";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use("/api", predefinedRoute);
app.use("/api", generateRoute);
app.use("/api", batchRoute);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Gridfinity label server running on http://localhost:${port}`);
});
