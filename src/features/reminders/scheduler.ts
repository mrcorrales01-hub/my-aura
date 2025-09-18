export interface ReminderData {
  type: 'checkin' | 'exercise' | 'visit';
  body: string;
  localTime: string;
  weekdays: number[];
}

export function scheduleLocal(reminder: ReminderData) {
  // Store next trigger timestamp in localStorage
  try {
    const nextTrigger = calculateNextTrigger(reminder);
    if (nextTrigger) {
      localStorage.setItem(`aura.reminder.${reminder.type}`, nextTrigger.toISOString());
    }
  } catch {}

  // Show notification if supported
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  
  navigator.serviceWorker?.ready.then(reg => {
    reg.showNotification("My Aura", { 
      body: reminder.body || "Dags för din check-in ✨",
      icon: "/placeholder.svg",
      badge: "/placeholder.svg"
    });
  }).catch(() => {});
}

export function requestPermission(): boolean {
  if (!("Notification" in window)) return false;
  
  if (Notification.permission === "default") {
    Notification.requestPermission().then(() => {});
  }
  
  return Notification.permission === "granted";
}

export function checkPendingReminders() {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  
  const now = new Date();
  const types = ['checkin', 'exercise', 'visit'] as const;
  
  for (const type of types) {
    try {
      const stored = localStorage.getItem(`aura.reminder.${type}`);
      if (!stored) continue;
      
      const triggerTime = new Date(stored);
      const diffMinutes = (now.getTime() - triggerTime.getTime()) / (1000 * 60);
      
      // Show notification if within 2 minutes of trigger time
      if (Math.abs(diffMinutes) <= 2) {
        const bodies = {
          checkin: "Dags för din dagliga check-in ✨",
          exercise: "Tid för en kort övning 🧘",
          visit: "Kom ihåg att förbereda ditt besök 📋"
        };
        
        scheduleLocal({
          type,
          body: bodies[type],
          localTime: '',
          weekdays: []
        });
        
        // Clear the trigger to avoid repeated notifications
        localStorage.removeItem(`aura.reminder.${type}`);
      }
    } catch {}
  }
}

function calculateNextTrigger(reminder: ReminderData): Date | null {
  try {
    const now = new Date();
    const [hours, minutes] = reminder.localTime.split(':').map(Number);
    
    // Find next occurrence
    for (let days = 0; days < 7; days++) {
      const candidate = new Date(now);
      candidate.setDate(candidate.getDate() + days);
      candidate.setHours(hours, minutes, 0, 0);
      
      const weekday = candidate.getDay() || 7; // Convert Sunday from 0 to 7
      
      if (reminder.weekdays.includes(weekday) && candidate > now) {
        return candidate;
      }
    }
  } catch {}
  
  return null;
}