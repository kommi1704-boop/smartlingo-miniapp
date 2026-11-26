import { useSyncExternalStore, createElement, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react';

// Tiny History-API router: clean URLs like  /tutor  and  /journey/run  (no "#/").
//
// Backward compatible: old links of the form  /#/notify  (bot buttons, bookmarks, shared links) are
// recognised and rewritten to /notify on first load. Telegram's own launch parameters live in the
// hash too (#tgWebAppData=...); those are NOT routes and are left untouched.
//
// Hosting: every unknown path must serve index.html (vercel.json has the SPA rewrite).

const NAV_EVENT = 'sl:navigate';

/** "/#/notify?x=1" style hash -> "/notify", or null when the hash is not a route (e.g. Telegram launch params). */
export function legacyHashPath(hash: string): string | null {
  const h = hash.replace(/^#/, '');
  if (!h.startsWith('/')) return null;
  const p = h.split(/[?&]/)[0];
  return p || '/';
}

export function normalizePath(pathname: string): string {
  const p = pathname.replace(/\/{2,}/g, '/');
  return p.length > 1 ? p.replace(/\/+$/, '') || '/' : p || '/';
}

function currentPath(): string {
  const legacy = legacyHashPath(window.location.hash);
  if (legacy && normalizePath(window.location.pathname) === '/') return legacy;
  return normalizePath(window.location.pathname);
}

const stack: string[] = [];
let started = false;

function track() {
  const p = currentPath();
  if (stack.length >= 2 && stack[stack.length - 2] === p) stack.pop();
  else if (stack[stack.length - 1] !== p) stack.push(p);
}

function start() {
  if (started) return;
  started = true;
  // Rewrite a legacy "/#/route" entry to the clean URL once (keeps Telegram's launch hash if it has one).
  const legacy = legacyHashPath(window.location.hash);
  if (legacy && normalizePath(window.location.pathname) === '/') {
    try {
      window.history.replaceState(window.history.state, '', `${legacy}${window.location.search}`);
    } catch {
      /* sandboxed iframe: keep working from the legacy hash path */
    }
  }
  stack.push(currentPath());
  window.addEventListener('popstate', track);
  window.addEventListener(NAV_EVENT, track);
}

function subscribe(cb: () => void) {
  start();
  window.addEventListener('popstate', cb);
  window.addEventListener(NAV_EVENT, cb);
  return () => {
    window.removeEventListener('popstate', cb);
    window.removeEventListener(NAV_EVENT, cb);
  };
}

export function usePath(): string {
  return useSyncExternalStore(subscribe, currentPath, () => '/');
}

export function navigate(to: string, opts?: { replace?: boolean }): void {
  start();
  const target = to.startsWith('/') ? to : `/${to}`;
  try {
    if (opts?.replace) {
      window.history.replaceState({}, '', target);
      if (stack.length) stack[stack.length - 1] = normalizePath(target.split(/[?#]/)[0]);
    } else {
      window.history.pushState({}, '', target);
    }
  } catch {
    // history API blocked: fall back to the hash form, which currentPath() also understands at "/"
    window.location.hash = target;
    return;
  }
  window.dispatchEvent(new Event(NAV_EVENT));
}

export function canGoBack(): boolean {
  start();
  return stack.length > 1;
}

export function goBack(fallback = '/'): void {
  if (canGoBack()) window.history.back();
  else navigate(fallback, { replace: true });
}

export function segments(path: string): string[] {
  return path.split('/').filter(Boolean);
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  children?: ReactNode;
}

export function A({ to, children, onClick, target, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    // let the browser handle new-tab / modified clicks; intercept plain left clicks for instant in-app navigation
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (target && target !== '_self')) return;
    e.preventDefault();
    navigate(to);
  };
  return createElement('a', { href: to, target, onClick: handle, ...rest }, children);
}
