import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BackButton from './BackButton';
import { supabase } from '../lib/supabase';

export default function Vision() {
    const [images, setImages] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const { data, error } = await supabase
                    .from('vision_images')
                    .select('image_url')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (data && data.length > 0) {
                    setImages(data.map((img: { image_url: string }) => img.image_url));
                }
            } catch (err) {
                console.error('Error fetching vision images:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    useEffect(() => {
        if (images.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev: number) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [images]);

    const nextSlide = () => images.length > 0 && setCurrentIndex((prev: number) => (prev + 1) % images.length);
    const prevSlide = () => images.length > 0 && setCurrentIndex((prev: number) => (prev - 1 + images.length) % images.length);

    return (
        <div className="pt-24 px-4 max-w-7xl mx-auto mb-20">
            <BackButton className="mb-6" />
            <div className="backdrop-blur-xl bg-white/40 rounded-3xl p-8 md:p-12 border border-white/50 shadow-2xl overflow-hidden">
                <div className="flex flex-col lg:flex-row gap-12 items-center">
                    {/* Text Section */}
                    <div className="lg:w-1/2">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-8">
                            Vision & Mission
                        </h1>
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="w-8 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"></span>
                                    Vision
                                </h2>
                                <p className="text-lg text-gray-700 leading-relaxed">
                                    To foster a sporting culture among CESC Officers which transpires to better teamwork, increased productivity, improved well-being and enhanced work-life balance.
                                </p>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="w-8 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"></span>
                                    Mission
                                </h2>
                                <p className="text-lg text-gray-700 leading-relaxed">
                                    By organising various sports events and offering access to sporting facilities, we aim to motivate our CESC officers and their families to prioritize fitness. Additionally, we strive to develop talent and proudly represent CESC in numerous inter-corporate events.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Carousel Section */}
                    <div className="lg:w-1/2 w-full">
                        <div className="relative group aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/80 transition-shadow hover:shadow-blue-500/20 bg-gray-100">
                            {loading ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                </div>
                            ) : images.length > 0 ? (
                                <>
                                    {images.map((img: string, index: number) => (
                                        <div
                                            key={index}
                                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                                                }`}
                                        >
                                            <div className="relative w-full h-full overflow-hidden">
                                                <img
                                                    src={img}
                                                    alt={`Vision and Mission ${index + 1}`}
                                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                                    loading="lazy"
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
                                        {images.map((_: any, index: number) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentIndex(index)}
                                                className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentIndex ? 'bg-blue-600 w-6' : 'bg-gray-400/50'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                    No images found. Please upload via Admin Dashboard.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
