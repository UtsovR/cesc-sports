import { type ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { LogOut, Users, MessageSquare, Search } from 'lucide-react';
import BackButton from './BackButton';
import GalleryFolderTree from './admin/GalleryFolderTree';
import { supabase } from '../lib/supabase';
import {
    buildGalleryFolderOptions,
    buildGalleryFolderPathMap,
    hasDuplicateGalleryFolderName,
    normalizeGalleryFolderName,
    type GalleryFolder
} from '../lib/galleryFolders';
import {
    buildCalendarFallbackUpdatedAt,
    isCalendarEventTimeColumnMissingError,
    normalizeCalendarEvent
} from '../lib/calendarEventTime';
import { DEFAULT_CALENDAR_FY_LABEL, normalizeCalendarFyLabel } from '../lib/calendarSettings';
import {
    formatUpcomingEventDateValue,
    formatUpcomingEventTimeValue,
    normalizeUpcomingEventDateValue,
    normalizeUpcomingEventTimeValue
} from '../lib/upcomingEventDateTime';

const INITIAL_EVENTS = [
    { id: -1, sport: 'Tennis', event_name: "CHAIRMAN'S CUP", event_date: '2025-12-01', displayDate: "DEC-JAN'26", event_type: 'Internal' },
    { id: -2, sport: 'Tennis', event_name: "MONSOON CARNIVAL", event_date: '2025-09-01', displayDate: "SEP'25", event_type: 'Internal' },
    { id: -3, sport: 'Cricket', event_name: "9A SIDE INTER DEPT.", event_date: '2026-02-01', displayDate: "FEB'26", event_type: 'Internal' },
    { id: -4, sport: 'Cricket', event_name: "MERCHANTS CUP CCFC", event_date: '2025-04-01', displayDate: "APL'25", event_type: 'External Corporate Tournament' },
    { id: -5, sport: 'Football', event_name: "5A SIDE INTER DEPT.", event_date: '2025-04-01', displayDate: "APL'25", event_type: 'Internal' },
    { id: -6, sport: 'Football', event_name: "MERCHANTS CUP CCFC", event_date: '2025-05-01', displayDate: "MAY'25", event_type: 'External Corporate Tournament' },
    { id: -7, sport: 'Table Tennis', event_name: "INTER DEPARTMENTAL", event_date: '2025-08-01', displayDate: "AUG'25", event_type: 'Internal' },
    { id: -8, sport: 'Table Tennis', event_name: "CORP. TOURN. SATURDAY CLUB", event_date: '2026-01-01', displayDate: "JAN'26", event_type: 'External Corporate Tournament' },
    { id: -9, sport: 'Badminton', event_name: "INTER DEPTARTMENTAL", event_date: '2025-06-01', displayDate: "JUN'25", event_type: 'Internal' },
    { id: -10, sport: 'Badminton', event_name: "LAKE CLUB TOURNAMENT", event_date: '2026-02-01', displayDate: "FEB'26", event_type: 'External Corporate Tournament' },
    { id: -11, sport: 'Athletics', event_name: "FITNESS WORKSHOP", event_date: '2025-10-01', displayDate: "OCT'25", event_type: 'Internal' },
    { id: -12, sport: 'Athletics', event_name: "NATUROPATHY WORKSHOP", event_date: '2026-03-01', displayDate: "MAR'26", event_type: 'Internal' },
    { id: -13, sport: 'Others', event_name: "CULTURAL/QUIZ", event_date: '2025-10-01', displayDate: "OCT'25", event_type: 'Internal' }
];

interface AdminDashboardProps {
    onLogout: () => void;
}

interface Registration {
    id?: number;
    employee_code: string;
    full_name: string;
    location?: string | null;
    organization?: string | null;
    organisation?: string | null;
    email?: string | null;
    department?: string | null;
    designation?: string | null;
    sports_interested: string | string[];
    other_sport?: string | null;
    created_at: string;
}

interface Feedback {
    id: number;
    name?: string | null;
    email?: string | null;
    employee_code?: string | null;
    contact_number?: string | null;
    location?: string | null;
    organization?: string | null;
    organisation?: string | null;
    department?: string | null;
    experience_rating: number;
    feedback_type: string;
    message: string;
    submitted_at: string;
}

type ActiveTab =
    | 'registrations'
    | 'feedback'
    | 'calendar'
    | 'whats-new'
    | 'upcoming-events'
    | 'hall-of-fame'
    | 'gallery-manager'
    | 'pre-gallery'
    | 'about-cms'
    | 'vision-cms';

type IconType = 'Bell' | 'Award' | 'TrendingUp' | 'Users';
type CmsType = 'about' | 'vision';

interface CalendarEvent {
    id: number;
    sport: string;
    event_name: string;
    event_date: string;
    event_type: string;
    event_time?: string | null;
    displayDate?: string;
    updated_at?: string;
}

interface WhatsNewItem {
    id: number;
    title: string;
    description: string;
    icon_type: IconType;
    updated_at: string;
}

interface UpcomingEvent {
    id: number;
    event_name: string;
    event_date: string;
    event_time: string;
    event_venue: string;
    event_image: string | null;
    updated_at?: string;
}

interface HallOfFameEntry {
    id: number;
    event_name: string;
    event_date: string;
    event_venue: string;
    winner_name: string;
    achievement_type: string;
    event_image: string | null;
    updated_at?: string;
}

interface CmsImage {
    id: number;
    image_url: string;
    created_at?: string;
}

interface PreGalleryImage {
    id: number;
    image_url: string;
    display_order: number;
    uploaded_at?: string;
}

interface GalleryCategory {
    id: number;
    name: string;
    created_at?: string;
}

interface GalleryImage {
    id: number;
    image_url: string;
    category_id: number;
    folder_id: number | null;
    uploaded_at?: string;
}

const PRE_GALLERY_SLOTS = [1, 2, 3] as const;
type PreGallerySlot = typeof PRE_GALLERY_SLOTS[number];
const GALLERY_CATEGORY_ORDER = ['cricket', 'football', 'badminton', 'lawn_tennis', 'table_tennis', 'workshops'] as const;

const formatGalleryCategoryLabel = (name: string) => name
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const sortGalleryCategories = <T extends { name: string }>(categories: T[]) => [...categories].sort((first, second) => {
    const firstIndex = GALLERY_CATEGORY_ORDER.indexOf(first.name as typeof GALLERY_CATEGORY_ORDER[number]);
    const secondIndex = GALLERY_CATEGORY_ORDER.indexOf(second.name as typeof GALLERY_CATEGORY_ORDER[number]);
    const normalizedFirstIndex = firstIndex === -1 ? Number.MAX_SAFE_INTEGER : firstIndex;
    const normalizedSecondIndex = secondIndex === -1 ? Number.MAX_SAFE_INTEGER : secondIndex;

    if (normalizedFirstIndex !== normalizedSecondIndex) {
        return normalizedFirstIndex - normalizedSecondIndex;
    }

    return first.name.localeCompare(second.name);
});

const DEFAULT_EVENT: CalendarEvent = { id: 0, event_name: '', sport: '', event_date: '', event_time: '', event_type: 'Internal' };
const DEFAULT_WHATS_NEW: Omit<WhatsNewItem, 'id' | 'updated_at'> = { title: '', description: '', icon_type: 'Bell' };
const DEFAULT_UPCOMING_EVENT: UpcomingEvent = { id: 0, event_name: '', event_date: '', event_time: '', event_venue: '', event_image: '' };
const DEFAULT_HALL_OF_FAME_ENTRY: HallOfFameEntry = {
    id: 0,
    event_name: '',
    event_date: '',
    event_venue: '',
    winner_name: '',
    achievement_type: 'Winner',
    event_image: ''
};
const EMPTY_IMAGE_PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'Unknown error';
const GALLERY_ALLOWED_FILE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png']);

const isAllowedGalleryUploadFile = (file: File) => {
    const normalizedMimeType = file.type.toLowerCase();
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

    return normalizedMimeType === 'image/jpeg'
        || normalizedMimeType === 'image/png'
        || GALLERY_ALLOWED_FILE_EXTENSIONS.has(fileExtension);
};

const formatSportsInterested = (sports: string | string[]) => {
    if (Array.isArray(sports)) {
        return sports.join(', ');
    }

    try {
        const parsedSports = JSON.parse(sports);
        return Array.isArray(parsedSports) ? parsedSports.join(', ') : sports;
    } catch {
        return sports;
    }
};

const getRegistrationOrganisation = (registration: Registration) =>
    registration.organization || registration.organisation || '';

const getFeedbackOrganisation = (feedback: Feedback) =>
    feedback.organization || feedback.organisation || '';

const formatRegistrationSports = (sports: string | string[], otherSport?: string | null) => {
    const formattedSports = formatSportsInterested(sports)
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);

    if (otherSport?.trim()) {
        const otherIndex = formattedSports.findIndex(item => item.toLowerCase() === 'others');
        if (otherIndex >= 0) {
            formattedSports[otherIndex] = `Others (${otherSport.trim()})`;
        } else {
            formattedSports.push(otherSport.trim());
        }
    }

    return formattedSports.join(', ');
};

const escapeCsvValue = (value: string | number | null | undefined) => {
    const normalized = value == null ? '' : String(value);
    return `"${normalized.replace(/"/g, '""')}"`;
};

