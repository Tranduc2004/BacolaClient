import { useEffect, useState } from "react";
import { LuShirt } from "react-icons/lu";
import { TbTruckDelivery } from "react-icons/tb";
import { CiDiscount1 } from "react-icons/ci";
import { CiDollar } from "react-icons/ci";
import ggplay from "../../assets/images/ggplay.webp";
import appstore from "../../assets/images/appstore.webp";
import { MdPhone } from "react-icons/md";
import { FaInstagram } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { api } from "../../services/api";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const Footer = () => {
  const [footerData, setFooterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openCategories, setOpenCategories] = useState({});

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        // Sử dụng instance api đã được cấu hình sẵn
        const response = await api.get("/footer");
        if (response.success) {
          setFooterData(response.data);
          // Khởi tạo trạng thái đóng cho tất cả các danh mục
          const initialOpenState = {};
          response.data.categories.forEach((_, index) => {
            initialOpenState[index] = false;
          });
          setOpenCategories(initialOpenState);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu footer:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  const toggleCategory = (index) => {
    setOpenCategories((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!footerData) {
    return null;
  }

  return (
    <footer>
      <div className="container">
        <div className="topInfo">
          {footerData.topInfo.map((info, index) => (
            <div key={index} className="d-flex align-items-center">
              <span>
                {info.icon === "LuShirt" && <LuShirt />}
                {info.icon === "TbTruckDelivery" && <TbTruckDelivery />}
                {info.icon === "CiDiscount1" && <CiDiscount1 />}
                {info.icon === "CiDollar" && <CiDollar />}
              </span>
              <span>{info.text}</span>
            </div>
          ))}
        </div>

        <div className="row1">
          <div className="col-12">
            <div className="product-categories d-flex flex-column flex-md-row justify-content-between">
              {footerData.categories.map((category, index) => (
                <div key={index} className="category mb-3 mb-md-0">
                  <div
                    className="category-header d-flex justify-content-between align-items-center"
                    onClick={() => toggleCategory(index)}
                    style={{ cursor: "pointer" }}
                  >
                    <h6 className="category-title mb-0">{category.title}</h6>
                    <span className="d-md-none">
                      {openCategories[index] ? (
                        <IoIosArrowUp />
                      ) : (
                        <IoIosArrowDown />
                      )}
                    </span>
                  </div>
                  <ul
                    className={`category-items ${
                      openCategories[index] ? "show" : "hide"
                    } d-md-block`}
                  >
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="coppyright mt-3 pt-3 pb-3 d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div className="footer-left d-flex align-items-center mb-3 mb-md-0">
            <div className="contact-info mr-4">
              <div className="phone d-flex align-items-center">
                <i className="fas fa-phone mr-2"></i>
                <MdPhone />
                <span>
                  {footerData.contactInfo.phone}
                  <br />
                  <span>{footerData.contactInfo.workingHours}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="footer-right d-flex flex-column flex-md-row align-items-center">
            <div className="app-download mb-3 mb-md-0">
              <span className="mr-2">
                {footerData.appDownload.title}
                <br />
                <span>{footerData.appDownload.subtitle}</span>
              </span>

              <span className="app-badges">
                <a
                  href={footerData.appDownload.googlePlayLink}
                  className="mr-2"
                >
                  <img src={ggplay} alt="Google Play" height="40" />
                </a>
                <a href={footerData.appDownload.appStoreLink}>
                  <img src={appstore} alt="App Store" height="40" />
                </a>
              </span>
            </div>
            <div className="social-media ml-md-4">
              <a
                href={footerData.socialMedia.facebook}
                className="mr-2 text-dark"
              >
                <FaFacebook />
              </a>
              <a
                href={footerData.socialMedia.twitter}
                className="mr-2 text-dark"
              >
                <FaTwitter />
              </a>
              <a href={footerData.socialMedia.instagram} className="text-dark">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .category-header {
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }

          .category-items {
            transition: all 0.3s ease;
            overflow: hidden;
          }

          .category-items.hide {
            display: none;
          }

          .category-items.show {
            display: block;
          }

          @media (min-width: 768px) {
            .category-header {
              border-bottom: none;
              cursor: default;
            }

            .category-items {
              display: block !important;
            }
          }

          .category ul {
            list-style: none;
            padding-left: 0;
            margin-top: 10px;
          }

          .category ul li {
            margin-bottom: 8px;
            color: #666;
          }

          .category-title {
            font-weight: 600;
            color: #333;
          }
        `}
      </style>
    </footer>
  );
};

export default Footer;
