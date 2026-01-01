import { addMinutes, isPast, isFuture } from 'date-fns';

export function getEventEndTime(startTime: Date, durationMinutes: number): Date {
  return addMinutes(startTime, durationMinutes);
}

export function isEventActive(startTime: Date, durationMinutes: number): boolean {
  const now = new Date();
  const endTime = getEventEndTime(startTime, durationMinutes);
  return isPast(startTime) && isFuture(endTime);
}

export function hasEventEnded(startTime: Date, durationMinutes: number): boolean {
  const endTime = getEventEndTime(startTime, durationMinutes);
  return isPast(endTime);
}

export function isEventUpcoming(startTime: Date): boolean {
  return isFuture(startTime);
}