const createCsvContent = (
    headers: string[],
    rows: Array<Array<string | number | null | undefined>>
) => [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\r\n');

const downloadCsvFile = ({
    headers,
    rows,
    fileBaseName
}: {
    headers: string[];
    rows: Array<Array<string | number | null | undefined>>;
    fileBaseName: string;
}) => {
    const csvContent = createCsvContent(headers, rows);
    const blob = new Blob(['\uFEFF', csvContent], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateSuffix = new Date().toISOString().slice(0, 10);

    link.href = downloadUrl;
    link.download = `${fileBaseName}_${dateSuffix}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
};

const isAnonymousFeedback = (feedback: Feedback) => ![
    feedback.name,
    feedback.email,
    feedback.employee_code,
    feedback.contact_number,
    feedback.location,
    getFeedbackOrganisation(feedback),
    feedback.department
].some(value => value && String(value).trim());

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<ActiveTab>('registrations');
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [whatsNewItems, setWhatsNewItems] = useState<WhatsNewItem[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
    const [hallOfFameEntries, setHallOfFameEntries] = useState<HallOfFameEntry[]>([]);
    const [aboutImages, setAboutImages] = useState<CmsImage[]>([]);
    const [visionImages, setVisionImages] = useState<CmsImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [registrationsError, setRegistrationsError] = useState('');
    const [feedbackError, setFeedbackError] = useState('');
    const [calendarError, setCalendarError] = useState('');
    const [feedbackTypeFilter, setFeedbackTypeFilter] = useState('all');

    // Calendar Form State
    const [isEditingEvent, setIsEditingEvent] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<CalendarEvent>(DEFAULT_EVENT);
    const [calendarFyLabel, setCalendarFyLabel] = useState(DEFAULT_CALENDAR_FY_LABEL);
    const [calendarSettingsMessage, setCalendarSettingsMessage] = useState('');
    const [isSavingCalendarSettings, setIsSavingCalendarSettings] = useState(false);
    const [eventFormMessage, setEventFormMessage] = useState('');

    // What's New State
    const [isAddingWhatsNew, setIsAddingWhatsNew] = useState(false);
    const [editingWhatsNew, setEditingWhatsNew] = useState<number | null>(null);
    const [tempWhatsNew, setTempWhatsNew] = useState<Omit<WhatsNewItem, 'id' | 'updated_at'>>(DEFAULT_WHATS_NEW);
    const [whatsNewMessage, setWhatsNewMessage] = useState('');

    // Upcoming Events Form State
    const [isEditingUpcomingEvent, setIsEditingUpcomingEvent] = useState(false);
    const [currentUpcomingEvent, setCurrentUpcomingEvent] = useState<UpcomingEvent>(DEFAULT_UPCOMING_EVENT);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [upcomingEventMessage, setUpcomingEventMessage] = useState('');

    // Hall of Fame Form State
    const [isEditingHallOfFame, setIsEditingHallOfFame] = useState(false);
    const [currentHallOfFameEntry, setCurrentHallOfFameEntry] = useState<HallOfFameEntry>(DEFAULT_HALL_OF_FAME_ENTRY);
    const [selectedHallOfFameImage, setSelectedHallOfFameImage] = useState<File | null>(null);
    const [hallOfFameMessage, setHallOfFameMessage] = useState('');

    // CMS States
    const [galleryCategories, setGalleryCategories] = useState<GalleryCategory[]>([]);
    const [galleryFolders, setGalleryFolders] = useState<GalleryFolder[]>([]);
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [galleryMessage, setGalleryMessage] = useState('');
    const [galleryError, setGalleryError] = useState('');
    const [galleryManagerLoading, setGalleryManagerLoading] = useState(false);
    const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<File[]>([]);
    const [selectedGalleryCategoryId, setSelectedGalleryCategoryId] = useState('');
    const [selectedGalleryUploadFolderId, setSelectedGalleryUploadFolderId] = useState('');
    const [selectedGalleryFolderCategoryId, setSelectedGalleryFolderCategoryId] = useState('');
    const [newGalleryFolderName, setNewGalleryFolderName] = useState('');
    const [isGalleryUploading, setIsGalleryUploading] = useState(false);
    const [isGalleryFolderSaving, setIsGalleryFolderSaving] = useState(false);
    const galleryFileInputRef = useRef<HTMLInputElement | null>(null);
    const [preGalleryImages, setPreGalleryImages] = useState<PreGalleryImage[]>([]);
    const [preGalleryMessage, setPreGalleryMessage] = useState('');
    const [preGalleryError, setPreGalleryError] = useState('');
    const [preGalleryUploadingOrder, setPreGalleryUploadingOrder] = useState<PreGallerySlot | null>(null);
    const [selectedPreGalleryFiles, setSelectedPreGalleryFiles] = useState<Record<PreGallerySlot, File | null>>({
        1: null,
        2: null,
        3: null
    });
    const [aboutMessage, setAboutMessage] = useState('');
    const [visionMessage, setVisionMessage] = useState('');
    const [selectedAboutFile, setSelectedAboutFile] = useState<File | null>(null);
    const [selectedVisionFile, setSelectedVisionFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const fetchData = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            onLogout();
            return;
        }

        try {
            const results = await Promise.all([
                supabase.from('registrations').select('*').order('created_at', { ascending: false }),
                supabase.from('feedbacks').select('*').order('submitted_at', { ascending: false }),
                supabase.from('calendar_events').select('*').order('event_date', { ascending: true }),
                supabase.from('calendar_settings').select('id, fy_label, updated_at').eq('id', 1).maybeSingle(),
                supabase.from('whats_new').select('*').order('updated_at', { ascending: false }),
                supabase.from('upcoming_events').select('*').order('created_at', { ascending: false }),
                supabase.from('hall_of_fame').select('*').order('event_date', { ascending: false }),
                supabase.from('gallery_categories').select('*'),
                supabase.from('gallery_folders').select('*').order('created_at', { ascending: true }),
                supabase.from('gallery_images').select('*').order('uploaded_at', { ascending: false }),
                supabase.from('pregallery_images').select('*').order('display_order', { ascending: true }),
                supabase.from('about_images').select('*').order('created_at', { ascending: false }),
                supabase.from('vision_images').select('*').order('created_at', { ascending: false })
            ]);

            const [regs, fbs, cal, cs, wn, up, hf, gc, gf, gi, pgi, ai, vi] = results;

            if (regs.error) {
                setRegistrationsError(`Failed to load registrations: ${regs.error.message}`);
            } else {
                setRegistrationsError('');
            }

            if (fbs.error) {
                setFeedbackError(`Failed to load feedback: ${fbs.error.message}`);
            } else {
                setFeedbackError('');
            }

            if (cal.error) {
                setCalendarError(`Failed to load calendar events: ${cal.error.message}`);
            } else {
                setCalendarError('');
            }

            if (cs.error) {
                console.error('Failed to load calendar settings', cs.error);
            }

            if (pgi.error) {
                setPreGalleryError(`Failed to load pre-gallery images: ${pgi.error.message}`);
            } else {
                setPreGalleryError('');
            }

            if (gc.error || gf.error || gi.error) {
                setGalleryError(`Failed to load gallery manager data: ${gc.error?.message || gf.error?.message || gi.error?.message}`);
            } else {
                setGalleryError('');
            }

            setRegistrations(regs.data || []);
            setFeedbacks(fbs.data || []);
            setCalendarEvents([
                ...INITIAL_EVENTS,
                ...((cal.data || []).map((event) => normalizeCalendarEvent(event as CalendarEvent)))
            ]);
            setCalendarFyLabel(normalizeCalendarFyLabel(cs.data?.fy_label));
            setWhatsNewItems(wn.data || []);
            setUpcomingEvents(up.data || []);
            setHallOfFameEntries(hf.data || []);
            setGalleryCategories(sortGalleryCategories((gc.data || []) as GalleryCategory[]));
            setGalleryFolders((gf.data || []) as GalleryFolder[]);
            setGalleryImages((gi.data || []) as GalleryImage[]);
            setPreGalleryImages((pgi.data || []) as PreGalleryImage[]);
            setAboutImages(ai.data || []);
            setVisionImages(vi.data || []);

        } catch (error) {
            setRegistrationsError('Failed to load registrations.');
            setFeedbackError('Failed to load feedback.');
            setCalendarError('Failed to load calendar events.');
            setGalleryError('Failed to load gallery manager data.');
            setPreGalleryError('Failed to load pre-gallery images.');
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    }, [onLogout]);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (galleryCategories.length === 0) {
            if (selectedGalleryFolderCategoryId) {
                setSelectedGalleryFolderCategoryId('');
            }
            return;
        }

        if (!selectedGalleryFolderCategoryId || !galleryCategories.some((category) => category.id === Number(selectedGalleryFolderCategoryId))) {
            setSelectedGalleryFolderCategoryId(String(galleryCategories[0].id));
        }
    }, [galleryCategories, selectedGalleryFolderCategoryId]);

    useEffect(() => {
        if (!selectedGalleryUploadFolderId) {
            return;
        }

        const selectedUploadCategoryId = Number(selectedGalleryCategoryId);
        const selectedUploadFolderId = Number(selectedGalleryUploadFolderId);
        const hasValidFolderSelection = galleryFolders.some((folder) => (
            folder.id === selectedUploadFolderId
            && folder.category_id === selectedUploadCategoryId
        ));

        if (!hasValidFolderSelection) {
            setSelectedGalleryUploadFolderId('');
        }
    }, [galleryFolders, selectedGalleryCategoryId, selectedGalleryUploadFolderId]);

    const fetchWhatsNew = async () => {
        try {
            const { data, error } = await supabase
                .from('whats_new')
                .select('*')
                .order('updated_at', { ascending: false });

            if (!error) setWhatsNewItems(data || []);
        } catch (error) {
            console.error('Failed to refresh whats new', error);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        onLogout();
    };

    const handleSaveEvent = async () => {
        if (!currentEvent.event_name || !currentEvent.sport || !currentEvent.event_date || !currentEvent.event_time) {
            setEventFormMessage('Name, Sport, Date and Time are required.');
            return;
        }

        try {
            const calendarPayload = {
                event_name: currentEvent.event_name,
                sport: currentEvent.sport,
                event_date: currentEvent.event_date,
                event_time: currentEvent.event_time,
                event_type: currentEvent.event_type,
                updated_at: new Date().toISOString()
            };

            const fallbackCalendarPayload = {
                event_name: currentEvent.event_name,
                sport: currentEvent.sport,
                event_date: currentEvent.event_date,
                event_type: currentEvent.event_type,
                updated_at: buildCalendarFallbackUpdatedAt(currentEvent.event_date, currentEvent.event_time)
            };

            let error;
            if (isEditingEvent) {
                const updateResponse = await supabase
                    .from('calendar_events')
                    .update(calendarPayload)
                    .eq('id', currentEvent.id);
                error = updateResponse.error;

                if (error && isCalendarEventTimeColumnMissingError(error)) {
                    const fallbackResponse = await supabase
                        .from('calendar_events')
                        .update(fallbackCalendarPayload)
                        .eq('id', currentEvent.id);
                    error = fallbackResponse.error;
                }
            } else {
                const insertResponse = await supabase
                    .from('calendar_events')
                    .insert([calendarPayload]);
                error = insertResponse.error;

                if (error && isCalendarEventTimeColumnMissingError(error)) {
                    const fallbackResponse = await supabase
                        .from('calendar_events')
                        .insert([fallbackCalendarPayload]);
                    error = fallbackResponse.error;
                }
            }

            if (!error) {
                setEventFormMessage(isEditingEvent ? 'Event updated!' : 'Event added!');
                setCurrentEvent(DEFAULT_EVENT);
                setIsEditingEvent(false);
                void fetchCalendarEvents();
                setTimeout(() => setEventFormMessage(''), 3000);
            } else {
                setEventFormMessage(`Error: ${error.message}`);
            }
        } catch (error) {
            setEventFormMessage(`Error: ${getErrorMessage(error)}`);
        }
    };

    const handleDeleteEvent = async (id: number) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            if (id < 0) {
                // For hardcoded events, we just filter them out of the current state
                setCalendarEvents(prev => prev.filter(event => event.id !== id));
                return;
            }
            const { error } = await supabase
                .from('calendar_events')
                .delete()
                .eq('id', id);

            if (!error) {
                void fetchCalendarEvents();
            }
            else alert('Failed to delete event: ' + error.message);
        } catch {
            alert('Error deleting event');
        }
    };

    const fetchCalendarEvents = async () => {
        try {
            const { data, error } = await supabase
                .from('calendar_events')
                .select('*')
                .order('event_date', { ascending: true });

            if (error) {
                setCalendarError(`Failed to load calendar events: ${error.message}`);
                return;
            }

            setCalendarEvents([
                ...INITIAL_EVENTS,
                ...((data || []).map((event) => normalizeCalendarEvent(event as CalendarEvent)))
            ]);
            setCalendarError('');
        } catch (error) {
            console.error('Failed to refresh calendar', error);
            setCalendarError('Failed to load calendar events.');
        }
    };

    const handleSaveCalendarSettings = async () => {
        const trimmedFyLabel = calendarFyLabel.trim();

        if (!trimmedFyLabel) {
            setCalendarSettingsMessage('Error: Financial year is required.');
            return;
        }

        setIsSavingCalendarSettings(true);

        try {
            const { error } = await supabase
                .from('calendar_settings')
                .upsert(
                    { id: 1, fy_label: trimmedFyLabel },
                    { onConflict: 'id' }
                );

            if (error) {
                setCalendarSettingsMessage(`Error: ${error.message}`);
                return;
            }

            setCalendarFyLabel(trimmedFyLabel);
            setCalendarSettingsMessage('Financial year updated!');
            setTimeout(() => setCalendarSettingsMessage(''), 3000);
        } catch (error) {
            setCalendarSettingsMessage(`Error: ${getErrorMessage(error)}`);
        } finally {
            setIsSavingCalendarSettings(false);
        }
    };

    const startEdit = (event: CalendarEvent) => {
        setIsEditingEvent(true);
        setCurrentEvent({ ...normalizeCalendarEvent(event) });
        window.scrollTo(0, 0);
    };

    const cancelEdit = () => {
        setIsEditingEvent(false);
        setCurrentEvent(DEFAULT_EVENT);
        setEventFormMessage('');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const formatRegistrationSubmittedAt = (dateString: string) => {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    const handleDownloadRegistrationsCsv = () => {
        const headers = [
            'Employee Code',
            'Full Name',
            'Location',
            'Organisation',
            'Department',
            'Designation',
            'Email Address',
            'Interested Sports',
            'Submitted At'
        ];

        const rows = registrations.map((registration) => [
            registration.employee_code,
            registration.full_name,
            registration.location,
            getRegistrationOrganisation(registration),
            registration.department,
            registration.designation,
            registration.email,
            formatRegistrationSports(registration.sports_interested, registration.other_sport),
            formatRegistrationSubmittedAt(registration.created_at)
        ]);

        downloadCsvFile({
            headers,
            rows,
            fileBaseName: 'event_registrations'
        });
    };

    const handleDownloadFeedbackCsv = () => {
        const headers = [
            'Name',
            'Email',
            'Employee Code',
            'Contact Number',
            'Location',
            'Organisation',
            'Department',
            'Experience Rating',
            'Feedback Type',
            'Message',
            'Submitted At'
        ];

        const rows = feedbacks.map((feedback) => [
            feedback.name,
            feedback.email,
            feedback.employee_code,
            feedback.contact_number,
            feedback.location,
            getFeedbackOrganisation(feedback),
            feedback.department,
            feedback.experience_rating,
            feedback.feedback_type,
            feedback.message,
            formatRegistrationSubmittedAt(feedback.submitted_at)
        ]);

        downloadCsvFile({
            headers,
            rows,
            fileBaseName: 'feedback_responses'
        });
    };

    const formatEventTime = (time?: string | null) => {
        if (!time) {
            return 'TBD';
        }

        const [hoursString = '0', minutesString = '0'] = time.split(':');
        const hours = Number(hoursString);
        const minutes = Number(minutesString);

        if (Number.isNaN(hours) || Number.isNaN(minutes)) {
            return time;
        }

        return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    // What's New Upgrade
    const handleEditWhatsNew = (item: WhatsNewItem) => {
        setEditingWhatsNew(item.id);
        setTempWhatsNew({
            title: item.title,
            description: item.description,
            icon_type: item.icon_type
        });
    };

    const handleCancelWhatsNew = () => {
        setEditingWhatsNew(null);
        setTempWhatsNew(DEFAULT_WHATS_NEW);
        setWhatsNewMessage('');
    };

    const handleSaveWhatsNew = async () => {
        if (!tempWhatsNew.title || !tempWhatsNew.description) {
            setWhatsNewMessage('Title and Description are required.');
            return;
        }

        try {
            let error;
            if (editingWhatsNew) {
                const { error: updateError } = await supabase
                    .from('whats_new')
                    .update({
                        title: tempWhatsNew.title,
                        description: tempWhatsNew.description,
                        icon_type: tempWhatsNew.icon_type,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', editingWhatsNew);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('whats_new')
                    .insert([{
                        title: tempWhatsNew.title,
                        description: tempWhatsNew.description,
                        icon_type: tempWhatsNew.icon_type
                    }]);
                error = insertError;
            }

            if (!error) {
                setWhatsNewMessage(editingWhatsNew ? 'Updated successfully!' : 'Added successfully!');
                setEditingWhatsNew(null);
                setIsAddingWhatsNew(false);
                setTempWhatsNew(DEFAULT_WHATS_NEW);
                void fetchWhatsNew();
                setTimeout(() => setWhatsNewMessage(''), 3000);
            } else {
                setWhatsNewMessage('Operation failed: ' + error.message);
            }
        } catch {
            setWhatsNewMessage('Error saving.');
        }
    };

    const handleDeleteWhatsNew = async (id: number) => {
        if (!confirm('Are you sure you want to delete this card?')) return;
        try {
            const { error } = await supabase
                .from('whats_new')
                .delete()
                .eq('id', id);

            if (!error) {
                void fetchWhatsNew();
            }
            else alert('Failed to delete: ' + error.message);
        } catch {
            alert('Error deleting card');
        }
    };

    // Upcoming Events CRUD
    const fetchUpcomingEvents = async () => {
        try {
            const { data, error } = await supabase
                .from('upcoming_events')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error) setUpcomingEvents(data || []);
        } catch (error) {
            console.error('Failed to refresh upcoming events', error);
        }
    };

    const fetchHallOfFameEntries = async () => {
        try {
            const { data, error } = await supabase
                .from('hall_of_fame')
                .select('*')
                .order('event_date', { ascending: false });

            if (!error) setHallOfFameEntries(data || []);
        } catch (error) {
            console.error('Failed to refresh hall of fame entries', error);
        }
    };

    const getImageUrl = (imagePath?: string | null) => {
        if (!imagePath) return EMPTY_IMAGE_PLACEHOLDER;
        if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
            return imagePath;
        }
        // Assuming we check both buckets or have a way to know, 
        // but for the dashboard preview we just try one or the other based on where we are.
        const bucket = activeTab === 'hall-of-fame' ? 'hall_of_fame' : 'events';
        return supabase.storage.from(bucket).getPublicUrl(imagePath).data.publicUrl;
    };

    const handleSaveUpcomingEvent = async () => {
        if (!currentUpcomingEvent.event_name || !currentUpcomingEvent.event_date || !currentUpcomingEvent.event_time || !currentUpcomingEvent.event_venue) {
            setUpcomingEventMessage('All fields (Name, Date, Time, Venue) are required.');
            return;
        }

        const normalizedUpcomingEventDate = normalizeUpcomingEventDateValue(currentUpcomingEvent.event_date);
        const normalizedUpcomingEventTime = normalizeUpcomingEventTimeValue(currentUpcomingEvent.event_time);

        if (!normalizedUpcomingEventDate || !normalizedUpcomingEventTime) {
            setUpcomingEventMessage('Please select a valid date and time.');
            return;
        }

        try {
            let imagePath = currentUpcomingEvent.event_image;

            if (selectedImage) {
                const fileExt = selectedImage.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('events')
                    .upload(fileName, selectedImage);

                if (uploadError) throw uploadError;
                imagePath = uploadData.path;
            }

            const eventData = {
                event_name: currentUpcomingEvent.event_name,
                event_date: normalizedUpcomingEventDate,
                event_time: normalizedUpcomingEventTime,
                event_venue: currentUpcomingEvent.event_venue,
                event_image: imagePath || '',
                updated_at: new Date().toISOString()
            };

            let error;
            if (isEditingUpcomingEvent) {
                const { error: updateError } = await supabase
                    .from('upcoming_events')
                    .update(eventData)
                    .eq('id', currentUpcomingEvent.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('upcoming_events')
                    .insert([eventData]);
                error = insertError;
            }

            if (!error) {
                setUpcomingEventMessage(isEditingUpcomingEvent ? 'Event updated!' : 'Event added!');
                setCurrentUpcomingEvent(DEFAULT_UPCOMING_EVENT);
                setSelectedImage(null);
                setIsEditingUpcomingEvent(false);
                void fetchUpcomingEvents();
                setTimeout(() => setUpcomingEventMessage(''), 3000);
            } else {
                setUpcomingEventMessage(`Error: ${error.message}`);
            }
        } catch (error) {
            setUpcomingEventMessage(`Error: ${getErrorMessage(error)}`);
        }
    };

    const handleDeleteUpcomingEvent = async (id: number) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            const { error } = await supabase
                .from('upcoming_events')
                .delete()
                .eq('id', id);

            if (!error) {
                void fetchUpcomingEvents();
            }
            else alert('Failed to delete event: ' + error.message);
        } catch {
            alert('Error deleting event');
        }
    };

    const handleSaveHallOfFameEntry = async () => {
        if (!currentHallOfFameEntry.event_name || !currentHallOfFameEntry.event_date || !currentHallOfFameEntry.winner_name || !currentHallOfFameEntry.event_venue) {
            setHallOfFameMessage('All fields are required.');
            return;
        }

        try {
            let imagePath = currentHallOfFameEntry.event_image;

            if (selectedHallOfFameImage) {
                const fileExt = selectedHallOfFameImage.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('hall_of_fame')
                    .upload(fileName, selectedHallOfFameImage);

                if (uploadError) throw uploadError;
                imagePath = uploadData.path;
            }

            const entryData = {
                event_name: currentHallOfFameEntry.event_name,
                event_date: currentHallOfFameEntry.event_date,
                event_venue: currentHallOfFameEntry.event_venue,
                winner_name: currentHallOfFameEntry.winner_name,
                achievement_type: currentHallOfFameEntry.achievement_type,
                event_image: imagePath || '',
                updated_at: new Date().toISOString()
            };

            let error;
            if (isEditingHallOfFame) {
                const { error: updateError } = await supabase
                    .from('hall_of_fame')
                    .update(entryData)
                    .eq('id', currentHallOfFameEntry.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('hall_of_fame')
                    .insert([entryData]);
                error = insertError;
            }

            if (!error) {
                setHallOfFameMessage(isEditingHallOfFame ? 'Entry updated!' : 'Entry added!');
                setCurrentHallOfFameEntry(DEFAULT_HALL_OF_FAME_ENTRY);
                setSelectedHallOfFameImage(null);
                setIsEditingHallOfFame(false);
                void fetchHallOfFameEntries();
                setTimeout(() => setHallOfFameMessage(''), 3000);
            } else {
                setHallOfFameMessage(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Network error:', error);
            setHallOfFameMessage(`Error: Connection failed - ${getErrorMessage(error)}`);
        }
    };

    const handleDeleteHallOfFameEntry = async (id: number) => {
        if (!confirm('Are you sure you want to delete this entry?')) return;
        try {
            const { error } = await supabase
                .from('hall_of_fame')
                .delete()
                .eq('id', id);

            if (!error) {
                void fetchHallOfFameEntries();
            }
            else alert('Failed to delete entry: ' + error.message);
        } catch {
            alert('Error deleting entry');
        }
    };

    const fetchAboutImages = async () => {
        const { data } = await supabase.from('about_images').select('*').order('created_at', { ascending: false });
        setAboutImages(data || []);
    };

    const fetchPreGalleryImages = async () => {
        try {
            const { data, error } = await supabase
                .from('pregallery_images')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) {
                setPreGalleryError(`Failed to load pre-gallery images: ${error.message}`);
                return;
            }

            setPreGalleryImages((data || []) as PreGalleryImage[]);
            setPreGalleryError('');
        } catch (error) {
            console.error('Failed to refresh pre-gallery images', error);
            setPreGalleryError('Failed to load pre-gallery images.');
        }
    };

    const fetchGalleryManagerData = async () => {
        setGalleryManagerLoading(true);

        try {
            const [categoriesResponse, foldersResponse, imagesResponse] = await Promise.all([
                supabase.from('gallery_categories').select('*'),
                supabase.from('gallery_folders').select('*').order('created_at', { ascending: true }),
                supabase.from('gallery_images').select('*').order('uploaded_at', { ascending: false })
            ]);

            if (categoriesResponse.error || foldersResponse.error || imagesResponse.error) {
                setGalleryError(`Failed to load gallery manager data: ${categoriesResponse.error?.message || foldersResponse.error?.message || imagesResponse.error?.message}`);
                return;
            }

            setGalleryCategories(sortGalleryCategories((categoriesResponse.data || []) as GalleryCategory[]));
            setGalleryFolders((foldersResponse.data || []) as GalleryFolder[]);
            setGalleryImages((imagesResponse.data || []) as GalleryImage[]);
            setGalleryError('');
        } catch (error) {
            console.error('Failed to refresh gallery manager data', error);
            setGalleryError('Failed to load gallery manager data.');
        } finally {
            setGalleryManagerLoading(false);
        }
    };

    const fetchVisionImages = async () => {
        const { data } = await supabase.from('vision_images').select('*').order('created_at', { ascending: false });
        setVisionImages(data || []);
    };

    const saveGalleryFolder = async ({
        name,
        categoryId,
        parentFolderId,
        folderId
    }: {
        name: string;
        categoryId: number;
        parentFolderId: number | null;
        folderId?: number;
    }) => {
        const normalizedFolderName = normalizeGalleryFolderName(name);

        if (!normalizedFolderName) {
            setGalleryMessage('Folder name cannot be empty.');
            return false;
        }

        if (hasDuplicateGalleryFolderName(galleryFolders, {
            name: normalizedFolderName,
            categoryId,
            parentFolderId,
            excludeFolderId: folderId
        })) {
            setGalleryMessage('A folder with that name already exists in this location.');
            return false;
        }

        setIsGalleryFolderSaving(true);

        try {
            const folderPayload = {
                name: normalizedFolderName,
                category_id: categoryId,
                parent_folder_id: parentFolderId
            };
            const { error } = folderId
                ? await supabase
                    .from('gallery_folders')
                    .update(folderPayload)
                    .eq('id', folderId)
                : await supabase
                    .from('gallery_folders')
                    .insert([folderPayload]);

            if (error) {
                throw error;
            }

            setGalleryError('');
            setGalleryMessage(folderId
                ? 'Folder renamed successfully!'
                : parentFolderId
                    ? 'Sub-folder created successfully!'
                    : 'Folder created successfully!');
            void fetchGalleryManagerData();
            setTimeout(() => setGalleryMessage(''), 3000);
            return true;
        } catch (error) {
            console.error('Gallery folder save error:', error);
            setGalleryMessage(`Folder save failed: ${getErrorMessage(error)}`);
            return false;
        } finally {
            setIsGalleryFolderSaving(false);
        }
    };

    const handleCreateGalleryFolder = async () => {
        if (!selectedGalleryFolderCategoryId) {
            setGalleryMessage('Please select a category before creating a folder.');
            return;
        }

        const created = await saveGalleryFolder({
            name: newGalleryFolderName,
            categoryId: Number(selectedGalleryFolderCategoryId),
            parentFolderId: null
        });

        if (created) {
            setNewGalleryFolderName('');
        }
    };

    const handleAddGallerySubFolder = async (parentFolder: GalleryFolder) => {
        const folderName = window.prompt(`Enter a sub-folder name for "${parentFolder.name}"`, '');

        if (folderName === null) {
            return;
        }

        await saveGalleryFolder({
            name: folderName,
            categoryId: parentFolder.category_id,
            parentFolderId: parentFolder.id
        });
    };

    const handleRenameGalleryFolder = async (folder: GalleryFolder) => {
        const nextFolderName = window.prompt('Rename folder', folder.name);

        if (nextFolderName === null) {
            return;
        }

        const normalizedNextFolderName = normalizeGalleryFolderName(nextFolderName);

        if (normalizedNextFolderName === folder.name) {
            return;
        }

        await saveGalleryFolder({
            folderId: folder.id,
            name: normalizedNextFolderName,
            categoryId: folder.category_id,
            parentFolderId: folder.parent_folder_id
        });
    };

    const handleDeleteGalleryFolder = async (folder: GalleryFolder) => {
        if (!confirm(`Delete "${folder.name}"? Empty folders only can be removed.`)) {
            return;
        }

        setIsGalleryFolderSaving(true);

        try {
            const { error } = await supabase
                .from('gallery_folders')
                .delete()
                .eq('id', folder.id);

            if (error) {
                throw error;
            }

            if (selectedGalleryUploadFolderId === String(folder.id)) {
                setSelectedGalleryUploadFolderId('');
            }

            setGalleryMessage('Folder deleted successfully!');
            void fetchGalleryManagerData();
            setTimeout(() => setGalleryMessage(''), 3000);
        } catch (error) {
            console.error('Gallery folder delete error:', error);
            setGalleryMessage(`Delete failed: ${getErrorMessage(error)}`);
        } finally {
            setIsGalleryFolderSaving(false);
        }
    };

    const handleGalleryFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);

        if (files.length === 0) {
            setSelectedGalleryFiles([]);
            return;
        }

        if (files.some((file) => !isAllowedGalleryUploadFile(file))) {
            setSelectedGalleryFiles([]);
            event.target.value = '';
            setGalleryMessage('Upload failed: only JPG and PNG files are allowed.');
            return;
        }

        setGalleryMessage('');
        setSelectedGalleryFiles(files);
    };

    const handleUploadGalleryImage = async () => {
        if (!selectedGalleryCategoryId) {
            setGalleryMessage('Please select a category.');
            return;
        }

        if (!selectedGalleryUploadFolderId) {
            setGalleryMessage('Please select a folder.');
            return;
        }

        if (selectedGalleryFiles.length === 0) {
            setGalleryMessage('Please choose at least one image.');
            return;
        }

        const selectedCategoryId = Number(selectedGalleryCategoryId);
        const selectedFolderId = Number(selectedGalleryUploadFolderId);
        const totalFiles = selectedGalleryFiles.length;

        if (!galleryFolders.some((folder) => (
            folder.id === selectedFolderId
            && folder.category_id === selectedCategoryId
        ))) {
            setGalleryMessage('Please select a valid folder for the chosen category.');
            return;
        }

        setIsGalleryUploading(true);
        setGalleryMessage(`Uploading ${totalFiles} image${totalFiles === 1 ? '' : 's'}...`);

        let uploadedCount = 0;
        const failedFileNames: string[] = [];

        try {
            for (const file of selectedGalleryFiles) {
                try {
                    const fileExt = file.name.split('.').pop()?.toLowerCase() || (file.type === 'image/png' ? 'png' : 'jpg');
                    const fileName = `gallery-${selectedGalleryCategoryId}-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('gallery-images')
                        .upload(fileName, file);

                    if (uploadError) throw uploadError;

                    const { data: publicUrlData } = supabase.storage.from('gallery-images').getPublicUrl(uploadData.path);
                    const publicUrl = publicUrlData.publicUrl;

                    const { error: dbError } = await supabase
                        .from('gallery_images')
                        .insert([{
                            image_url: publicUrl,
                            category_id: selectedCategoryId,
                            folder_id: selectedFolderId,
                            uploaded_at: new Date().toISOString()
                        }]);

                    if (dbError) throw dbError;

                    uploadedCount += 1;
                } catch (error) {
                    console.error(`Gallery upload error for ${file.name}:`, error);
                    failedFileNames.push(file.name);
                }
            }

            if (failedFileNames.length === 0) {
                setSelectedGalleryFiles([]);
                if (galleryFileInputRef.current) {
                    galleryFileInputRef.current.value = '';
                }
                setSelectedGalleryCategoryId('');
                setSelectedGalleryUploadFolderId('');
                setGalleryError('');
                setGalleryMessage(`${uploadedCount} gallery image${uploadedCount === 1 ? '' : 's'} uploaded successfully!`);
                void fetchGalleryManagerData();
                setTimeout(() => setGalleryMessage(''), 3000);
            } else if (uploadedCount > 0) {
                setSelectedGalleryFiles([]);
                if (galleryFileInputRef.current) {
                    galleryFileInputRef.current.value = '';
                }
                setSelectedGalleryCategoryId('');
                setSelectedGalleryUploadFolderId('');
                setGalleryError('');
                setGalleryMessage(`${uploadedCount} of ${totalFiles} gallery images uploaded successfully; failed: ${failedFileNames.join(', ')}.`);
                void fetchGalleryManagerData();
            } else {
                setGalleryMessage(`Upload failed: ${failedFileNames.join(', ')} could not be uploaded.`);
            }
        } catch (error) {
            console.error('Gallery upload error:', error);
            setGalleryMessage(`Upload failed: ${getErrorMessage(error)}`);
        } finally {
            setIsGalleryUploading(false);
        }
    };

    const handleMoveGalleryImage = async (imageId: number, categoryId: number, folderId: number | null) => {
        try {
            const { error } = await supabase
                .from('gallery_images')
                .update({
                    category_id: categoryId,
                    folder_id: folderId
                })
                .eq('id', imageId);

            if (error) throw error;

            setGalleryImages((currentImages) => currentImages.map((image) => (
                image.id === imageId
                    ? {
                        ...image,
                        category_id: categoryId,
                        folder_id: folderId
                    }
                    : image
            )));
            setGalleryMessage('Gallery image location updated successfully!');
            setTimeout(() => setGalleryMessage(''), 3000);
        } catch (error) {
            console.error('Gallery move error:', error);
            setGalleryMessage(`Move failed: ${getErrorMessage(error)}`);
        }
    };

    const handleDeleteGalleryImage = async (imageId: number, imageUrl: string) => {
        if (!confirm('Are you sure you want to delete this gallery image?')) return;

        try {
            const imageUrlObject = new URL(imageUrl);
            const fileName = imageUrlObject.pathname.split('/').pop();

            const { error: storageError } = fileName
                ? await supabase.storage.from('gallery-images').remove([fileName])
                : { error: null };

            const { error: dbError } = await supabase
                .from('gallery_images')
                .delete()
                .eq('id', imageId);

            if (dbError) throw dbError;
            if (storageError) {
                console.warn('Gallery storage deletion warning:', storageError);
            }

            setGalleryImages((currentImages) => currentImages.filter((image) => image.id !== imageId));
            setGalleryMessage('Gallery image deleted successfully!');
            setTimeout(() => setGalleryMessage(''), 3000);
        } catch (error) {
            console.error('Gallery delete error:', error);
            setGalleryMessage(`Delete failed: ${getErrorMessage(error)}`);
        }
    };

    const handleUploadPreGalleryImage = async (displayOrder: PreGallerySlot) => {
        const file = selectedPreGalleryFiles[displayOrder];

        if (!file) {
            setPreGalleryMessage(`Please select an image for slot ${displayOrder} first.`);
            return;
        }

        setIsUploading(true);
        setPreGalleryUploadingOrder(displayOrder);
        setPreGalleryMessage(`Uploading image ${displayOrder}...`);

        const existingImage = preGalleryImages.find((image) => image.display_order === displayOrder);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `pregallery-${displayOrder}-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('pregallery-images')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage.from('pregallery-images').getPublicUrl(uploadData.path);
            const publicUrl = publicUrlData.publicUrl;

            const { error: dbError } = await supabase
                .from('pregallery_images')
                .upsert([{
                    image_url: publicUrl,
                    display_order: displayOrder,
                    uploaded_at: new Date().toISOString()
                }], { onConflict: 'display_order' });

            if (dbError) throw dbError;

            if (existingImage?.image_url && existingImage.image_url !== publicUrl) {
                try {
                    const oldImageUrl = new URL(existingImage.image_url);
                    const oldFileName = oldImageUrl.pathname.split('/').pop();

                    if (oldFileName) {
                        const { error: cleanupError } = await supabase.storage
                            .from('pregallery-images')
                            .remove([oldFileName]);

                        if (cleanupError) {
                            console.warn('Pre-gallery storage cleanup warning:', cleanupError);
                        }
                    }
                } catch (cleanupError) {
                    console.warn('Failed to parse old pre-gallery image URL', cleanupError);
                }
            }

            setSelectedPreGalleryFiles((currentFiles) => ({
                ...currentFiles,
                [displayOrder]: null
            }));
            setPreGalleryError('');
            setPreGalleryMessage(`Image ${displayOrder} updated successfully!`);
            void fetchPreGalleryImages();
            setTimeout(() => setPreGalleryMessage(''), 3000);
        } catch (error) {
            console.error('Pre-gallery upload error:', error);
            setPreGalleryMessage(`Upload failed: ${getErrorMessage(error)}`);
        } finally {
            setIsUploading(false);
            setPreGalleryUploadingOrder(null);
        }
    };

    const handleUploadCMSImage = async (type: CmsType) => {
        const file = type === 'about' ? selectedAboutFile : selectedVisionFile;
        const bucket = type === 'about' ? 'about-images' : 'vision-images';
        const table = type === 'about' ? 'about_images' : 'vision_images';
        const setMessage = type === 'about' ? setAboutMessage : setVisionMessage;
        const setFile = type === 'about' ? setSelectedAboutFile : setSelectedVisionFile;
        const fetchFn = type === 'about' ? fetchAboutImages : fetchVisionImages;

        if (!file) {
            setMessage('Please select a file first.');
            return;
        }

        setIsUploading(true);
        setMessage('Uploading...');

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);
            const publicUrl = publicUrlData.publicUrl;

            const { error: dbError } = await supabase
                .from(table)
                .insert([{ image_url: publicUrl }]);

            if (dbError) throw dbError;

            setMessage('Uploaded successfully!');
            setFile(null);
            void fetchFn();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Upload error:', error);
            setMessage(`Upload failed: ${getErrorMessage(error)}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteCMSImage = async (type: CmsType, id: number, imageUrl: string) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        const bucket = type === 'about' ? 'about-images' : 'vision-images';
        const table = type === 'about' ? 'about_images' : 'vision_images';
        const setMessage = type === 'about' ? setAboutMessage : setVisionMessage;
        const fetchFn = type === 'about' ? fetchAboutImages : fetchVisionImages;

        try {
            // Extract file path from public URL
            const urlObj = new URL(imageUrl);
            const pathParts = urlObj.pathname.split('/');
            const fileName = pathParts[pathParts.length - 1];

            // 1. Delete from Storage
            const { error: storageError } = await supabase.storage
                .from(bucket)
                .remove([fileName]);

            // 2. Delete from Database (regardless of storage deletion success to keep sync)
            const { error: dbError } = await supabase
                .from(table)
                .delete()
                .eq('id', id);

            if (dbError) throw dbError;
            if (storageError) {
                console.warn('Storage deletion warning:', storageError);
            }

            setMessage('Deleted successfully!');
            void fetchFn();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Delete error:', error);
            setMessage(`Delete failed: ${getErrorMessage(error)}`);
        }
    };


    const filteredRegistrations = registrations.filter(r =>
        r.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.employee_code?.includes(searchTerm) ||
        r.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const filteredFeedbacks = feedbacks.filter((feedback) => {
        const matchesSearch = !normalizedSearchTerm || [
            feedback.message,
            feedback.feedback_type,
            feedback.name,
            feedback.email,
            feedback.employee_code,
            feedback.contact_number,
            feedback.location,
            getFeedbackOrganisation(feedback),
            feedback.department
        ].some(value => String(value || '').toLowerCase().includes(normalizedSearchTerm));

        const matchesType = feedbackTypeFilter === 'all'
            || feedback.feedback_type?.toLowerCase() === feedbackTypeFilter;

        return matchesSearch && matchesType;
    });
    const feedbackTypeOptions = ['all', ...new Set(
        feedbacks
            .map(feedback => feedback.feedback_type?.toLowerCase())
            .filter((value): value is string => Boolean(value))
    )];
    const visibleGalleryCategories = galleryCategories.filter((category) =>
        !normalizedSearchTerm || formatGalleryCategoryLabel(category.name).toLowerCase().includes(normalizedSearchTerm)
    );
    const galleryFolderPathMap = buildGalleryFolderPathMap(galleryFolders);
    const galleryImageCountsByFolder = galleryImages.reduce<Record<number, number>>((counts, image) => {
        if (image.folder_id != null) {
            counts[image.folder_id] = (counts[image.folder_id] || 0) + 1;
        }

        return counts;
    }, {});
    const selectedGalleryFolderManagerCategoryId = selectedGalleryFolderCategoryId
        ? Number(selectedGalleryFolderCategoryId)
        : null;
    const selectedGalleryFolderManagerFolders = selectedGalleryFolderManagerCategoryId
        ? galleryFolders.filter((folder) => folder.category_id === selectedGalleryFolderManagerCategoryId)
        : [];
    const selectedGalleryUploadCategoryId = selectedGalleryCategoryId
        ? Number(selectedGalleryCategoryId)
        : null;
    const selectedGalleryUploadFolderOptions = selectedGalleryUploadCategoryId
        ? buildGalleryFolderOptions(galleryFolders.filter((folder) => folder.category_id === selectedGalleryUploadCategoryId))
        : [];
    const selectedGalleryUploadHasFolders = selectedGalleryUploadFolderOptions.length > 0;
    const galleryImagesByCategory = visibleGalleryCategories.map((category) => {
        const categoryFolders = galleryFolders.filter((folder) => folder.category_id === category.id);

        return {
            category,
            folderCount: categoryFolders.length,
            folderOptions: buildGalleryFolderOptions(categoryFolders),
            images: galleryImages.filter((image) => image.category_id === category.id)
        };
    });

    const sortedEvents = [...calendarEvents].sort((a, b) => {
        const first = new Date(a.event_date);
        const second = new Date(b.event_date);

        if (a.event_time) {
            const [hours = '0', minutes = '0'] = a.event_time.split(':');
            first.setHours(Number(hours), Number(minutes), 0, 0);
        }

        if (b.event_time) {
            const [hours = '0', minutes = '0'] = b.event_time.split(':');
            second.setHours(Number(hours), Number(minutes), 0, 0);
        }

        return first.getTime() - second.getTime();
    });

    return (
        <div className="min-h-screen bg-gray-50 pt-32 px-4 pb-12">
            <div className="max-w-7xl mx-auto">
                <BackButton className="mb-6" />
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-cyan-600 drop-shadow-sm">
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-500 mt-1">Overview of club activities</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-sm font-medium text-gray-600">Live Database</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
                        >
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </div>

                {/* Search & Tabs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
                        <button
                            onClick={() => setActiveTab('registrations')}
                            className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'registrations' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Users size={18} /> Registration Data
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{registrations.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('feedback')}
                            className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'feedback' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <MessageSquare size={18} /> Feedback Data
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{feedbacks.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('calendar')}
                            className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <span className="font-bold">📅</span> Calendar Manager
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{calendarEvents.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('whats-new')}
                            className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'whats-new' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <span className="font-bold">🔔</span> What's New
                        </button>
                        <button
                            onClick={() => setActiveTab('upcoming-events')}
                            className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'upcoming-events' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <span className="font-bold">🚀</span> Upcoming Events
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{upcomingEvents.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('hall-of-fame')}
                            className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'hall-of-fame' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <span className="font-bold">🏆</span> Hall of Fame
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{hallOfFameEntries.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('gallery-manager')}
                            className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'gallery-manager' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <span className="font-bold">🗂️</span> Gallery Manager
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{galleryImages.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('pre-gallery')}
                            className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'pre-gallery' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <span className="font-bold">🖼️</span> Pre-Gallery Manager
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{preGalleryImages.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('about-cms')}
                            className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'about-cms' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <span className="font-bold">ℹ️</span> About CMS
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{aboutImages.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('vision-cms')}
                            className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'vision-cms' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <span className="font-bold">🎯</span> Vision CMS
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{visionImages.length}</span>
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading data...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            {activeTab === 'registrations' && (
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">Registration Data Export</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {registrations.length} total registration{registrations.length === 1 ? '' : 's'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleDownloadRegistrationsCsv}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm self-start md:self-auto"
                                        >
                                            Download CSV
                                        </button>
                                    </div>

                                    {registrationsError && (
                                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                            {registrationsError}
                                        </div>
                                    )}

                                    <div className="overflow-hidden rounded-xl border border-gray-200">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-100">
                                                <tr>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Employee Code</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Full Name</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Location</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Organisation</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Department</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Designation</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Email</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Interested Sports</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Submitted At</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {filteredRegistrations.map((reg, index) => (
                                                    <tr
                                                        key={reg.id ?? `${reg.employee_code}-${reg.created_at}-${index}`}
                                                        className="hover:bg-gray-50/50 transition-colors"
                                                    >
                                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{reg.employee_code}</td>
                                                        <td className="px-6 py-4 text-gray-600">{reg.full_name}</td>
                                                        <td className="px-6 py-4 text-gray-600">{reg.location || '—'}</td>
                                                        <td className="px-6 py-4 text-gray-600">{getRegistrationOrganisation(reg) || '—'}</td>
                                                        <td className="px-6 py-4 text-gray-600">{reg.department || '—'}</td>
                                                        <td className="px-6 py-4 text-gray-600">{reg.designation || '—'}</td>
                                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{reg.email || '—'}</td>
                                                        <td className="px-6 py-4 text-gray-600 min-w-64 whitespace-normal">
                                                            {formatRegistrationSports(reg.sports_interested, reg.other_sport) || '—'}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{formatRegistrationSubmittedAt(reg.created_at)}</td>
                                                    </tr>
                                                ))}
                                                {filteredRegistrations.length === 0 && (
                                                    <tr>
                                                        <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                                                            {registrations.length === 0 ? 'No registrations found' : 'No registrations match the current search'}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'feedback' && (
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">Feedback Data Export</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {feedbacks.length} total feedback entr{feedbacks.length === 1 ? 'y' : 'ies'}
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3 self-start md:self-auto">
                                            <select
                                                value={feedbackTypeFilter}
                                                onChange={(event) => setFeedbackTypeFilter(event.target.value)}
                                                className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                {feedbackTypeOptions.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option === 'all' ? 'All Types' : option.charAt(0).toUpperCase() + option.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={handleDownloadFeedbackCsv}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
                                            >
                                                Download CSV
                                            </button>
                                        </div>
                                    </div>

                                    {feedbackError && (
                                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                            {feedbackError}
                                        </div>
                                    )}

                                    <div className="overflow-hidden rounded-xl border border-gray-200">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-100">
                                                <tr>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Type</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Rating</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Message</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Identity</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Email</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Employee Code</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Contact</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Location / Org / Dept</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Submitted At</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                        {filteredFeedbacks.map((fb) => (
                                            <tr key={fb.id} className="hover:bg-gray-50/50 transition-colors align-top">
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium capitalize
                                                        ${fb.feedback_type === 'suggestion' ? 'bg-blue-50 text-blue-600' :
                                                            fb.feedback_type === 'complaint' ? 'bg-red-50 text-red-600' :
                                                                'bg-green-50 text-green-600'}`}>
                                                        {fb.feedback_type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex text-yellow-400 text-xs">
                                                        {'★'.repeat(fb.experience_rating)}
                                                        <span className="text-gray-200">{'★'.repeat(5 - fb.experience_rating)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 max-w-md whitespace-pre-wrap">{fb.message}</td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {isAnonymousFeedback(fb) ? (
                                                        <div className="flex flex-col gap-1">
                                                            <span className="inline-flex w-fit rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                                                Anonymous / Discreet
                                                            </span>
                                                            <span className="text-xs text-gray-400">No personal details shared</span>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            <div className="font-medium text-gray-800">{fb.name || 'Unnamed'}</div>
                                                            {!fb.name && (
                                                                <div className="text-xs text-gray-400">Identity partially provided</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {fb.email || <span className="text-gray-400">-</span>}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {fb.employee_code || <span className="text-gray-400">-</span>}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {fb.contact_number || <span className="text-gray-400">-</span>}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    <div className="space-y-1">
                                                        <div>{fb.location || <span className="text-gray-400">No location</span>}</div>
                                                        <div className="text-xs text-gray-500">{getFeedbackOrganisation(fb) || 'No organisation'}</div>
                                                        <div className="text-xs text-gray-400">{fb.department || 'No department'}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{formatRegistrationSubmittedAt(fb.submitted_at)}</td>
                                            </tr>
                                        ))}
                                        {filteredFeedbacks.length === 0 && (
                                            <tr>
                                                <td colSpan={9} className="px-6 py-10 text-center text-gray-500">
                                                    {feedbacks.length === 0
                                                        ? 'No feedback entries found.'
                                                        : 'No feedback entries match the current search or filter.'}
                                                </td>
                                            </tr>
                                        )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'calendar' && (
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">Calendar Manager</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {sortedEvents.length} total event{sortedEvents.length === 1 ? '' : 's'}
                                            </p>
                                        </div>
                                    </div>

                                    {calendarError && (
                                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                            {calendarError}
                                        </div>
                                    )}

                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
                                        <h4 className="text-lg font-bold text-gray-800 mb-4">Calendar Settings</h4>
                                        <div className="flex flex-col md:flex-row md:items-end gap-4">
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Financial Year</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={calendarFyLabel}
                                                    onChange={e => setCalendarFyLabel(e.target.value)}
                                                    placeholder="FY 25-26"
                                                />
                                            </div>
                                            <button
                                                onClick={handleSaveCalendarSettings}
                                                disabled={isSavingCalendarSettings}
                                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:cursor-not-allowed disabled:bg-blue-400"
                                            >
                                                {isSavingCalendarSettings ? 'Saving...' : 'Save FY'}
                                            </button>
                                        </div>

                                        {calendarSettingsMessage && (
                                            <p className={`mt-4 text-sm ${calendarSettingsMessage.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
                                                {calendarSettingsMessage}
                                            </p>
                                        )}
                                    </div>

                                    {/* Add/Edit Form */}
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                                        <h4 className="text-lg font-bold text-gray-800 mb-4">{isEditingEvent ? 'Edit Event' : 'Add New Event'}</h4>
                                        <div className="grid md:grid-cols-5 gap-4">
                                            <div className="md:col-span-1">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentEvent.sport}
                                                    onChange={e => setCurrentEvent({ ...currentEvent, sport: e.target.value })}
                                                    placeholder="e.g. Cricket"
                                                />
                                            </div>
                                            <div className="md:col-span-1">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentEvent.event_name}
                                                    onChange={e => setCurrentEvent({ ...currentEvent, event_name: e.target.value })}
                                                    placeholder="e.g. Merchants Cup"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                                <input
                                                    type="date"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentEvent.event_date}
                                                    onChange={e => setCurrentEvent({ ...currentEvent, event_date: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                                <input
                                                    type="time"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentEvent.event_time ?? ''}
                                                    onChange={e => setCurrentEvent({ ...currentEvent, event_time: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                                <select
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentEvent.event_type}
                                                    onChange={e => setCurrentEvent({ ...currentEvent, event_type: e.target.value })}
                                                >
                                                    <option value="Internal">Internal</option>
                                                    <option value="External">External</option>
                                                    <option value="Corporate">Corporate</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-4 items-center">
                                            <button
                                                onClick={handleSaveEvent}
                                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                            >
                                                {isEditingEvent ? 'Update Event' : 'Add Event'}
                                            </button>

                                            {isEditingEvent && (
                                                <button
                                                    onClick={cancelEdit}
                                                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                                                >
                                                    Cancel
                                                </button>
                                            )}

                                            {eventFormMessage && (
                                                <span className={`text-sm ${eventFormMessage.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
                                                    {eventFormMessage}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Events Table */}
                                    <div className="overflow-hidden rounded-xl border border-gray-200">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-100 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Sport</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Event Name</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Time</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Type</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {sortedEvents.map((evt) => (
                                                    <tr key={evt.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-gray-900">{evt.sport}</td>
                                                        <td className="px-6 py-4 text-gray-600">{evt.event_name}</td>
                                                        <td className="px-6 py-4 text-gray-600">{formatDate(evt.event_date)}</td>
                                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{formatEventTime(evt.event_time)}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded-lg text-xs font-medium
                                                                ${evt.event_type === 'Internal' ? 'bg-green-50 text-green-600' :
                                                                    evt.event_type === 'External' ? 'bg-purple-50 text-purple-600' :
                                                                        'bg-blue-50 text-blue-600'}`}>
                                                                {evt.event_type}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                            <button
                                                                onClick={() => startEdit(evt)}
                                                                className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteEvent(evt.id)}
                                                                className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-200 hover:bg-red-50 transition-colors"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {sortedEvents.length === 0 && (
                                                    <tr>
                                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No events found</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'whats-new' && (
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-800">Manage What's New Cards</h3>
                                        {!isAddingWhatsNew && (
                                            <button
                                                onClick={() => {
                                                    setIsAddingWhatsNew(true);
                                                    setEditingWhatsNew(null);
                                                    setTempWhatsNew(DEFAULT_WHATS_NEW);
                                                }}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 shadow-sm"
                                            >
                                                <span>+</span> Add New Card
                                            </button>
                                        )}
                                    </div>

                                    {isAddingWhatsNew && (
                                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 mb-8 max-w-2xl">
                                            <h4 className="font-bold text-blue-800 mb-4">Add New Announcement</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                        value={tempWhatsNew.title}
                                                        onChange={(e) => setTempWhatsNew({ ...tempWhatsNew, title: e.target.value })}
                                                        placeholder="e.g. New Registration Open"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                    <textarea
                                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                        rows={3}
                                                        value={tempWhatsNew.description}
                                                        onChange={(e) => setTempWhatsNew({ ...tempWhatsNew, description: e.target.value })}
                                                        placeholder="Write details here..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon Type</label>
                                                    <select
                                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                        value={tempWhatsNew.icon_type}
                                                        onChange={(e) => setTempWhatsNew({ ...tempWhatsNew, icon_type: e.target.value as IconType })}
                                                    >
                                                        <option value="Bell">Bell</option>
                                                        <option value="Award">Award</option>
                                                        <option value="TrendingUp">TrendingUp</option>
                                                        <option value="Users">Users</option>
                                                    </select>
                                                </div>
                                                <div className="flex gap-2 justify-end pt-2">
                                                    <button
                                                        onClick={() => setIsAddingWhatsNew(false)}
                                                        className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleSaveWhatsNew}
                                                        className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-md transition-all"
                                                    >
                                                        Post Update
                                                    </button>
                                                </div>
                                                {whatsNewMessage && (
                                                    <p className="text-sm text-center text-blue-600 mt-2 font-medium">{whatsNewMessage}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                                        {whatsNewItems.map((item) => (
                                            <div key={item.id} className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative group">
                                                {editingWhatsNew === item.id ? (
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                                            <input
                                                                type="text"
                                                                className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50/10"
                                                                value={tempWhatsNew.title}
                                                                onChange={(e) => setTempWhatsNew({ ...tempWhatsNew, title: e.target.value })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                            <textarea
                                                                className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50/10"
                                                                rows={3}
                                                                value={tempWhatsNew.description}
                                                                onChange={(e) => setTempWhatsNew({ ...tempWhatsNew, description: e.target.value })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Icon Type</label>
                                                            <select
                                                                className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50/10"
                                                                value={tempWhatsNew.icon_type}
                                                                onChange={(e) => setTempWhatsNew({ ...tempWhatsNew, icon_type: e.target.value as IconType })}
                                                            >
                                                                <option value="Bell">Bell</option>
                                                                <option value="Award">Award</option>
                                                                <option value="TrendingUp">TrendingUp</option>
                                                                <option value="Users">Users</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex gap-2 justify-end pt-2">
                                                            <button
                                                                onClick={handleCancelWhatsNew}
                                                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={handleSaveWhatsNew}
                                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                            >
                                                                Save
                                                            </button>
                                                        </div>
                                                        {whatsNewMessage && (
                                                            <p className="text-sm text-center text-blue-600 mt-2">{whatsNewMessage}</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleDeleteWhatsNew(item.id)}
                                                            className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-1"
                                                            title="Delete card"
                                                        >
                                                            <LogOut size={16} /> {/* Using LogOut icon as a placeholder for trash since Lucide's Trash is not imported */}
                                                        </button>
                                                        <div className="flex items-start justify-between mb-4 pr-6">
                                                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold uppercase tracking-wider">
                                                                {item.icon_type} Icon
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                {new Date(item.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-bold text-gray-800 text-lg mb-2">{item.title}</h4>
                                                        <p className="text-gray-600 text-sm flex-grow mb-4 leading-relaxed">{item.description}</p>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleEditWhatsNew(item)}
                                                                className="flex-grow py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors text-sm"
                                                            >
                                                                Edit
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {whatsNewItems.length === 0 && (
                                        <div className="text-center py-12 text-gray-400">No updates found. Click 'Add New Card' to create one.</div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'upcoming-events' && (
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-6">Manage Upcoming Events</h3>

                                    {/* Add/Edit Form */}
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                                        <h4 className="text-lg font-bold text-gray-800 mb-4">{isEditingUpcomingEvent ? 'Edit Event' : 'Add New Event'}</h4>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentUpcomingEvent.event_name}
                                                    onChange={e => setCurrentUpcomingEvent({ ...currentUpcomingEvent, event_name: e.target.value })}
                                                    placeholder="e.g. Annual Cricket Tournament"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                                                <input
                                                    type="date"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={normalizeUpcomingEventDateValue(currentUpcomingEvent.event_date)}
                                                    onChange={e => setCurrentUpcomingEvent({ ...currentUpcomingEvent, event_date: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Time</label>
                                                <input
                                                    type="time"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={normalizeUpcomingEventTimeValue(currentUpcomingEvent.event_time)}
                                                    onChange={e => setCurrentUpcomingEvent({ ...currentUpcomingEvent, event_time: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentUpcomingEvent.event_venue}
                                                    onChange={e => setCurrentUpcomingEvent({ ...currentUpcomingEvent, event_venue: e.target.value })}
                                                    placeholder="e.g. Main Cricket Ground"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Event Image</label>
                                                <div className="flex flex-col gap-2">
                                                    {currentUpcomingEvent.event_image && (
                                                        <div className="text-xs text-gray-500 mb-1">
                                                            Current: {currentUpcomingEvent.event_image.split('/').pop()}
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept=".jpg,.jpeg,.png"
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                        onChange={e => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                // Validating file size (e.g., 5MB)
                                                                if (file.size > 5 * 1024 * 1024) {
                                                                    setUpcomingEventMessage('Error: File size too large (max 5MB)');
                                                                    e.target.value = ''; // Reset input
                                                                    return;
                                                                }
                                                                setSelectedImage(file);
                                                            } else {
                                                                setSelectedImage(null);
                                                            }
                                                        }}
                                                    />
                                                    <p className="text-xs text-gray-500">Allowed formats: JPG, PNG. Max size: 5MB.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-4 items-center">
                                            <button
                                                onClick={handleSaveUpcomingEvent}
                                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                            >
                                                {isEditingUpcomingEvent ? 'Update Event' : 'Add Event'}
                                            </button>

                                            {isEditingUpcomingEvent && (
                                                <button
                                                    onClick={() => {
                                                        setIsEditingUpcomingEvent(false);
                                                        setCurrentUpcomingEvent(DEFAULT_UPCOMING_EVENT);
                                                        setSelectedImage(null);
                                                        setUpcomingEventMessage('');
                                                    }}
                                                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                                                >
                                                    Cancel
                                                </button>
                                            )}

                                            {upcomingEventMessage && (
                                                <span className={`text-sm ${upcomingEventMessage.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
                                                    {upcomingEventMessage}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* List */}
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {upcomingEvents.map((event) => (
                                            <div key={event.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                                                <div className="h-40 overflow-hidden relative">
                                                    <img src={getImageUrl(event.event_image)} alt={event.event_name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="p-4">
                                                    <h4 className="font-bold text-lg text-gray-800 mb-2">{event.event_name}</h4>
                                                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                                                        <p>📅 {formatUpcomingEventDateValue(event.event_date)}</p>
                                                        <p>⏰ {formatUpcomingEventTimeValue(event.event_time)}</p>
                                                        <p>📍 {event.event_venue}</p>
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setIsEditingUpcomingEvent(true);
                                                                setCurrentUpcomingEvent({ ...event });
                                                                setSelectedImage(null);
                                                                setUpcomingEventMessage('');
                                                                window.scrollTo(0, 0);
                                                            }}
                                                            className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUpcomingEvent(event.id)}
                                                            className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'hall-of-fame' && (
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-6">Manage Hall of Fame</h3>

                                    {/* Add/Edit Form */}
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                                        <h4 className="text-lg font-bold text-gray-800 mb-4">{isEditingHallOfFame ? 'Edit Entry' : 'Add New Entry'}</h4>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Winner / Team Name</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentHallOfFameEntry.winner_name}
                                                    onChange={e => setCurrentHallOfFameEntry({ ...currentHallOfFameEntry, winner_name: e.target.value })}
                                                    placeholder="e.g. John Doe / Cricket Team A"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentHallOfFameEntry.event_name}
                                                    onChange={e => setCurrentHallOfFameEntry({ ...currentHallOfFameEntry, event_name: e.target.value })}
                                                    placeholder="e.g. Annual Cricket Tournament"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Achievement Type</label>
                                                <select
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentHallOfFameEntry.achievement_type}
                                                    onChange={e => setCurrentHallOfFameEntry({ ...currentHallOfFameEntry, achievement_type: e.target.value })}
                                                >
                                                    <option value="Winner">Winner</option>
                                                    <option value="First Runner-Up">First Runner-Up</option>
                                                    <option value="Second Runner-Up">Second Runner-Up</option>
                                                    <option value="Special Achievement">Special Achievement</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                                <input
                                                    type="date"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentHallOfFameEntry.event_date}
                                                    onChange={e => setCurrentHallOfFameEntry({ ...currentHallOfFameEntry, event_date: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentHallOfFameEntry.event_venue}
                                                    onChange={e => setCurrentHallOfFameEntry({ ...currentHallOfFameEntry, event_venue: e.target.value })}
                                                    placeholder="e.g. Main Stadium"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
                                                <div className="flex flex-col gap-2">
                                                    {currentHallOfFameEntry.event_image && (
                                                        <div className="text-xs text-gray-500 mb-1">
                                                            Current: {currentHallOfFameEntry.event_image.split('/').pop()}
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept=".jpg,.jpeg,.png"
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                        onChange={e => {
                                                            const file = e.target.files?.[0];
                                                            setSelectedHallOfFameImage(file || null);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-4 items-center">
                                            <button
                                                onClick={handleSaveHallOfFameEntry}
                                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                            >
                                                {isEditingHallOfFame ? 'Update Entry' : 'Add Entry'}
                                            </button>
                                            {isEditingHallOfFame && (
                                                <button
                                                    onClick={() => {
                                                        setIsEditingHallOfFame(false);
                                                        setCurrentHallOfFameEntry(DEFAULT_HALL_OF_FAME_ENTRY);
                                                        setHallOfFameMessage('');
                                                    }}
                                                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            {hallOfFameMessage && (
                                                <span className={`text-sm ${hallOfFameMessage.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
                                                    {hallOfFameMessage}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Hall of Fame Table */}
                                    <div className="overflow-hidden rounded-xl border border-gray-200">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-100 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Winner</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Event</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Achievement</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {hallOfFameEntries.map((entry) => (
                                                    <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-gray-900">{entry.winner_name}</td>
                                                        <td className="px-6 py-4 text-gray-600">{entry.event_name}</td>
                                                        <td className="px-6 py-4 text-gray-600">{entry.achievement_type}</td>
                                                        <td className="px-6 py-4 text-gray-600">{formatDate(entry.event_date)}</td>
                                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setIsEditingHallOfFame(true);
                                                                    setCurrentHallOfFameEntry({ ...entry });
                                                                    window.scrollTo(0, 0);
                                                                }}
                                                                className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteHallOfFameEntry(entry.id)}
                                                                className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-200 hover:bg-red-50 transition-colors"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {hallOfFameEntries.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No Hall of Fame entries found</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'gallery-manager' && (
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">Gallery Manager</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {galleryImages.length} total image{galleryImages.length === 1 ? '' : 's'} across {galleryCategories.length} categor{galleryCategories.length === 1 ? 'y' : 'ies'}.
                                            </p>
                                        </div>
                                        {galleryMessage && (
                                            <span className={`text-sm px-3 py-1 rounded-full self-start ${galleryMessage.includes('failed') ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                                                {galleryMessage}
                                            </span>
                                        )}
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                                        <h4 className="text-lg font-bold text-gray-800 mb-4">Upload Gallery Image</h4>
                                        <div className="flex flex-wrap items-center justify-start gap-4">
                                            <select
                                                value={selectedGalleryCategoryId}
                                                onChange={(event) => {
                                                    setSelectedGalleryCategoryId(event.target.value);
                                                    setSelectedGalleryUploadFolderId('');
                                                }}
                                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none sm:w-[220px]"
                                            >
                                                <option value="">Select category</option>
                                                {galleryCategories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {formatGalleryCategoryLabel(category.name)}
                                                </option>
                                            ))}
                                            </select>
                                            <select
                                                value={selectedGalleryUploadFolderId}
                                                onChange={(event) => setSelectedGalleryUploadFolderId(event.target.value)}
                                                disabled={!selectedGalleryCategoryId || !selectedGalleryUploadHasFolders}
                                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 sm:w-[260px]"
                                            >
                                                <option value="">{selectedGalleryCategoryId ? 'Select folder' : 'Select category first'}</option>
                                                {selectedGalleryUploadFolderOptions.map((folder) => (
                                                    <option key={folder.id} value={folder.id}>
                                                        {folder.pathLabel}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                ref={galleryFileInputRef}
                                                type="file"
                                                accept=".jpg,.jpeg,.png"
                                                multiple
                                                onChange={handleGalleryFileSelection}
                                                className="block w-full text-sm text-gray-500 sm:w-auto sm:max-w-[320px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                            <button
                                                onClick={handleUploadGalleryImage}
                                                disabled={isGalleryUploading || selectedGalleryFiles.length === 0 || !selectedGalleryCategoryId || !selectedGalleryUploadFolderId}
                                                className="rounded-xl bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {isGalleryUploading ? 'Uploading...' : 'Upload Image'}
                                            </button>
                                        </div>
                                        {selectedGalleryCategoryId && !selectedGalleryUploadHasFolders && (
                                            <p className="mt-3 text-xs text-gray-500">
                                                Create a folder in this category before uploading images.
                                            </p>
                                        )}
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                                        <h4 className="text-lg font-bold text-gray-800 mb-4">Manage Gallery Folders</h4>
                                        <div className="flex flex-wrap items-center justify-start gap-4">
                                            <select
                                                value={selectedGalleryFolderCategoryId}
                                                onChange={(event) => setSelectedGalleryFolderCategoryId(event.target.value)}
                                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none sm:w-[220px]"
                                            >
                                                <option value="">Select category</option>
                                                {galleryCategories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {formatGalleryCategoryLabel(category.name)}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="text"
                                                value={newGalleryFolderName}
                                                onChange={(event) => setNewGalleryFolderName(event.target.value)}
                                                placeholder="New folder name"
                                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none sm:w-[260px]"
                                            />
                                            <button
                                                onClick={handleCreateGalleryFolder}
                                                disabled={isGalleryFolderSaving || !selectedGalleryFolderCategoryId || !newGalleryFolderName.trim()}
                                                className="rounded-xl bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {isGalleryFolderSaving ? 'Saving...' : 'Create Folder'}
                                            </button>
                                        </div>
                                        <p className="mt-3 text-xs text-gray-500">
                                            Create top-level folders here. Use the folder tree actions to add sub-folders, rename folders, or delete empty folders.
                                        </p>

                                        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4">
                                            {!selectedGalleryFolderCategoryId ? (
                                                <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-center text-gray-400">
                                                    Select a category to manage its folder hierarchy.
                                                </div>
                                            ) : selectedGalleryFolderManagerFolders.length === 0 ? (
                                                <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-center text-gray-400">
                                                    No folders created for this category yet.
                                                </div>
                                            ) : (
                                                <GalleryFolderTree
                                                    folders={selectedGalleryFolderManagerFolders}
                                                    imageCountsByFolder={galleryImageCountsByFolder}
                                                    isBusy={isGalleryFolderSaving}
                                                    onAddSubFolder={handleAddGallerySubFolder}
                                                    onRenameFolder={handleRenameGalleryFolder}
                                                    onDeleteFolder={handleDeleteGalleryFolder}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {galleryError && (
                                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                            {galleryError}
                                        </div>
                                    )}

                                    {galleryManagerLoading && (
                                        <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 px-6 py-8 text-center text-gray-500">
                                            Loading gallery manager data...
                                        </div>
                                    )}

                                    {!galleryManagerLoading && galleryCategories.length === 0 && (
                                        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-center text-gray-500">
                                            No gallery categories are available yet.
                                        </div>
                                    )}

                                    {!galleryManagerLoading && galleryCategories.length > 0 && visibleGalleryCategories.length === 0 && (
                                        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-center text-gray-500">
                                            No gallery categories match the current search.
                                        </div>
                                    )}

                                    <div className="space-y-8">
                                        {galleryImagesByCategory.map(({ category, images, folderCount, folderOptions }) => (
                                            <section key={category.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                                                    <div>
                                                        <h4 className="text-lg font-bold text-gray-800">{formatGalleryCategoryLabel(category.name)}</h4>
                                                        <p className="text-sm text-gray-500">
                                                            {images.length} image{images.length === 1 ? '' : 's'} | {folderCount} folder{folderCount === 1 ? '' : 's'} in this category
                                                        </p>
                                                    </div>
                                                </div>

                                                {images.length === 0 ? (
                                                    <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-center text-gray-400">
                                                        No images uploaded to {formatGalleryCategoryLabel(category.name)} yet.
                                                    </div>
                                                ) : (
                                                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                                        {images.map((image) => (
                                                            <div key={image.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                                                                <div className="aspect-[4/3] overflow-hidden bg-white">
                                                                    <img src={image.image_url} alt={formatGalleryCategoryLabel(category.name)} className="h-full w-full object-cover" />
                                                                </div>
                                                                <div className="space-y-3 p-4">
                                                                    <div className="text-xs text-gray-500">
                                                                        {image.uploaded_at ? formatRegistrationSubmittedAt(image.uploaded_at) : 'Recently uploaded'}
                                                                    </div>
                                                                    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500">
                                                                        Folder: {image.folder_id ? (galleryFolderPathMap[image.folder_id] || 'Assigned folder') : 'Unassigned (category root)'}
                                                                    </div>
                                                                    <select
                                                                        value={image.category_id}
                                                                        onChange={(event) => handleMoveGalleryImage(image.id, Number(event.target.value), null)}
                                                                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                                                    >
                                                                        {galleryCategories.map((galleryCategory) => (
                                                                            <option key={galleryCategory.id} value={galleryCategory.id}>
                                                                                {formatGalleryCategoryLabel(galleryCategory.name)}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <select
                                                                        value={image.folder_id ?? ''}
                                                                        onChange={(event) => handleMoveGalleryImage(
                                                                            image.id,
                                                                            image.category_id,
                                                                            event.target.value ? Number(event.target.value) : null
                                                                        )}
                                                                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                                                    >
                                                                        <option value="">Unassigned (category root)</option>
                                                                        {folderOptions.map((folder) => (
                                                                            <option key={folder.id} value={folder.id}>
                                                                                {folder.pathLabel}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <button
                                                                        onClick={() => handleDeleteGalleryImage(image.id, image.image_url)}
                                                                        className="w-full rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                                                                    >
                                                                        Delete Image
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </section>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'pre-gallery' && (
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">Pre-Gallery Manager</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {preGalleryImages.length} of {PRE_GALLERY_SLOTS.length} preview slots configured.
                                            </p>
                                        </div>
                                        {preGalleryMessage && (
                                            <span className={`text-sm px-3 py-1 rounded-full self-start ${preGalleryMessage.includes('failed') ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                                                {preGalleryMessage}
                                            </span>
                                        )}
                                    </div>

                                    {preGalleryError && (
                                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                            {preGalleryError}
                                        </div>
                                    )}

                                    {preGalleryImages.length === 0 && (
                                        <div className="mb-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-center text-gray-500">
                                            No pre-gallery images managed yet. Upload images for slots 1, 2, and 3 below.
                                        </div>
                                    )}

                                    <div className="grid gap-6 lg:grid-cols-3">
                                        {PRE_GALLERY_SLOTS.map((slot) => {
                                            const currentImage = preGalleryImages.find((image) => image.display_order === slot);

                                            return (
                                                <div key={slot} className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div>
                                                            <h4 className="text-lg font-semibold text-gray-800">Image {slot}</h4>
                                                            <p className="text-sm text-gray-500">
                                                                {currentImage ? `Display order ${currentImage.display_order}` : 'No image uploaded yet'}
                                                            </p>
                                                        </div>
                                                        {currentImage?.uploaded_at && (
                                                            <span className="text-xs text-gray-400">
                                                                {formatRegistrationSubmittedAt(currentImage.uploaded_at)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-gray-200 bg-white mb-4">
                                                        {currentImage ? (
                                                            <img
                                                                src={currentImage.image_url}
                                                                alt={`Pre-gallery slot ${slot}`}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full items-center justify-center text-sm text-gray-400">
                                                                Slot {slot} is empty
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-3">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(event) => setSelectedPreGalleryFiles((currentFiles) => ({
                                                                ...currentFiles,
                                                                [slot]: event.target.files?.[0] || null
                                                            }))}
                                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                        />
                                                        <button
                                                            onClick={() => handleUploadPreGalleryImage(slot)}
                                                            disabled={isUploading || !selectedPreGalleryFiles[slot]}
                                                            className="w-full rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                                                        >
                                                            {preGalleryUploadingOrder === slot ? 'Uploading...' : currentImage ? 'Replace Image' : 'Upload Image'}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'about-cms' && (
                                <div className="p-6">
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-bold text-gray-800">Upload About Image</h3>
                                            {aboutMessage && (
                                                <span className={`text-sm px-3 py-1 rounded-full ${aboutMessage.includes('failed') ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                                                    {aboutMessage}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-4 items-center">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setSelectedAboutFile(e.target.files?.[0] || null)}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                            <button
                                                onClick={() => handleUploadCMSImage('about')}
                                                disabled={isUploading || !selectedAboutFile}
                                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 whitespace-nowrap"
                                            >
                                                {isUploading ? 'Uploading...' : 'Upload Image'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {aboutImages.map((img) => (
                                            <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square border border-gray-200 bg-white shadow-sm">
                                                <img src={img.image_url} alt="About" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => handleDeleteCMSImage('about', img.id, img.image_url)}
                                                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
                                                    title="Delete Image"
                                                >
                                                    <LogOut size={16} className="rotate-90" />
                                                </button>
                                            </div>
                                        ))}
                                        {aboutImages.length === 0 && (
                                            <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                                                No About images managed via CMS yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'vision-cms' && (
                                <div className="p-6">
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-bold text-gray-800">Upload Vision Image</h3>
                                            {visionMessage && (
                                                <span className={`text-sm px-3 py-1 rounded-full ${visionMessage.includes('failed') ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                                                    {visionMessage}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-4 items-center">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setSelectedVisionFile(e.target.files?.[0] || null)}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                            <button
                                                onClick={() => handleUploadCMSImage('vision')}
                                                disabled={isUploading || !selectedVisionFile}
                                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 whitespace-nowrap"
                                            >
                                                {isUploading ? 'Uploading...' : 'Upload Image'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {visionImages.map((img) => (
                                            <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square border border-gray-200 bg-white shadow-sm">
                                                <img src={img.image_url} alt="Vision" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => handleDeleteCMSImage('vision', img.id, img.image_url)}
                                                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
                                                    title="Delete Image"
                                                >
                                                    <LogOut size={16} className="rotate-90" />
                                                </button>
                                            </div>
                                        ))}
                                        {visionImages.length === 0 && (
                                            <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                                                No Vision images managed via CMS yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
}
