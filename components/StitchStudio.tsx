import React, { useState, useEffect, useRef } from 'react';
import type { StitchDeviceType, StitchModelId, StitchGenerateResult, StitchProject } from '../types';

interface HistoryEntry {
  prompt: string;
  result: StitchGenerateResult;
  timestamp: number;
}

export const StitchStudio = () => {
  const [prompt, setPrompt] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [deviceType, setDeviceType] = useState<StitchDeviceType>('DESKTOP');
  const [modelId, setModelId] = useState<StitchModelId>('GEMINI_3_FLASH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<StitchGenerateResult | null>(null);
  const [previewMode, setPreviewMode] = useState<'html' | 'image'>('html');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [projects, setProjects] = useState<StitchProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/stitch/projects');
      const data = await res.json();
      if (data.projects) {
        setProjects(data.projects);
        if (data.projects.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data.projects[0].id);
        }
      }
    } catch {
      // Projects will be empty, user can create one
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stitch/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newProjectTitle.trim() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSelectedProjectId(data.id);
      setNewProjectTitle('');
      setShowNewProject(false);
      await fetchProjects();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedProjectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stitch/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          prompt: prompt.trim(),
          deviceType,
          modelId,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCurrent(data);
      setHistory((prev) => [{ prompt: prompt.trim(), result: data, timestamp: Date.now() }, ...prev]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editPrompt.trim() || !current) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stitch/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: current.sessionId,
          prompt: editPrompt.trim(),
          deviceType,
          modelId,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCurrent(data);
      setHistory((prev) => [{ prompt: `Edit: ${editPrompt.trim()}`, result: data, timestamp: Date.now() }, ...prev]);
      setEditPrompt('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (entry: HistoryEntry) => {
    setCurrent(entry.result);
  };

  const deviceTypes: StitchDeviceType[] = ['MOBILE', 'DESKTOP', 'TABLET', 'AGNOSTIC'];
  const models: { id: StitchModelId; label: string }[] = [
    { id: 'GEMINI_3_FLASH', label: 'Flash' },
    { id: 'GEMINI_3_PRO', label: 'Pro' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-57px)]">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 lg:px-8 py-3 border-b border-border-hairline bg-off-white">
        <span className="material-symbols-outlined text-charcoal text-xl">design_services</span>
        <h1 className="font-mono text-xs font-bold uppercase tracking-widest text-charcoal">Stitch Studio</h1>

        <div className="flex-1" />

        {/* Device Type Selector */}
        <div className="hidden md:flex gap-1">
          {deviceTypes.map((dt) => (
            <button
              key={dt}
              onClick={() => setDeviceType(dt)}
              className={`px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-widest transition-all ${
                deviceType === dt
                  ? 'bg-charcoal text-white'
                  : 'text-charcoal-muted border border-transparent hover:border-border-hairline'
              }`}
            >
              {dt}
            </button>
          ))}
        </div>

        {/* Model Selector */}
        <div className="hidden md:flex gap-1 border-l border-border-hairline pl-4">
          {models.map((m) => (
            <button
              key={m.id}
              onClick={() => setModelId(m.id)}
              className={`px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-widest transition-all ${
                modelId === m.id
                  ? 'bg-charcoal text-white'
                  : 'text-charcoal-muted border border-transparent hover:border-border-hairline'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left Panel — Input */}
        <div className="w-full md:w-[400px] lg:w-[440px] flex flex-col border-r border-border-hairline bg-white shrink-0">
          {/* Project Selector */}
          <div className="px-4 py-3 border-b border-border-hairline">
            <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal-muted block mb-2">
              Project
            </label>
            <div className="flex gap-2">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="flex-1 bg-off-white border border-border-hairline px-3 py-1.5 font-mono text-xs text-charcoal focus:outline-none focus:border-charcoal"
              >
                {projects.length === 0 && <option value="">No projects — create one</option>}
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.data.title || p.id}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowNewProject(!showNewProject)}
                className="px-2 py-1 text-charcoal-muted hover:text-charcoal transition-colors"
                title="New project"
              >
                <span className="material-symbols-outlined text-lg">add</span>
              </button>
            </div>

            {showNewProject && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="Project name..."
                  className="flex-1 bg-off-white border border-border-hairline px-3 py-1.5 font-mono text-xs text-charcoal focus:outline-none focus:border-charcoal"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                />
                <button
                  onClick={handleCreateProject}
                  disabled={loading}
                  className="bg-charcoal text-white px-4 py-1.5 font-mono text-[9px] uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            )}
          </div>

          {/* Prompt Input */}
          <div className="flex-1 flex flex-col p-4 gap-3">
            <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal-muted">
              Prompt
            </label>
            <textarea
              ref={promptRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the UI you want to generate...&#10;&#10;e.g. A modern dashboard with sales charts, user activity feed, and notification panel"
              className="flex-1 min-h-[120px] bg-off-white border border-border-hairline p-4 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:border-charcoal text-charcoal"
              spellCheck={false}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />

            {/* Mobile device/model selectors */}
            <div className="flex md:hidden gap-1 flex-wrap">
              {deviceTypes.map((dt) => (
                <button
                  key={dt}
                  onClick={() => setDeviceType(dt)}
                  className={`px-2 py-1 text-[8px] font-mono font-bold uppercase tracking-widest ${
                    deviceType === dt ? 'bg-charcoal text-white' : 'text-charcoal-muted border border-border-hairline'
                  }`}
                >
                  {dt}
                </button>
              ))}
              <span className="w-px bg-border-hairline mx-1" />
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModelId(m.id)}
                  className={`px-2 py-1 text-[8px] font-mono font-bold uppercase tracking-widest ${
                    modelId === m.id ? 'bg-charcoal text-white' : 'text-charcoal-muted border border-border-hairline'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim() || !selectedProjectId}
              className="bg-charcoal text-white px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  Generating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  Generate
                </>
              )}
            </button>
            <span className="text-[9px] text-charcoal-muted font-mono text-center">Ctrl+Enter to generate</span>

            {/* Edit existing screen */}
            {current && (
              <div className="border-t border-border-hairline pt-3 mt-1">
                <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal-muted block mb-2">
                  Edit Current Screen
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="e.g. Make the header blue, add a sidebar..."
                    className="flex-1 bg-off-white border border-border-hairline px-3 py-2 font-mono text-xs text-charcoal focus:outline-none focus:border-charcoal"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleEdit();
                      }
                    }}
                  />
                  <button
                    onClick={handleEdit}
                    disabled={loading || !editPrompt.trim()}
                    className="bg-charcoal text-white px-4 py-2 font-mono text-[9px] uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="border-t border-border-hairline max-h-[200px] overflow-y-auto">
              <div className="px-4 py-2 sticky top-0 bg-white border-b border-border-hairline">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal-muted">
                  History ({history.length})
                </span>
              </div>
              {history.map((entry, idx) => (
                <button
                  key={idx}
                  onClick={() => loadFromHistory(entry)}
                  className={`w-full text-left px-4 py-2 hover:bg-off-white transition-colors border-b border-border-hairline ${
                    current?.sessionId === entry.result.sessionId ? 'bg-off-white' : ''
                  }`}
                >
                  <p className="font-mono text-[10px] text-charcoal truncate">{entry.prompt}</p>
                  <p className="font-mono text-[8px] text-charcoal-muted mt-0.5">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel — Preview */}
        <div className="hidden md:flex flex-1 flex-col bg-off-white min-w-0">
          {/* Preview toolbar */}
          {current && (
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border-hairline bg-white">
              <button
                onClick={() => setPreviewMode('html')}
                className={`px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-widest ${
                  previewMode === 'html' ? 'bg-charcoal text-white' : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                HTML Preview
              </button>
              <button
                onClick={() => setPreviewMode('image')}
                className={`px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-widest ${
                  previewMode === 'image' ? 'bg-charcoal text-white' : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                Screenshot
              </button>
              <div className="flex-1" />
              <span className="text-[8px] font-mono text-charcoal-muted">
                Session: {current.sessionId.slice(0, 12)}...
              </span>
            </div>
          )}

          {/* Preview content */}
          <div className="flex-1 flex items-center justify-center p-4 min-h-0">
            {loading && !current ? (
              <div className="flex flex-col items-center gap-4 text-charcoal-muted">
                <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                <p className="font-mono text-xs uppercase tracking-widest">Generating design...</p>
              </div>
            ) : current ? (
              previewMode === 'html' ? (
                <iframe
                  srcDoc={current.html}
                  className="w-full h-full border border-border-hairline bg-white shadow-sm"
                  sandbox="allow-scripts"
                  title="Stitch Preview"
                />
              ) : (
                <div className="w-full h-full overflow-auto flex items-start justify-center">
                  <img
                    src={current.imageUrl}
                    alt="Generated UI screenshot"
                    className="max-w-full border border-border-hairline shadow-sm"
                  />
                </div>
              )
            ) : (
              <div className="flex flex-col items-center gap-4 text-charcoal-muted max-w-md text-center">
                <span className="material-symbols-outlined text-5xl opacity-30">design_services</span>
                <p className="font-serif text-lg text-charcoal">Start Designing</p>
                <p className="font-mono text-[10px] uppercase tracking-widest leading-relaxed">
                  Enter a prompt and click Generate to create a UI design using Google Stitch AI
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 border-t border-red-200">
              <p className="font-mono text-xs text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
