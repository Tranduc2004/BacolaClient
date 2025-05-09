import InnerImageZoom from "react-inner-image-zoom";
import { Swiper, SwiperSlide } from "swiper/react";
import React, { useState } from "react";

const ProductZoom = ({ product }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  // Sử dụng mảng ảnh từ product hoặc mảng mặc định nếu không có
  const images =
    product?.images?.length > 0
      ? product.images
      : [
          "https://klbtheme.com/bacola/wp-content/uploads/2021/04/product-image-62.jpg",
          "https://klbtheme.com/bacola/wp-content/uploads/2021/04/product-image2-47.jpg",
          "https://klbtheme.com/bacola/wp-content/uploads/2021/04/product-image3-35.jpg",
        ];

  const handleImageChange = (index) => {
    setIsFading(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsFading(false);
    }, 300);
  };

  return (
    <>
      {/* Large Image with Zoom */}
      <div className="productZoom position-relative">
        {product?.discount > 0 && (
          <div className="badge badge-primary" style={{ fontSize: "14px" }}>
            -{product.discount}%
          </div>
        )}
        <div className={`fade-image ${isFading ? "fade-out" : "fade-in"}`}>
          <InnerImageZoom
            src={images[activeIndex]}
            zoomType="hover"
            zoomScale={1}
          />
        </div>
      </div>

      {/* Thumbnail Swiper */}
      <Swiper spaceBetween={10} slidesPerView={3} className="zoomSlider">
        {images.map((src, index) => (
          <SwiperSlide key={index}>
            <div className={`item ${activeIndex === index ? "active" : ""}`}>
              <img
                alt={product?.name || `Product image ${index + 1}`}
                src={src}
                className="w-100 thumbnail"
                onClick={() => handleImageChange(index)}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

export default ProductZoom;
