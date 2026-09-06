'use client';

import { useState } from 'react';
import Link from 'next/link';
import { renderMarkdown } from '../../../lib/markdown';

const TAB_LABELS = { prelab: 'Pre-Lab', postlab: 'Post-Lab', procedure: 'Procedure' };
const TAB_ORDER = ['prelab', 'postlab', 'procedure'];

export default function WeekPageClient({ weekId, title, desc, theory, questions }) {
  const firstAvailable = TAB_ORDER.find((key) => theory[key].text) || TAB_ORDER[0];
  const [activeTab, setActiveTab] = useState(firstAvailable);
  const current = theory[activeTab];

  return (
    <div className="week-page">
      <div className="week-page-inner">
        <div className="week-page-header">
          <p className="week-page-index">Week {String(weekId).padStart(2, '0')}</p>
          <h1 className="week-page-title">{title}</h1>
          {desc && <p className="week-page-desc">{desc}</p>}
        </div>

        <div className="theory-tabs" role="tablist" aria-label="Theory sections">
          {TAB_ORDER.map((key) => {
            const hasContent = Boolean(theory[key].text);
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeTab === key}
                className={`theory-tab ${activeTab === key ? 'is-active' : ''} ${!hasContent ? 'is-empty' : ''}`}
                onClick={() => hasContent && setActiveTab(key)}
              >
                {TAB_LABELS[key]}
              </button>
            );
          })}
        </div>

        <div className="theory-panel" role="tabpanel">
          {current.text ? (
            <>
              {current.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={current.image} alt="" className="theory-panel-image" />
              )}
              <div className="theory-panel-text">{renderMarkdown(current.text)}</div>
            </>
          ) : (
            <p className="theory-panel-empty">Not added yet.</p>
          )}
        </div>

        <h2 className="question-list-heading">Questions</h2>
        {questions.length > 0 ? (
          <div className="question-list">
            {questions.map((q) => (
              <Link key={q.id} href={`/week/${weekId}/question/${q.id}`} className="question-item">
                <span className="question-item-number">Q{q.id}</span>
                <span className="question-item-title">{q.title}</span>
                <span className="question-item-meta">
                  {q.stepCount} step{q.stepCount === 1 ? '' : 's'}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="question-list-empty">No questions added yet.</p>
        )}
      </div>
    </div>
  );
}
