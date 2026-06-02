import { useRef } from 'react';
import { Banner } from '@/types/banners';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

interface BannerCarouselProps {
    banners: Banner[];
}

const BannerCarousel = ({ banners }: BannerCarouselProps) => {
    const plugin = useRef(
        Autoplay({ delay: 4000, stopOnInteraction: true })
    );

    if (!banners.length) return null;

    return (
        <div dir="ltr" className="relative w-full h-full">
            <Carousel
                plugins={[plugin.current]}
                className="w-full h-full"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
                opts={{
                    loop: true,
                }}
            >
                <CarouselContent className="h-full ml-0">
                    {banners.map((banner) => (
                        <CarouselItem key={banner.id} className="relative h-full pl-0 overflow-hidden">
                            {banner.link ? (
                                <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative group">
                                    <div
                                        className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                        style={{ backgroundImage: `url(${banner.image_url})` }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                                    {(banner.title || banner.description) && (
                                        <div className="absolute bottom-4 right-6 left-6 md:bottom-8 md:right-10 md:left-10 text-white z-20 pointer-events-none">
                                            {banner.title && <h3 className="text-xl md:text-3xl font-display font-bold mb-2 drop-shadow-lg">{banner.title}</h3>}
                                            {banner.description && <p className="text-sm md:text-base opacity-90 drop-shadow-md max-w-2xl">{banner.description}</p>}
                                        </div>
                                    )}
                                </a>
                            ) : (
                                <div className="w-full h-full relative group">
                                    <div
                                        className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                        style={{ backgroundImage: `url(${banner.image_url})` }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                                    {(banner.title || banner.description) && (
                                        <div className="absolute bottom-4 right-6 left-6 md:bottom-8 md:right-10 md:left-10 text-white z-20 pointer-events-none">
                                            {banner.title && <h3 className="text-xl md:text-3xl font-display font-bold mb-2 drop-shadow-lg">{banner.title}</h3>}
                                            {banner.description && <p className="text-sm md:text-base opacity-90 drop-shadow-md max-w-2xl">{banner.description}</p>}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CarouselItem>
                    ))}
                </CarouselContent>
                {banners.length > 1 && (
                    <>
                        <CarouselPrevious className="hidden md:flex left-4 text-white hover:text-white border-white/20 bg-black/20 hover:bg-black/40" />
                        <CarouselNext className="hidden md:flex right-4 text-white hover:text-white border-white/20 bg-black/20 hover:bg-black/40" />
                    </>
                )}
            </Carousel>
        </div>
    );
};

export default BannerCarousel;
