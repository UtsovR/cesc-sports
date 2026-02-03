import { Shield, Award, MessageSquare, Heart, Lightbulb, Music, Users, Star, User } from 'lucide-react';
import BackButton from './BackButton';

// Import images from local assets
import img1 from '../assets/committee/image1.jpeg'; // Used for Treasury & Cultural (Kaushik & Anindya)
import img2 from '../assets/committee/image2.jpeg'; // Used for Comm & Athletics (Roshni)
import img3 from '../assets/committee/image3.JPG'; // Branding (Amit Das)
import img4 from '../assets/committee/image4.jpeg'; // Tennis & Badminton (Sampad/Shampad & Soumyajit)
import img5 from '../assets/committee/image5.jpeg'; // Football (Suvro)
import img6 from '../assets/committee/image6.jpeg'; // Cricket (Majidur)
import img8 from '../assets/committee/image8.jpeg'; // TT (Ramkrishna)
import img9 from '../assets/committee/image9.JPG'; // Gen Sec (Suhash)
import img16 from '../assets/committee/image16.jpeg'; // FGR (Rajrupa/Rajpura)
import img10 from '../assets/committee/image10.jpeg'; // Cultural (Anindya)
import img7 from '../assets/committee/image7.png'; // Badminton (Soumyajit)                                                            

// Advisory Board Images
import presidentImg from '../assets/committee/president.jpeg';
import vp1Img from '../assets/committee/vp1.jpeg';
import vp2Img from '../assets/committee/vp2.png';
import patronImg from '../assets/committee/patron.jpeg';
import mentorImg from '../assets/committee/mentor.JPG';

// --- Data Structure Based on New Hierarchy ---

// Tier 1: Top Leadership
const leadership = [
    {
        name: 'Mr. Kapil Thapar',
        role: 'President',
        image: presidentImg,
        highlight: true // Special styling for President
    },
    {
        name: 'Mr. Subir Verma',
        role: 'Chief Patron',
        image: patronImg
    },
    {
        name: 'Mr. Snehasis Shamaddar',
        role: 'Vice President',
        image: vp1Img
    },
    {
        name: 'Mr. Vernon Morais',
        role: 'Vice President',
        image: vp2Img
    },
    {
        name: 'Mr. Bratin Ghosh',
        role: 'Mentor',
        image: mentorImg
    }
];

// Tier 2: Core Management & Operations
const coreManagement = [
    {
        name: 'Kaushik Bhattacharya',
        role: 'Treasury Secretary',
        department: 'Treasury',
        image: img1,
        icon: Award,
        team: ['Pradipta Hati', 'Tanmoy Mishra']
    },
    {
        name: 'Amit Das',
        role: 'BTM Secretary',
        department: 'Branding & Talent Management',
        image: img3,
        icon: Lightbulb,
        team: ['Arijit Mitra']
    },
    {
        name: 'Roshni Guhathakurta',
        role: 'Comm. Secretary',
        department: 'Communication',
        image: img2,
        icon: MessageSquare,
        team: ['Tathagata Roy Chowdhury', 'Puskar Basu']
    },
    {
        name: 'Anindya Sen',
        role: 'Cultural Secretary',
        department: 'Cultural',
        image: img10,
        icon: Music,
        team: ['Nilanjan Daripa', 'Eshita Roy']
    },
    {
        name: 'Rajpura Majumder',
        role: 'FGR Secretary',
        department: 'Feedback & Grievance',
        image: img16,
        icon: Heart,
        team: ['Sujay Sahu']
    }
];

// Tier 4: General Secretary (Special Placement)
const generalSecretary = {
    name: 'Suhash Chakraborty',
    role: 'General Secretary',
    image: img9,
    icon: Shield
};

