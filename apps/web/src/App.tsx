import { useEffect, useMemo, useState } from "react";
import { addWatchlistTicker, fetchDashboard, removeWatchlistTicker, runSimulation } from "./lib/api";
import type { DashboardResponse, JournalEntry, SimulationResponse, TradeIdea } from "./types";

type AppPage = "scanner" | "simulation" | "journal";

const PAGE_TITLES: Record<AppPage, string> = {
  scanner: "Scanner",
  simulation: "Simulation",
  journal: "Journal"
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

function getPageFromHash(hash: string): AppPage {
  const normalized = hash.replace("#", "");
  if (normalized === "simulation" || normalized === "journal") {
    return normalized;
  }

  return "scanner";
}

function buildTradeIdeaId(tradeIdea: TradeIdea) {
  return `${tradeIdea.ticker}:${tradeIdea.setup}:${tradeIdea.timeframe}`;
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
    <article className="panel chart-card">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Chart</p>
          <h2>{tradeIdea.ticker}</h2>
        </div>
        <div className={`grade-badge grade-${tradeIdea.grade.toLowerCase().replace("+", "plus")}`}>{tradeIdea.grade}</div>
      </div>
      <svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${tradeIdea.ticker} chart`}>
        <line x1="0" y1={yFromPrice(tradeIdea.entry)} x2={width} y2={yFromPrice(tradeIdea.entry)} className="chart-entry" />
        <line x1="0" y1={yFromPrice(tradeIdea.stop)} x2={width} y2={yFromPrice(tradeIdea.stop)} className="chart-stop" />
        <line x1="0" y1={yFromPrice(tradeIdea.target)} x2={width} y2={yFromPrice(tradeIdea.target)} className="chart-target" />
        <polyline points={points} className="chart-line" />
      </svg>
      <div className="price-strip">
        <span>Entry {formatMoney(tradeIdea.entry)}</span>
        <span>Stop {formatMoney(tradeIdea.stop)}</span>
        <span>Target {formatMoney(tradeIdea.target)}</span>
      </div>
    </article>
  );
}

function ScannerStatus({ marketSummary, stayInCash, marketBias }: { marketSummary: string; stayInCash: boolean; marketBias: DashboardResponse["marketBias"] }) {
  return (
    <article className={`hero-callout hero-callout-${marketBias}`}>
      <div className="scanner-status-top">
        <div className="scanner-radar" aria-hidden="true">
          <div className="scanner-ring scanner-ring-1" />
          <div className="scanner-ring scanner-ring-2" />
          <div className="scanner-ring scanner-ring-3" />
          <div className="scanner-sweep" />
          <div className="scanner-core" />
        </div>
        <div>
          <span>Scanner active</span>
          <h3>{stayInCash ? "Hold cash unless a setup is exceptional" : "Scanning for qualified setups"}</h3>
        </div>
      </div>
      <p>{marketSummary}</p>
    </article>
  );
}

function ScannerPage({
  dashboard,
  selectedTradeIdea,
  selectedTradeIdeaId,
  watchlist,
  watchlistDraft,
  onSelectTradeIdea,
  onWatchlistDraftChange,
  onAddTicker,
  onRemoveTicker
}: {
  dashboard: DashboardResponse;
  selectedTradeIdea: TradeIdea;
  selectedTradeIdeaId: string;
  watchlist: string[];
  watchlistDraft: string;
  onSelectTradeIdea: (tradeIdeaId: string) => void;
  onWatchlistDraftChange: (value: string) => void;
  onAddTicker: () => void;
  onRemoveTicker: (ticker: string) => void;
}) {
  return (
    <section className="page-grid">
      <div className="main-stack">
        <article className="panel scanner-panel">
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
                {dashboard.tradeIdeas.map((tradeIdea) => {
                  const tradeIdeaId = buildTradeIdeaId(tradeIdea);

                  return (
                    <tr
                      key={tradeIdeaId}
                      className={selectedTradeIdeaId === tradeIdeaId ? "selected-row" : undefined}
                      onClick={() => onSelectTradeIdea(tradeIdeaId)}
                    >
                      <td>
                        <div className="ticker-cell">
                          <strong>{tradeIdea.ticker}</strong>
                          <span className={`direction-pill direction-${tradeIdea.direction}`}>{tradeIdea.direction}</span>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>

        <div className="two-column-row">
          <TrendChart tradeIdea={selectedTradeIdea} />

          <article className="panel detail-card">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Selected setup</p>
                <h2>{selectedTradeIdea.setup}</h2>
              </div>
              <span className={`risk-chip risk-${selectedTradeIdea.confluence.eventRisk}`}>{selectedTradeIdea.confluence.eventRisk} risk</span>
            </div>

            <div className="detail-grid">
              <div>
                <span className="label">Ticker</span>
                <strong>{selectedTradeIdea.ticker}</strong>
              </div>
              <div>
                <span className="label">Direction</span>
                <strong className={selectedTradeIdea.direction === "long" ? "text-green" : "text-red"}>{selectedTradeIdea.direction}</strong>
              </div>
              <div>
                <span className="label">FVG</span>
                <strong>{selectedTradeIdea.confluence.fairValueGap ? "Present" : "None"}</strong>
              </div>
              <div>
                <span className="label">Key level</span>
                <strong>{selectedTradeIdea.confluence.nearKeyLevel ? "Near" : "Not near"}</strong>
              </div>
            </div>

            <p className="setup-copy">{selectedTradeIdea.notes}</p>
          </article>
        </div>
      </div>

      <aside className="side-stack">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Catalysts</p>
              <h2>News and events</h2>
            </div>
          </div>
          <div className="event-list">
            {dashboard.events.map((event) => (
              <div key={event.name} className="event-item">
                <strong>{event.name}</strong>
                <span>{event.dateLabel}</span>
                <small className={`event-severity event-${event.severity}`}>{event.severity} risk</small>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Watchlist</p>
              <h2>Symbols</h2>
            </div>
          </div>
          <div className="watchlist-form">
            <input
              type="text"
              placeholder="Add ticker"
              value={watchlistDraft}
              onChange={(event) => onWatchlistDraftChange(event.target.value.toUpperCase())}
            />
            <button type="button" onClick={onAddTicker}>
              Add
            </button>
          </div>
          <div className="watchlist watchlist-editable">
            {watchlist.map((ticker) => (
              <span key={ticker} className="watchlist-pill">
                <span>{ticker}</span>
                <button type="button" aria-label={`Remove ${ticker}`} onClick={() => onRemoveTicker(ticker)}>
                  x
                </button>
              </span>
            ))}
          </div>
        </article>
      </aside>
    </section>
  );
}

function SimulationPage({
  tradeIdeas,
  selectedTradeIdea,
  selectedTradeIdeaId,
  simulation,
  riskAmount,
  onSelectTradeIdea,
  onRiskAmountChange
}: {
  tradeIdeas: TradeIdea[];
  selectedTradeIdea: TradeIdea;
  selectedTradeIdeaId: string;
  simulation: SimulationResponse | null;
  riskAmount: number;
  onSelectTradeIdea: (tradeIdeaId: string) => void;
  onRiskAmountChange: (riskAmount: number) => void;
}) {
  const riskPerShare = Math.abs(selectedTradeIdea.entry - selectedTradeIdea.stop);
  const rewardPerShare = Math.abs(selectedTradeIdea.target - selectedTradeIdea.entry);

  return (
    <section className="page-grid simulation-page">
      <div className="main-stack">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Simulation</p>
              <h2>Trade sizing and risk</h2>
            </div>
          </div>

          <div className="sim-layout">
            <div className="sim-controls">
              <label className="field">
                <span>Selected setup</span>
                <select value={selectedTradeIdeaId} onChange={(event) => onSelectTradeIdea(event.target.value)}>
                  {tradeIdeas.map((tradeIdea) => {
                    const tradeIdeaId = buildTradeIdeaId(tradeIdea);
                    return (
                      <option key={tradeIdeaId} value={tradeIdeaId}>
                        {tradeIdea.ticker} | {tradeIdea.setup} | {tradeIdea.timeframe}
                      </option>
                    );
                  })}
                </select>
              </label>

              <label className="field">
                <span>Risk per trade</span>
                <input
                  type="number"
                  min="25"
                  step="25"
                  value={riskAmount}
                  onChange={(event) => onRiskAmountChange(Number(event.target.value))}
                />
              </label>

              <div className="sim-summary">
                <div>
                  <span className="label">Entry</span>
                  <strong>{formatMoney(selectedTradeIdea.entry)}</strong>
                </div>
                <div>
                  <span className="label">Stop</span>
                  <strong>{formatMoney(selectedTradeIdea.stop)}</strong>
                </div>
                <div>
                  <span className="label">Target</span>
                  <strong>{formatMoney(selectedTradeIdea.target)}</strong>
                </div>
                <div>
                  <span className="label">Setup</span>
                  <strong>{selectedTradeIdea.setup}</strong>
                </div>
              </div>
            </div>

            <div className="sim-results">
              <div className="sim-card">
                <span>Risk per share</span>
                <strong>{formatMoney(riskPerShare)}</strong>
              </div>
              <div className="sim-card">
                <span>Reward per share</span>
                <strong>{formatMoney(rewardPerShare)}</strong>
              </div>
              <div className="sim-card">
                <span>Position size</span>
                <strong>{simulation ? `${simulation.quantity} shares` : "N/A"}</strong>
              </div>
              <div className="sim-card">
                <span>R multiple</span>
                <strong>{simulation ? `${simulation.riskRewardRatio}:1` : "N/A"}</strong>
              </div>
              <div className="sim-card pnl-positive">
                <span>Potential profit</span>
                <strong>{simulation ? formatMoney(simulation.potentialProfit) : "N/A"}</strong>
              </div>
              <div className="sim-card pnl-negative">
                <span>Potential loss</span>
                <strong>{simulation ? formatMoney(simulation.potentialLoss) : "N/A"}</strong>
              </div>
            </div>
          </div>
        </article>

        <TrendChart tradeIdea={selectedTradeIdea} />
      </div>
    </section>
  );
}

function buildCalendarEntries(journal: JournalEntry[]) {
  const sourceDate = new Date(journal[0]?.date ?? new Date().toISOString().slice(0, 10));
  const year = sourceDate.getFullYear();
  const month = sourceDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const cells: Array<{ day: number | null; entry: JournalEntry | null }> = [];
  const entryMap = new Map(journal.map((entry) => [new Date(entry.date).getDate(), entry]));

  for (let index = 0; index < startWeekday; index += 1) {
    cells.push({ day: null, entry: null });
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    cells.push({
      day,
      entry: entryMap.get(day) ?? null
    });
  }

  return {
    monthLabel: firstDay.toLocaleString("en-US", { month: "long", year: "numeric" }),
    cells
  };
}

function JournalPage({ journal }: { journal: JournalEntry[] }) {
  const totalPnl = journal.reduce((sum, entry) => sum + entry.pnl, 0);
  const winningTrades = journal.filter((entry) => entry.pnl > 0).length;
  const losingTrades = journal.filter((entry) => entry.pnl < 0).length;
  const cashDays = journal.filter((entry) => entry.pnl === 0).length;
  const calendar = buildCalendarEntries(journal);

  return (
    <section className="page-grid">
      <div className="main-stack">
        <section className="summary-row">
          <article className="panel summary-card">
            <span className="label">Total PnL</span>
            <strong className={totalPnl >= 0 ? "text-green" : "text-red"}>{formatMoney(totalPnl)}</strong>
          </article>
          <article className="panel summary-card">
            <span className="label">Winning trades</span>
            <strong>{winningTrades}</strong>
          </article>
          <article className="panel summary-card">
            <span className="label">Losing trades</span>
            <strong>{losingTrades}</strong>
          </article>
          <article className="panel summary-card">
            <span className="label">Cash days</span>
            <strong>{cashDays}</strong>
          </article>
        </section>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Trade calendar</p>
              <h2>{calendar.monthLabel}</h2>
            </div>
          </div>

          <div className="calendar-weekdays">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>

          <div className="calendar-grid">
            {calendar.cells.map((cell, index) => (
              <div
                key={`${cell.day ?? "empty"}-${index}`}
                className={`calendar-cell ${cell.entry ? (cell.entry.pnl > 0 ? "calendar-win" : cell.entry.pnl < 0 ? "calendar-loss" : "calendar-flat") : "calendar-empty"}`}
              >
                {cell.day ? (
                  <>
                    <span className="calendar-day">{cell.day}</span>
                    {cell.entry ? (
                      <>
                        <strong>{cell.entry.ticker}</strong>
                        <small>{cell.entry.pnl === 0 ? "Cash" : formatMoney(cell.entry.pnl)}</small>
                      </>
                    ) : (
                      <small className="muted">No entry</small>
                    )}
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </article>
      </div>

      <aside className="side-stack">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Journal log</p>
              <h2>Past trades</h2>
            </div>
          </div>
          <div className="journal-list">
            {journal.map((entry) => (
              <div key={`${entry.date}-${entry.ticker}`} className="journal-item">
                <div className="journal-topline">
                  <strong>{entry.ticker}</strong>
                  <span>{entry.date}</span>
                </div>
                <p>{entry.notes}</p>
                <small className={entry.pnl > 0 ? "text-green" : entry.pnl < 0 ? "text-red" : "muted"}>
                  {entry.pnl === 0 ? "No trade taken" : `PnL ${formatMoney(entry.pnl)}`}
                </small>
              </div>
            ))}
          </div>
        </article>
      </aside>
    </section>
  );
}

export default function App() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [selectedTradeIdeaId, setSelectedTradeIdeaId] = useState("");
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [riskAmount, setRiskAmount] = useState(250);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [watchlistDraft, setWatchlistDraft] = useState("");
  const [page, setPage] = useState<AppPage>(() => getPageFromHash(window.location.hash));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchDashboard();
        setDashboard(data);
        setWatchlist(data.watchlist);
        if (data.tradeIdeas.length > 0) {
          setSelectedTradeIdeaId(buildTradeIdeaId(data.tradeIdeas[0]));
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  useEffect(() => {
    function onHashChange() {
      setPage(getPageFromHash(window.location.hash));
    }

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const selectedTradeIdea = useMemo(() => {
    if (!dashboard || dashboard.tradeIdeas.length === 0) {
      return null;
    }

    return dashboard.tradeIdeas.find((tradeIdea) => buildTradeIdeaId(tradeIdea) === selectedTradeIdeaId) ?? dashboard.tradeIdeas[0];
  }, [dashboard, selectedTradeIdeaId]);

  useEffect(() => {
    async function simulate() {
      if (!selectedTradeIdea) {
        return;
      }

      const result = await runSimulation({
        entry: selectedTradeIdea.entry,
        stop: selectedTradeIdea.stop,
        target: selectedTradeIdea.target,
        riskAmount
      });
      setSimulation(result);
    }

    void simulate();
  }, [selectedTradeIdea, riskAmount]);

  async function handleAddTicker() {
    const ticker = watchlistDraft.trim().toUpperCase();
    if (!ticker || watchlist.includes(ticker)) {
      setWatchlistDraft("");
      return;
    }

    try {
      const response = await addWatchlistTicker(ticker);
      setWatchlist(response.symbols);
    } catch {
      setWatchlist((current) => [...current, ticker]);
    }

    setWatchlistDraft("");
  }

  async function handleRemoveTicker(ticker: string) {
    try {
      const response = await removeWatchlistTicker(ticker);
      setWatchlist(response.symbols);
    } catch {
      setWatchlist((current) => current.filter((currentTicker) => currentTicker !== ticker));
    }
  }

  if (loading) {
    return <main className="app-shell loading-state">Loading StratifyX...</main>;
  }

  if (error || !dashboard || !selectedTradeIdea) {
    return <main className="app-shell loading-state">Unable to load the dashboard: {error || "Missing data"}</main>;
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">StratifyX</p>
          <h1>{PAGE_TITLES[page]}</h1>
          <p className="hero-copy">Focused pages for scanning, simulation, and journal review.</p>
        </div>

        <nav className="page-nav" aria-label="Primary">
          {(Object.keys(PAGE_TITLES) as AppPage[]).map((navPage) => (
            <a key={navPage} href={`#${navPage}`} className={page === navPage ? "nav-link nav-link-active" : "nav-link"}>
              {PAGE_TITLES[navPage]}
            </a>
          ))}
        </nav>
      </header>

      <section className="hero">
        <article className="hero-copy-block">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Active trade plan</p>
              <h2 className="hero-title">
                {selectedTradeIdea.ticker} {selectedTradeIdea.setup}
              </h2>
            </div>
            <div className={`grade-badge grade-${selectedTradeIdea.grade.toLowerCase().replace("+", "plus")}`}>{selectedTradeIdea.grade}</div>
          </div>
          <p className="hero-copy">{selectedTradeIdea.notes}</p>
          <div className="hero-plan-strip">
            <span>{selectedTradeIdea.timeframe}</span>
            <span>Entry {formatMoney(selectedTradeIdea.entry)}</span>
            <span>Stop {formatMoney(selectedTradeIdea.stop)}</span>
            <span>Target {formatMoney(selectedTradeIdea.target)}</span>
          </div>
        </article>

        <ScannerStatus marketSummary={dashboard.marketSummary} stayInCash={dashboard.stayInCash} marketBias={dashboard.marketBias} />
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <p className="eyebrow">Bias</p>
          <strong>{dashboard.marketBias}</strong>
        </article>
        <article className="stat-card">
          <p className="eyebrow">Setups</p>
          <strong>{dashboard.tradeIdeas.length}</strong>
        </article>
        <article className="stat-card">
          <p className="eyebrow">Best grade</p>
          <strong>{dashboard.tradeIdeas[0]?.grade ?? "N/A"}</strong>
        </article>
        <article className="stat-card">
          <p className="eyebrow">Watchlist</p>
          <strong>{watchlist.length}</strong>
        </article>
      </section>

      {page === "scanner" ? (
        <ScannerPage
          dashboard={dashboard}
          selectedTradeIdea={selectedTradeIdea}
          selectedTradeIdeaId={selectedTradeIdeaId}
          watchlist={watchlist}
          watchlistDraft={watchlistDraft}
          onSelectTradeIdea={setSelectedTradeIdeaId}
          onWatchlistDraftChange={setWatchlistDraft}
          onAddTicker={handleAddTicker}
          onRemoveTicker={handleRemoveTicker}
        />
      ) : null}

      {page === "simulation" ? (
        <SimulationPage
          tradeIdeas={dashboard.tradeIdeas}
          selectedTradeIdea={selectedTradeIdea}
          selectedTradeIdeaId={selectedTradeIdeaId}
          simulation={simulation}
          riskAmount={riskAmount}
          onSelectTradeIdea={setSelectedTradeIdeaId}
          onRiskAmountChange={setRiskAmount}
        />
      ) : null}

      {page === "journal" ? <JournalPage journal={dashboard.journal} /> : null}
    </main>
  );
}
