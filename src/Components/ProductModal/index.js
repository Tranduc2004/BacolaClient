import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import { MdClose } from "react-icons/md";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import { IoIosHeartEmpty, IoIosHeart } from "react-icons/io";
import { MdOutlineCompareArrows } from "react-icons/md";
import "swiper/css";
import { useState, useEffect, useContext } from "react";
import {
  getProductById,
  getBrands,
  addToCart,
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus,
} from "../../services/api";
import { MyContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import "react-inner-image-zoom/lib/InnerImageZoom/styles.css";
import QuantityBox from "../QuantityBox";
import ProductZoom from "../ProductZoom";

const ProductModal = ({ productId, closeProductModal }) => {
  const [product, setProduct] = useState(null);
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(true);
  const context = useContext(MyContext);
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        const response = await getProductById(productId);
        if (response) {
          setProduct(response);

          // Kiểm tra nếu brand đã được populate
          if (response.brand && typeof response.brand === "object") {
            setBrandName(response.brand.name);
          }
          // Nếu brand chỉ là ID, thì mới cần fetch brands
          else if (response.brand) {
            const brands = await getBrands();
            const brand = brands.find((b) => b._id === response.brand);
            if (brand) {
              setBrandName(brand.name);
            }
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!product?._id) return;

      try {
        const response = await checkWishlistStatus(product._id);
        setIsLiked(response.isLiked);
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái yêu thích:", error);
      }
    };

    checkLikeStatus();
  }, [product?._id]);

  if (loading) {
    return (
      <Dialog open={true} onClose={closeProductModal}>
        <DialogContent>
          <Typography>Đang tải...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  if (!product) {
    return (
      <Dialog open={true} onClose={closeProductModal}>
        <DialogContent>
          <Typography>Không tìm thấy sản phẩm</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  // Tính giá sau khi giảm giá
  const discountedPrice =
    product.price - (product.price * (product.discount || 0)) / 100;
  const isInStock = product.countInStock > 0;

  const handleAddToCart = async () => {
    try {
      // Kiểm tra đăng nhập từ context
      if (!context.isLogin) {
        toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
        localStorage.setItem("redirectUrl", window.location.pathname);
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
        return;
      }

      // Kiểm tra số lượng
      if (!quantity || quantity < 1) {
        toast.error("Vui lòng chọn số lượng hợp lệ");
        return;
      }

      // Kiểm tra số lượng tồn kho
      if (quantity > product.countInStock) {
        toast.error(
          `Số lượng tồn kho không đủ. Chỉ còn ${product.countInStock} sản phẩm`
        );
        return;
      }

      // Thêm vào giỏ hàng với số lượng đã chọn
      const response = await addToCart(product._id, quantity);

      if (response) {
        toast.success("Đã thêm sản phẩm vào giỏ hàng!");
        closeProductModal();
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng");
      }
    }
  };

  const handleWishlistClick = async () => {
    if (isLoading || !product._id) return;

    setIsLoading(true);
    try {
      if (isLiked) {
        await removeFromWishlist(product._id);
        setIsLiked(false);
        toast.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        await addToWishlist(product._id);
        setIsLiked(true);
        toast.success("Đã thêm vào danh sách yêu thích");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={true}
      className="productModal"
      onClose={closeProductModal}
      sx={{
        "& .MuiDialog-paper": {
          width: "100%",
          maxWidth: "800px",
          padding: "20px",
          position: "relative",
        },
      }}
    >
      {/* Close Button */}
      <Button
        onClick={closeProductModal}
        sx={{
          position: "absolute",
          top: "10px",
          right: "10px",
          minWidth: "auto",
          padding: "5px",
          fontSize: "25px",
          background: "#c2c2d3",
          color: "#fff",
          borderRadius: "50%",
        }}
      >
        <MdClose />
      </Button>

      {/* Product Title & Brand */}
      <h4 className="mb-1 font-weight-bold">{product.name}</h4>
      <div className="d-flex align-items-center">
        <span className="mr-2">
          Thương hiệu: <b>{brandName || "Không có thương hiệu"}</b>
        </span>
        <Rating
          name="read-only"
          value={product.rating || 0}
          size="small"
          precision={0.5}
          readOnly
        />
      </div>
      <hr />

      <div className="row mt-2">
        <div className="col-md-5">
          <ProductZoom product={product} />
        </div>

        {/* Product Info */}
        <div className="col-md-7">
          <div className="d-flex align-items-center mb-3">
            {product.discount > 0 && (
              <span className="oldPrice lg mr-2">
                {product.price.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
            )}
            <span className="netPrice text-danger lg">
              <span className="netPrice text-danger ml-2">
                {discountedPrice.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
            </span>
          </div>
          <span className={`badge  ${isInStock ? "bg-success" : "bg-danger"}`}>
            {isInStock ? "Còn hàng" : "Hết hàng"}
          </span>
          <p className="mt-3"></p>

          {/* Quantity & Add to Cart */}
          <div className="d-flex align-items-center">
            <QuantityBox value={quantity} onChange={setQuantity} />
            <Button
              className="btn-lg btn-big btn-round ml-3"
              sx={{
                backgroundColor: isInStock ? "#00aaff" : "#cccccc",
                fontFamily: "Dosis, sans-serif",
                color: "white",
                "&:hover": {
                  backgroundColor: isInStock ? "#0088cc" : "#cccccc",
                },
                "&:disabled": {
                  backgroundColor: "#cccccc",
                  color: "white",
                },
              }}
              onClick={handleAddToCart}
              disabled={!isInStock}
            >
              {isInStock ? "Thêm giỏ hàng" : "Hết hàng"}
            </Button>
          </div>

          {/* Wishlist & Compare */}
          <div className="d-flex align-items-center mt-5 actions">
            <Button
              className="btn-round btn-sml"
              variant="outlined"
              onClick={handleWishlistClick}
              disabled={isLoading}
            >
              {isLiked ? (
                <IoIosHeart style={{ color: "red", fill: "red" }} />
              ) : (
                <IoIosHeartEmpty style={{ color: "red", fill: "red" }} />
              )}{" "}
              &nbsp;
              {isLiked ? "ĐÃ THÍCH" : "THÊM VÀO YÊU THÍCH"}
            </Button>
            <Button className="btn-round btn-sml ml-3" variant="outlined">
              <MdOutlineCompareArrows /> &nbsp; SO SÁNH
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ProductModal;
