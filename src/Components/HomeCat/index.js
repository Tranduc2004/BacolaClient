import React, { useState, useEffect } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import cat9 from "../../assets/images/cat9.png";
import { getCategories } from "../../services/api";
import { Link } from "react-router-dom";

const HomeCat = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [itemBg] = useState([
    "#fffceb",
    "#ecffec",
    "#feefea",
    "#fff3eb",
    "#fff3ff",
    "#f2fce4",
    "#feefea",
    "#fffceb",
    "#feefea",
    "#ecffec",
    "#feefea",
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi lấy danh mục:", err);
        setError("Không thể tải danh mục. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="homeCat mt-5">
      <div className="container">
        <h3 className="mb-4 hd">Danh mục nổi bật</h3>

        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <Swiper
            slidesPerView={7}
            spaceBetween={8}
            slidesPerGroup={1}
            pagination={{ clickable: true }}
            navigation={true}
            breakpoints={{
              // When window width is >= 320px (mobile)
              320: {
                slidesPerView: 4,
                spaceBetween: 10,
              },
              // When window width is >= 768px (tablet)
              768: {
                slidesPerView: 6,
                spaceBetween: 15,
              },
              // When window width is >= 1024px (desktop)
              1024: {
                slidesPerView: 7,
                spaceBetween: 8,
              },
            }}
            modules={[Navigation]}
            className="mySwiper"
          >
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <SwiperSlide key={category._id || index}>
                  <Link
                    to={`/category/${category._id}`}
                    className="block"
                    style={{ color: "black" }}
                  >
                    <div
                      className="item text-center cursor"
                      style={{ background: itemBg[index % itemBg.length] }}
                    >
                      <div className="img-wrapper">
                        <img src={category.image || cat9} alt={category.name} />
                      </div>
                      <h6
                        style={{
                          opacity: "0.8",
                          fontSize: "15px",
                        }}
                      >
                        {category.name}
                      </h6>
                    </div>
                  </Link>
                </SwiperSlide>
              ))
            ) : (
              <div className="text-center">Không có danh mục nào</div>
            )}
          </Swiper>
        )}
      </div>

      {/* Add custom CSS for smaller navigation arrows */}
      <style>{`
        .swiper-button-next,
        .swiper-button-prev {
          width: 30px;
          height: 30px;
          background-color: #fff;
          border-radius: 50%;
        }

        .swiper-button-next::after,
        .swiper-button-prev::after {
          font-size: 16px;
          color: #333;
        }

        .swiper-button-next {
          right: 10px;
        }

        .swiper-button-prev {
          left: 10px;
        }
      `}</style>
    </section>
  );
};

export default HomeCat;
