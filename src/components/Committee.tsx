import { useEffect, useMemo, useState } from 'react';
import { Shield } from 'lucide-react';
import BackButton from './BackButton';
import {
    fetchExecutiveCommitteeMembers,
    resolveExecutiveCommitteeImage,
    type ExecutiveCommitteeMember
} from '../lib/executiveCommittee';

export default function Committee() {
    const [members, setMembers] = useState<ExecutiveCommitteeMember[]>([]);

    useEffect(() => {
        let isMounted = true;

        const loadMembers = async () => {
            try {
                const data = await fetchExecutiveCommitteeMembers();

                if (isMounted) {
                    setMembers(data);
                }
            } catch (error) {
                console.error('Failed to load executive committee members:', error);
            }
        };

        void loadMembers();

        return () => {
            isMounted = false;
        };
    }, []);

    const leadership = useMemo(
        () => members.filter(member => member.section === 'leadership'),
        [members]
    );
    const generalSecretary = useMemo(
        () => members.find(member => member.section === 'general_secretary') || null,
        [members]
    );
    const sportsMentors = useMemo(
        () => members.filter(member => member.section === 'sports_mentor'),
        [members]
    );
    const coreManagement = useMemo(
        () => members.filter(member => member.section === 'core_management'),
        [members]
    );

    return (
        <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-slate-50 to-white min-h-screen">
            <div className="max-w-7xl mx-auto">
                <BackButton className="mb-8" />
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-600 mb-4">
                        Executive Committee
                    </h2>
                    <div className="h-1.5 w-24 bg-gradient-to-r from-blue-600 to-cyan-500 mx-auto rounded-full mb-6" />
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto italic">
                        "Leading with vision, executing with passion"
                    </p>
                </div>

                {/* --- Tier 1: Top Leadership --- */}
                <div className="mb-24">
                    <h3 className="text-2xl font-bold text-gray-800 text-center mb-12 uppercase tracking-widest text-sm text-blue-900/60">
                        Leadership
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
                        {leadership.slice(0, 2).map((member) => (
                            <div
                                key={member.id}
                                className="group relative bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-blue-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 w-full max-w-sm mx-auto flex flex-col items-center text-center ring-1 ring-blue-50"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-t-2xl" />
                                <div className="w-32 h-32 rounded-full overflow-hidden mb-5 border-4 border-blue-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                    <img
                                        src={resolveExecutiveCommitteeImage(member.image_url)}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h4 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h4>
                                <p className="text-blue-700 font-bold uppercase tracking-wider text-sm">{member.designation}</p>
                            </div>
                        ))}
                    </div>

                    {/* Other Leaders Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {leadership.slice(2).map((member) => (
                            <div
                                key={member.id}
                                className="group relative bg-white rounded-xl p-6 border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
                            >
                                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-gray-100 group-hover:border-blue-200 transition-colors">
                                    <img
                                        src={resolveExecutiveCommitteeImage(member.image_url)}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h4 className="text-lg font-bold text-gray-800 mb-1">{member.name}</h4>
                                <p className="text-gray-500 font-semibold text-xs uppercase tracking-wider">{member.designation}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-px w-full max-w-4xl mx-auto bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-20" />

                {generalSecretary && (
                    <div className="mb-20 flex justify-center">
                        <div className="relative bg-gradient-to-br from-blue-50 to-white rounded-xl p-8 border border-blue-100/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row items-center gap-6 max-w-2xl w-full">
                            <div className="w-24 h-24 shrink-0 rounded-full overflow-hidden border-2 border-white shadow-md">
                                <img
                                    src={resolveExecutiveCommitteeImage(generalSecretary.image_url)}
                                    alt={generalSecretary.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                    <h3 className="text-xl font-bold text-gray-800">{generalSecretary.name}</h3>
                                    <Shield className="text-blue-500" size={18} />
                                </div>
                                <p className="text-blue-600 font-bold uppercase tracking-wider text-sm mb-2">{generalSecretary.designation}</p>
                                {generalSecretary.description && (
                                    <p className="text-gray-500 text-sm">{generalSecretary.description}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Tier 3: Sports Mentors --- */}
                <div className="mb-12">
                    <h3 className="text-2xl font-bold text-gray-800 text-center mb-12 uppercase tracking-widest text-sm text-blue-900/60">
                        SPORTS INCHARGE
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sportsMentors.map((member) => (
                            <div
                                key={member.id}
                                className="group bg-white rounded-xl p-5 border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 text-left"
                            >
                                <div className="w-16 h-16 shrink-0 rounded-full overflow-hidden border border-gray-100 group-hover:border-blue-100">
                                    <img
                                        src={resolveExecutiveCommitteeImage(member.image_url)}
                                        alt={member.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-800 truncate">{member.name}</h4>
                                    <p className="text-blue-600 font-semibold text-xs mb-1">{member.sport}</p>
                                    {member.team.length > 0 && (
                                        <div className="text-[10px] text-gray-500 leading-tight">
                                            <span className="font-medium text-gray-400">Team: </span>
                                            {member.team.join(', ')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-px w-full max-w-4xl mx-auto bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-20" />

                {/* --- Tier 2: Core Management --- */}
                <div className="mb-20">
                    <h3 className="text-2xl font-bold text-gray-800 text-center mb-12 uppercase tracking-widest text-sm text-blue-900/60">
                        Core Management & Operations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 justify-center">
                        {coreManagement.map((member) => (
                            <div
                                key={member.id}
                                className="group bg-white rounded-xl p-6 border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center h-full"
                            >
                                <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-gray-50 group-hover:border-blue-100 transition-colors">
                                    <img
                                        src={resolveExecutiveCommitteeImage(member.image_url)}
                                        alt={member.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <h4 className="text-sm font-bold text-gray-800 mb-1">{member.name}</h4>
                                <p className="text-blue-600 font-medium text-xs mb-3">{member.designation}</p>

                                {member.team.length > 0 && (
                                    <div className="mt-auto pt-3 border-t border-gray-50 w-full">
                                        <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Team</p>
                                        <div className="text-xs text-gray-600 space-y-0.5">
                                            {member.team.map((m, i) => (
                                                <div key={i}>{m}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
