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
const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="topInfo">
          <div className="d-flex align-items-center">
            <span>
              <LuShirt />
            </span>
            <span>Sản phẩm tươi mới mỗi ngày</span>
          </div>
          <div className="d-flex align-items-center">
            <span>
              <TbTruckDelivery />
            </span>
            <span>Miễn phí vận chuyển cho đơn hàng trên 1.600.000đ</span>
          </div>
          <div className="d-flex align-items-center">
            <span>
              <CiDiscount1 />
            </span>
            <span>Khuyến mãi hàng ngày</span>
          </div>
          <div className="d-flex align-items-center">
            <span>
              <CiDollar />
            </span>
            <span>Giá tốt nhất thị trường</span>
          </div>
        </div>

        <div className="row1">
          <div className="col-12">
            <div className="product-categories d-flex justify-content-between">
              <div className="category">
                <h6 className="category-title">RAU CỦ & TRÁI CÂY</h6>
                <ul>
                  <li>Rau củ tươi</li>
                  <li>Gia vị & Thảo mộc</li>
                  <li>Trái cây tươi</li>
                  <li>Rau mầm & Giá</li>
                  <li>Trái cây nhập khẩu</li>
                  <li>Rau củ đóng gói</li>
                  <li>Khay tiệc</li>
                </ul>
              </div>
              <div className="category">
                <h6 className="category-title">BỮA SÁNG & SỮA</h6>
                <ul>
                  <li>Sữa tươi & Sữa có hương vị</li>
                  <li>Bơ và Bơ thực vật</li>
                  <li>Phô mai</li>
                  <li>Trứng</li>
                  <li>Mật ong</li>
                  <li>Mứt</li>
                  <li>Kem chua và Sốt chấm</li>
                  <li>Sữa chua</li>
                </ul>
              </div>
              <div className="category">
                <h6 className="category-title">THỊT & HẢI SẢN</h6>
                <ul>
                  <li>Xúc xích ăn sáng</li>
                  <li>Xúc xích ăn tối</li>
                  <li>Thịt bò</li>
                  <li>Thịt gà</li>
                  <li>Thịt nguội</li>
                  <li>Tôm</li>
                  <li>Cá tự nhiên</li>
                  <li>Cua & Nghêu sò</li>
                  <li>Cá nuôi</li>
                </ul>
              </div>
              <div className="category">
                <h6 className="category-title">ĐỒ UỐNG</h6>
                <ul>
                  <li>Nước tinh khiết</li>
                  <li>Nước có gas</li>
                  <li>Nước ngọt</li>
                  <li>Cà phê</li>
                  <li>Sữa & Sữa thực vật</li>
                  <li>Trà & Kombucha</li>
                  <li>Nước đóng hộp</li>
                  <li>Bia thủ công</li>
                  <li>Rượu vang</li>
                </ul>
              </div>
              <div className="category">
                <h6 className="category-title">BÁNH MÌ & BÁNH NGỌT</h6>
                <ul>
                  <li>Sữa tươi & Sữa có hương vị</li>
                  <li>Bơ và Bơ thực vật</li>
                  <li>Phô mai</li>
                  <li>Trứng</li>
                  <li>Mật ong</li>
                  <li>Mứt</li>
                  <li>Kem chua và Sốt chấm</li>
                  <li>Sữa chua</li>
                </ul>
              </div>
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
                  1800 555-55
                  <br />
                  <span>Làm việc 8:00 - 22:00</span>
                </span>
              </div>
              <div
                className="working-hours text-muted"
                style={{ fontSize: "0.8rem" }}
              ></div>
            </div>
          </div>
          <div className="footer-right d-flex align-items-center">
            <div className="app-download mr-4">
              <span className="mr-2">
                Tải ứng dụng trên điện thoại:
                <br />
                <span>Giảm 15% cho đơn hàng đầu tiên</span>
              </span>

              <span className="app-badges">
                <a href="/google-play" className="mr-2">
                  <img src={ggplay} alt="Google Play" height="40" />
                </a>
                <a href="/app-store">
                  <img src={appstore} alt="App Store" height="40" />
                </a>
              </span>
              <div
                className="discount-text text-muted"
                style={{ fontSize: "0.8rem" }}
              ></div>
            </div>
            <div className="social-media ml-4">
              <a href="/facebook" className="mr-2 text-dark">
                <FaFacebook />
              </a>
              <a href="/twitter" className="mr-2 text-dark">
                <FaTwitter />
              </a>
              <a href="/instagram" className="text-dark">
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
