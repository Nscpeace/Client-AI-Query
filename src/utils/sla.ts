export interface SlaStatusResult {
  text: string;
  isOverdue: boolean;
  isWarning: boolean;
  daysOverdue: number;
  hoursLeft: number;
  minutesLeft: number;
  severityClass: string;
  badgeBg: string;
}

/**
 * Returns a human-friendly SLA status string:
 * e.g. "Overdue by 2 weeks", "Overdue by 8 days", "Overdue by 3 days", "35m left", "2h left"
 */
export function formatSlaStatus(deadlineStr: string): SlaStatusResult {
  const deadline = new Date(deadlineStr).getTime();
  const now = Date.now();
  const diffMs = deadline - now;
  const isOverdue = diffMs < 0;
  const absDiffMs = Math.abs(diffMs);

  const minutes = Math.floor(absDiffMs / (1000 * 60));
  const hours = Math.floor(absDiffMs / (1000 * 60 * 60));
  const days = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);

  if (isOverdue) {
    let text = '';
    let severityClass = '';
    let badgeBg = '';

    if (days >= 14) {
      const displayWeeks = Math.round(days / 7);
      text = `Overdue by ${displayWeeks} weeks`;
      severityClass = 'text-red-900 bg-red-100 border-red-300 font-bold';
      badgeBg = 'bg-red-600 text-white';
    } else if (days >= 7) {
      text = `Overdue by ${days} days`;
      severityClass = 'text-red-800 bg-red-100 border-red-200 font-semibold';
      badgeBg = 'bg-red-500 text-white';
    } else if (days >= 1) {
      text = `Overdue by ${days} ${days === 1 ? 'day' : 'days'}`;
      severityClass = 'text-red-700 bg-red-50 border-red-200 font-semibold';
      badgeBg = 'bg-red-500 text-white';
    } else if (hours >= 1) {
      text = `Overdue by ${hours}h`;
      severityClass = 'text-rose-700 bg-rose-50 border-rose-200 font-semibold';
      badgeBg = 'bg-rose-500 text-white';
    } else {
      text = `Overdue by ${minutes}m`;
      severityClass = 'text-rose-700 bg-rose-50 border-rose-200 font-semibold';
      badgeBg = 'bg-rose-500 text-white';
    }

    return {
      text,
      isOverdue: true,
      isWarning: true,
      daysOverdue: days,
      hoursLeft: 0,
      minutesLeft: 0,
      severityClass,
      badgeBg,
    };
  } else {
    let text = '';
    let severityClass = '';
    let badgeBg = '';

    if (hours >= 24) {
      text = `${days}d left`;
      severityClass = 'text-slate-700 bg-slate-50 border-slate-200 font-medium';
      badgeBg = 'bg-slate-500 text-white';
    } else if (hours >= 1) {
      text = `${hours}h left`;
      severityClass = hours <= 2 
        ? 'text-amber-800 bg-amber-50 border-amber-200 font-semibold' 
        : 'text-slate-700 bg-slate-50 border-slate-200 font-medium';
      badgeBg = hours <= 2 ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white';
    } else {
      text = `${minutes}m left`;
      severityClass = 'text-amber-900 bg-amber-100 border-amber-300 font-bold animate-pulse';
      badgeBg = 'bg-amber-600 text-white';
    }

    return {
      text,
      isOverdue: false,
      isWarning: hours < 2,
      daysOverdue: 0,
      hoursLeft: hours,
      minutesLeft: minutes,
      severityClass,
      badgeBg,
    };
  }
}
