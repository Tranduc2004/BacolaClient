import Button from "@mui/material/Button";
import { IoIosMenu } from "react-icons/io";
import { CgMenuGridO } from "react-icons/cg";
import { BsGridFill } from "react-icons/bs";
import { TfiLayoutGrid4Alt } from "react-icons/tfi";
import { FaAngleDown } from "react-icons/fa6";
import { FaFilter, FaTimes } from "react-icons/fa";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import ProductItem from "../../Components/ProductItem";
import Pagination from "@mui/material/Pagination";
import { getProducts, getProductsByCategory } from "../../services/api";
import { useParams } from "react-router-dom";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";

// Hàm định dạng số thành tiền Việt Nam
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const ProductByCategory = () => {
  const { categoryId } = useParams();
  const [anchorEl, setAnchorEl] = useState(null);
  const [productView, setProductView] = useState("four");
  const [showFilter, setShowFilter] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [priceRange, setPriceRange] = useState([0, 100000000]);
  const sidebarRef = useRef(null);
  const openDropdown = Boolean(anchorEl);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let data;
        if (categoryId) {
          data = await getProductsByCategory(categoryId);
        } else {
          data = await getProducts();
        }

        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          setFilteredProducts(data);
        } else {
          setProducts([]);
          setFilteredProducts([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm:", error);
        setProducts([]);
        setFilteredProducts([]);
      }
    };

    fetchProducts();
  }, [categoryId]);

  useEffect(() => {
    if (products.length > 0) {
      const filtered = products.filter((product) => {
        return product.price >= priceRange[0] && product.price <= priceRange[1];
      });
      setFilteredProducts(filtered);
    }
    setCurrentPage(1);
  }, [priceRange, products]);

  const handlePriceChange = (value) => {
    setPriceRange(value);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
    handleClose();
  };

  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Tính toán sản phẩm hiển thị trên trang hiện tại
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Tính tổng số trang
  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);

  // Check window size on initial render and resize
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

  return (
    <>
      <section className="product_Listing_Page">
        <div className="container">
          {window.innerWidth <= 767 && (
            <button className="filter-toggle" onClick={toggleFilter}>
              {showFilter ? (
                <>
                  Hide Filters <FaTimes />
                </>
              ) : (
                <>
                  Show Filters <FaFilter />
                </>
              )}
            </button>
          )}

          <div className="productListing d-flex">
            <div
              className={`sidebar-wrapper ${showFilter ? "active" : ""}`}
              ref={sidebarRef}
              style={{
                display: showFilter ? "block" : "none",
                width: window.innerWidth <= 767 ? "100%" : "auto",
              }}
            >
              <div className="filterBox">
                <h6>KHOẢNG GIÁ</h6>
                <RangeSlider
                  value={priceRange}
                  onInput={handlePriceChange}
                  min={0}
                  max={100000000}
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
              </div>
            </div>

            <div className="content_right">
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
                    Show {itemsPerPage} <FaAngleDown />
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
                    <MenuItem onClick={() => handleItemsPerPageChange(45)}>
                      45
                    </MenuItem>
                  </Menu>
                </div>
              </div>

              <div className="product-count mb-3">
                <p>
                  Hiển thị{" "}
                  {currentProducts.length > 0 ? indexOfFirstProduct + 1 : 0} -{" "}
                  {Math.min(indexOfLastProduct, filteredProducts.length)} của{" "}
                  {filteredProducts.length} sản phẩm
                </p>
              </div>

              <div className="productListing">
                {currentProducts.length > 0 ? (
                  currentProducts.map((product) => (
                    <ProductItem
                      key={product._id}
                      product={product}
                      itemView={productView}
                    />
                  ))
                ) : (
                  <div className="no-products-found">
                    <p>Không tìm thấy sản phẩm phù hợp với bộ lọc.</p>
                  </div>
                )}
              </div>
              {pageCount > 1 && (
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
    </>
  );
};

export default ProductByCategory;
