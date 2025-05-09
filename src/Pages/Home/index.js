import HomeBanner from "../../Components/HomeBanner";
import HomeCat from "../../Components/HomeCat";
import banner1 from "../../assets/images/banner1.webp";
import banner2 from "../../assets/images/banner2.png";
import banner3 from "../../assets/images/banner3.png";
import banner4 from "../../assets/images/banner4.png";
import coupon from "../../assets/images/coupon.webp";
import Button from "@mui/material/Button";
import { FaArrowRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import * as React from "react";
import { CiMail } from "react-icons/ci";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { getProducts, getReviewsByProduct } from "../../services/api";
import { Link } from "react-router-dom";
import ProductItem from "../../Components/ProductItem";
import Chatbot from "../../Components/Chatbot";
import CustomerComment from "../../Components/CustomerComment/CustomerComment";
import avtuser from "../../assets/images/avtuser.png";
import HotDealOfWeek from "../../Components/HotDealOfWeek";
import DiscountBanner from "../../Components/DiscountBanner";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

// Tách Swiper settings ra ngoài component
const swiperSettings = {
  slidesPerView: 4,
  spaceBetween: 8,
  slidesPerGroup: 1,
  pagination: { clickable: true },
  navigation: true,
  modules: [Navigation],
  className: "mySwiper",
  breakpoints: {
    0: { slidesPerView: 2, spaceBetween: 10 },
    768: { slidesPerView: 3, spaceBetween: 15 },
    1024: { slidesPerView: 4, spaceBetween: 8 },
  },
};

// Tách ProductSwiper thành component riêng
const ProductSwiper = memo(({ products, title, description }) => {
  const renderProducts = useMemo(() => {
    if (!products.length) {
      return <div className="text-center">Không có sản phẩm nào</div>;
    }
    return products.map((product) => (
      <SwiperSlide key={product._id}>
        <ProductItem product={product} />
      </SwiperSlide>
    ));
  }, [products]);

  return (
    <>
      <div className="d-flex align-items-center">
        <div className="info w-75">
          <h3 className="mb-0 hd">{title}</h3>
          <p className="text-light1 text-sml mb-0">{description}</p>
        </div>
        <Link to="/listing" className="ml-auto">
          <Button className="viewAllBtn ml-auto">
            Xem tất cả&nbsp;
            <FaArrowRight className="arrow" />
          </Button>
        </Link>
      </div>
      <div className="product_row w-100 mt-2">
        <Swiper {...swiperSettings}>{renderProducts}</Swiper>
      </div>
    </>
  );
});

// Tách AllProducts thành component riêng
const AllProducts = memo(({ products }) => {
  const renderProducts = useMemo(() => {
    return products.map((product) => (
      <div key={product._id} className="col-6 col-sm-6 col-md-3 col-lg-3 p-0">
        <ProductItem product={product} />
      </div>
    ));
  }, [products]);

  return (
    <section className="allProducts mt-5">
      <div className="container">
        <div className="section-header mb-4">
          <h2 className="text-left hd">TẤT CẢ SẢN PHẨM</h2>
          <p className="text-left text-light1">
            Khám phá thêm nhiều sản phẩm hấp dẫn khác
          </p>
        </div>
        <div className="row g-2">{renderProducts}</div>
      </div>
    </section>
  );
});

const BestSellers = memo(() => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerComments, setCustomerComments] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchProductsAndComments = async () => {
      try {
        const data = await getProducts();
        if (isMounted && !controller.signal.aborted) {
          if (Array.isArray(data)) {
            setProducts(data);
            // Lấy review của sản phẩm đầu tiên nếu có
            if (data.length > 0) {
              const productId = data[0]._id;
              try {
                const reviews = await getReviewsByProduct(productId);
                if (Array.isArray(reviews) && reviews.length > 0) {
                  // Shuffle và lấy 2 bình luận ngẫu nhiên
                  const shuffled = reviews.sort(() => 0.5 - Math.random());
                  const selected = shuffled.slice(0, 2).map((review) => ({
                    title: review.title || "Khách hàng nhận xét",
                    content: review.comment,
                    avatar: review.user?.avatar || avtuser,
                    name: review.user?.name || "Khách hàng",
                    role: review.user?.role || "Khách hàng",
                  }));
                  setCustomerComments(selected);
                }
              } catch (e) {
                setCustomerComments([]);
              }
            }
          } else {
            setProducts([]);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted && !controller.signal.aborted) {
          setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
          setLoading(false);
        }
      }
    };

    fetchProductsAndComments();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // Memoize các danh sách sản phẩm
  const productLists = useMemo(() => {
    if (!Array.isArray(products))
      return { bestSellers: [], featuredProducts: [], remainingProducts: [] };

    return {
      bestSellers: products.slice(0, 8),
      featuredProducts: products.slice(8, 15),
      remainingProducts: products.slice(16),
    };
  }, [products]);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;
  if (!Array.isArray(products)) return <div>Không có sản phẩm nào</div>;

  return (
    <div className="home">
      <HomeBanner />
      <HomeCat />
      <section className="homeProducts">
        <div className="container">
          <div className="row">
            <div className="col-md-3 hidden md:block">
              <div className="sticky">
                <div className="banner">
                  <img alt="" src={banner1} className="cusror w-100" />
                </div>
                <div className="banner mt-3">
                  <img alt="" src={banner2} className="cusror w-100" />
                </div>
                {/* Hiển thị bình luận khách hàng */}
                <div className="mt-3 d-flex flex-column gap-3">
                  <h3
                    className="hd mt-9"
                    style={{
                      fontSize: "17px",
                      fontFamily: "Dosis, sans-serif",
                    }}
                  >
                    BÌNH LUẬN KHÁCH HÀNG
                  </h3>
                  {customerComments.map((c, idx) => (
                    <CustomerComment key={idx} comment={c} />
                  ))}
                </div>
              </div>
            </div>
            <div className="col-md-9 productRow">
              <HotDealOfWeek />
              <DiscountBanner />
              <br />
              <ProductSwiper
                products={productLists.bestSellers}
                title="SẢN PHẨM NỔI BẬT"
                description="Khám phá các sản phẩm bán chạy nhất của chúng tôi."
              />
              <br />
              <ProductSwiper
                products={productLists.featuredProducts}
                title="SẢN PHẨM MỚI"
                description="Khám phá các sản phẩm mới nhất của chúng tôi."
              />
              <div className="d-flex mt-4 mb-5 bannerSec">
                <div className="banner">
                  <img
                    src={banner3}
                    alt=""
                    className="cursor w-100 rounded-3"
                  />
                </div>
                <div className="banner">
                  <img
                    src={banner4}
                    alt=""
                    className="cursor w-100 rounded-3"
                    style={{ borderRadius: "7px" }}
                  />
                </div>
              </div>

              <AllProducts products={productLists.remainingProducts} />
            </div>
          </div>
        </div>
      </section>

      <section className="newsLetterSection mt-3 d-flex align-items-center">
        <div className="container">
          <div className="row">
            <div className="col-md-6 row1 text3">
              <p className="text-white mb-1">
                Giảm giá $20 cho đơn hàng đầu tiên của bạn
              </p>
              <h3 className="text-white">
                Tham gia bản tin của chúng tôi và nhận...
              </h3>
              <p className="text-light1">
                Đăng ký nhận email ngay bây giờ để cập nhật về
                <br /> khuyến mãi và mã giảm giá.
              </p>

              <form>
                <CiMail />
                <input type="text" placeholder="Nhập email của bạn" />
                <Button>Đăng kí</Button>
              </form>
            </div>
            <div className="col-md-6">
              <img alt="" src={coupon} />
            </div>
          </div>
        </div>
      </section>
      <Chatbot />
    </div>
  );
});

BestSellers.displayName = "BestSellers";

export default BestSellers;
