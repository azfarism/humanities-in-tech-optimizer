export type AppStatus = 'draft' | 'ready_for_generation' | 'generated';

export interface ApplicationRow {
  id: string;
  user_id: string;
  title: string;
  resume_text: string;
  job_listing_text: string;
  follow_up_answers: {
    target_role?: string;
    target_company?: string;
    must_include_points?: string;
    constraints_or_notes?: string;
  };
  rewritten_cv: string | null;
  cover_letter: string | null;
  checklist: string | null;
  gap_note: string | null;
  status: AppStatus;
  created_at: string;
  updated_at: string;
}

export type ApplicationDraftPayload = {
  id?: string;
  title: string;
  resume_text: string;
  job_listing_text: string;
  follow_up_answers: ApplicationRow['follow_up_answers'];
  status: AppStatus;
};
