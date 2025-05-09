import React, { useRef, useEffect, useState, useCallback, memo } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getSliders } from "../../services/api";

// Tách settings ra ngoài component để tránh tạo lại object mỗi lần render
const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  dotsClass: "slick-dots custom-dots",
  responsive: [
    { breakpoint: 1024, settings: { dots: true } },
    { breakpoint: 600, settings: { dots: false } },
  ],
};

const HomeBanner = memo(() => {
  const sliderRef = useRef(null);
  const [sliders, setSliders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchSliders = async () => {
      try {
        const res = await getSliders();
        if (isMounted && !controller.signal.aborted) {
          const data = Array.isArray(res) ? res : [];
          setSliders(data);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted && !controller.signal.aborted) {
          console.error("Lỗi khi tải slider:", error);
          setSliders([]);
          setIsLoading(false);
        }
      }
    };

    fetchSliders();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const goToPrev = useCallback(() => {
    if (sliderRef.current) {
      sliderRef.current.slickPrev();
    }
  }, []);

  const goToNext = useCallback(() => {
    if (sliderRef.current) {
      sliderRef.current.slickNext();
    }
  }, []);

  const renderSlides = useCallback(() => {
    if (!Array.isArray(sliders) || sliders.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <p>Không có slider để hiển thị.</p>
        </div>
      );
    }

    return sliders.map((item) => (
      <div key={item._id || item.id} className="w-full h-full">
        <img
          src={item.image || "/images/default.jpg"}
          alt={`slider-${item._id || item.id}`}
          className="w-full h-full object-cover object-center"
          loading="lazy"
          width={1200}
          height={600}
        />
      </div>
    ));
  }, [sliders]);

  if (isLoading) {
    return (
      <div className="container">
        <div className="relative w-full group overflow-hidden">
          <div className="w-full row2 h-[200px] sm:h-[300px] md:h-[300px] lg:h-[300px] xl:h-[300px] mt-3 flex items-center justify-center">
            <p>Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="relative w-full group overflow-hidden">
        <div className="w-full row2 h-[200px] sm:h-[300px] md:h-[300px] lg:h-[300px] xl:h-[300px] mt-3">
          <Slider ref={sliderRef} {...sliderSettings}>
            {renderSlides()}
          </Slider>
        </div>

        <button
          onClick={goToPrev}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 p-1 sm:p-2 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:block"
          aria-label="Previous slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={20}
            height={20}
            className="w-5 h-5 sm:w-6 sm:h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          onClick={goToNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 p-1 sm:p-2 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:block"
          aria-label="Next slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={20}
            height={20}
            className="w-5 h-5 sm:w-6 sm:h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
});

HomeBanner.displayName = "HomeBanner";

export default HomeBanner;
