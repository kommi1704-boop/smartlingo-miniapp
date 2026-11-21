// /plan now redirects to the Daily Learning Journey: the journey IS today's plan
// (one engaging AI session, one CTA — the user's request). The classic adaptive
// plan engine still powers mission/quest signals under the hood; only the
// page-level duplicate list is gone.
import { useEffect } from 'react';
import { navigate } from '../lib/router';

export function Plan() {
  useEffect(() => {
    navigate('/journey', { replace: true });
  }, []);
  return null;
}
