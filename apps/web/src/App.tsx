import { useEffect, useMemo, useState } from "react";
import { fetchDashboard, runSimulation } from "./lib/api";
import type { DashboardResponse, SimulationResponse, TradeIdea } from "./types";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

function TrendChart({ tradeIdea }: { tradeIdea: TradeIdea }) {
  const values = tradeIdea.chart.map((point) => point.value);
  const min = Math.min(...values, tradeIdea.stop);
  const max = Math.max(...values, tradeIdea.target);
  const width = 460;
  const height = 220;
  const xStep = width / Math.max(tradeIdea.chart.length - 1, 1);
  const points = tradeIdea.chart
    .map((point, index) => {
      const x = index * xStep;
      const y = height - ((point.value - min) / (max - min || 1)) * height;
      return `${x},${y}`;
    })
    .join(" ");
  const yFromPrice = (price: number) => height - ((price - min) / (max - min || 1)) * height;

  return (
    <div className="chart-card">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Trade visualization</p>
          <h3>{tradeIdea.ticker} plan</h3>
        </div>
        <div className={`grade-badge grade-${tradeIdea.grade.toLowerCase().replace("+", "plus")}`}>
          {tradeIdea.grade}
        </div>
      </div>
      <svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${tradeIdea.ticker} chart`}>
        <line x1="0" y1={yFromPrice(tradeIdea.entry)} x2={width} y2={yFromPrice(tradeIdea.entry)} className="chart-entry" />
        <line x1="0" y1={yFromPrice(tradeIdea.stop)} x2={width} y2={yFromPrice(tradeIdea.stop)} className="chart-stop" />
        <line x1="0" y1={yFromPrice(tradeIdea.target)} x2={width} y2={yFromPrice(tradeIdea.target)} className="chart-target" />
        <polyline points={points} className="chart-line" />
      </svg>
      <div className="legend">
        <span>Entry {formatMoney(tradeIdea.entry)}</span>
        <span>Stop {formatMoney(tradeIdea.stop)}</span>
        <span>Target {formatMoney(tradeIdea.target)}</span>
      </div>
    </div>
  );
}

export default function App() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [selectedTicker, setSelectedTicker] = useState("");
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchDashboard();
        setDashboard(data);
        setSelectedTicker(data.tradeIdeas[0]?.ticker ?? "");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const selectedTradeIdea = useMemo(
    () => dashboard?.tradeIdeas.find((tradeIdea) => tradeIdea.ticker === selectedTicker) ?? dashboard?.tradeIdeas[0] ?? null,
    [dashboard, selectedTicker]
  );

  useEffect(() => {
    async function simulate() {
      if (!selectedTradeIdea) {
        return;
      }

      const result = await runSimulation({
        entry: selectedTradeIdea.entry,
        stop: selectedTradeIdea.stop,
        target: selectedTradeIdea.target,
        riskAmount: 250
      });
      setSimulation(result);
    }

    void simulate();
  }, [selectedTradeIdea]);

  if (loading) {
    return <main className="app-shell loading-state">Loading StratifyX...</main>;
  }

  if (error || !dashboard || !selectedTradeIdea) {
    return <main className="app-shell loading-state">Unable to load dashboard: {error || "Missing data"}</main>;
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Strat-aware trading dashboard</p>
          <h1>Scan, rank, visualize, and stand aside when the tape is wrong.</h1>
        </div>
        <div className={`regime-banner regime-${dashboard.marketBias}`}>
          <span>{dashboard.stayInCash ? "Stay in cash" : "Deploy selectively"}</span>
          <p>{dashboard.marketSummary}</p>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <p className="eyebrow">Market bias</p>
          <strong>{dashboard.marketBias}</strong>
        </article>
        <article className="stat-card">
          <p className="eyebrow">Qualified setups</p>
          <strong>{dashboard.tradeIdeas.length}</strong>
        </article>
        <article className="stat-card">
          <p className="eyebrow">Top grade</p>
          <strong>{dashboard.tradeIdeas[0]?.grade ?? "N/A"}</strong>
        </article>
        <article className="stat-card">
          <p className="eyebrow">Watchlist size</p>
          <strong>{dashboard.watchlist.length}</strong>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel panel-wide">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Ticker scanner</p>
              <h2>Ranked trade ideas</h2>
            </div>
            <p className="muted">Generated {new Date(dashboard.generatedAt).toLocaleString()}</p>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Setup</th>
                  <th>TF</th>
                  <th>Entry</th>
                  <th>Stop</th>
                  <th>Target</th>
                  <th>Score</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.tradeIdeas.map((tradeIdea) => (
                  <tr
                    key={`${tradeIdea.ticker}-${tradeIdea.setup}`}
                    className={selectedTradeIdea.ticker === tradeIdea.ticker ? "selected-row" : undefined}
                    onClick={() => setSelectedTicker(tradeIdea.ticker)}
                  >
                    <td>
                      <div className="ticker-cell">
                        <strong>{tradeIdea.ticker}</strong>
                        <span>{tradeIdea.direction}</span>
                      </div>
                    </td>
                    <td>{tradeIdea.setup}</td>
                    <td>{tradeIdea.timeframe}</td>
                    <td>{formatMoney(tradeIdea.entry)}</td>
                    <td>{formatMoney(tradeIdea.stop)}</td>
                    <td>{formatMoney(tradeIdea.target)}</td>
                    <td>{tradeIdea.confidenceScore}</td>
                    <td>{tradeIdea.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <TrendChart tradeIdea={selectedTradeIdea} />

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Catalysts</p>
              <h2>News and event risk</h2>
            </div>
          </div>
          <div className="event-list">
            {dashboard.events.map((event) => (
              <div key={event.name} className="event-item">
                <strong>{event.name}</strong>
                <span>{event.dateLabel}</span>
                <small>{event.severity} risk</small>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Simulation</p>
              <h2>Risk preview</h2>
            </div>
          </div>
          {simulation ? (
            <div className="sim-grid">
              <div>
                <span>Size</span>
                <strong>{simulation.quantity} shares</strong>
              </div>
              <div>
                <span>R multiple</span>
                <strong>{simulation.riskRewardRatio}:1</strong>
              </div>
              <div>
                <span>Potential profit</span>
                <strong>{formatMoney(simulation.potentialProfit)}</strong>
              </div>
              <div>
                <span>Potential loss</span>
                <strong>{formatMoney(simulation.potentialLoss)}</strong>
              </div>
            </div>
          ) : (
            <p className="muted">Simulation unavailable.</p>
          )}
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Setup notes</p>
              <h2>{selectedTradeIdea.setup}</h2>
            </div>
          </div>
          <div className="event-list">
            <div className="event-item">
              <strong>{selectedTradeIdea.ticker}</strong>
              <span>{selectedTradeIdea.notes}</span>
              <small>
                FVG {selectedTradeIdea.confluence.fairValueGap ? "yes" : "no"} | Key level {selectedTradeIdea.confluence.nearKeyLevel ? "yes" : "no"} | Event risk {selectedTradeIdea.confluence.eventRisk}
              </small>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Journal</p>
              <h2>Recent trade notes</h2>
            </div>
          </div>
          <div className="journal-list">
            {dashboard.journal.map((entry) => (
              <div key={`${entry.date}-${entry.ticker}`} className="journal-item">
                <div>
                  <strong>{entry.ticker}</strong>
                  <span>{entry.date}</span>
                </div>
                <p>{entry.notes}</p>
                <small>{entry.pnl === 0 ? "No trade taken" : `PnL ${formatMoney(entry.pnl)}`}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Watchlist</p>
              <h2>Symbols in scope</h2>
            </div>
          </div>
          <div className="watchlist">
            {dashboard.watchlist.map((symbol) => (
              <span key={symbol}>{symbol}</span>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
