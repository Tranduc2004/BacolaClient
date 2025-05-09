import Sidebar from "../../Components/Sidebar";
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
import { getProducts } from "../../services/api";

const Listing = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [productView, setProductView] = useState("two");
  const [showFilter, setShowFilter] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [filters, setFilters] = useState({
    priceRange: [0, 100000000],
    categories: [],
    brands: [],
  });
  const sidebarRef = useRef(null);
  const openDropdown = Boolean(anchorEl);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter((product) => {
      const priceInRange =
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1];

      const categoryMatch =
        filters.categories.length === 0 ||
        filters.categories.some(
          (categoryId) =>
            product.category === categoryId ||
            product.categoryId === categoryId ||
            (product.category && product.category._id === categoryId)
        );

      const brandMatch =
        filters.brands.length === 0 ||
        filters.brands.some(
          (brandId) =>
            product.brand === brandId ||
            product.brandId === brandId ||
            (product.brand && product.brand._id === brandId)
        );

      return priceInRange && categoryMatch && brandMatch;
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [filters, products]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
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

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);

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
              <Sidebar
                onFilterChange={handleFilterChange}
                initialFilters={filters}
              />
            </div>

            <div className="content_right">
              <img
                alt=""
                src="https://klbtheme.com/bacola/wp-content/uploads/2021/08/bacola-banner-18.jpg"
                className="w-100"
                style={{ borderRadius: "10px" }}
              />
              <div className="showBy mt-3 mb-3 d-flex align-items-center">
                <div className="d-flex align-items-center btnWraper hidden md:flex">
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
                    className={productView === "three" ? "act" : ""}
                    onClick={() => setProductView("three")}
                  >
                    <CgMenuGridO />
                  </Button>
                  <Button
                    className={productView === "four" ? "act" : ""}
                    onClick={() => setProductView("four")}
                  >
                    <TfiLayoutGrid4Alt />
                  </Button>
                </div>
                <div className="showByFilter">
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
                    <MenuItem onClick={() => handleItemsPerPageChange(12)}>
                      12
                    </MenuItem>
                    <MenuItem onClick={() => handleItemsPerPageChange(24)}>
                      24
                    </MenuItem>
                    <MenuItem onClick={() => handleItemsPerPageChange(36)}>
                      36
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
export default Listing;
