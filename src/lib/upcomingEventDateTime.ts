const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TWENTY_FOUR_HOUR_TIME_PATTERN = /^(\d{1,2}):(\d{2})(?::\d{2})?$/;
const TWELVE_HOUR_TIME_PATTERN = /^(\d{1,2})(?::(\d{2}))?\s*([AP]M)$/i;

const padTwoDigits = (value: number) => String(value).padStart(2, '0');

export const normalizeUpcomingEventDateValue = (dateValue: string) => {
    const trimmedDate = dateValue.trim();

    if (!trimmedDate) {
        return '';
    }

    if (ISO_DATE_PATTERN.test(trimmedDate)) {
        return trimmedDate;
    }

    const parsedDate = new Date(trimmedDate);
    if (Number.isNaN(parsedDate.getTime())) {
        return '';
    }

    return [
        parsedDate.getFullYear(),
        padTwoDigits(parsedDate.getMonth() + 1),
        padTwoDigits(parsedDate.getDate())
    ].join('-');
};

export const normalizeUpcomingEventTimeValue = (timeValue: string) => {
    const trimmedTime = timeValue.trim();

    if (!trimmedTime) {
        return '';
    }

    const twentyFourHourMatch = trimmedTime.match(TWENTY_FOUR_HOUR_TIME_PATTERN);
    if (twentyFourHourMatch) {
        const hours = Number(twentyFourHourMatch[1]);
        const minutes = Number(twentyFourHourMatch[2]);

        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
            return `${padTwoDigits(hours)}:${padTwoDigits(minutes)}`;
        }
    }

    const twelveHourMatch = trimmedTime.match(TWELVE_HOUR_TIME_PATTERN);
    if (!twelveHourMatch) {
        return '';
    }

    const rawHours = Number(twelveHourMatch[1]);
    const rawMinutes = Number(twelveHourMatch[2] ?? '0');

    if (rawHours < 1 || rawHours > 12 || rawMinutes < 0 || rawMinutes > 59) {
        return '';
    }

    const meridiem = twelveHourMatch[3].toUpperCase();
    let normalizedHours = rawHours % 12;

    if (meridiem === 'PM') {
        normalizedHours += 12;
    }

    return `${padTwoDigits(normalizedHours)}:${padTwoDigits(rawMinutes)}`;
};

export const formatUpcomingEventDateValue = (dateValue: string) => {
    const normalizedDate = normalizeUpcomingEventDateValue(dateValue);
    if (!normalizedDate) {
        return dateValue;
    }

    return new Date(`${normalizedDate}T00:00:00`).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

export const formatUpcomingEventTimeValue = (timeValue: string) => {
    const normalizedTime = normalizeUpcomingEventTimeValue(timeValue);
    if (!normalizedTime) {
        return timeValue;
    }

    const [hours, minutes] = normalizedTime.split(':').map(Number);
    const timeReference = new Date();
    timeReference.setHours(hours, minutes, 0, 0);

    return timeReference.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};
