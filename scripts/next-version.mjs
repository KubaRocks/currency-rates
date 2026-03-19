function normalizeVersion(value) {
  return value.trim();
}

function getTodayVersionPrefix(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `v${year}.${month}.${day}`;
}

function getNextVersionFromVersions(versions, date = new Date()) {
  const todayPrefix = getTodayVersionPrefix(date);
  const todaysVersions = versions
    .map(normalizeVersion)
    .filter((version) => version === todayPrefix || version.startsWith(`${todayPrefix}.`));

  if (todaysVersions.length === 0) {
    return todayPrefix;
  }

  let highestReleaseNumber = 1;

  for (const version of todaysVersions) {
    if (version === todayPrefix) {
      highestReleaseNumber = Math.max(highestReleaseNumber, 1);
      continue;
    }

    const suffix = Number(version.slice(todayPrefix.length + 1));

    if (Number.isFinite(suffix)) {
      highestReleaseNumber = Math.max(highestReleaseNumber, suffix);
    }
  }

  if (highestReleaseNumber === 1) {
    return `${todayPrefix}.2`;
  }

  return `${todayPrefix}.${highestReleaseNumber + 1}`;
}

const versions = process.argv.slice(2);

process.stdout.write(getNextVersionFromVersions(versions));
