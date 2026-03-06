import { Router } from "express";
import { generateLabelStl } from "../services/labelGenerator.js";
import type { LabelInput } from "../types.js";

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

router.post("/generate", (req, res) => {
  const label = req.body as LabelInput;
  label.iconSvg = normalizeIconSvg((req.body as { iconSvg?: unknown }).iconSvg);

  if (!label || !label.title || !label.iconSvg) {
    res.status(400).json({ error: "title and iconSvg are required" });
    return;
  }

  try {
    const stlBuffer = generateLabelStl(label);
    const fileName = `${toSlug(label.title)}.stl`;

    res.setHeader("Content-Type", "model/stl");
    res.setHeader("Content-Disposition", `attachment; filename=\"${fileName}\"`);
    res.send(stlBuffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    res.status(400).json({ error: message });
  }
});

export default router;
