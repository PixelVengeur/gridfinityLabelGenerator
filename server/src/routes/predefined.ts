import { Router } from "express";
import { predefinedLabels, readIcon } from "../data/predefinedLabels.js";

const router = Router();

router.get("/predefined", (_req, res) => {
  res.json(
    predefinedLabels.map((label) => ({
      ...label,
      iconSvg: readIcon(label.icon)
    }))
  );
});

export default router;
