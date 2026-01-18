import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { Session } from "./components/Session";
import { FrameworkDetail } from "./components/FrameworkDetail";
import { SessionLog } from "./components/SessionLog";
import { DrillPractice } from "./components/DrillPractice";
import { Sidebar } from "./components/Sidebar";
import "./App.css";

type Tab = "practice" | "frameworks" | "drills" | "log";

interface Framework {
  _id: string;
  name: string;
  description: string;
  pattern: string;
  examples: string[];
  tags: string[];
  source: string;
  domain: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("practice");
  const [showSession, setShowSession] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
  const [selectedDrillId, setSelectedDrillId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const frameworks = useQuery(api.frameworks.list);
  const drills = useQuery(api.drills.list);
  const recentSessions = useQuery(api.sessions.recent, { limit: 5 });
  const seedAll = useMutation(api.seed.seedAll);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await seedAll();
      setSeedResult(
        `Frameworks: ${result.frameworks.status} (${result.frameworks.count}), Drills: ${result.drills.status} (${result.drills.count})`
      );
    } catch (error) {
      setSeedResult(`Error: ${error}`);
    }
    setSeeding(false);
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="app">
      {/* Background grid animation */}
      <div className="app-background" />

      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onStartSession={() => setShowSession(true)}
      />

      {/* Mobile Header */}
      <header className="header">
        <h1>Peitho</h1>
        <p className="subtitle">The art of persuasion</p>
      </header>

      <main className="main">
        {/* Seed Section - only show if no frameworks */}
        {frameworks?.length === 0 && activeTab === "practice" && (
          <section className="card seed-card">
            <h2>Welcome to Peitho</h2>
            <p>Let's seed your framework library to get started.</p>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="btn btn-primary"
            >
              {seeding ? "Seeding..." : "Seed Frameworks & Drills"}
            </button>
            {seedResult && <p className="seed-result">{seedResult}</p>}
          </section>
        )}

        {/* Practice Tab */}
        {activeTab === "practice" && (
          <>
            <section className="card">
              <div className="card-header">
                <h2>Today's Practice</h2>
                <span className="date">{today}</span>
              </div>
              <button
                className="btn btn-large btn-primary"
                onClick={() => setShowSession(true)}
              >
                Start Session
              </button>
            </section>

            <div className="stats-grid">
              <div className="stat-card" onClick={() => setActiveTab("frameworks")}>
                <span className="stat-number">{frameworks?.length ?? "—"}</span>
                <span className="stat-label">Frameworks</span>
              </div>
              <div className="stat-card" onClick={() => setActiveTab("drills")}>
                <span className="stat-number">{drills?.length ?? "—"}</span>
                <span className="stat-label">Drills</span>
              </div>
              <div className="stat-card" onClick={() => setActiveTab("log")}>
                <span className="stat-number">{recentSessions?.length ?? 0}</span>
                <span className="stat-label">Sessions</span>
              </div>
            </div>
          </>
        )}

        {/* Frameworks Tab */}
        {activeTab === "frameworks" && frameworks && frameworks.length > 0 && (
          <section className="card">
            <h2>Frameworks</h2>
            <p className="section-hint">Tap a framework to see examples and patterns</p>
            <div className="framework-list">
              {frameworks.map((f) => (
                <div
                  key={f._id}
                  className="framework-item clickable"
                  onClick={() => setSelectedFramework(f as Framework)}
                >
                  <div className="framework-header">
                    <h3>{f.name}</h3>
                    <span className={`badge badge-${f.domain}`}>{f.domain}</span>
                  </div>
                  <p>{f.description}</p>
                  <div className="tags">
                    {f.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Drills Tab */}
        {activeTab === "drills" && drills && drills.length > 0 && (
          <section className="card">
            <h2>Drills</h2>
            <p className="section-hint">Tap a drill to start practicing</p>
            <div className="drill-list">
              {drills.map((d) => (
                <div
                  key={d._id}
                  className="drill-item clickable"
                  onClick={() => setSelectedDrillId(d._id)}
                >
                  <div className="drill-header">
                    <h3>{d.name}</h3>
                    <span className="duration">{d.durationSeconds}s</span>
                  </div>
                  <p className="drill-instructions">{d.instructions.split("\n")[0]}</p>
                  <span className={`badge badge-${d.type}`}>{d.type.replace("_", " ")}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Log Tab */}
        {activeTab === "log" && <SessionLog />}
      </main>

      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === "practice" ? "active" : ""}`}
          onClick={() => setActiveTab("practice")}
        >
          <span className="nav-icon">⏱</span>
          <span>Practice</span>
        </button>
        <button
          className={`nav-item ${activeTab === "frameworks" ? "active" : ""}`}
          onClick={() => setActiveTab("frameworks")}
        >
          <span className="nav-icon">📚</span>
          <span>Frameworks</span>
        </button>
        <button
          className={`nav-item ${activeTab === "drills" ? "active" : ""}`}
          onClick={() => setActiveTab("drills")}
        >
          <span className="nav-icon">🎯</span>
          <span>Drills</span>
        </button>
        <button
          className={`nav-item ${activeTab === "log" ? "active" : ""}`}
          onClick={() => setActiveTab("log")}
        >
          <span className="nav-icon">📝</span>
          <span>Log</span>
        </button>
      </nav>

      {/* Session Modal */}
      {showSession && <Session onClose={() => setShowSession(false)} />}

      {/* Framework Detail Modal */}
      {selectedFramework && (
        <FrameworkDetail
          framework={selectedFramework}
          onClose={() => setSelectedFramework(null)}
        />
      )}

      {/* Drill Practice Modal */}
      {selectedDrillId && (
        <DrillPractice
          drillId={selectedDrillId}
          onClose={() => setSelectedDrillId(null)}
        />
      )}
    </div>
  );
}

export default App;
