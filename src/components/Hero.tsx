import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import clubLogo from '../assets/logo/CESC Sports club logo.jpg';
import badmintonImg from '../assets/hero_slides/Badminton.JPG';
import cricketImg from '../assets/hero_slides/Cricket.JPG';
import footballImg from '../assets/hero_slides/Football.jpg';
import ttImg from '../assets/hero_slides/TT.jpg';
import tennisImg from '../assets/hero_slides/Tennis.JPG';
import fitnessImg from '../assets/hero_slides/FITNESS_WORKSHOP.jpg';

const slides = [
  {
    logo: clubLogo,
    title: 'Excellence in Sports',
    subtitle: 'Building Champions, Creating Legends',
    image: 'https://images.pexels.com/photos/3621788/pexels-photo-3621788.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    title: 'Tennis',
    subtitle: 'Ace Your Game',
    image: tennisImg
  },
  {
    title: 'Badminton',
    subtitle: 'Agility and Speed',
    image: badmintonImg
  },
  {
    title: 'Fitness Workshop',
    subtitle: 'Healthy Body, Healthy Mind',
    image: fitnessImg
  },
  {
    title: 'Football',
    subtitle: 'Passion on the Field',
    image: footballImg
  },
  {
    title: 'Table Tennis',
    subtitle: 'Fast Paced Action',
    image: ttImg
  },
  {
    title: 'Cricket',
    subtitle: 'The Spirit of the Game',
    image: cricketImg
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative pt-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="relative h-[600px] rounded-3xl overflow-hidden group">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-700 ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`text-center bg-white/1 rounded-3xl flex flex-col justify-center items-center border border-white/30 shadow-2xl transform transition-all duration-700 ${slide.logo ? 'w-[700px] h-[450px] backdrop-blur-[8px]' : 'w-[500px] h-[300px] backdrop-blur-[2px]'}`}>
                  {/* @ts-ignore */}
                  {slide.logo ? (
                    <>
                      <img
                        src={slide.logo}
                        alt="CESC Sports Club"
                        className="w-96 h-auto mx-auto mb-6 object-contain"
                      />
                      <h1 className="text-3xl font-bold text-white text-center leading-tight">
                        CESC Officer's Sports Club
                      </h1>
                    </>
                  ) : (
                    <>
                      <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
                        {slide.title}
                      </h1>
                      <p className="text-xl text-white/90 font-light">
                        {slide.subtitle}
                      </p>
                    </>
                  )}

                </div>
              </div>
            </div>
          ))}

          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full backdrop-blur-xl bg-white/20 border border-white/30 hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="text-white" size={24} />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full backdrop-blur-xl bg-white/20 border border-white/30 hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="text-white" size={24} />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
