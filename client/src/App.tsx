import React from 'react';
import './App.css';
import { Rates } from "./components/Rates";
import { RatesProvider } from "./hooks/useRates";

export function App() {
  return (
    <div className="App">
      <header className="App-header">
        <RatesProvider>
          <Rates />
        </RatesProvider>
      </header>
    </div>
  );
}
