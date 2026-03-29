INSERT INTO users (email, display_name)
VALUES ('demo@stratifyx.local', 'Demo Trader');

INSERT INTO market_events (event_type, event_name, starts_at, severity, notes)
VALUES
  ('macro', 'CPI', NOW() + INTERVAL '1 day', 'high', 'High-volatility macro release'),
  ('macro', 'FOMC Minutes', NOW() + INTERVAL '3 days', 'high', 'Expect headline sensitivity'),
  ('market', 'OPEX', NOW() + INTERVAL '5 days', 'medium', 'Potential options-related pinning');
