import { Router } from "express";
import archiver from "archiver";
import { generateLabelStl } from "../services/labelGenerator.js";
import type { GenerateRequest } from "../types.js";

const router = Router();

function normalizeIconSvg(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (
    value &&
    typeof value === "object" &&
    "value" in value &&
    typeof (value as { value?: unknown }).value === "string"
  ) {
    return (value as { value: string }).value;
  }

  return "";
}

function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "label";
}

router.post("/generate-batch", async (req, res) => {
  const body = req.body as GenerateRequest;
  const labels = (body?.labels ?? []).map((label) => ({
    ...label,
    iconSvg: normalizeIconSvg((label as { iconSvg?: unknown }).iconSvg)
  }));

  if (labels.length === 0) {
    res.status(400).json({ error: "At least one label is required" });
    return;
  }

  if (labels.length === 1) {
    try {
      const fileName = `${toSlug(labels[0].title)}.stl`;
      const stlBuffer = generateLabelStl(labels[0]);
      res.setHeader("Content-Type", "model/stl");
      res.setHeader("Content-Disposition", `attachment; filename=\"${fileName}\"`);
      res.send(stlBuffer);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Generation failed";
      res.status(400).json({ error: message });
    }
    return;
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", "attachment; filename=\"labels-batch.zip\"");

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.on("error", (error: Error) => {
    res.status(500).json({ error: error.message });
  });

  archive.pipe(res);

  try {
    for (const label of labels) {
      const buffer = generateLabelStl(label);
      const fileName = `${toSlug(label.title)}.stl`;
      archive.append(buffer, { name: fileName });
    }

    await archive.finalize();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Batch generation failed";
    res.status(400).json({ error: message });
  }
});

export default router;
