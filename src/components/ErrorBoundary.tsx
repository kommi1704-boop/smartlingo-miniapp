import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Empty } from './ui';

/**
 * Keeps one broken screen from blanking the whole app. Without a boundary React unmounts the entire
 * tree on the first render error and the learner is left with an empty page. App.tsx keys this
 * component by route, so navigating anywhere else clears the error automatically.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // one short, structured line (no PII) — easy to spot in the console / remote error collectors
    console.error('screen crashed:', error.message, info.componentStack?.split('\n')[1]?.trim() ?? '');
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <Empty
        emoji="🛠️"
        title="Bu sahifada xatolik yuz berdi"
        text="Hech narsa yo‘qolmadi — natijalaringiz saqlangan. Sahifani qayta yuklang yoki bosh sahifaga qayting."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => this.setState({ failed: false })}>Qayta urinish</Button>
            <Button variant="secondary" onClick={() => { window.location.assign('/'); }}>Bosh sahifa</Button>
          </div>
        }
      />
    );
  }
}
