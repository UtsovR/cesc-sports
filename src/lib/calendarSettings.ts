export interface CalendarSettings {
    id: number;
    fy_label: string;
    updated_at?: string | null;
}

export const DEFAULT_CALENDAR_FY_LABEL = 'FY 25-26';

export const normalizeCalendarFyLabel = (fyLabel?: string | null) => {
    const trimmedLabel = fyLabel?.trim();
    return trimmedLabel ? trimmedLabel : DEFAULT_CALENDAR_FY_LABEL;
};
