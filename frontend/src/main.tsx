import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Global error boundary
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {error: Error | null}> {
  constructor(props: any) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding:40,fontFamily:'monospace',maxWidth:700,margin:'0 auto'}}>
          <h1 style={{color:'red'}}>⚠️ Erreur JIMPRO-HOPITAL</h1>
          <pre style={{background:'#fee',padding:16,borderRadius:8,overflow:'auto',whiteSpace:'pre-wrap'}}>
            {this.state.error.message}
          </pre>
          <pre style={{background:'#eee',padding:16,borderRadius:8,overflow:'auto',maxHeight:300,whiteSpace:'pre-wrap',fontSize:12}}>
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
