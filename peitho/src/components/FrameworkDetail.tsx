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

interface FrameworkDetailProps {
  framework: Framework;
  onClose: () => void;
}

export function FrameworkDetail({ framework, onClose }: FrameworkDetailProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content framework-detail" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="close-btn">&times;</button>

        <div className="framework-detail-header">
          <h2>{framework.name}</h2>
          <div className="framework-meta">
            <span className={`badge badge-${framework.domain}`}>{framework.domain}</span>
            <span className="source">Source: {framework.source}</span>
          </div>
        </div>

        <p className="framework-description">{framework.description}</p>

        <div className="framework-section">
          <h3>Pattern / Structure</h3>
          <pre className="pattern-block">{framework.pattern}</pre>
        </div>

        <div className="framework-section">
          <h3>Examples</h3>
          {framework.examples.map((example, index) => (
            <div key={index} className="example-block">
              <pre>{example}</pre>
            </div>
          ))}
        </div>

        <div className="framework-tags">
          {framework.tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
