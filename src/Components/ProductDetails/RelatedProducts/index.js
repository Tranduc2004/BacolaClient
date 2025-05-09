import ProductItem from "../../ProductItem";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import React, { useMemo } from "react";

const RelatedProducts = React.memo(({ title, initialProducts }) => {
  // Memoize products
  const products = useMemo(() => initialProducts || [], [initialProducts]);

  // Memoize Swiper component
  const swiperComponent = useMemo(
    () => (
      <Swiper
        slidesPerView={4}
        spaceBetween={8}
        slidesPerGroup={1}
        pagination={{ clickable: true }}
        navigation={true}
        modules={[Navigation]}
        className="mySwiper"
        breakpoints={{
          0: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 15,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 8,
          },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product._id}>
            <ProductItem product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    ),
    [products]
  );

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <>
      <div className="d-flex align-items-center mt-3">
        <div className="info w-75">
          <h3 className="mb-0 hd">{title}</h3>
        </div>
      </div>
      <div className="product_row w-100 mt-2">{swiperComponent}</div>
    </>
  );
});

RelatedProducts.displayName = "RelatedProducts";

export default RelatedProducts;
