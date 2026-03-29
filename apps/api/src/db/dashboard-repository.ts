import type { JournalEntry } from "../types.js";
import { getPool, hasDatabaseConfig } from "./client.js";

const DEMO_EMAIL = "demo@stratifyx.local";
const DEMO_NAME = "Demo Trader";
const DEFAULT_WATCHLIST = "Core Growth";

async function ensureDemoContext() {
  const pool = getPool();

  const userResult = await pool.query<{ id: string }>(
    `
      insert into users (email, display_name)
      values ($1, $2)
      on conflict (email) do update
      set display_name = excluded.display_name
      returning id
    `,
    [DEMO_EMAIL, DEMO_NAME]
  );

  const userId = userResult.rows[0].id;

  const existingWatchlist = await pool.query<{ id: string }>(
    `
      select id
      from watchlists
      where user_id = $1 and is_default = true
      order by created_at asc
      limit 1
    `,
      [userId]
  );

  if (existingWatchlist.rows[0]?.id) {
    return {
      userId,
      watchlistId: existingWatchlist.rows[0].id
    };
  }

  const watchlistResult = await pool.query<{ id: string }>(
    `
      insert into watchlists (user_id, name, is_default)
      values ($1, $2, true)
      returning id
    `,
    [userId, DEFAULT_WATCHLIST]
  );

  return {
    userId,
    watchlistId: watchlistResult.rows[0].id
  };
}

export async function getDefaultWatchlistSymbols(): Promise<string[] | null> {
  if (!hasDatabaseConfig()) {
    return null;
  }

  try {
    const context = await ensureDemoContext();
    const pool = getPool();
    const result = await pool.query<{ symbol: string }>(
      `
        select symbol
        from watchlist_symbols
        where watchlist_id = $1
        order by created_at asc
      `,
      [context.watchlistId]
    );

    return result.rows.map((row: { symbol: string }) => row.symbol);
  } catch {
    return null;
  }
}

export async function addDefaultWatchlistSymbol(symbol: string): Promise<string[] | null> {
  if (!hasDatabaseConfig()) {
    return null;
  }

  try {
    const context = await ensureDemoContext();
    const pool = getPool();

    await pool.query(
      `
        insert into watchlist_symbols (watchlist_id, symbol)
        values ($1, $2)
        on conflict (watchlist_id, symbol) do nothing
      `,
      [context.watchlistId, symbol.toUpperCase()]
    );

    return getDefaultWatchlistSymbols();
  } catch {
    return null;
  }
}

export async function removeDefaultWatchlistSymbol(symbol: string): Promise<string[] | null> {
  if (!hasDatabaseConfig()) {
    return null;
  }

  try {
    const context = await ensureDemoContext();
    const pool = getPool();

    await pool.query(
      `
        delete from watchlist_symbols
        where watchlist_id = $1 and symbol = $2
      `,
      [context.watchlistId, symbol.toUpperCase()]
    );

    return getDefaultWatchlistSymbols();
  } catch {
    return null;
  }
}

export async function getJournalEntries(limit = 20): Promise<JournalEntry[] | null> {
  if (!hasDatabaseConfig()) {
    return null;
  }

  try {
    const context = await ensureDemoContext();
    const pool = getPool();

    const result = await pool.query<{
      entry_date: string;
      notes: string;
      pnl: string | null;
      symbol: string | null;
    }>(
      `
        select
          j.entry_date,
          j.notes,
          t.pnl,
          t.symbol
        from journal_entries j
        left join trades t on t.id = j.trade_id
        where j.user_id = $1
        order by j.entry_date desc, j.created_at desc
        limit $2
      `,
      [context.userId, limit]
    );

    return result.rows.map((row: { entry_date: string; notes: string; pnl: string | null; symbol: string | null }) => ({
      date: row.entry_date,
      ticker: row.symbol ?? "CASH",
      notes: row.notes,
      pnl: Number(row.pnl ?? 0)
    }));
  } catch {
    return null;
  }
}
