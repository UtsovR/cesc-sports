export const EVENT_TIME_COLUMN_MISSING_MESSAGE = "Could not find the 'event_time' column of 'calendar_events' in the schema cache";

type CalendarEventTimeShape = {
    event_date: string;
    event_time?: string | null;
    updated_at?: string | null;
};

const normalizeTime = (time?: string | null) => {
    if (!time) {
        return null;
    }

    const match = time.match(/^(\d{2}):(\d{2})/);
    if (!match) {
        return null;
    }

    return `${match[1]}:${match[2]}`;
};

export const buildCalendarFallbackUpdatedAt = (eventDate: string, eventTime: string) => {
    const normalizedTime = normalizeTime(eventTime);
    return normalizedTime ? `${eventDate}T${normalizedTime}:00Z` : new Date().toISOString();
};

export const deriveCalendarEventTime = ({ event_date, event_time, updated_at }: CalendarEventTimeShape) => {
    const normalizedDirectTime = normalizeTime(event_time);
    if (normalizedDirectTime) {
        return normalizedDirectTime;
    }

    if (!updated_at) {
        return null;
    }

    const [datePart, timePart = ''] = updated_at.split('T');
    if (datePart !== event_date) {
        return null;
    }

    return normalizeTime(timePart);
};

export const normalizeCalendarEvent = <T extends CalendarEventTimeShape>(event: T): T => {
    const derivedTime = deriveCalendarEventTime(event);

    if (!derivedTime || event.event_time === derivedTime) {
        return event;
    }

    return {
        ...event,
        event_time: derivedTime
    };
};

export const isCalendarEventTimeColumnMissingError = (error: unknown) =>
    error instanceof Error
        ? error.message.includes(EVENT_TIME_COLUMN_MISSING_MESSAGE)
        : String(error || '').includes(EVENT_TIME_COLUMN_MISSING_MESSAGE);
