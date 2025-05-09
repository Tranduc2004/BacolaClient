import React, { useState, useEffect, useRef } from "react";
import { FaAngleRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getCategories } from "../../../services/api";

const CategoryMenu = ({ closeMenu }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        if (response && Array.isArray(response)) {
          setCategories(response);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isToggleButton = event.target.closest("[data-category-toggle]");
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !isToggleButton
      ) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeMenu]);

  if (loading) {
    return (
      <div
        ref={menuRef}
        className="absolute top-full left-0 w-72 bg-white shadow-lg rounded-md z-50 border mt-3 p-4"
      >
        <div className="text-center">Đang tải danh mục...</div>
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      className="absolute top-full left-0 w-72 bg-white shadow-lg rounded-md z-50 border mt-3 animate-fadeIn max-h-[40vh] overflow-y-auto"
    >
      <ul className="py-2">
        {categories.map((category) => (
          <li
            key={category._id}
            className="px-4 py-3 flex items-center justify-between hover:bg-gray-100 cursor-pointer relative group"
            onMouseEnter={() => setOpenSubMenu(category._id)}
            onMouseLeave={() => setOpenSubMenu(null)}
          >
            <Link
              to={`/category/${category._id}`}
              className="flex items-center space-x-3 w-full"
              onClick={closeMenu}
            >
              <span className="text-gray-700 font-medium">{category.name}</span>
            </Link>

            {category.subCategories && category.subCategories.length > 0 && (
              <FaAngleRight className="text-gray-400" />
            )}

            {/* Submenu cấp 2 */}
            {category.subCategories &&
              category.subCategories.length > 0 &&
              openSubMenu === category._id && (
                <div className="absolute left-full top-0 bg-white shadow-lg rounded-md w-48 border py-2 animate-slideIn max-h-[30vh] overflow-y-auto">
                  {category.subCategories.map((subCategory) => (
                    <Link
                      key={subCategory._id}
                      to={`/category/${subCategory._id}`}
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-100"
                      onClick={closeMenu}
                    >
                      {subCategory.name}
                    </Link>
                  ))}
                </div>
              )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryMenu;
