import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import heroLogo from '../../logo/logoMain.png';
import badmintonImg from '../assets/hero_slides/Badminton.JPG';
import cricketImg from '../assets/hero_slides/Cricket.JPG';
import footballImg from '../assets/hero_slides/Football.jpg';
import ttImg from '../assets/hero_slides/TT.jpg';
import tennisImg from '../assets/hero_slides/Tennis.JPG';
import fitnessImg from '../assets/hero_slides/FITNESS_WORKSHOP.jpg';

const slides = [
  {
    logo: heroLogo,
    title: 'Building champions and fostering sporting excellence since 1988.',
    subtitle: 'For decades, the club has empowered employees and families through competitive spirit, teamwork, and a culture of sporting excellence.',
    image: 'https://images.pexels.com/photos/3621788/pexels-photo-3621788.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    title: 'Tennis',
    subtitle: 'Precision, discipline, and composure.',
    image: tennisImg
  },
  {
    title: 'Badminton',
    subtitle: 'Speed, focus, and resilience.',
    image: badmintonImg
  },
  {
    title: 'Fitness Workshop',
    subtitle: 'Well-being through active living.',
    image: fitnessImg
  },
  {
    title: 'Football',
    subtitle: 'Unity, strategy, and shared effort.',
    image: footballImg
  },
  {
    title: 'Table Tennis',
    subtitle: 'Reflexes, rhythm, and control.',
    image: ttImg
  },
  {
    title: 'Cricket',
    subtitle: 'Tradition, teamwork, and competitive spirit.',
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
                <div className={`text-center bg-white/1 rounded-3xl flex flex-col justify-center items-center border border-white/30 shadow-2xl transform transition-all duration-700 ${slide.logo ? 'w-[700px] h-[450px] max-w-[90%] backdrop-blur-[8px]' : 'w-[500px] h-[300px] max-w-[90%] px-6 py-8 backdrop-blur-[2px]'}`}>
                  {slide.logo ? (
                    <div className="flex h-full w-full items-center justify-center p-5 sm:p-7 md:p-9 lg:p-10">
                      <img
                        src={slide.logo}
                        alt="CESC Sports Club"
                        className="block h-auto w-auto max-h-full max-w-full object-contain"
                      />
                    </div>
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
