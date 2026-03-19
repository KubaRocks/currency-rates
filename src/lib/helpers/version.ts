import { readFile } from 'node:fs/promises';
import path from 'node:path';
import dayjs from 'dayjs';

const VERSION_PATTERN = /^v\d{4}\.\d{2}\.\d{2}(?:\.\d+)?$/;

export function normalizeVersion(value: string): string {
  return value.trim();
}

export function getTodayVersionPrefix(date: Date = new Date()): string {
  return `v${dayjs(date).format('YYYY.MM.DD')}`;
}

export function getNextVersion(currentVersion: string | null | undefined, date: Date = new Date()): string {
  const todayPrefix = getTodayVersionPrefix(date);
  const normalizedCurrentVersion = currentVersion ? normalizeVersion(currentVersion) : '';

  if (!normalizedCurrentVersion.startsWith(todayPrefix)) {
    return todayPrefix;
  }

  const suffix = normalizedCurrentVersion.slice(todayPrefix.length + 1);

  if (!suffix) {
    return `${todayPrefix}.2`;
  }

  const releaseNumber = Number(suffix);

  if (!Number.isFinite(releaseNumber) || releaseNumber < 2) {
    return `${todayPrefix}.2`;
  }

  return `${todayPrefix}.${releaseNumber + 1}`;
}

export function getNextVersionFromVersions(versions: string[], date: Date = new Date()): string {
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

export async function readVersionFile(filePath: string = path.join(process.cwd(), 'VERSION')): Promise<string> {
  const version = normalizeVersion(await readFile(filePath, 'utf8'));

  if (!VERSION_PATTERN.test(version)) {
    throw new Error(`Invalid VERSION value: ${version}`);
  }

  return version;
}
