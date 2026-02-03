import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BackButton from './BackButton';

// Import images from local assets
import img1 from '../assets/about/33.JPG';
import img2 from '../assets/about/44.JPG';
import img3 from '../assets/about/3.jpg';
import img4 from '../assets/about/11.JPG';
import img5 from '../assets/about/15.JPG';

const images = [img1, img2, img3, img4, img5];

export default function About() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % images.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

    return (
        <div className="pt-24 px-4 max-w-7xl mx-auto mb-20">
            <BackButton className="mb-6" />
            <div className="backdrop-blur-xl bg-white/40 rounded-3xl p-8 md:p-12 border border-white/50 shadow-2xl overflow-hidden">
                <div className="flex flex-col lg:flex-row gap-12 items-center">
                    {/* Text Section */}
                    <div className="lg:w-1/2">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-6">
                            About CESC Officers' Sports Club
                        </h1>
                        <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                            <p>
                                CESC Officers’ Sports Club (CESCOSC) was established in the year 1988, with CESC House as its Registered Office, to bring colleagues together around a shared passion for sports. At its inception, the club had only seven Officers from different departments of the company as members. Back then, Lawn Tennis was the sport that the club focused on.
                            </p>
                            <p>
                                Over the years, the club has grown and has inducted several other sporting activities like Cricket, Football, Table Tennis, Badminton and other Fitness Workshops.
                            </p>
                        </div>
                    </div>

                    {/* Carousel Section */}
                    <div className="lg:w-1/2 w-full">
                        <div className="relative group aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/80 transition-shadow hover:shadow-blue-500/20">
                            {images.map((img, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                                        }`}
                                >
                                    <div className="relative w-full h-full overflow-hidden">
                                        <img
                                            src={img}
                                            alt={`Club Activity ${index + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            ))}

                            {/* Navigation Arrows */}
                            <button
                                onClick={prevSlide}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full backdrop-blur-md bg-white/20 border border-white/40 text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full backdrop-blur-md bg-white/20 border border-white/40 text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
                            >
                                <ChevronRight size={24} />
                            </button>

                            {/* Dots */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentIndex ? 'bg-blue-600 w-6' : 'bg-gray-400/50'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
