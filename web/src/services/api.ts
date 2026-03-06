import type { LabelInput, PredefinedLabel } from "../types/label";

const API_URL = "http://localhost:4000/api";

export async function fetchPredefined(): Promise<PredefinedLabel[]> {
  const response = await fetch(`${API_URL}/predefined`);
  if (!response.ok) {
    throw new Error("Failed to load predefined labels");
  }

  return response.json();
}

export async function downloadSingle(label: LabelInput): Promise<Blob> {
  const response = await fetch(`${API_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(label)
  });

  if (!response.ok) {
    const details = await response.json().catch(() => ({ error: "Generation failed" }));
    throw new Error(details.error ?? "Generation failed");
  }

  return response.blob();
}

export async function downloadBatch(labels: LabelInput[]): Promise<{ blob: Blob; isZip: boolean }> {
  const response = await fetch(`${API_URL}/generate-batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ labels })
  });

  if (!response.ok) {
    const details = await response.json().catch(() => ({ error: "Batch generation failed" }));
    throw new Error(details.error ?? "Batch generation failed");
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  return { blob: await response.blob(), isZip: contentType.includes("application/zip") };
}
