import { supabase } from './supabase';

import img1 from '../assets/committee/image1.jpeg';
import img2 from '../assets/committee/image2.jpeg';
import img3 from '../assets/committee/image3.JPG';
import img4 from '../assets/committee/image4.jpeg';
import img5 from '../assets/committee/image5.jpeg';
import img6 from '../assets/committee/image6.jpeg';
import img7 from '../assets/committee/image7.png';
import img8 from '../assets/committee/image8.jpeg';
import img9 from '../assets/committee/image9.JPG';
import img10 from '../assets/committee/image10.jpeg';
import img16 from '../assets/committee/image16.jpeg';
import mentorImg from '../assets/committee/mentor.JPG';
import patronImg from '../assets/committee/patron.jpeg';
import presidentImg from '../assets/committee/president.jpeg';
import vp1Img from '../assets/committee/vp1.jpeg';
import vp2Img from '../assets/committee/vp2.png';

export type ExecutiveCommitteeSection =
    | 'leadership'
    | 'general_secretary'
    | 'sports_mentor'
    | 'core_management';

export interface ExecutiveCommitteeMember {
    id: string;
    section: ExecutiveCommitteeSection;
    name: string;
    designation: string | null;
    sport: string | null;
    team: string[];
    description: string | null;
    image_url: string | null;
    display_order: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ExecutiveCommitteeMemberPayload {
    section: ExecutiveCommitteeSection;
    name: string;
    designation: string | null;
    sport: string | null;
    team: string[] | null;
    description: string | null;
    image_url: string | null;
    display_order: number;
    is_active: boolean;
}

const EXECUTIVE_COMMITTEE_BUCKET = 'executive-committee';

type SupabaseErrorLike = {
    message?: string;
    name?: string;
    statusCode?: string | number;
    details?: string;
    hint?: string;
    code?: string;
};

const committeeAssetMap: Record<string, string> = {
    'asset:committee/image1.jpeg': img1,
    'asset:committee/image2.jpeg': img2,
    'asset:committee/image3.JPG': img3,
    'asset:committee/image4.jpeg': img4,
    'asset:committee/image5.jpeg': img5,
    'asset:committee/image6.jpeg': img6,
    'asset:committee/image7.png': img7,
    'asset:committee/image8.jpeg': img8,
    'asset:committee/image9.JPG': img9,
    'asset:committee/image10.jpeg': img10,
    'asset:committee/image16.jpeg': img16,
    'asset:committee/mentor.JPG': mentorImg,
    'asset:committee/patron.jpeg': patronImg,
    'asset:committee/president.jpeg': presidentImg,
    'asset:committee/vp1.jpeg': vp1Img,
    'asset:committee/vp2.png': vp2Img
};

const sortExecutiveCommitteeMembers = (members: ExecutiveCommitteeMember[]) =>
    [...members].sort((first, second) => first.display_order - second.display_order);

const normalizeDuplicateValue = (value?: string | null) => value?.trim().toLowerCase() || '';

export const getExecutiveCommitteeDuplicateKey = ({
    section,
    name,
    designation,
    sport,
    team
}: Pick<ExecutiveCommitteeMemberPayload, 'section' | 'name' | 'designation' | 'sport' | 'team'>) => [
    section,
    normalizeDuplicateValue(name),
    normalizeDuplicateValue(designation),
    normalizeDuplicateValue(sport),
    Array.isArray(team) ? team.map(member => member.trim()).filter(Boolean).join('\u001f') : ''
].join('\u001e');

export const getExecutiveCommitteeErrorMessage = (
    error: unknown,
    fallback = 'Executive committee request failed.'
) => {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    if (error && typeof error === 'object') {
        const supabaseError = error as SupabaseErrorLike;
        return supabaseError.message
            || supabaseError.details
            || supabaseError.hint
            || supabaseError.code
            || fallback;
    }

    return fallback;
};

const logSupabaseError = (label: string, error: unknown) => {
    if (error && typeof error === 'object') {
        const supabaseError = error as SupabaseErrorLike;
        console.error(label, {
            message: supabaseError.message,
            details: supabaseError.details,
            hint: supabaseError.hint,
            code: supabaseError.code
        });
        return;
    }

    console.error(label, error);
};

const throwExecutiveCommitteeError = (label: string, error: unknown, fallback?: string): never => {
    logSupabaseError(label, error);
    throw new Error(getExecutiveCommitteeErrorMessage(error, fallback));
};

const throwExecutiveCommitteeImageUploadError = (error: unknown): never => {
    const storageError = error as SupabaseErrorLike;
    console.error('Executive committee image upload error:', {
        message: storageError?.message,
        name: storageError?.name,
        statusCode: storageError?.statusCode
    });
    throw new Error(getExecutiveCommitteeErrorMessage(error, 'Image upload failed. Please check console.'));
};

const sanitizeExecutiveCommitteePayload = (
    data: ExecutiveCommitteeMemberPayload
): ExecutiveCommitteeMemberPayload => ({
    section: data.section,
    name: data.name.trim(),
    designation: data.designation?.trim() || null,
    sport: data.sport?.trim() || null,
    team: Array.isArray(data.team)
        ? data.team.map(member => member.trim()).filter(Boolean)
        : null,
    description: data.description?.trim() || null,
    image_url: data.image_url?.trim() || null,
    display_order: Number(data.display_order) || 0,
    is_active: Boolean(data.is_active)
});

export const normalizeExecutiveCommitteeTeam = (team: unknown): string[] => {
    if (Array.isArray(team)) {
        return team.map(String).map(item => item.trim()).filter(Boolean);
    }

    if (typeof team === 'string') {
        try {
            const parsedTeam = JSON.parse(team);
            if (Array.isArray(parsedTeam)) {
                return parsedTeam.map(String).map(item => item.trim()).filter(Boolean);
            }
        } catch {
            return team.split(',').map(item => item.trim()).filter(Boolean);
        }
    }

    return [];
};

export const normalizeExecutiveCommitteeMember = (member: Record<string, unknown>): ExecutiveCommitteeMember => ({
    id: String(member.id),
    section: member.section as ExecutiveCommitteeSection,
    name: String(member.name || ''),
    designation: member.designation ? String(member.designation) : null,
    sport: member.sport ? String(member.sport) : null,
    team: normalizeExecutiveCommitteeTeam(member.team),
    description: member.description ? String(member.description) : null,
    image_url: member.image_url ? String(member.image_url) : null,
    display_order: Number(member.display_order || 0),
    is_active: Boolean(member.is_active),
    created_at: member.created_at ? String(member.created_at) : undefined,
    updated_at: member.updated_at ? String(member.updated_at) : undefined
});

export const resolveExecutiveCommitteeImage = (imageUrl?: string | null) => {
    if (!imageUrl) {
        return '';
    }

    if (committeeAssetMap[imageUrl]) {
        return committeeAssetMap[imageUrl];
    }

    if (
        imageUrl.startsWith('http://')
        || imageUrl.startsWith('https://')
        || imageUrl.startsWith('data:')
        || imageUrl.startsWith('/')
    ) {
        return imageUrl;
    }

    return supabase.storage.from(EXECUTIVE_COMMITTEE_BUCKET).getPublicUrl(imageUrl).data.publicUrl;
};

export const fetchExecutiveCommitteeMembers = async () => {
    const { data, error } = await supabase
        .from('executive_committee_members')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

    if (error) {
        throwExecutiveCommitteeError('Supabase public executive committee fetch error:', error);
    }

    return sortExecutiveCommitteeMembers((data || []).map(member => normalizeExecutiveCommitteeMember(member)));
};

export const fetchExecutiveCommitteeMembersAdmin = async () => {
    const { data, error } = await supabase
        .from('executive_committee_members')
        .select('*')
        .order('display_order', { ascending: true });

    if (error) {
        throwExecutiveCommitteeError('Supabase admin executive committee fetch error:', error);
    }

    return sortExecutiveCommitteeMembers((data || []).map(member => normalizeExecutiveCommitteeMember(member)));
};

export const updateExecutiveCommitteeMember = async (
    id: string,
    data: Partial<ExecutiveCommitteeMemberPayload>
) => {
    const { error } = await supabase
        .from('executive_committee_members')
        .update({
            ...data,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) {
        throwExecutiveCommitteeError('Supabase executive committee update error:', error);
    }
};

export const createExecutiveCommitteeMember = async (data: ExecutiveCommitteeMemberPayload) => {
    const payload = sanitizeExecutiveCommitteePayload(data);
    const payloadDuplicateKey = getExecutiveCommitteeDuplicateKey(payload);

    const { data: existingMembers, error: duplicateCheckError } = await supabase
        .from('executive_committee_members')
        .select('section, name, designation, sport, team')
        .eq('section', payload.section);

    if (duplicateCheckError) {
        throwExecutiveCommitteeError('Supabase duplicate check error:', duplicateCheckError);
    }

    const hasDuplicate = (existingMembers || []).some(member => (
        getExecutiveCommitteeDuplicateKey({
            section: member.section as ExecutiveCommitteeSection,
            name: String(member.name || ''),
            designation: member.designation ? String(member.designation) : null,
            sport: member.sport ? String(member.sport) : null,
            team: normalizeExecutiveCommitteeTeam(member.team)
        }) === payloadDuplicateKey
    ));

    if (hasDuplicate) {
        throw new Error('This member already exists in this section.');
    }

    const { data: createdMember, error } = await supabase
        .from('executive_committee_members')
        .insert([payload])
        .select('*')
        .single();

    if (error) {
        throwExecutiveCommitteeError('Supabase insert error:', error, 'Add failed. Please check console.');
    }

    return normalizeExecutiveCommitteeMember(createdMember);
};

export const deleteExecutiveCommitteeMember = async (id: string) => {
    const { error } = await supabase
        .from('executive_committee_members')
        .delete()
        .eq('id', id);

    if (error) {
        throwExecutiveCommitteeError('Supabase executive committee delete error:', error);
    }
};

export const uploadExecutiveCommitteeImage = async (
    id: string,
    section: ExecutiveCommitteeSection,
    file: File
) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || (file.type === 'image/png' ? 'png' : 'jpg');
    const safeBaseName = file.name
        .replace(/\.[^/.]+$/, '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        || 'committee-photo';
    const fileName = `${section}/${id}/${Date.now()}-${safeBaseName}.${fileExtension}`;

    const { data, error } = await supabase.storage
        .from(EXECUTIVE_COMMITTEE_BUCKET)
        .upload(fileName, file);

    if (error) {
        throwExecutiveCommitteeImageUploadError(error);
    }

    if (!data?.path) {
        throw new Error('Image upload did not return a storage path.');
    }

    return supabase.storage.from(EXECUTIVE_COMMITTEE_BUCKET).getPublicUrl(data.path).data.publicUrl;
};
