type HistoryLike = {
  date: string;
  duration: string;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseHistoryDate(input: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.trim());
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
    return null;
  }

  return parsed;
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfCurrentWeek(now: Date): Date {
  const start = startOfDay(now);
  const jsDay = start.getDay();
  const mondayOffset = (jsDay + 6) % 7;
  start.setDate(start.getDate() - mondayOffset);
  return start;
}

export function parseDurationToSeconds(input: string): number {
  const value = input.trim();
  if (!value) {
    return 0;
  }

  // Backward compatibility: treat plain integer values as minutes.
  if (/^\d+$/.test(value)) {
    return Number(value) * 60;
  }

  const parts = value.split(':').map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part) || part < 0)) {
    return 0;
  }

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  return 0;
}

export function getTotalWorkoutMinutes(history: HistoryLike[]): number {
  const totalSeconds = history.reduce((sum, item) => sum + parseDurationToSeconds(item.duration), 0);
  return Math.round(totalSeconds / 60);
}

export function getAverageWorkoutMinutes(history: HistoryLike[]): number {
  if (history.length === 0) {
    return 0;
  }

  return Math.round(getTotalWorkoutMinutes(history) / history.length);
}

export function getWeeklyCompletedWorkouts(history: HistoryLike[], now: Date = new Date()): number {
  const weekStart = startOfCurrentWeek(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  return history.reduce((count, item) => {
    const date = parseHistoryDate(item.date);
    if (!date) {
      return count;
    }

    if (date >= weekStart && date < weekEnd) {
      return count + 1;
    }

    return count;
  }, 0);
}

export function getWorkoutStreakDays(history: HistoryLike[], now: Date = new Date()): number {
  if (history.length === 0) {
    return 0;
  }

  const today = startOfDay(now);
  const uniqueDates = new Set<number>();

  for (const item of history) {
    const parsed = parseHistoryDate(item.date);
    if (!parsed) {
      continue;
    }

    const day = startOfDay(parsed);
    if (day <= today) {
      uniqueDates.add(day.getTime());
    }
  }

  if (uniqueDates.size === 0) {
    return 0;
  }

  const latest = Math.max(...uniqueDates);
  let cursor = new Date(latest);
  let streak = 0;

  while (uniqueDates.has(cursor.getTime())) {
    streak += 1;
    cursor = new Date(cursor.getTime() - MS_PER_DAY);
  }

  return streak;
}

export function getCompletedWeekdayIndexesForCurrentWeek(history: HistoryLike[], now: Date = new Date()): Set<number> {
  const weekStart = startOfCurrentWeek(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const indexes = new Set<number>();

  for (const item of history) {
    const date = parseHistoryDate(item.date);
    if (!date || date < weekStart || date >= weekEnd) {
      continue;
    }

    const dayOffset = Math.floor((startOfDay(date).getTime() - weekStart.getTime()) / MS_PER_DAY);
    if (dayOffset >= 0 && dayOffset <= 6) {
      indexes.add(dayOffset);
    }
  }

  return indexes;
}
