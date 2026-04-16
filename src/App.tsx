import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import AuthGate from './components/AuthGate';
import Dashboard from './components/Dashboard';
import ApplicationForm from './components/ApplicationForm';
import { supabase } from './lib/supabase';
import type { ApplicationDraftPayload, ApplicationRow } from './types/application';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [items, setItems] = useState<ApplicationRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setItems([]);
      setSelectedId(null);
      return;
    }

    const loadApplications = async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error(error.message);
        return;
      }

      setItems((data ?? []) as ApplicationRow[]);
      setSelectedId((data ?? [])[0]?.id ?? null);
    };

    void loadApplications();
  }, [session?.user]);

  const current = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId]
  );

  const saveDraft = async (payload: ApplicationDraftPayload) => {
    const userId = session?.user.id;
    if (!userId) throw new Error('You must be signed in.');

    const basePayload = {
      title: payload.title,
      resume_text: payload.resume_text,
      job_listing_text: payload.job_listing_text,
      follow_up_answers: payload.follow_up_answers,
      status: payload.status
    };

    if (payload.id) {
      const { data, error } = await supabase
        .from('applications')
        .update(basePayload)
        .eq('id', payload.id)
        .select('*')
        .single();

      if (error) throw new Error(error.message);

      setItems((prev) => prev.map((item) => (item.id === data.id ? (data as ApplicationRow) : item)));
      setSelectedId(data.id);
      return;
    }

    const { data, error } = await supabase
      .from('applications')
      .insert({
        ...basePayload,
        user_id: userId,
        rewritten_cv: null,
        cover_letter: null,
        checklist: null,
        gap_note: null
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);

    setItems((prev) => [data as ApplicationRow, ...prev]);
    setSelectedId(data.id);
  };

  const handleCreateNew = () => {
    setSelectedId(null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <main className="shell">Loading…</main>;
  if (!session) return <main className="shell"><AuthGate /></main>;

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Signed in as {session.user.email}</p>
        </div>
        <button onClick={handleSignOut}>Sign out</button>
      </header>

      <div className="layout">
        <Dashboard
          items={items}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onCreateNew={handleCreateNew}
        />
        <ApplicationForm current={current} onSave={saveDraft} />
      </div>
    </main>
  );
}
