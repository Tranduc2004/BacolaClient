import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { searchProducts } from "../../services/api";
import ProductItem from "../../Components/ProductItem";
import Sidebar from "../../Components/Sidebar";
import {
  Typography,
  Box,
  CircularProgress,
  Button,
  Menu,
  MenuItem,
  Pagination,
} from "@mui/material";
import { IoIosMenu } from "react-icons/io";
import { CgMenuGridO } from "react-icons/cg";
import { BsGridFill } from "react-icons/bs";
import { TfiLayoutGrid4Alt } from "react-icons/tfi";
import { FaAngleDown } from "react-icons/fa6";
import { FaFilter, FaTimes } from "react-icons/fa";

const Search = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productView, setProductView] = useState("two");
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 100000000],
    categories: [],
    brands: [],
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  const query = searchParams.get("q");
  const sidebarRef = useRef(null);
  const openDropdown = Boolean(anchorEl);

  // Fetch search results
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await searchProducts({ search: query });
        setProducts(response);
        setFilteredProducts(response);

        // Tạo map tên danh mục
        const catMap = {};
        const brandMap = {};
        response.forEach((product) => {
          if (product.category && typeof product.category === "object") {
            catMap[product.category._id] = product.category.name;
          }
          if (product.brand && typeof product.brand === "object") {
            brandMap[product.brand._id] = product.brand.name;
          }
        });
      } catch (error) {
        console.error("Lỗi khi tìm kiếm sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchProducts();
    }
  }, [query]);

  // Apply filters
  useEffect(() => {
    const filtered = products.filter((product) => {
      // Lọc theo giá
      const price = Number(product.price);
      const priceInRange =
        price >= filters.priceRange[0] && price <= filters.priceRange[1];

      // Lọc theo danh mục (xử lý cả trường hợp category là object hoặc ID)
      const categoryId = product.category?._id || product.category;
      const categoryMatch =
        filters.categories.length === 0 ||
        filters.categories.includes(categoryId);

      // Lọc theo thương hiệu (xử lý cả trường hợp brand là object hoặc ID)
      const brandId = product.brand?._id || product.brand;
      const brandMatch =
        filters.brands.length === 0 || filters.brands.includes(brandId);

      return priceInRange && categoryMatch && brandMatch;
    });

    setFilteredProducts(filtered);
    // Reset về trang 1 khi thay đổi bộ lọc
    setCurrentPage(1);
  }, [filters, products]);

  // Handle responsive filter display
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 767) {
        setShowFilter(true);
      } else {
        setShowFilter(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Pagination calculations
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (newFilters) => {
    setFilters({
      priceRange: newFilters.priceRange || filters.priceRange,
      categories: newFilters.categories || filters.categories,
      brands: newFilters.brands || filters.brands,
    });
  };

  // Reset tất cả bộ lọc
  const handleResetAllFilters = () => {
    setFilters({
      priceRange: [0, 100000000],
      categories: [],
      brands: [],
    });
  };

  // Xử lý thay đổi số sản phẩm mỗi trang
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
    setAnchorEl(null);
  };

  // Xử lý chuyển trang
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo(0, 0);
  };

  // Xử lý click menu dropdown
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Đóng menu dropdown
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Chuyển đổi hiển thị bộ lọc (mobile)
  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  // Kiểm tra có bộ lọc nào đang được áp dụng
  const hasActiveFilters = () => {
    return (
      filters.categories.length > 0 ||
      filters.brands.length > 0 ||
      filters.priceRange[0] > 0 ||
      filters.priceRange[1] < 100000000
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="70vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Đang tìm kiếm...
        </Typography>
      </Box>
    );
  }

  return (
    <section className="product_Listing_Page">
      <div className="container">
        {/* Nút chuyển đổi bộ lọc dành cho thiết bị di động */}
        {window.innerWidth <= 767 && (
          <button
            className="filter-toggle"
            onClick={toggleFilter}
            style={{
              backgroundColor: "#00aaff",
              color: "white",
              borderColor: "#00aaff",
            }}
          >
            {showFilter ? (
              <>
                Ẩn bộ lọc <FaTimes style={{ marginLeft: "5px" }} />
              </>
            ) : (
              <>
                Hiện bộ lọc <FaFilter style={{ marginLeft: "5px" }} />
              </>
            )}
          </button>
        )}

        <div className="productListing d-flex">
          {/* Sidebar filter */}
          <div
            className={`sidebar-wrapper ${showFilter ? "active" : ""}`}
            ref={sidebarRef}
            style={{
              display: showFilter ? "block" : "none",
              width: window.innerWidth <= 767 ? "100%" : "auto",
            }}
          >
            <Sidebar
              onFilterChange={handleFilterChange}
              initialFilters={filters}
            />
          </div>

          <div className="content_right">
            {/* Banner hình ảnh */}
            <img
              alt="Search banner"
              src="https://klbtheme.com/bacola/wp-content/uploads/2021/08/bacola-banner-18.jpg"
              className="w-100"
              style={{ borderRadius: "10px", marginBottom: "20px" }}
            />

            <div className="showBy mt-3 mb-3 d-flex align-items-center">
              <div className="d-flex align-items-center btnWraper">
                <Button
                  className={productView === "one" ? "act" : ""}
                  onClick={() => setProductView("one")}
                >
                  <IoIosMenu />
                </Button>
                <Button
                  className={productView === "two" ? "act" : ""}
                  onClick={() => setProductView("two")}
                >
                  <BsGridFill />
                </Button>
                <Button
                  className={`${
                    productView === "three" ? "act" : ""
                  } hidden md:block`}
                  onClick={() => setProductView("three")}
                >
                  <CgMenuGridO />
                </Button>
                <Button
                  className={`${
                    productView === "four" ? "act" : ""
                  } hidden md:block`}
                  onClick={() => setProductView("four")}
                >
                  <TfiLayoutGrid4Alt />
                </Button>
              </div>

              <div className="ml-auto showByFilter">
                <Button onClick={handleClick}>
                  Hiển thị {itemsPerPage} <FaAngleDown />
                </Button>
                <Menu
                  className="w-100 showPerPageDropdown"
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={openDropdown}
                  onClose={handleClose}
                  MenuListProps={{
                    "aria-labelledby": "basic-button",
                  }}
                >
                  <MenuItem onClick={() => handleItemsPerPageChange(9)}>
                    9
                  </MenuItem>
                  <MenuItem onClick={() => handleItemsPerPageChange(18)}>
                    18
                  </MenuItem>
                  <MenuItem onClick={() => handleItemsPerPageChange(27)}>
                    27
                  </MenuItem>
                  <MenuItem onClick={() => handleItemsPerPageChange(36)}>
                    36
                  </MenuItem>
                </Menu>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <Box
                p={5}
                textAlign="center"
                bgcolor="rgba(244, 67, 54, 0.05)"
                borderRadius={2}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Không tìm thấy sản phẩm nào phù hợp
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vui lòng thử lại với từ khóa khác hoặc điều chỉnh bộ lọc
                </Typography>
                {hasActiveFilters() && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handleResetAllFilters}
                    style={{ marginTop: "15px" }}
                  >
                    Xóa tất cả bộ lọc
                  </Button>
                )}
              </Box>
            ) : (
              <div className="productListing">
                {currentProducts.map((product) => (
                  <ProductItem
                    key={product._id}
                    product={product}
                    itemView={productView}
                  />
                ))}
              </div>
            )}

            {filteredProducts.length > 0 && (
              <div className="pagination-responsive d-flex align-items-center justify-content-center mt-5">
                <Pagination
                  count={pageCount}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Search;
