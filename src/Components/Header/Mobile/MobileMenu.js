import React, { useState, useEffect, useContext } from "react";
import { IoClose } from "react-icons/io5";
import { CircleButton } from "../common/CircleButtons";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { MobileLocationSelector } from "../common/LocationSelector";
import { Link, useNavigate } from "react-router-dom";
import { getCart, getCategories, logout } from "../../../services/api";
import { FaUserLarge, FaHeart } from "react-icons/fa6";
import { BsCartCheck } from "react-icons/bs";
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
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleMobileMenu}
      />

      {/* Menu */}
      <div
        className={`fixed inset-y-0 left-0 w-[300px] bg-white z-[9999] transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="pt-16 px-4 flex-1 overflow-y-auto">
            <button
              onClick={toggleMobileMenu}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <IoClose className="text-2xl" />
            </button>

            {/* User Account Info */}
            <div className="flex items-center mb-6 pb-4 border-b">
              <div style={{ padding: "8px" }}>
                <CircleButton>
                  <PersonOutlineIcon
                    style={{ width: "24px", height: "24px" }}
                  />
                </CircleButton>
              </div>
              <div className="ml-3">
                {context.isLogin ? (
                  <p className="font-medium">Xin chào, {context.user?.name}</p>
                ) : (
                  <>
                    <p className="font-medium">Tài khoản của tôi</p>
                    <Link
                      to="/signIn"
                      onClick={handleLinkClick}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Đăng nhập / Đăng ký
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Location Selector */}
            <div className="mb-6 pb-4 border-b w-full">
              <MobileLocationSelector className="w-full" />
            </div>

            {/* Main Navigation */}
            <ul className="space-y-1">
              <li>
                <Link to="/" onClick={handleLinkClick}>
                  <button className="flex items-center justify-between w-full px-3 py-3 hover:bg-gray-50 rounded-lg">
                    <span className="font-medium">Trang chủ</span>
                  </button>
                </Link>
              </li>

              {context.isLogin && (
                <>
                  <li>
                    <Link to="/profile" onClick={handleLinkClick}>
                      <button className="flex items-center gap-2 w-full px-3 py-3 hover:bg-gray-50 rounded-lg">
                        <FaUserLarge size={14} />
                        <span className="font-medium">Tài khoản của tôi</span>
                      </button>
                    </Link>
                  </li>
                  <li>
                    <Link to="/wishlist" onClick={handleLinkClick}>
                      <button className="flex items-center gap-2 w-full px-3 py-3 hover:bg-gray-50 rounded-lg">
                        <FaHeart size={14} />
                        <span className="font-medium">Danh sách yêu thích</span>
                      </button>
                    </Link>
                  </li>
                  <li>
                    <Link to="/orders" onClick={handleLinkClick}>
                      <button className="flex items-center gap-2 w-full px-3 py-3 hover:bg-gray-50 rounded-lg">
                        <BsCartCheck size={14} />
                        <span className="font-medium">Lịch sử đơn hàng</span>
                      </button>
                    </Link>
                  </li>
                </>
              )}

              <li>
                <Link to="/listing" onClick={handleLinkClick}>
                  <button className="flex items-center justify-between w-full px-3 py-3 hover:bg-gray-50 rounded-lg">
                    <span className="font-medium">Cửa hàng</span>
                  </button>
                </Link>
              </li>

              {/* Categories */}
              {loading ? (
                <li className="px-3 py-3 text-center">Đang tải danh mục...</li>
              ) : (
                categories.map((category) => (
                  <li key={category._id}>
                    <div className="relative">
                      <button
                        className="flex items-center justify-between w-full px-3 py-3 hover:bg-gray-50 rounded-lg"
                        onClick={() => handleCategoryClick(category._id)}
                      >
                        <span className="font-medium">{category.name}</span>
                        {category.subCategories &&
                          category.subCategories.length > 0 && (
                            <span className="transform transition-transform">
                              {openSubMenu === category._id ? "▼" : "▶"}
                            </span>
                          )}
                      </button>

                      {/* Submenu */}
                      {category.subCategories &&
                        category.subCategories.length > 0 &&
                        openSubMenu === category._id && (
                          <div className="pl-4 mt-1 space-y-1">
                            {category.subCategories.map((subCategory) => (
                              <Link
                                key={subCategory._id}
                                to={`/category/${subCategory._id}`}
                                onClick={handleLinkClick}
                                className="block px-3 py-2 hover:bg-gray-50 rounded-lg"
                              >
                                {subCategory.name}
                              </Link>
                            ))}
                          </div>
                        )}
                    </div>
                  </li>
                ))
              )}

              <li>
                <Link to="/posts" onClick={handleLinkClick}>
                  <button className="flex items-center justify-between w-full px-3 py-3 hover:bg-gray-50 rounded-lg">
                    <span className="font-medium">Bài viết</span>
                  </button>
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={handleLinkClick}>
                  <button className="flex items-center justify-between w-full px-3 py-3 hover:bg-gray-50 rounded-lg">
                    <span className="font-medium">CONTACT</span>
                  </button>
                </Link>
              </li>
            </ul>

            {/* Cart Summary */}
            {context.isLogin && (
              <div className="mt-8 pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Giỏ hàng của bạn</p>
                  <span className="text-sm font-medium bg-red-500 text-white px-2 py-1 rounded-full">
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
                  className="w-full mt-4 bg-blue-500 text-white py-3 rounded-lg font-medium text-center block"
                >
                  Xem giỏ hàng
                </Link>
              </div>
            )}

            {/* Logout Button */}
            {context.isLogin && (
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => {
                    logout();
                    context.setIsLogin(false);
                    context.setUser(null);
                    toggleMobileMenu();
                    toast.success("Đăng xuất thành công!");
                    navigate("/");
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <IoIosLogOut size={18} />
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
