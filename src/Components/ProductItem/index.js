import { useState, useEffect, useContext, useCallback, memo } from "react";
import { MyContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { IoIosHeart } from "react-icons/io";
import { GoHeart } from "react-icons/go";
import {
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus,
} from "../../services/api";
import ProductModal from "../ProductModal";
import { AiOutlineFullscreen } from "react-icons/ai";
import { Link } from "react-router-dom";
import { addToCart } from "../../services/api";
import { Button, Rating, Box, Typography } from "@mui/material";

// Move these outside the component to prevent recreation on each render
const defaultThumbnail =
  "https://klbtheme.com/bacola/wp-content/uploads/2021/04/product-image-62-346x310.jpg";

const ProductItem = memo(
  ({ product, itemView }) => {
    const [isOpenProductModal, setIsProductModal] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const context = useContext(MyContext);
    const navigate = useNavigate();

    // Calculate these values outside of render to reduce computations
    const productId = product?._id;
    const isInStock = product?.countInStock > 0;
    const discountedPrice = product?.price
      ? product.price - (product.price * (product.discount || 0)) / 100
      : 0;
    const thumbnailImage =
      product?.images?.length > 0 ? product.images[0] : defaultThumbnail;

    // Use useEffect with proper dependency array
    useEffect(() => {
      let isMounted = true;

      const checkLikeStatus = async () => {
        if (!productId) return;

        try {
          const response = await checkWishlistStatus(productId);
          if (isMounted) {
            setIsLiked(response.isLiked);
          }
        } catch (error) {
          console.error("Lỗi khi kiểm tra trạng thái yêu thích:", error);
        }
      };

      checkLikeStatus();

      // Cleanup function to prevent state updates on unmounted component
      return () => {
        isMounted = false;
      };
    }, [productId]); // Only depend on productId

    const handleWishlistClick = useCallback(
      async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading || !productId) return;

        if (!context.isLogin) {
          toast.error("Vui lòng đăng nhập để thêm sản phẩm vào yêu thích");
          localStorage.setItem("redirectUrl", window.location.pathname);
          setTimeout(() => {
            navigate("/signin");
          }, 2000);
          return;
        }

        setIsLoading(true);
        try {
          if (isLiked) {
            await removeFromWishlist(productId);
            setIsLiked(false);
            toast.success("Đã xóa khỏi danh sách yêu thích");
          } else {
            await addToWishlist(productId);
            setIsLiked(true);
            toast.success("Đã thêm vào danh sách yêu thích");
          }
        } catch (error) {
          toast.error("Có lỗi xảy ra, vui lòng thử lại");
        } finally {
          setIsLoading(false);
        }
      },
      [isLoading, productId, context.isLogin, isLiked, navigate]
    );

    const viewProductDetails = useCallback(() => {
      setIsProductModal(true);
    }, []);

    const closeProductModal = useCallback(() => {
      setIsProductModal(false);
    }, []);

    const handleAddToCart = useCallback(
      async (e) => {
        e.stopPropagation();

        if (!context.isLogin) {
          toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
          localStorage.setItem("redirectUrl", window.location.pathname);
          setTimeout(() => {
            navigate("/signin");
          }, 2000);
          return;
        }

        try {
          const response = await addToCart(productId, 1);
          if (response) {
            toast.success("Đã thêm sản phẩm vào giỏ hàng!");
          }
        } catch (error) {
          console.error("Lỗi khi thêm vào giỏ hàng:", error);
          if (error.response?.data?.message) {
            toast.error(error.response.data.message);
          } else {
            toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng");
          }
        }
      },
      [productId, context.isLogin, navigate]
    );

    // Early return if no product
    if (!product) {
      return null;
    }

    return (
      <>
        <div
          className={`item productItem ${itemView}`}
          onClick={viewProductDetails}
        >
          <div className="imgWrapper">
            <img
              alt={product.name}
              src={thumbnailImage}
              className="w-100"
              onError={(e) => {
                e.target.src = defaultThumbnail;
              }}
            />
            <div className="actions">
              <Button
                className="b1"
                onClick={(e) => {
                  e.preventDefault();
                  viewProductDetails();
                }}
              >
                <AiOutlineFullscreen />
              </Button>
              <Button
                className="b1"
                onClick={handleWishlistClick}
                disabled={isLoading}
              >
                {isLiked ? (
                  <IoIosHeart style={{ color: "red", fill: "red" }} />
                ) : (
                  <GoHeart />
                )}
              </Button>
            </div>
          </div>
          <Link
            className="link-product"
            to={`/product/${productId}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="info">
              <div className="productitem-top-row">
                <span
                  className={`d-block badge ${
                    isInStock ? "bg-success" : "bg-danger"
                  }`}
                >
                  {isInStock ? "Còn hàng" : "Hết hàng"}
                </span>
                {product.discount > 0 && (
                  <span className="badge-discount">-{product.discount}%</span>
                )}
              </div>
              <h4
                className="productName"
                style={{ fontFamily: "Roboto, sans-serif" }}
              >
                {product.name}
              </h4>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Rating
                  value={product.rating || 0}
                  precision={0.5}
                  readOnly
                  size="small"
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.8rem" }}
                >
                  ({product.numReviews || 0} đánh giá)
                </Typography>
              </Box>
              <div className="d-flex align-items-center gap-2">
                {product.discount > 0 && (
                  <span className="oldPrice">
                    {product.price.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </span>
                )}
                <span className="netPrice text-danger ml-2">
                  {discountedPrice.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </span>
              </div>
            </div>
          </Link>
          <div className="d-flex align-items-center justify-content-center mb-3">
            <Button
              className="add-to-cart-btn"
              sx={{
                backgroundColor: isInStock ? "transparent" : "#ffcccc",
                border: isInStock ? "2px solid #00aaff" : "2px solid red",
                color: isInStock ? "#00aaff" : "red",
                fontWeight: "600",
                textTransform: "none",
                borderRadius: "20px",
                "&:hover": {
                  backgroundColor: isInStock ? "#00aaff" : "#ff4d4d",
                  color: "white",
                  borderColor: isInStock ? "#00aaff" : "red",
                },
                fontFamily: "Dosis, sans-serif",
              }}
              onClick={handleAddToCart}
              disabled={!isInStock}
            >
              {isInStock ? "Thêm vào giỏ" : "Hết hàng"}
            </Button>
          </div>
        </div>

        {isOpenProductModal && (
          <ProductModal
            productId={productId}
            closeProductModal={closeProductModal}
          />
        )}
      </>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memo to prevent unnecessary re-renders
    // Return true if we should NOT re-render
    return (
      prevProps.product?._id === nextProps.product?._id &&
      prevProps.itemView === nextProps.itemView &&
      prevProps.product?.price === nextProps.product?.price &&
      prevProps.product?.discount === nextProps.product?.discount &&
      prevProps.product?.countInStock === nextProps.product?.countInStock &&
      prevProps.product?.rating === nextProps.product?.rating &&
      prevProps.product?.numReviews === nextProps.product?.numReviews
    );
  }
);

ProductItem.displayName = "ProductItem";

export default ProductItem;
