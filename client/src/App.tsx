import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { formatMoney } from "./helpers/formatters";
import { calculatePercentageChange } from "./helpers/changeCalculator";
import { Rate } from "./types";
import { validateRateResponse } from "./helpers/validators";

export function App() {
  const [ rates, setRates ] = useState<Rate[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${process.env.API_URL || ''}/api/rates/USD,EUR`);
      const data = await response.json();

      if (validateRateResponse(data)) {
        setRates(data);
      }
    };
    fetchData();

    const timer = setInterval(() => {
      fetchData();
    }, 10 * 1000); // every minute

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {!rates.length && (
          <img src={logo} className="App-logo" alt="logo" />
        )}
        {rates.map(rate => (
          <div key={rate.code}>
            <h2
              className={calculatePercentageChange(rate.nbpRate, rate.forexRate) < 0 ? 'decrease' : 'increase'}>
              {rate.code} <span>➡</span> {formatMoney(rate.forexRate)}
            </h2>
          </div>
        ))}
      </header>
    </div>
  );
}
