import { useState } from "react";
import { HintRenderer, type HintLevel } from "./HintRenderer";
import type { ScriptSection } from "../lib/openai";

interface ScriptPanelProps {
  sections: ScriptSection[];
  onClose: () => void;
}

export function ScriptPanel({ sections, onClose }: ScriptPanelProps) {
  const [globalLevel, setGlobalLevel] = useState<HintLevel>(2);
  const [sectionLevels, setSectionLevels] = useState<Record<number, HintLevel>>({});

  const getSectionLevel = (index: number): HintLevel => {
    return sectionLevels[index] ?? globalLevel;
  };

  const setSectionLevel = (index: number, level: HintLevel) => {
    setSectionLevels((prev) => ({
      ...prev,
      [index]: level,
    }));
  };

  const resetToGlobal = () => {
    setSectionLevels({});
  };

  return (
    <aside className="script-panel">
      <div className="script-panel-header">
        <h3>Script Helper</h3>
        <button className="script-panel-close" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* Global hint level control */}
      <div className="hint-level-control">
        <span className="hint-level-label">Hint Level:</span>
        <div className="hint-level-buttons">
          {([1, 2, 3, 4] as HintLevel[]).map((level) => (
            <button
              key={level}
              className={`hint-level-btn ${globalLevel === level ? "active" : ""}`}
              onClick={() => {
                setGlobalLevel(level);
                resetToGlobal();
              }}
              title={getLevelTitle(level)}
            >
              {level}
            </button>
          ))}
        </div>
        <span className="hint-level-desc">{getLevelDescription(globalLevel)}</span>
      </div>

      {/* Sections */}
      <div className="script-sections">
        {sections.map((section, index) => {
          const currentLevel = getSectionLevel(index);
          const isOverridden = sectionLevels[index] !== undefined;

          return (
            <div key={index} className={`script-section ${isOverridden ? "overridden" : ""}`}>
              <div className="script-section-header">
                <span className="script-section-label">{section.label}</span>
                <div className="section-level-control">
                  <button
                    className="section-level-btn"
                    onClick={() => {
                      const nextLevel = ((currentLevel % 4) + 1) as HintLevel;
                      setSectionLevel(index, nextLevel);
                    }}
                    title="Click to change hint level for this section"
                  >
                    {currentLevel}
                  </button>
                </div>
              </div>
              <div className="script-section-content">
                <HintRenderer
                  content={section.content}
                  keywords={section.keywords}
                  level={currentLevel}
                  sectionLabel={section.label}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Level legend */}
      <div className="hint-legend">
        <div className="hint-legend-item">
          <span className="legend-num">1</span> Full script
        </div>
        <div className="hint-legend-item">
          <span className="legend-num">2</span> Keywords visible
        </div>
        <div className="hint-legend-item">
          <span className="legend-num">3</span> Structure only
        </div>
        <div className="hint-legend-item">
          <span className="legend-num">4</span> Minimal
        </div>
      </div>
    </aside>
  );
}

function getLevelTitle(level: HintLevel): string {
  switch (level) {
    case 1:
      return "Full Script (Easiest)";
    case 2:
      return "Keywords Visible";
    case 3:
      return "Structure Only";
    case 4:
      return "Minimal (Hardest)";
  }
}

function getLevelDescription(level: HintLevel): string {
  switch (level) {
    case 1:
      return "Full text visible";
    case 2:
      return "Keywords highlighted";
    case 3:
      return "Keywords + structure";
    case 4:
      return "Section labels only";
  }
}
