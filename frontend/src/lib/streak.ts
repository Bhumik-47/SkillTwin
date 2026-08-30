/**
 * SkillTwin Calendar & Weekly Study Streak Engine
 * Accurately synchronizes the 7-day weekly streak with real calendar days (Monday - Sunday).
 */

export interface WeekDayStreak {
  dayName: string;       // 'Mon', 'Tue', 'Wed', etc.
  shortLetter: string;   // 'M', 'T', 'W', 'T', 'F', 'S', 'S'
  dayNumber: number;     // e.g. 30
  dateString: string;    // 'YYYY-MM-DD'
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  isActive: boolean;     // Has verified quiz attempt on this calendar day
}

export interface StreakCalculation {
  days: WeekDayStreak[];
  consecutiveStreakDays: number;
  activeDaysThisWeek: number;
  isTodayActive: boolean;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SHORT_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function computeWeeklyStreak(attemptsHistory: any[] = []): StreakCalculation {
  const now = new Date();
  const todayStr = formatLocalDate(now);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Extract set of dates with verified quiz/assessment activity
  const activeDateSet = new Set<string>();

  if (Array.isArray(attemptsHistory)) {
    attemptsHistory.forEach(att => {
      if (att?.timestamp) {
        try {
          const dt = new Date(att.timestamp);
          if (!isNaN(dt.getTime())) {
            activeDateSet.add(formatLocalDate(dt));
          }
        } catch {
          // Ignore invalid timestamps
        }
      }
    });
  }

  // Calculate Monday of the current calendar week
  // getDay(): 0 is Sunday, 1 is Monday, 2 is Tuesday, ..., 6 is Saturday
  const currentDayOfWeek = now.getDay();
  const distanceToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

  const mondayDate = new Date(todayStart);
  mondayDate.setDate(todayStart.getDate() - distanceToMonday);

  // Generate 7 days: Monday through Sunday
  const days: WeekDayStreak[] = [];
  let activeDaysThisWeek = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);

    const dateString = formatLocalDate(d);
    const isToday = dateString === todayStr;
    const isPast = d.getTime() < todayStart.getTime();
    const isFuture = d.getTime() > todayStart.getTime();
    const isActive = activeDateSet.has(dateString);

    if (isActive) {
      activeDaysThisWeek++;
    }

    days.push({
      dayName: DAY_NAMES[i],
      shortLetter: SHORT_LETTERS[i],
      dayNumber: d.getDate(),
      dateString,
      isToday,
      isPast,
      isFuture,
      isActive
    });
  }

  // Compute consecutive streak ending today or yesterday
  let consecutiveStreakDays = 0;
  const isTodayActive = activeDateSet.has(todayStr);

  const checkDate = new Date(todayStart);

  if (isTodayActive) {
    consecutiveStreakDays++;
    checkDate.setDate(checkDate.getDate() - 1);
    while (activeDateSet.has(formatLocalDate(checkDate))) {
      consecutiveStreakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else {
    // Check if streak was active yesterday (user hasn't practiced yet today)
    checkDate.setDate(checkDate.getDate() - 1);
    while (activeDateSet.has(formatLocalDate(checkDate))) {
      consecutiveStreakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  return {
    days,
    consecutiveStreakDays,
    activeDaysThisWeek,
    isTodayActive
  };
}
