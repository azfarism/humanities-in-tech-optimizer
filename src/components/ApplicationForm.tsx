import { useEffect, useMemo, useState } from 'react';
import type { ApplicationDraftPayload, ApplicationRow } from '../types/application';

interface ApplicationFormProps {
  current: ApplicationRow | null;
  onSave: (payload: ApplicationDraftPayload) => Promise<void>;
}

const emptyForm: ApplicationDraftPayload = {
  title: '',
  resume_text: '',
  job_listing_text: '',
  follow_up_answers: {
    target_role: '',
    target_company: '',
    must_include_points: '',
    constraints_or_notes: ''
  },
  status: 'draft'
};

export default function ApplicationForm({ current, onSave }: ApplicationFormProps) {
  const [form, setForm] = useState<ApplicationDraftPayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!current) {
      setForm(emptyForm);
      return;
    }

    setForm({
      id: current.id,
      title: current.title,
      resume_text: current.resume_text,
      job_listing_text: current.job_listing_text,
      follow_up_answers: {
        target_role: current.follow_up_answers?.target_role ?? '',
        target_company: current.follow_up_answers?.target_company ?? '',
        must_include_points: current.follow_up_answers?.must_include_points ?? '',
        constraints_or_notes: current.follow_up_answers?.constraints_or_notes ?? ''
      },
      status: current.status
    });
  }, [current]);

  const missingChecklist = useMemo(() => {
    const missing: string[] = [];
    if (!form.resume_text.trim()) missing.push('resume text');
    if (!form.job_listing_text.trim()) missing.push('job listing text');
    if (!form.follow_up_answers.target_role?.trim()) missing.push('target role');
    return missing;
  }, [form]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await onSave(form);
      setMessage('Draft saved. You can keep iterating before AI generation is added.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save draft.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="panel">
      <h2>{current ? 'Edit application' : 'New application'}</h2>
      <p className="muted">Bounded follow-up form (no chat). Save draft first; generation comes later.</p>

      <form onSubmit={handleSubmit} className="stack">
        <label>
          Application title
          <input
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Product Analyst at Example Co"
            required
          />
        </label>

        <label>
          Paste resume text
          <textarea
            rows={8}
            value={form.resume_text}
            onChange={(e) => setForm((prev) => ({ ...prev, resume_text: e.target.value }))}
            placeholder="Paste the raw resume text"
          />
        </label>

        <label>
          Paste job listing text
          <textarea
            rows={8}
            value={form.job_listing_text}
            onChange={(e) => setForm((prev) => ({ ...prev, job_listing_text: e.target.value }))}
            placeholder="Paste the full job listing"
          />
        </label>

        <h3>Structured follow-up (single round)</h3>
        <label>
          Target role (required for best output)
          <input
            value={form.follow_up_answers.target_role}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                follow_up_answers: { ...prev.follow_up_answers, target_role: e.target.value }
              }))
            }
            placeholder="e.g. Technical Program Manager"
          />
        </label>

        <label>
          Target company
          <input
            value={form.follow_up_answers.target_company}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                follow_up_answers: { ...prev.follow_up_answers, target_company: e.target.value }
              }))
            }
            placeholder="Optional"
          />
        </label>

        <label>
          Must-include points
          <textarea
            rows={3}
            value={form.follow_up_answers.must_include_points}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                follow_up_answers: { ...prev.follow_up_answers, must_include_points: e.target.value }
              }))
            }
            placeholder="Any achievements, projects, or language to include"
          />
        </label>

        <label>
          Constraints / notes
          <textarea
            rows={3}
            value={form.follow_up_answers.constraints_or_notes}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                follow_up_answers: { ...prev.follow_up_answers, constraints_or_notes: e.target.value }
              }))
            }
            placeholder="e.g. no relocation, tone preference, salary context"
          />
        </label>

        <label>
          Draft status
          <select
            value={form.status}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                status: e.target.value as ApplicationDraftPayload['status']
              }))
            }
          >
            <option value="draft">draft</option>
            <option value="ready_for_generation">ready_for_generation</option>
            <option value="generated">generated (placeholder)</option>
          </select>
        </label>

        <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save draft'}</button>
      </form>

      {missingChecklist.length > 0 ? (
        <p className="warning">Missing info (best-effort later): {missingChecklist.join(', ')}.</p>
      ) : null}

      {message ? <p className="success">{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}
