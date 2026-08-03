import { Component } from 'react';
import * as Sentry from '@sentry/react';

// Filet de sécurité global : toute erreur de rendu affiche un écran de repli
// au lieu d'une page blanche. Volontairement sans i18n ni store : le repli
// doit fonctionner même si ces providers sont la cause du crash.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    Sentry.captureException(error, { extra: { componentStack: info?.componentStack } });
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 24,
          textAlign: 'center',
          background: 'var(--bg-base, #ffffff)',
          color: 'var(--text-primary, #0f0e1a)',
          fontFamily: "'Kumbh Sans', sans-serif",
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
          Une erreur est survenue
        </h1>
        <p style={{ fontSize: 14, maxWidth: 420, margin: 0, color: 'var(--text-secondary, #55516e)' }}>
          Quelque chose s'est mal passé. Rechargez la page pour continuer —
          votre panier est conservé.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 24px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            background: 'var(--accent, #6d5df6)',
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Recharger la page
        </button>
      </div>
    );
  }
}