// Tier 3: Sports Mentors
const sportsMentors = [
    {
        name: 'Shampad Ghosh',
        role: 'Tennis Secretary',
        department: 'Tennis',
        image: img4,
        team: ['Sangram Singha', 'Debmalya Datta']
    },
    {
        name: 'Suvro Banerjee',
        role: 'Football Secretary',
        department: 'Football',
        image: img5,
        team: ['Soumik Nag Roy', 'Avik Mallick']
    },
    {
        name: 'Majidur Islam',
        role: 'Cricket Secretary',
        department: 'Cricket',
        image: img6,
        team: ['Sourav Gupta', 'Arnab Choudhury']
    },
    {
        name: 'Ramkrishna Shah',
        role: 'Table Tennis Secretary',
        department: 'Table Tennis',
        image: img8,
        team: ['Sujay Podder', 'Biswajit Saha']
    },
    {
        name: 'Soumyajit Konar',
        role: 'Badminton Secretary',
        department: 'Badminton',
        image: img7,
        team: ['Sakya Singha Maity', 'Swagata Banerjee']
    },
    {
        name: 'Ms. Roshni Guhathakurta',
        role: 'Athletics Secretary',
        department: 'Athletics',
        image: img2,
        team: ['Sourya Banerjee']
    }
];

export default function Committee() {
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

                    {/* President - Center Standalone */}
                    <div className="flex justify-center mb-12">
                        <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-blue-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 w-full max-w-sm flex flex-col items-center text-center ring-1 ring-blue-50">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-t-2xl" />
                            <div className="w-32 h-32 rounded-full overflow-hidden mb-5 border-4 border-blue-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                <img
                                    src={leadership[0].image}
                                    alt={leadership[0].name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900 mb-2">{leadership[0].name}</h4>
                            <p className="text-blue-700 font-bold uppercase tracking-wider text-sm">{leadership[0].role}</p>
                        </div>
                    </div>

                    {/* Other Leaders Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {leadership.slice(1).map((member, index) => (
                            <div
                                key={index}
                                className="group relative bg-white rounded-xl p-6 border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
                            >
                                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-gray-100 group-hover:border-blue-200 transition-colors">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h4 className="text-lg font-bold text-gray-800 mb-1">{member.name}</h4>
                                <p className="text-gray-500 font-semibold text-xs uppercase tracking-wider">{member.role}</p>
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
                        {coreManagement.map((member, index) => (
                            <div
                                key={index}
                                className="group bg-white rounded-xl p-6 border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center h-full"
                            >
                                <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-gray-50 group-hover:border-blue-100 transition-colors">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <h4 className="text-sm font-bold text-gray-800 mb-1">{member.name}</h4>
                                <p className="text-blue-600 font-medium text-xs mb-3">{member.department}</p>

                                {member.team && (
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

                {/* --- Tier 4: General Secretary (Bridge) --- */}
                <div className="mb-20 flex justify-center">
                    <div className="relative bg-gradient-to-br from-blue-50 to-white rounded-xl p-8 border border-blue-100/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row items-center gap-6 max-w-2xl w-full">
                        <div className="w-24 h-24 shrink-0 rounded-full overflow-hidden border-2 border-white shadow-md">
                            <img
                                src={generalSecretary.image}
                                alt={generalSecretary.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <h3 className="text-xl font-bold text-gray-800">{generalSecretary.name}</h3>
                                <Shield className="text-blue-500" size={18} />
                            </div>
                            <p className="text-blue-600 font-bold uppercase tracking-wider text-sm mb-2">{generalSecretary.role}</p>
                            <p className="text-gray-500 text-sm">Overseeing strategic initiatives and club administration.</p>
                        </div>
                    </div>
                </div>

                <div className="h-px w-full max-w-4xl mx-auto bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-20" />

                {/* --- Tier 3: Sports Mentors --- */}
                <div className="mb-12">
                    <h3 className="text-2xl font-bold text-gray-800 text-center mb-12 uppercase tracking-widest text-sm text-blue-900/60">
                        Sports Mentors
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sportsMentors.map((member, index) => (
                            <div
                                key={index}
                                className="group bg-white rounded-xl p-5 border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 text-left"
                            >
                                <div className="w-16 h-16 shrink-0 rounded-full overflow-hidden border border-gray-100 group-hover:border-blue-100">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-800 truncate">{member.name}</h4>
                                    <p className="text-blue-600 font-semibold text-xs mb-1">{member.department}</p>
                                    {member.team && (
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

            </div>
        </section>
    );
}
