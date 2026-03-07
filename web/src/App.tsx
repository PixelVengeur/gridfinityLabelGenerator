import { useEffect, useState } from "react";
import { LabelForm } from "./components/LabelForm";
import { LabelPreview } from "./components/LabelPreview";
import { PredefinedSelector } from "./components/PredefinedSelector";
import { downloadBatch, downloadSingle, fetchPredefined } from "./services/api";
import { saveBlob } from "./services/download";
import type { LabelInput, PredefinedLabel } from "./types/label";

function slugifyTitle(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "label";
}

export function App() {
  const [labels, setLabels] = useState<PredefinedLabel[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewLabel, setPreviewLabel] = useState<LabelInput | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLabels(await fetchPredefined());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load predefined labels");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const handleCustom = async (input: LabelInput) => {
    setError("");
    const blob = await downloadSingle(input);
    saveBlob(blob, `${slugifyTitle(input.title)}.stl`);
  };

  const handleBatch = async (selected: PredefinedLabel[]) => {
    setError("");
    const result = await downloadBatch(selected);
    if (result.isZip) {
      saveBlob(result.blob, "labels-batch.zip");
      return;
    }

    const single = selected[0];
    saveBlob(result.blob, `${slugifyTitle(single.title)}.stl`);
  };

  return (
    <main className="app">
      <a href="https://cnckitchen.store/" target="_blank" rel="noopener noreferrer">
        <img src={`${import.meta.env.BASE_URL}header.jpg`} alt="CNC Kitchen" className="header-banner" />
      </a>
      <header>
        <h1>Gridfinity Label Generator</h1>
      </header>

      {loading ? <p>Loading predefined labels...</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <section className="panel preview-panel">
        <LabelPreview label={previewLabel} />
      </section>

      <div className="layout">
        <LabelForm onGenerate={handleCustom} onPreviewChange={setPreviewLabel} />
        <PredefinedSelector labels={labels} onGenerate={handleBatch} onPreviewChange={setPreviewLabel} />
      </div>
    </main>
  );
}
