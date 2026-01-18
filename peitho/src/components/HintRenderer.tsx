import { useMemo } from "react";

export type HintLevel = 1 | 2 | 3 | 4;

interface HintRendererProps {
  content: string;
  keywords: string[];
  level: HintLevel;
  sectionLabel: string;
}

export function HintRenderer({ content, keywords, level, sectionLabel }: HintRendererProps) {
  const renderedContent = useMemo(() => {
    switch (level) {
      case 1:
        // Full script - show everything
        return <span className="hint-full">{content}</span>;

      case 2:
        // Keywords visible - blur/mask non-keywords
        return renderWithKeywords(content, keywords, "blur");

      case 3:
        // Structure only - keywords + ellipsis
        return renderWithKeywords(content, keywords, "structure");

      case 4:
        // Minimal - section label only
        return <span className="hint-minimal">• {sectionLabel}</span>;

      default:
        return <span>{content}</span>;
    }
  }, [content, keywords, level, sectionLabel]);

  return <div className={`hint-renderer hint-level-${level}`}>{renderedContent}</div>;
}

function renderWithKeywords(
  content: string,
  keywords: string[],
  mode: "blur" | "structure"
): React.ReactNode {
  if (keywords.length === 0) {
    return mode === "blur" ? (
      <span className="hint-blurred">{content}</span>
    ) : (
      <span className="hint-structure">...</span>
    );
  }

  // Create a regex to match any keyword (case-insensitive)
  const keywordPattern = keywords
    .map((k) => escapeRegex(k))
    .join("|");
  const regex = new RegExp(`(${keywordPattern})`, "gi");

  // Split content by keywords
  const parts = content.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        const isKeyword = keywords.some(
          (k) => k.toLowerCase() === part.toLowerCase()
        );

        if (isKeyword) {
          return (
            <span key={index} className="hint-keyword">
              {part}
            </span>
          );
        }

        if (mode === "blur") {
          // Show blurred/masked text
          return (
            <span key={index} className="hint-blurred">
              {part}
            </span>
          );
        }

        // Structure mode - show ellipsis for non-keyword parts
        const trimmed = part.trim();
        if (trimmed.length > 0) {
          return (
            <span key={index} className="hint-ellipsis">
              {" ... "}
            </span>
          );
        }
        return null;
      })}
    </>
  );
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
