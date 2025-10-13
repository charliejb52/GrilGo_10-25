import {
  format,
  parse,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameDay,
  parseISO,
  addDays,
} from 'date-fns';
import { formatInTimeZone, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

export function getCalendarDays(date: Date, timezone: string = 'America/New_York') {
  const start = startOfWeek(startOfMonth(date));
  const end = endOfWeek(endOfMonth(date));
  
  return eachDayOfInterval({ start, end });
}

export function formatDate(date: Date | string, formatStr: string, timezone?: string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (timezone) {
    return formatInTimeZone(dateObj, timezone, formatStr);
  }
  
  return format(dateObj, formatStr);
}

export function parseDate(dateStr: string, formatStr: string, timezone?: string): Date {
  if (timezone) {
    const parsed = parse(dateStr, formatStr, new Date());
    return zonedTimeToUtc(parsed, timezone);
  }
  
  return parse(dateStr, formatStr, new Date());
}

export function toTimezone(date: Date | string, timezone: string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return utcToZonedTime(dateObj, timezone);
}

export function fromTimezone(date: Date, timezone: string): Date {
  return zonedTimeToUtc(date, timezone);
}

export { 
  startOfMonth, 
  endOfMonth, 
  isSameMonth, 
  isToday, 
  addMonths, 
  subMonths,
  isSameDay,
  parseISO,
  addDays,
};

