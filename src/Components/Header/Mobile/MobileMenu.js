import React, { useState, useEffect, useContext } from "react";
import { IoClose } from "react-icons/io5";
import { CircleButton } from "../common/CircleButtons";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { MobileLocationSelector } from "../common/LocationSelector";
import { Link, useNavigate } from "react-router-dom";
import { getCart, getCategories, logout } from "../../../services/api";
import { FaUserLarge, FaHeart } from "react-icons/fa6";
import { BsCartCheck, BsChevronDown } from "react-icons/bs";
import { IoIosLogOut } from "react-icons/io";
import { MyContext } from "../../../App";
import { toast } from "react-hot-toast";

const MobileMenu = ({ toggleMobileMenu, isOpen }) => {
  const context = useContext(MyContext);
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cart data
        const cart = await getCart();
        setCartItems(cart.items || []);
        const total =
          cart.items?.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ) || 0;
        setTotalAmount(total);

        // Fetch categories
        const response = await getCategories();
        if (response && Array.isArray(response)) {
          setCategories(response);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryClick = (categoryId) => {
    setOpenSubMenu(openSubMenu === categoryId ? null : categoryId);
  };

  const handleLinkClick = () => {
    toggleMobileMenu();
  };

  return (
    <>
      {/* Overlay with blur effect */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] transition-all duration-300 md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleMobileMenu}
      />

      {/* Menu with shadow and smooth animation */}
      <div
        className={`fixed inset-y-0 left-0 w-[300px] bg-white shadow-2xl z-[9999] transform transition-all duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="pt-16 px-4 flex-1 overflow-y-auto">
            {/* Close button with hover effect */}
            <button
              onClick={toggleMobileMenu}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100"
            >
              <IoClose className="text-2xl" />
            </button>

            {/* User Account Info with enhanced dropdown */}
            <div className="mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2">
                    <CircleButton className="bg-blue-50 hover:bg-blue-100 transition-colors">
                      <PersonOutlineIcon
                        className="text-blue-500"
                        style={{ width: "24px", height: "24px" }}
                      />
                    </CircleButton>
                  </div>
                  <div className="ml-3">
                    {context.isLogin ? (
                      <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-2 group"
                      >
                        <p className="font-medium text-gray-800 group-hover:text-blue-500 transition-colors">
                          Xin chào, {context.user?.name}
                        </p>
                        <span
                          className={`transform transition-transform duration-200 ${
                            isUserMenuOpen ? "rotate-180" : ""
                          }`}
                        >
                          <BsChevronDown className="text-gray-500" />
                        </span>
                      </button>
                    ) : (
                      <>
                        <p className="font-medium text-gray-800">
                          Tài khoản của tôi
                        </p>
                        <Link
                          to="/signIn"
                          onClick={handleLinkClick}
                          className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
                        >
                          Đăng nhập / Đăng ký
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced User Menu Dropdown with animation */}
              {context.isLogin && (
                <div
                  className={`mt-2 ml-12 space-y-1 overflow-hidden transition-all duration-300 ${
                    isUserMenuOpen
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <Link to="/profile" onClick={handleLinkClick}>
                    <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors group">
                      <FaUserLarge
                        size={14}
                        className="text-gray-500 group-hover:text-blue-500"
                      />
                      <span className="font-medium text-gray-700 group-hover:text-blue-500">
                        Tài khoản của tôi
                      </span>
                    </button>
                  </Link>
                  <Link to="/wishlist" onClick={handleLinkClick}>
                    <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors group">
                      <FaHeart
                        size={14}
                        className="text-gray-500 group-hover:text-blue-500"
                      />
                      <span className="font-medium text-gray-700 group-hover:text-blue-500">
                        Danh sách yêu thích
                      </span>
                    </button>
                  </Link>
                  <Link to="/myvoucher" onClick={handleLinkClick}>
                    <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors group">
                      <FaHeart
                        size={14}
                        className="text-gray-500 group-hover:text-blue-500"
                      />
                      <span className="font-medium text-gray-700 group-hover:text-blue-500">
                        Mã giảm giá của tôi
                      </span>
                    </button>
                  </Link>
                  <Link to="/orders" onClick={handleLinkClick}>
                    <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors group">
                      <BsCartCheck
                        size={14}
                        className="text-gray-500 group-hover:text-blue-500"
                      />
                      <span className="font-medium text-gray-700 group-hover:text-blue-500">
                        Lịch sử đơn hàng
                      </span>
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Location Selector with enhanced styling */}
            <div className="mb-6 pb-4 border-b border-gray-100">
              <MobileLocationSelector className="w-full" />
            </div>

            {/* Main Navigation with enhanced styling */}
            <ul className="space-y-1">
              <li>
                <Link to="/" onClick={handleLinkClick}>
                  <button className="flex items-center justify-between w-full px-3 py-3 hover:bg-blue-50 rounded-lg transition-colors group">
                    <span className="font-medium text-gray-700 group-hover:text-blue-500">
                      Trang chủ
                    </span>
                  </button>
                </Link>
              </li>

              <li>
                <Link to="/listing" onClick={handleLinkClick}>
                  <button className="flex items-center justify-between w-full px-3 py-3 hover:bg-blue-50 rounded-lg transition-colors group">
                    <span className="font-medium text-gray-700 group-hover:text-blue-500">
                      Cửa hàng
                    </span>
                  </button>
                </Link>
              </li>
              <li>
                <Link to="/voucher" onClick={handleLinkClick}>
                  <button className="flex items-center justify-between w-full px-3 py-3 hover:bg-blue-50 rounded-lg transition-colors group">
                    <span className="font-medium text-gray-700 group-hover:text-blue-500">
                      Mã giảm giá
                    </span>
                  </button>
                </Link>
              </li>

              {/* Categories Section with Title */}
              <div className="mt-6 mb-2">
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="flex items-center justify-between w-full px-3"
                >
                  <h1
                    className="text-sm font-semibold  uppercase tracking-wider"
                    style={{ color: "#00aaff", fontSize: "16px" }}
                  >
                    Danh mục
                  </h1>
                  <span
                    className={`transform transition-transform duration-200 ${
                      isCategoriesOpen ? "rotate-180" : ""
                    }`}
                  >
                    <BsChevronDown className="text-gray-500" />
                  </span>
                </button>
              </div>

              {/* Enhanced Categories with smooth animation */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isCategoriesOpen
                    ? "max-h-[1000px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                {loading ? (
                  <li className="px-3 py-3 text-center text-gray-500">
                    Đang tải danh mục...
                  </li>
                ) : (
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <div key={category._id} className="relative">
                        <button
                          className="flex items-center justify-between w-full px-3 py-3 hover:bg-blue-50 rounded-lg transition-colors group"
                          onClick={() => handleCategoryClick(category._id)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700 group-hover:text-blue-500">
                              {category.name}
                            </span>
                            {category.subCategories &&
                              category.subCategories.length > 0 && (
                                <span className="text-xs text-gray-400">
                                  ({category.subCategories.length})
                                </span>
                              )}
                          </div>
                          {category.subCategories &&
                            category.subCategories.length > 0 && (
                              <span
                                className={`transform transition-transform duration-200 ${
                                  openSubMenu === category._id
                                    ? "rotate-180"
                                    : ""
                                }`}
                              >
                                <BsChevronDown className="text-gray-500" />
                              </span>
                            )}
                        </button>

                        {/* Enhanced Submenu with animation */}
                        {category.subCategories &&
                          category.subCategories.length > 0 && (
                            <div
                              className={`pl-4 space-y-1 overflow-hidden transition-all duration-300 ${
                                openSubMenu === category._id
                                  ? "max-h-96 opacity-100 mt-1"
                                  : "max-h-0 opacity-0"
                              }`}
                            >
                              {category.subCategories.map((subCategory) => (
                                <Link
                                  key={subCategory._id}
                                  to={`/category/${subCategory._id}`}
                                  onClick={handleLinkClick}
                                  className="block px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors group"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-700 group-hover:text-blue-500">
                                      {subCategory.name}
                                    </span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <li>
                <Link to="/posts" onClick={handleLinkClick}>
                  <button className="flex items-center justify-between w-full px-3 py-3 hover:bg-blue-50 rounded-lg transition-colors group">
                    <span className="font-medium text-gray-700 group-hover:text-blue-500">
                      Bài viết
                    </span>
                  </button>
                </Link>
              </li>
              <li>
                <Link to="/chat" onClick={handleLinkClick}>
                  <button className="flex items-center justify-between w-full px-3 py-3 hover:bg-blue-50 rounded-lg transition-colors group">
                    <span className="font-medium text-gray-700 group-hover:text-blue-500">
                      Chat với nhân viên hỗ trợ
                    </span>
                  </button>
                </Link>
              </li>
              <li>
                <Link to="/about" onClick={handleLinkClick}>
                  <button className="flex items-center justify-between w-full px-3 py-3 hover:bg-blue-50 rounded-lg transition-colors group">
                    <span className="font-medium text-gray-700 group-hover:text-blue-500">
                      Hỗ trợ & Liên hệ
                    </span>
                  </button>
                </Link>
              </li>
            </ul>

            {/* Enhanced Cart Summary */}
            {context.isLogin && (
              <div className="mt-8 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-800">Giỏ hàng của bạn</p>
                  <span className="text-sm font-medium bg-blue-500 text-white px-3 py-1 rounded-full">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Tổng cộng:{" "}
                  <span className="text-gray-700 font-medium">
                    {totalAmount.toLocaleString("vi-VN")}đ
                  </span>
                </p>
                <Link
                  to="/cart"
                  onClick={handleLinkClick}
                  className="w-full mt-4 bg-blue-500 text-white py-3 rounded-lg font-medium text-center block hover:bg-blue-600 transition-colors"
                >
                  Xem giỏ hàng
                </Link>
              </div>
            )}

            {/* Enhanced Logout Button */}
            {context.isLogin && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    logout();
                    context.setIsLogin(false);
                    context.setUser(null);
                    toggleMobileMenu();
                    toast.success("Đăng xuất thành công!");
                    navigate("/");
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors group"
                >
                  <IoIosLogOut
                    size={18}
                    className="group-hover:scale-110 transition-transform"
                  />
                  <span className="font-medium">Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
