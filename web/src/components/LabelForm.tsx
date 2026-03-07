import { useState } from "react";
import type { LabelInput } from "../types/label";
import hexSvg from "../assets/hex.svg?raw";
import insertSvg from "../assets/insert.svg?raw";
import locknutSvg from "../assets/locknut.svg?raw";
import nutSvg from "../assets/nut.svg?raw";
import nylockSvg from "../assets/nylock.svg?raw";
import phSvg from "../assets/PH.svg?raw";
import slotSvg from "../assets/slot.svg?raw";
import txSvg from "../assets/tx.svg?raw";
import washerSvg from "../assets/washer_sml.svg?raw";

const CLIPARTS = [
  { id: "hex",           label: "Hex",     svg: hexSvg },
  { id: "insert",        label: "Insert",  svg: insertSvg },
  { id: "locknut",       label: "Locknut", svg: locknutSvg },
  { id: "nut",           label: "Nut",     svg: nutSvg },
  { id: "nylock",        label: "Nylock",  svg: nylockSvg },
  { id: "ph",            label: "Phillips",svg: phSvg },
  { id: "slot",          label: "Slot",    svg: slotSvg },
  { id: "tx",            label: "Torx",    svg: txSvg },
  { id: "washer",        label: "Washer",  svg: washerSvg },
];

interface LabelFormProps {
  onGenerate: (input: LabelInput) => Promise<void>;
}

export function LabelForm({ onGenerate }: LabelFormProps) {
  const [line1, setLine1] = useState("M3x10");
  const [line2, setLine2] = useState("Socket");
  const [selectedClipart, setSelectedClipart] = useState<string | null>("tx");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);
    try {
      const iconSvg = CLIPARTS.find((c) => c.id === selectedClipart)?.svg ?? "";
      const title = [line1, line2].filter(Boolean).join(" ");
      await onGenerate({ title, line1, line2, iconSvg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h2>Custom label</h2>
      <label>
        Text line 1
        <input value={line1} onChange={(e) => setLine1(e.target.value)} required />
      </label>
      <label>
        Text line 2
        <input value={line2} onChange={(e) => setLine2(e.target.value)} />
      </label>
      <div className="symbol-section">
        <span>Symbol</span>
        <div className="symbol-picker">
          {CLIPARTS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`symbol-item${selectedClipart === c.id ? " selected" : ""}`}
              onClick={() => setSelectedClipart(selectedClipart === c.id ? null : c.id)}
              title={c.label}
            >
              <img
                src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(c.svg)}`}
                alt={c.label}
              />
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Generating..." : "Download STL"}
      </button>
    </form>
  );
}
