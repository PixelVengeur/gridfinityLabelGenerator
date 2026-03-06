import { useMemo, useState } from "react";
import type { PredefinedLabel } from "../types/label";

interface PredefinedSelectorProps {
  labels: PredefinedLabel[];
  onGenerate: (selected: PredefinedLabel[]) => Promise<void>;
}

export function PredefinedSelector({ labels, onGenerate }: PredefinedSelectorProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const selectedItems = useMemo(
    () => labels.filter((item) => selected[item.id ?? ""]),
    [labels, selected]
  );

  const toggle = (id: string) => {
    setSelected((current) => ({ ...current, [id]: !current[id] }));
  };

  const runGenerate = async () => {
    if (selectedItems.length === 0) {
      return;
    }

    setLoading(true);
    try {
      await onGenerate(selectedItems);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel">
      <h2>Predefined labels</h2>
      <div className="list">
        {labels.map((label) => (
          <label key={label.id} className="list-item">
            <input type="checkbox" checked={Boolean(selected[label.id ?? ""])} onChange={() => toggle(label.id ?? "")} />
            <span>{label.title}</span>
          </label>
        ))}
      </div>
      <button disabled={loading || selectedItems.length === 0} onClick={runGenerate}>
        {loading
          ? "Generating..."
          : selectedItems.length <= 1
            ? "Download STL"
            : "Download ZIP"}
      </button>
    </section>
  );
}
