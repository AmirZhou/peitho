import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type Tab = "practice" | "frameworks" | "drills" | "log";

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onStartSession: () => void;
}

export function Sidebar({ activeTab, onTabChange, onStartSession }: SidebarProps) {
  const recentSessions = useQuery(api.sessions.recent, { limit: 100 });

  // Calculate streak (simplified - count consecutive days)
  const streak = recentSessions?.length ?? 0;

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        {/* Brand */}
        <div className="sidebar-brand">
          <h1 className="sidebar-logo">PEITHO</h1>
          <p className="sidebar-tagline">the art of persuasion</p>
        </div>

        {/* Primary CTA */}
        <button className="sidebar-cta" onClick={onStartSession}>
          Start Session
        </button>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${activeTab === "practice" ? "active" : ""}`}
            onClick={() => onTabChange("practice")}
          >
            <span className="nav-icon">⏱</span>
            <span>Practice</span>
          </button>
          <button
            className={`sidebar-nav-item ${activeTab === "frameworks" ? "active" : ""}`}
            onClick={() => onTabChange("frameworks")}
          >
            <span className="nav-icon">📚</span>
            <span>Frameworks</span>
          </button>
          <button
            className={`sidebar-nav-item ${activeTab === "drills" ? "active" : ""}`}
            onClick={() => onTabChange("drills")}
          >
            <span className="nav-icon">🎯</span>
            <span>Drills</span>
          </button>
          <button
            className={`sidebar-nav-item ${activeTab === "log" ? "active" : ""}`}
            onClick={() => onTabChange("log")}
          >
            <span className="nav-icon">📝</span>
            <span>Log</span>
          </button>
        </nav>

        {/* Spacer */}
        <div className="sidebar-spacer" />

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-streak">
            <span className="streak-icon">🔥</span>
            <span className="streak-count">{streak} day streak</span>
          </div>
          <button className="sidebar-settings">
            <span>⚙</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
