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
import axios from "axios";

const Footer = () => {
  const [footerData, setFooterData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const response = await axios.get("/api/footer");
        if (response.data.success) {
          setFooterData(response.data.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu footer:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

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
            <div className="product-categories d-flex justify-content-between">
              {footerData.categories.map((category, index) => (
                <div key={index} className="category">
                  <h6 className="category-title">{category.title}</h6>
                  <ul>
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="coppyright mt-3 pt-3 pb-3 d-flex justify-content-between align-items-center">
          <div className="footer-left d-flex align-items-center">
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
          <div className="footer-right d-flex align-items-center">
            <div className="app-download mr-4">
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
            <div className="social-media ml-4">
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
    </footer>
  );
};

export default Footer;
