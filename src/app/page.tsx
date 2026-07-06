"use client";

import { useMemo, useState } from 'react';
import { useChat } from 'ai/react';

const starterPrompts = [
  'Explain photosynthesis like I am 15',
  'Start a quiz with multiple-choice options',
  'Make me flashcards on enzymes',
  'Create a 10-minute study plan for respiration',
];

type Mode = 'general' | 'explain' | 'quiz' | 'flashcards' | 'plan';
type WorkspaceView = 'study' | 'notes' | 'practice';
type Topic = 'general' | 'photosynthesis' | 'enzymes' | 'inheritance';

export default function HomePage() {
  const [mode, setMode] = useState<Mode>('general');
  const [quizStyle, setQuizStyle] = useState<'options' | 'freeform'>('options');
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>('study');
  const [selectedTopic, setSelectedTopic] = useState<Topic>('general');
  const { messages, input: chatInput, handleInputChange, handleSubmit, setInput, setMessages, isLoading, error } = useChat({
    api: '/api/chat',
    body: { mode, quizStyle },
  });

  const activeModeLabel = useMemo(() => {
    switch (mode) {
      case 'quiz':
        return 'Quiz';
      case 'flashcards':
        return 'Flashcards';
      case 'plan':
        return 'Study Plan';
      case 'explain':
        return 'Explain';
      default:
        return 'General';
    }
  }, [mode]);

  const activeTopicLabel = useMemo(() => {
    switch (selectedTopic) {
      case 'photosynthesis':
        return 'Photosynthesis';
      case 'enzymes':
        return 'Enzymes';
      case 'inheritance':
        return 'Inheritance';
      default:
        return 'General Biology';
    }
  }, [selectedTopic]);

  const latestUserMessage = useMemo(() => {
    const reversed = [...messages].reverse();
    return reversed.find((message) => message.role === 'user')?.content || '';
  }, [messages]);

  const contextPreview = useMemo(() => {
    const topicText = activeTopicLabel.toLowerCase();
    switch (workspaceView) {
      case 'notes':
        return {
          insight: `Revision notes mode for ${topicText}`,
          title: 'Revision note prompt',
          body: `Turn ${topicText} into a concise set of revision notes, quick facts, and memory hooks.`,
          action: `Summarise ${topicText} into revision notes`,
        };
      case 'practice':
        return {
          insight: `Practice mode for ${topicText}`,
          title: 'Practice prompt',
          body: `Create a short quiz, recall drill, or exam-style challenge for ${topicText}.`,
          action: `Give me a quiz on ${topicText}`,
        };
      default:
        return {
          insight: mode === 'quiz' ? 'Quiz mode is active' : `Study stream focused on ${topicText}`,
          title: 'Next best step',
          body: latestUserMessage
            ? `You recently asked about ${latestUserMessage}. Maya can explain it, quiz you on it, or turn it into notes.`
            : `Ask Maya to explain ${topicText}, test you with questions, or build flashcards.`,
          action: mode === 'quiz' ? `Answer the current quiz question for ${topicText}` : `Explain ${topicText} in simple steps`,
        };
    }
  }, [activeTopicLabel, latestUserMessage, mode, workspaceView]);

  const composerPlaceholder = useMemo(() => {
    if (mode === 'quiz') return 'Answer the current quiz question…';
    if (workspaceView === 'notes') return `Create revision notes for ${activeTopicLabel}...`;
    if (workspaceView === 'practice') return `Practice ${activeTopicLabel} with a quiz...`;
    return `Ask Maya about ${activeTopicLabel}...`;
  }, [activeTopicLabel, mode, workspaceView]);

  const submitWithMode = (value: string) => {
    const nextMode = detectMode(value);
    setMode(nextMode);
    setInput(value);
    const syntheticEvent = { preventDefault: () => undefined } as React.FormEvent;
    handleSubmit(syntheticEvent as never);
  };

  function detectMode(value: string): Mode {
    const text = value.toLowerCase();
    if (text.includes('quiz') || text.includes('question') || text.includes('option')) return 'quiz';
    if (text.includes('flashcard')) return 'flashcards';
    if (text.includes('plan') || text.includes('revision')) return 'plan';
    if (text.includes('explain') || text.includes('why') || text.includes('how')) return 'explain';
    return 'general';
  }

  const prepareAndSubmit = (value: string) => {
    const resolvedMode = detectMode(value);
    const normalized = resolvedMode === 'quiz' && quizStyle === 'options' && /^[abcd]$/i.test(value.trim())
      ? `My answer is option ${value.trim().toUpperCase()}.`
      : value;
    setMode(resolvedMode);
    setInput(normalized);
    const syntheticEvent = { preventDefault: () => undefined } as React.FormEvent;
    handleSubmit(syntheticEvent as never);
  };

  const selectTopic = (topic: Topic, view: WorkspaceView = 'study') => {
    setSelectedTopic(topic);
    setWorkspaceView(view);
  };

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">M</div>
          <div>
            <div className="title">Maya</div>
            <div className="subtitle">Premium Biology Coach</div>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-title">Workspace</div>
          <button className={`nav-item ${workspaceView === 'study' ? 'active' : ''}`} onClick={() => setWorkspaceView('study')}>Study Stream</button>
          <button className={`nav-item ${workspaceView === 'notes' ? 'active' : ''}`} onClick={() => setWorkspaceView('notes')}>Revision Notes</button>
          <button className={`nav-item ${workspaceView === 'practice' ? 'active' : ''}`} onClick={() => setWorkspaceView('practice')}>Practice Sets</button>
        </div>

        <div className="nav-section" style={{ flex: 1 }}>
          <div className="nav-title">Threads</div>
          <button className={`thread-item ${selectedTopic === 'photosynthesis' ? 'selected' : ''}`} onClick={() => selectTopic('photosynthesis')}>Photosynthesis</button>
          <button className={`thread-item ${selectedTopic === 'enzymes' ? 'selected' : ''}`} onClick={() => selectTopic('enzymes')}>Enzymes</button>
          <button className={`thread-item ${selectedTopic === 'inheritance' ? 'selected' : ''}`} onClick={() => selectTopic('inheritance')}>Inheritance</button>
        </div>

        <div className="profile-card">
          <div className="profile-dot" />
          <div>
            <div className="title">Student</div>
            <div className="subtitle">Focused on {activeTopicLabel}</div>
          </div>
        </div>
      </aside>

      <section className="center-panel">
        <div className="topbar">
          <div>
            <div className="title">Study Stream</div>
            <div className="subtitle">A calm, premium AI tutor experience for GCSE Biology</div>
          </div>
          <button className="ghost-btn" onClick={() => setMessages([])}>
            Reset Chat
          </button>
        </div>

        <div className="chat-scroll">
          {messages.length === 0 ? (
            <div className="welcome-card">
              <div className="welcome-title">Maya: I’m here to help you learn.</div>
              <div className="welcome-copy">
                I’m Maya, your premium GCSE Biology coach. I can explain ideas clearly, quiz you one question at a time, build flashcards, and make revision plans that feel fast and focused.
              </div>
              <div className="starter-grid">
                {starterPrompts.map((prompt) => (
                  <button key={prompt} className="starter-pill" onClick={() => submitWithMode(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((message) => (
            <div key={message.id} className={`message-row ${message.role === 'user' ? 'user-row' : 'assistant-row'}`}>
              {message.role === 'user' ? (
                <div className="user-block">{message.content}</div>
              ) : (
                <div className="assistant-block">
                  <div className="assistant-text">{message.content}</div>
                </div>
              )}
            </div>
          ))}

          {isLoading ? <div className="thinking">AI is thinking…</div> : null}
          {error ? <div className="error">{error.message}</div> : null}
        </div>

        <form
          className="composer"
          onSubmit={(event) => {
            event.preventDefault();
            const value = chatInput.trim();
            if (!value) return;
            prepareAndSubmit(value);
          }}
        >
          {mode === 'quiz' ? (
            <div className="quiz-toggle">
              <button type="button" className={quizStyle === 'options' ? 'active' : ''} onClick={() => setQuizStyle('options')}>With options</button>
              <button type="button" className={quizStyle === 'freeform' ? 'active' : ''} onClick={() => setQuizStyle('freeform')}>Without options</button>
            </div>
          ) : null}
          <input
            value={chatInput}
            onChange={handleInputChange}
            placeholder={composerPlaceholder}
            className="composer-input"
          />
          <button type="submit" className="send-btn">➜</button>
        </form>
      </section>

      <aside className="right-panel">
        <div className="panel-card">
          <div className="panel-title">Context Workspace</div>
          <div className="panel-body">
            <div className="mini-card">
              <div className="mini-label">Live Insight</div>
              <div className="mini-value">{contextPreview.insight}</div>
            </div>
            <div className="mini-card">
              <div className="mini-label">Active Focus</div>
              <div className="mini-value">{activeTopicLabel}</div>
            </div>
            <div className="mini-card code-card">
              <div className="mini-label">{contextPreview.title}</div>
              <pre>{contextPreview.body}</pre>
            </div>
            <button className="context-action" onClick={() => setInput(contextPreview.action)}>
              Use this prompt
            </button>
          </div>
        </div>
      </aside>

      <style jsx global>{`
        :root { color-scheme: dark; }
        body { background: #05070b; color: #f5f7fb; }
        .shell {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 260px 1fr 320px;
          background: linear-gradient(135deg, #05070b 0%, #0e1118 100%);
          color: #f5f7fb;
        }
        .sidebar, .right-panel {
          background: #121214;
          border-right: 1px solid #2a2a2e;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .right-panel { border-right: 0; border-left: 1px solid #2a2a2e; }
        .brand-block, .profile-card, .panel-card, .welcome-card, .assistant-block, .user-block, .composer {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(16px);
        }
        .brand-block, .profile-card { display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 16px; }
        .brand-mark {
          width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; background: linear-gradient(135deg, #7c3aed, #14b8a6); color: white; font-weight: 800;
        }
        .title { font-weight: 700; }
        .subtitle { color: #9aa1ab; font-size: 0.9rem; }
        .nav-section { display: flex; flex-direction: column; gap: 8px; }
        .nav-title { color: #7c8795; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.15em; }
        .nav-item, .thread-item, .starter-pill, .ghost-btn {
          border: 0; background: transparent; color: #f5f7fb; text-align: left; cursor: pointer;
        }
        .nav-item.active { color: #8b5cf6; }
        .thread-item { padding: 8px 10px; border-radius: 10px; background: rgba(255,255,255,0.03); width: 100%; }
        .thread-item.selected { background: linear-gradient(135deg, rgba(124, 58, 237, 0.35), rgba(20, 184, 166, 0.24)); color: white; }
        .profile-dot { width: 10px; height: 10px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #14b8a6); }
        .center-panel { display: flex; flex-direction: column; min-height: 100vh; padding: 24px 24px 20px; }
        .topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .ghost-btn { padding: 10px 14px; border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; }
        .chat-scroll { flex: 1; overflow-y: auto; padding-right: 8px; display: flex; flex-direction: column; gap: 14px; }
        .welcome-card, .panel-card, .assistant-block, .user-block { border-radius: 18px; padding: 16px; }
        .welcome-title { font-size: 1.15rem; font-weight: 700; margin-bottom: 8px; }
        .welcome-copy { color: #b3bac3; line-height: 1.6; margin-bottom: 12px; }
        .starter-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        .starter-pill { padding: 10px 12px; border-radius: 999px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
        .message-row { display: flex; }
        .user-row { justify-content: flex-end; }
        .user-block { max-width: 70%; background: linear-gradient(135deg, #6d28d9, #14b8a6); padding: 14px 16px; color: white; }
        .assistant-block { max-width: 84%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); }
        .assistant-text { line-height: 1.7; color: #e5eaf0; }
        .thinking { color: #9aa1ab; font-style: italic; }
        .error { color: #fda4af; }
        .composer {
          margin-top: 16px; display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 999px; position: sticky; bottom: 12px; background: rgba(255,255,255,0.06); box-shadow: 0 10px 40px rgba(0,0,0,0.35); backdrop-filter: blur(20px);
        }
        .send-btn { width: 42px; height: 42px; border: 0; border-radius: 50%; cursor: pointer; color: white; background: linear-gradient(135deg, #7c3aed, #14b8a6); }
        .quiz-toggle { display: flex; gap: 6px; }
        .quiz-toggle button { border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #d7dceb; padding: 7px 10px; border-radius: 999px; cursor: pointer; }
        .quiz-toggle button.active { background: linear-gradient(135deg, #7c3aed, #14b8a6); color: white; }
        .composer-input { flex: 1; border: 0; outline: 0; background: transparent; color: #f5f7fb; }
        .panel-body { display: flex; flex-direction: column; gap: 12px; }
        .mini-card { padding: 12px; border-radius: 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); }
        .mini-label { font-size: 0.78rem; text-transform: uppercase; color: #7c8795; margin-bottom: 4px; }
        .mini-value { color: #f5f7fb; }
        .context-action { margin-top: 4px; padding: 10px 12px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.06); color: #f5f7fb; cursor: pointer; }
        .code-card pre { margin: 0; color: #cbd5e1; font-size: 0.9rem; white-space: pre-wrap; }
        @media (max-width: 1100px) { .shell { grid-template-columns: 1fr; } .sidebar, .right-panel { display: none; } }
      `}</style>
    </main>
  );
}
