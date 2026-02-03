import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
    className?: string;
    label?: string;
}

export default function BackButton({ className = '', label = 'Back' }: BackButtonProps) {
    const handleBack = () => {
        window.history.back();
    };

    return (
        <button
            onClick={handleBack}
            className={`group flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-white/50 transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-blue-100 ${className}`}
            aria-label="Go back"
        >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">{label}</span>
        </button>
    );
}
