import React from "react";
import { Link, useLocation } from "react-router-dom";
import { IoHomeOutline } from "react-icons/io5";
import { CiSearch, CiUser, CiHeart } from "react-icons/ci";
import { IoBagOutline } from "react-icons/io5";

const BottomNavigation = ({ toggleMobileSearch }) => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex items-center justify-around">
        <Link
          to="/"
          className={`flex flex-col items-center py-2 px-3 ${
            location.pathname === "/" ? "text-[#00aaff]" : "text-gray-600"
          }`}
        >
          <IoHomeOutline size={24} />
          <span className="text-xs mt-1">Trang chủ</span>
        </Link>

        <button
          onClick={toggleMobileSearch}
          className="flex flex-col items-center py-2 px-3 text-gray-600"
        >
          <CiSearch size={24} />
          <span className="text-xs mt-1">Tìm kiếm</span>
        </button>

        <Link
          to="/wishlist"
          className={`flex flex-col items-center py-2 px-3 ${
            location.pathname === "/wishlist"
              ? "text-[#00aaff]"
              : "text-gray-600"
          }`}
        >
          <CiHeart size={24} />
          <span className="text-xs mt-1">Yêu thích</span>
        </Link>

        <Link
          to="/cart"
          className={`flex flex-col items-center py-2 px-3 ${
            location.pathname === "/cart" ? "text-[#00aaff]" : "text-gray-600"
          }`}
        >
          <IoBagOutline size={24} />
          <span className="text-xs mt-1">Giỏ hàng</span>
        </Link>

        <Link
          to="/profile"
          className={`flex flex-col items-center py-2 px-3 ${
            location.pathname === "/profile"
              ? "text-[#00aaff]"
              : "text-gray-600"
          }`}
        >
          <CiUser size={24} />
          <span className="text-xs mt-1">Tài khoản</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNavigation;
