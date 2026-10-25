"use client";

import { useState, type ReactNode } from "react";

export interface TabDef {
  id: string;
  label: string;
  hint?: string;
  icon?: ReactNode;
  content: ReactNode;
}

export function Tabs({ tabs, initial }: { tabs: TabDef[]; initial?: string }) {
  const [active, setActive] = useState(initial ?? tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div>
      <div className="sticky top-[78px] z-30 -mx-1 mb-5 px-1 py-1.5">
        <div
          role="tablist"
          aria-label="Paper analysis sections"
          className="flex gap-1 overflow-x-auto rounded-full border border-black/[0.07] bg-white/45 backdrop-blur-md/92 p-1.5 shadow-[0_12px_30px_-24px_rgba(27,24,21,0.6)] backdrop-blur-xl"
        >
          {tabs.map((tab) => {
            const selected = tab.id === current?.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => setActive(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-medium transition-all sm:px-4 ${
                  selected ? "bg-[#1b1815] text-[#f8f4ec] shadow-sm" : "text-ink-soft hover:bg-[#efeade] hover:text-ink"
                }`}
              >
                <span className={selected ? "text-[#f0b27a]" : "text-muted/70"}>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.hint && (
                  <span
                    className={`hidden rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:inline ${
                      selected ? "bg-white/15 text-[#fbe6cd]" : "bg-black/[0.05] text-muted"
                    }`}
                  >
                    {tab.hint}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {current && (
        <div role="tabpanel" id={`panel-${current.id}`} aria-labelledby={`tab-${current.id}`} className="animate-fade-up">
          {current.content}
        </div>
      )}
    </div>
  );
}
