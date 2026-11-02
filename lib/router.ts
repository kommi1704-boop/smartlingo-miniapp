import { useSyncExternalStore, createElement, type AnchorHTMLAttributes, type ReactNode } from 'react';

// Tiny hash router (works everywhere: Telegram, GitHub Pages, any static host).

function currentPath(): string {
  const h = window.location.hash.replace(/^#/, '');
  const p = h.split('?')[0];
  return p || '/';
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
  stack.push(currentPath());
  window.addEventListener('hashchange', track);
}

function subscribe(cb: () => void) {
  start();
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

export function usePath(): string {
  return useSyncExternalStore(subscribe, currentPath, () => '/');
}

export function navigate(to: string, opts?: { replace?: boolean }): void {
  start();
  if (opts?.replace) {
    const url = `${window.location.pathname}${window.location.search}#${to}`;
    window.location.replace(url);
    // replace() fires hashchange too, but keep stack tidy
    if (stack.length) stack[stack.length - 1] = to;
  } else {
    window.location.hash = to;
  }
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

export function A({ to, children, ...rest }: LinkProps) {
  return createElement('a', { href: `#${to}`, ...rest }, children);
}
