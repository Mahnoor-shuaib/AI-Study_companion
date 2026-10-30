"use client";

import { useState } from "react";
import AgentPanel from "./AgentPanel";

const TABS = [
  { key: "search", label: "Search", placeholder: "e.g. structures" },
  { key: "summary", label: "Summary", placeholder: "e.g. information security" },
  { key: "quiz", label: "Quiz", placeholder: "e.g. information security" },
  { key: "past_paper", label: "Past Papers", placeholder: "e.g. information security" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function Tabs() {
  const [active, setActive] = useState<TabKey>("search");
  const current = TABS.find((t) => t.key === active)!;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            style={{
              padding: "8px 16px",
              fontWeight: active === t.key ? "bold" : "normal",
              borderBottom: active === t.key ? "2px solid" : "2px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <AgentPanel key={active} mode={active} placeholder={current.placeholder} />
    </div>
  );
}