import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const OPENING_HOURS = {
    sunday: { isOpen: false },
    monday: { isOpen: false },
    tuesday: { isOpen: true, start: "10:00", end: "18:00" },
    wednesday: { isOpen: true, start: "10:00", end: "18:00" },
    thursday: { isOpen: true, start: "10:00", end: "18:00" },
    friday: { isOpen: true, start: "10:00", end: "18:00" },
    saturday: { isOpen: true, start: "10:00", end: "18:00" },
} as const;

export function isWithinBusinessHours(date: Date, time: string) {
    const dayOfWeek = date.getDay();
    const dayName = Object.keys(OPENING_HOURS)[
        dayOfWeek
    ] as keyof typeof OPENING_HOURS;
    const daySchedule = OPENING_HOURS[dayName];

    if (!daySchedule.isOpen) return false;

    const [hours, minutes] = time.split(":").map(Number);
    const [startHours, startMinutes] = daySchedule.start.split(":").map(Number);
    const [endHours, endMinutes] = daySchedule.end.split(":").map(Number);

    const timeInMinutes = hours * 60 + minutes;
    const startInMinutes = startHours * 60 + startMinutes;
    const endInMinutes = endHours * 60 + endMinutes;

    return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
}

export function generateTimeSlots(date: Date, interval = 15) {
    const dayOfWeek = date.getDay();
    const dayName = Object.keys(OPENING_HOURS)[
        dayOfWeek
    ] as keyof typeof OPENING_HOURS;
    const daySchedule = OPENING_HOURS[dayName];

    if (!daySchedule.isOpen) return [];

    const slots: string[] = [];
    let [h, m] = daySchedule.start.split(":").map(Number);
    const [endH, endM] = daySchedule.end.split(":").map(Number);

    while (h < endH || (h === endH && m < endM)) {
        const slot = `${String(h).padStart(2, "0")}:${String(m).padStart(
            2,
            "0"
        )}`;
        slots.push(slot);
        m += interval;
        if (m >= 60) {
            h++;
            m = m % 60;
        }
    }

    return slots;
}
