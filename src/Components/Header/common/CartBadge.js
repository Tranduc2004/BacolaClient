import React, { useState, useEffect, useContext } from "react";
import { fetchCartCount } from "../../../services/api";
import { MyContext } from "../../../App";

const CartBadge = () => {
  const [itemCount, setItemCount] = useState(0);
  const { isLogin } = useContext(MyContext);

  useEffect(() => {
    const getCartCount = async () => {
      if (!isLogin) {
        setItemCount(0);
        return;
      }
      try {
        const count = await fetchCartCount();
        setItemCount(count);
      } catch (error) {
        console.error("Lỗi khi lấy số lượng giỏ hàng:", error);
        setItemCount(0);
      }
    };

    getCartCount();

    // Thêm interval để cập nhật số lượng mỗi 5 giây
    const interval = setInterval(getCartCount, 5000);

    // Cleanup interval
    return () => clearInterval(interval);
  }, [isLogin]);

  return (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
      {itemCount}
    </span>
  );
};

export default CartBadge;
