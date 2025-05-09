import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { FaFilter } from "react-icons/fa";
import { getCategories, getBrands } from "../../services/api";

// Hàm định dạng số thành tiền Việt Nam
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Các mức giá phổ biến để chọn nhanh
const pricePresets = [
  { label: "Dưới 1 triệu", range: [0, 1000000] },
  { label: "1 - 5 triệu", range: [1000000, 5000000] },
  { label: "5 - 10 triệu", range: [5000000, 10000000] },
  { label: "10 - 20 triệu", range: [10000000, 20000000] },
  { label: "Trên 20 triệu", range: [20000000, 100000000] },
];

const Sidebar = ({ onFilterChange = () => {}, initialFilters = {} }) => {
  const MAX_PRICE = 100000000;
  const isFirstRender = useRef(true); // Sử dụng useRef để theo dõi lần render đầu tiên

  // Sử dụng giá trị mặc định từ initialFilters nếu có
  const [priceRange, setPriceRange] = useState(
    initialFilters.priceRange || [0, MAX_PRICE]
  );
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(
    initialFilters.categories || []
  );
  const [selectedBrands, setSelectedBrands] = useState(
    initialFilters.brands || []
  );
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  // Thêm state để theo dõi giá tùy chỉnh
  const [customMinPrice, setCustomMinPrice] = useState(priceRange[0]);
  const [customMaxPrice, setCustomMaxPrice] = useState(priceRange[1]);
  const [appliedFilter, setAppliedFilter] = useState(false);

  // Lấy dữ liệu danh mục và thương hiệu
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          getCategories(),
          getBrands(),
        ]);
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };
    fetchData();
  }, []);

  // Kiểm tra màn hình di động
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      setSidebarVisible(window.innerWidth > 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Đồng bộ state với initialFilters khi props thay đổi
  useEffect(() => {
    if (initialFilters.priceRange) {
      setPriceRange(initialFilters.priceRange);
      setCustomMinPrice(initialFilters.priceRange[0]);
      setCustomMaxPrice(initialFilters.priceRange[1]);
    }
    if (initialFilters.categories) {
      setSelectedCategories(initialFilters.categories);
    }
    if (initialFilters.brands) {
      setSelectedBrands(initialFilters.brands);
    }
  }, [initialFilters]);

  useEffect(() => {
    if (!isFirstRender.current && appliedFilter) {
      if (
        priceRange[0] !== initialFilters.priceRange[0] ||
        priceRange[1] !== initialFilters.priceRange[1]
      ) {
        onFilterChange({
          priceRange,
          categories: selectedCategories,
          brands: selectedBrands,
        });
        setAppliedFilter(false);
      }
    } else {
      isFirstRender.current = false;
    }
  }, [
    priceRange,
    selectedCategories,
    selectedBrands,
    appliedFilter,
    onFilterChange,
    initialFilters.priceRange,
  ]);

  // Hàm xử lý thay đổi danh mục
  const handleCategoryChange = useCallback(
    (categoryId) => {
      setSelectedCategories((prev) => {
        const newCategories = prev.includes(categoryId)
          ? prev.filter((id) => id !== categoryId)
          : [...prev, categoryId];
        setAppliedFilter(true);
        onFilterChange({
          priceRange,
          categories: newCategories,
          brands: selectedBrands,
        });
        return newCategories;
      });
    },
    [priceRange, selectedBrands, onFilterChange]
  );

  // Hàm xử lý thay đổi thương hiệu
  const handleBrandChange = useCallback(
    (brandId) => {
      setSelectedBrands((prev) => {
        const newBrands = prev.includes(brandId)
          ? prev.filter((id) => id !== brandId)
          : [...prev, brandId];
        setAppliedFilter(true);
        onFilterChange({
          priceRange,
          categories: selectedCategories,
          brands: newBrands,
        });
        return newBrands;
      });
    },
    [priceRange, selectedCategories, onFilterChange]
  );

  // Hàm xử lý thay đổi khoảng giá từ slider
  const handlePriceChange = useCallback(
    (value) => {
      setPriceRange(value);
      setCustomMinPrice(value[0]);
      setCustomMaxPrice(value[1]);
      setAppliedFilter(true);
      onFilterChange({
        priceRange: value,
        categories: selectedCategories,
        brands: selectedBrands,
      });
    },
    [selectedCategories, selectedBrands, onFilterChange]
  );

  // Hàm xử lý thay đổi giá input tùy chỉnh
  const handleCustomMinPriceChange = (e) => {
    const value = Number(e.target.value.replace(/\D/g, ""));
    setCustomMinPrice(value);
  };

  const handleCustomMaxPriceChange = (e) => {
    const value = Number(e.target.value.replace(/\D/g, ""));
    setCustomMaxPrice(value);
  };

  // Hàm áp dụng giá tùy chỉnh
  const applyCustomPrice = () => {
    let min = customMinPrice || 0;
    let max = customMaxPrice || MAX_PRICE;

    // Đảm bảo min <= max
    if (min > max) {
      [min, max] = [max, min];
    }

    // Đảm bảo không vượt quá giới hạn
    min = Math.max(0, Math.min(min, MAX_PRICE));
    max = Math.max(min, Math.min(max, MAX_PRICE));

    const newPriceRange = [min, max];
    setPriceRange(newPriceRange);
    setAppliedFilter(true);
    onFilterChange({
      priceRange: newPriceRange,
      categories: selectedCategories,
      brands: selectedBrands,
    });
  };

  // Hàm chọn mức giá từ preset
  const selectPricePreset = (range) => {
    setPriceRange(range);
    setCustomMinPrice(range[0]);
    setCustomMaxPrice(range[1]);
    setAppliedFilter(true);
    onFilterChange({
      priceRange: range,
      categories: selectedCategories,
      brands: selectedBrands,
    });
  };

  // Hàm chuyển đổi hiển thị sidebar (dành cho mobile)
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // Hàm reset tất cả bộ lọc
  const resetFilters = () => {
    const defaultPriceRange = [0, MAX_PRICE];
    setPriceRange(defaultPriceRange);
    setCustomMinPrice(0);
    setCustomMaxPrice(MAX_PRICE);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setAppliedFilter(true);
    onFilterChange({
      priceRange: defaultPriceRange,
      categories: [],
      brands: [],
    });
  };

  return (
    <>
      {isMobile && (
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          <FaFilter style={{ marginRight: "8px" }} />
          {sidebarVisible ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
        </button>
      )}
      <div
        className={`sidebar ${
          isMobile && !sidebarVisible ? "sidebar-hidden" : "sidebar-visible"
        }`}
      >
        <div className="filterBox">
          <div className="d-flex justify-content-between align-items-center">
            <h6>BỘ LỌC SẢN PHẨM</h6>
            <button
              className="reset-filter-btn"
              onClick={resetFilters}
              style={{
                background: "none",
                border: "none",
                color: "#ff5722",
                fontSize: "0.8rem",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Đặt lại
            </button>
          </div>
        </div>

        <div className="filterBox">
          <h6>KHOẢNG GIÁ</h6>
          {/* Các mức giá phổ biến */}
          <div className="price-presets mb-3">
            <div className="price-preset-label mb-1">Mức giá phổ biến:</div>
            <div className="price-preset-buttons">
              {pricePresets.map((preset, index) => (
                <button
                  key={index}
                  className={`price-preset-btn mb-1 ${
                    priceRange[0] === preset.range[0] &&
                    priceRange[1] === preset.range[1]
                      ? "active"
                      : ""
                  }`}
                  onClick={() => selectPricePreset(preset.range)}
                  style={{
                    padding: "5px 10px",
                    margin: "0 5px 5px 0",
                    fontSize: "0.8rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    cursor: "pointer",
                    backgroundColor:
                      priceRange[0] === preset.range[0] &&
                      priceRange[1] === preset.range[1]
                        ? "#f0f0f0"
                        : "white",
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Range slider */}
          <RangeSlider
            value={priceRange}
            onInput={handlePriceChange}
            min={0}
            max={MAX_PRICE}
            step={100000}
          />
          <div className="d-flex pt-2 pb-2 priceRange">
            <span>
              Từ:{" "}
              <strong className="text-dark">
                {formatCurrency(priceRange[0])}
              </strong>
            </span>
            <span className="ml-auto">
              Đến:{" "}
              <strong className="text-dark">
                {formatCurrency(priceRange[1])}
              </strong>
            </span>
          </div>

          {/* Nhập giá tùy chỉnh */}
          <div className="custom-price-inputs mt-3">
            <div className="row">
              <div className="col-5">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Giá từ"
                  value={customMinPrice === 0 ? "" : customMinPrice}
                  onChange={handleCustomMinPriceChange}
                  style={{ fontSize: "0.85rem" }}
                />
              </div>
              <div className="col-5">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Giá đến"
                  value={customMaxPrice === MAX_PRICE ? "" : customMaxPrice}
                  onChange={handleCustomMaxPriceChange}
                  style={{ fontSize: "0.85rem" }}
                />
              </div>
            </div>
            <div className="d-flex justify-content-center mt-2">
              {" "}
              {/* Thay đổi tại đây */}
              <button
                className=" btn-sm text-white"
                onClick={applyCustomPrice}
                style={{
                  fontSize: "0.85rem",
                  width: "100px",
                  backgroundColor: "#51adf6", // Thêm màu nền tại đây
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>

        <div className="filterBox">
          <h6>DANH MỤC SẢN PHẨM</h6>
          <div className="scroll">
            <ul>
              {categories.map((category) => (
                <li key={category._id}>
                  <FormControlLabel
                    className="w-100"
                    control={
                      <Checkbox
                        checked={selectedCategories.includes(category._id)}
                        onChange={() => handleCategoryChange(category._id)}
                      />
                    }
                    label={category.name}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="filterBox">
          <h6>THƯƠNG HIỆU</h6>
          <div className="scroll">
            <ul>
              {brands.map((brand) => (
                <li key={brand._id}>
                  <FormControlLabel
                    className="w-100"
                    control={
                      <Checkbox
                        checked={selectedBrands.includes(brand._id)}
                        onChange={() => handleBrandChange(brand._id)}
                      />
                    }
                    label={brand.name}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <br />
        {!isMobile && (
          <Link>
            <img
              alt=""
              src="https://klbtheme.com/bacola/wp-content/uploads/2021/05/sidebar-banner.gif"
              className="w-100"
            />
          </Link>
        )}
      </div>
    </>
  );
};

export default Sidebar;
