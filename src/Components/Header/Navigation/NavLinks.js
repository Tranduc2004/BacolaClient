import React, { useState, useRef, useEffect } from "react";
import { FaAngleDown, FaAngleRight } from "react-icons/fa";

const NavLinks = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});
  const timeoutRef = useRef(null);

  // Theo dõi thay đổi số thông báo mới trong localStorage
  useEffect(() => {
    const handleStorage = () => {
      const storedUnread = localStorage.getItem("unread_messages");
      if (storedUnread) {
        setUnreadMessages(JSON.parse(storedUnread));
      }
    };
    window.addEventListener("storage", handleStorage);
    const interval = setInterval(handleStorage, 1000);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  // Tính tổng số tin nhắn chưa đọc
  const totalUnread = Object.values(unreadMessages).reduce(
    (sum, count) => sum + count,
    0
  );

  const handleMenuLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
      setActiveSubMenu(null);
    }, 300);
  };

  const handleMenuEnter = (index) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveMenu(index);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const menuItems = [
    {
      name: "Trang chủ",
      link: "/",
    },
    {
      name: "Cửa hàng",
      link: "/listing",
    },
    { name: "Bài viết", link: "/posts" },
    { name: "Mã giảm giá", link: "/voucher" },
    { name: "Chat với nhân viên hỗ trợ", link: "/chat" },
    { name: "Giới thiệu & Liên hệ", link: "/about" },
  ];

  return (
    <div className="hidden md:flex space-x-1 items-center">
      {menuItems.map((item, index) => (
        <div
          key={index}
          className="relative group"
          onMouseEnter={() => handleMenuEnter(index)}
          onMouseLeave={handleMenuLeave}
        >
          <a
            href={item.link}
            className={`text-gray-700 flex items-center font-semibold transition-all duration-300 hover:text-[#00aaff] px-3 py-2 rounded-md hover:bg-[#00aaff]/10 hover:no-underline ${
              item.name === "HOME" || item.name === "SHOP"
                ? ""
                : "hover:bg-[#00aaff]/10"
            } ${
              activeMenu === index &&
              (item.name === "HOME" || item.name === "SHOP")
                ? "bg-gray-100"
                : ""
            }`}
          >
            {item.name}
            {/* Badge cho Hỗ trợ */}
            {item.name === "Hỗ trợ" && totalUnread > 0 && (
              <span
                style={{
                  background: "#ff3b3b",
                  color: "#fff",
                  borderRadius: "50%",
                  padding: "2px 8px",
                  fontSize: 12,
                  marginLeft: 6,
                  minWidth: 20,
                  textAlign: "center",
                  fontWeight: 700,
                  display: "inline-block",
                }}
              >
                {totalUnread}
              </span>
            )}
            {item.subItems && (
              <span
                className={`ml-1 transition-transform duration-300 ${
                  activeMenu === index ? "rotate-180" : ""
                }`}
              >
                <FaAngleDown className="text-[#00aaff] w-[16px] h-[16px]" />
              </span>
            )}
          </a>

          {/* Level 1 submenu */}
          {item.subItems && activeMenu === index && (
            <div
              className="absolute left-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn"
              style={{
                padding: "8px",
                margin: "-8px",
                paddingTop: "16px",
                marginTop: "-8px",
              }}
            >
              <div className="absolute w-full h-8 -top-8 left-0" />

              {item.subItems.map((subItem, subIndex) => (
                <div
                  key={subIndex}
                  className="relative"
                  onMouseEnter={() => setActiveSubMenu(subIndex)}
                >
                  <a
                    href={subItem.link}
                    className="flex items-center justify-between px-4 py-2 text-gray-700 font-semibold hover:bg-[#00aaff]/10 hover:text-[#00aaff] whitespace-nowrap hover:no-underline"
                  >
                    {subItem.name}
                    {subItem.subItems && (
                      <FaAngleRight className="text-gray-400 hover:text-[#00aaff] w-[12px] h-[12px]" />
                    )}
                  </a>

                  {/* Level 2 submenu */}
                  {subItem.subItems && activeSubMenu === subIndex && (
                    <div
                      className="absolute left-full top-0 ml-1 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 block animate-fadeIn"
                      style={{
                        padding: "8px",
                        margin: "-8px",
                        paddingLeft: "16px",
                        marginLeft: "-8px",
                      }}
                    >
                      <div className="absolute w-8 h-full -left-8 top-0" />

                      {subItem.subItems.map((nestedItem, nestedIndex) => (
                        <a
                          key={nestedIndex}
                          href={nestedItem.link}
                          className="block px-4 py-2 text-gray-700 font-semibold hover:bg-[#00aaff]/10 hover:text-[#00aaff] whitespace-nowrap hover:no-underline"
                        >
                          {nestedItem.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NavLinks;
