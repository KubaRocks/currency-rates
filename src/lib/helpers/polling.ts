interface StartPollingOptions {
  refreshRates: () => void | Promise<void>;
  refreshVersion: () => void | Promise<void>;
  ratesIntervalMs: number;
  versionIntervalMs: number;
}

export function startPolling({
  refreshRates,
  refreshVersion,
  ratesIntervalMs,
  versionIntervalMs,
}: StartPollingOptions) {
  const scheduler = globalThis;

  void refreshRates();
  void refreshVersion();

  const ratesIntervalId = scheduler.setInterval(() => {
    void refreshRates();
  }, ratesIntervalMs);

  const versionIntervalId = scheduler.setInterval(() => {
    void refreshVersion();
  }, versionIntervalMs);

  return () => {
    scheduler.clearInterval(ratesIntervalId);
    scheduler.clearInterval(versionIntervalId);
  };
}
