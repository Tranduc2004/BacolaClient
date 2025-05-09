import ProductZoom from "../../Components/ProductZoom";
import Rating from "@mui/material/Rating";
import QuantityBox from "../../Components/QuantityBox";
import Button from "@mui/material/Button";
import { BsFillCartFill } from "react-icons/bs";
import { useState, useEffect, useMemo } from "react";
import { FaRegHeart } from "react-icons/fa6";
import { MdCompareArrows } from "react-icons/md";
import Tooltip from "@mui/material/Tooltip";
import RelatedProducts from "../../Components/ProductDetails/RelatedProducts";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  getProductById,
  getBrands,
  getReviewsByProduct,
  addReview,
  addToCart,
  getSuggestedProducts,
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus,
  isAuthenticated,
} from "../../services/api";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Alert,
  Snackbar,
  Container,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FaHeart } from "react-icons/fa";

// Styled components
const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: "#00aaff10",
  borderRadius: 40,
  padding: 8,
  marginBottom: 30,
  "& .MuiTab-root": {
    borderRadius: 40,
    minHeight: 56,
    fontSize: "1rem",
    fontWeight: 500,
    padding: "12px 24px",
    "&.Mui-selected": {
      backgroundColor: "#00aaff",
      color: "white",
    },
  },
  "& .MuiTabs-indicator": {
    display: "none",
  },
}));

const ContentBox = styled(Box)(({ theme }) => ({
  backgroundColor: "#00aaff10",
  borderRadius: 16,
  padding: 30,
  fontSize: "1.05rem",
}));

const ReviewTextField = styled(TextField)(({ theme }) => ({
  backgroundColor: "white",
  borderRadius: 10,
  marginBottom: 20,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#e0e0e0",
    },
    "&:hover fieldset": {
      borderColor: "#00aaff",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#00aaff",
    },
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#00aaff",
  color: "white",
  borderRadius: 30,
  padding: "10px 30px",
  fontWeight: 500,
  fontSize: "1rem",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#0195df",
  },
}));

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeSize, setActiveSize] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const isInStock = product?.countInStock > 0;
  const [reviews, setReviews] = useState([]);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [hasReviewed, setHasReviewed] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Memoize handlers
  const memoizedHandleTabChange = useMemo(
    () => (event, newValue) => setTabValue(newValue),
    []
  );

  const memoizedHandleReviewChange = useMemo(
    () => (event) => setReview(event.target.value),
    []
  );

  const memoizedHandleRatingChange = useMemo(
    () => (event, newValue) => setRating(newValue),
    []
  );

  // Memoize data
  const memoizedRelatedProducts = useMemo(
    () => relatedProducts || [],
    [relatedProducts]
  );
  const memoizedProduct = useMemo(() => product, [product]);

  useEffect(() => {
    let isMounted = true;
    let isFetching = false;

    const fetchProductDetails = async () => {
      if (!id || isFetching) return;

      try {
        isFetching = true;
        setLoading(true);
        const productData = await getProductById(id);

        if (!isMounted) return;

        setProduct(productData);

        // Kiểm tra nếu brand đã được populate
        if (productData.brand && typeof productData.brand === "object") {
          setBrandName(productData.brand.name);
        }
        // Nếu brand chỉ là ID, thì mới cần fetch brands
        else if (productData.brand) {
          const brands = await getBrands();
          const brand = brands.find((b) => b._id === productData.brand);
          if (brand && isMounted) {
            setBrandName(brand.name);
          }
        }

        // Lấy sản phẩm liên quan - chỉ gọi một lần khi có productData
        if (productData?._id && !relatedProducts.length) {
          const related = await getSuggestedProducts(productData._id);
          if (isMounted) {
            setRelatedProducts(related);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error(
            "[ProductDetails] Lỗi khi lấy thông tin sản phẩm:",
            err
          );
          setError(err.message);
          toast.error("Không thể tải thông tin sản phẩm");
          setRelatedProducts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          isFetching = false;
        }
      }
    };

    fetchProductDetails();

    return () => {
      isMounted = false;
    };
  }, [id, relatedProducts.length]);

  useEffect(() => {
    let isMounted = true;

    const fetchReviews = async () => {
      if (!id) return;

      try {
        const response = await getReviewsByProduct(id);
        const reviewsData = response.data || response;
        if (isMounted) {
          setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Lỗi khi lấy đánh giá:", error);
          setReviews([]);
        }
      }
    };

    fetchReviews();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    const checkLikeStatus = async () => {
      if (!product?._id) return;

      try {
        const response = await checkWishlistStatus(product._id);
        if (isMounted) {
          setIsLiked(response.isLiked);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Lỗi khi kiểm tra trạng thái yêu thích:", error);
        }
      }
    };

    checkLikeStatus();

    return () => {
      isMounted = false;
    };
  }, [product?._id]);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  // Tính giá sau khi giảm giá
  const discountedPrice =
    product?.price - (product?.price * (product?.discount || 0)) / 100;

  const isActive = (index) => {
    setActiveSize(index);
  };

  const handleSubmitReview = async () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      setAlert({
        open: true,
        message: "Bạn cần đăng nhập để gửi đánh giá",
        severity: "warning",
      });
      return;
    }

    if (!review.trim()) {
      setAlert({
        open: true,
        message: "Vui lòng nhập nội dung đánh giá",
        severity: "warning",
      });
      return;
    }

    // Kiểm tra xem người dùng đã đánh giá chưa
    const userReview = reviews.find(
      (r) => r.user?._id === JSON.parse(user)._id
    );
    if (userReview) {
      setAlert({
        open: true,
        message: "Bạn đã đánh giá sản phẩm này rồi",
        severity: "warning",
      });
      return;
    }

    try {
      const result = await addReview({
        productId: id,
        rating,
        comment: review,
      });

      // Extract the new review data from the result
      const newReview = result.data || result;

      // Add new review to the existing reviews
      setReviews([newReview, ...reviews]);

      // Reset form
      setReview("");
      setRating(1);
      setHasReviewed(true);

      setAlert({
        open: true,
        message: "Đánh giá của bạn đã được gửi thành công",
        severity: "success",
      });
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      let errorMessage = "Không thể gửi đánh giá";

      if (error.response?.status === 401) {
        errorMessage = "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại";
        // Xóa token và user khi hết hạn
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setAlert({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleAddToCart = async () => {
    try {
      // Kiểm tra đăng nhập từ AuthContext
      if (!isAuthenticated()) {
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

      // Thêm vào giỏ hàng với số lượng đã chọn
      const response = await addToCart(product._id, quantity);

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
  };

  const handleWishlistClick = async () => {
    if (isLoading || !product._id) return;

    // Kiểm tra đăng nhập từ AuthContext
    if (!isAuthenticated()) {
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

  const handleCompareClick = () => {
    // Kiểm tra đăng nhập
    if (!isAuthenticated()) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào danh sách so sánh");
      localStorage.setItem("redirectUrl", window.location.pathname);
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
      return;
    }

    const compareItems = JSON.parse(
      localStorage.getItem("compareItems") || "[]"
    );

    // Kiểm tra xem sản phẩm đã có trong danh sách so sánh chưa
    if (compareItems.includes(product._id)) {
      toast.error("Sản phẩm đã có trong danh sách so sánh");
      return;
    }

    // Giới hạn số lượng sản phẩm so sánh là 3
    if (compareItems.length >= 3) {
      toast.error("Bạn chỉ có thể so sánh tối đa 3 sản phẩm");
      return;
    }

    // Thêm sản phẩm vào danh sách so sánh
    compareItems.push(product._id);
    localStorage.setItem("compareItems", JSON.stringify(compareItems));
    toast.success("Đã thêm sản phẩm vào danh sách so sánh");
  };

  // Sắp xếp review: admin/superadmin lên đầu
  const sortedReviews = [...reviews].sort((a, b) => {
    if ((b.isAdminComment || b.adminRole) && !(a.isAdminComment || a.adminRole))
      return 1;
    if ((a.isAdminComment || a.adminRole) && !(b.isAdminComment || b.adminRole))
      return -1;
    return 0;
  });

  return (
    <Container maxWidth="xl" className="product-details-container">
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div>Lỗi: {error}</div>
      ) : (
        <>
          <Snackbar
            open={alert.open}
            autoHideDuration={6000}
            onClose={handleCloseAlert}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert onClose={handleCloseAlert} severity={alert.severity}>
              {alert.message}
            </Alert>
          </Snackbar>

          <section className="productDetails section">
            <div className="container">
              <div className="row">
                <div className="col-md-4 pl-5">
                  <ProductZoom product={product} />
                </div>
                <div className="col-md-7 pl-5">
                  <h2 className="hd text-capitalize">{product?.name}</h2>
                  <ul className="list list-inline">
                    <li className="list-inline-item">
                      <div className="d-flex align-items-center mr-3">
                        <span className="text-light1 mr-2">Thương hiệu : </span>
                        <span>{brandName || "No Brand"}</span>
                      </div>
                    </li>
                    <li className="list-inline-item d-flex align-items-center">
                      <div className="d-flex align-items-center">
                        <Rating
                          name="read-only"
                          value={product?.rating || 0}
                          size="small"
                          readOnly
                          precision={0.5}
                        />
                        <span className="text-light1 cursor ml-2">
                          {reviews.length || 0} Đánh giá
                        </span>
                      </div>
                    </li>
                  </ul>
                  <div className="d-flex info mb-3">
                    {product?.discount > 0 && (
                      <span className="oldPrice">
                        {product?.price?.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </span>
                    )}
                    <span className="netPrice text-danger ml-2">
                      {discountedPrice?.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </span>
                  </div>
                  <span
                    className={`badge ${
                      isInStock ? "bg-success" : "bg-danger"
                    }`}
                  >
                    {isInStock ? "Còn hàng" : "Hết hàng"}
                  </span>

                  <p className="mt-3">
                    Vivamus adipiscing nisl ut dolor dignissim semper. Nulla
                    luctus malesuada tincidunt. Class aptent taciti sociosqu ad
                    litora torquent
                  </p>
                  <div className="productSize d-flex align-items-center">
                    <span>Size / Weight:</span>
                    <ul className="list list-inline mb-0 pl-0 ml-3">
                      <li className="list-inline-item">
                        {" "}
                        <a
                          href="#/"
                          className={`tag ${activeSize === 0 ? "active" : ""}`}
                          onClick={() => isActive(0)}
                        >
                          50g
                        </a>
                      </li>
                      <li className="list-inline-item">
                        {" "}
                        <a
                          href="#/"
                          className={`tag ${activeSize === 1 ? "active" : ""}`}
                          onClick={() => isActive(1)}
                        >
                          100g
                        </a>
                      </li>
                      <li className="list-inline-item">
                        {" "}
                        <a
                          href="#/"
                          className={`tag ${activeSize === 2 ? "active" : ""}`}
                          onClick={() => isActive(2)}
                        >
                          200g
                        </a>
                      </li>
                      <li className="list-inline-item">
                        {" "}
                        <a
                          href="#/"
                          className={`tag ${activeSize === 3 ? "active" : ""}`}
                          onClick={() => isActive(3)}
                        >
                          500g
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div className="d-flex align-items-center mt-3">
                    <QuantityBox value={quantity} onChange={setQuantity} />
                    <Button
                      className="btn-lg btn-big btn-round ml-3"
                      sx={{
                        backgroundColor: isInStock ? "#00aaff" : "#cccccc",
                        color: "white",
                        fontFamily: "Dosis, sans-serif",
                        "&:hover": {
                          backgroundColor: isInStock ? "#0088cc" : "#cccccc",
                        },
                        "&:disabled": {
                          backgroundColor: "#faf7f7",
                          border: "1px solid #b81616",
                          color: "red",
                        },
                      }}
                      onClick={handleAddToCart}
                      disabled={!isInStock}
                    >
                      <BsFillCartFill /> &nbsp;{" "}
                      {isInStock ? "Thêm vào giỏ " : "Hết hàng"}
                    </Button>
                    <Tooltip
                      title="Thêm vào danh sách yêu thích"
                      placement="top"
                    >
                      <Button
                        className="btn-lg btn-big btn-circle ml-4"
                        sx={{
                          backgroundColor: "#00aaff",
                          color: "white",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "white",
                            color: "#00aaff",
                            border: "1px solid #00aaff",
                          },
                          "&:active": {
                            backgroundColor: "#00aaff",
                            color: "white",
                          },
                        }}
                        onClick={handleWishlistClick}
                        disabled={isLoading}
                      >
                        {isLiked ? (
                          <FaHeart style={{ color: "red", fill: "red" }} />
                        ) : (
                          <FaRegHeart style={{ color: "red", fill: "red" }} />
                        )}
                      </Button>
                    </Tooltip>
                    <Tooltip title="So sánh" placement="top">
                      <Button
                        className="btn-lg btn-big btn-circle ml-2"
                        sx={{
                          backgroundColor: "#00aaff",
                          color: "white",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "white",
                            color: "#00aaff",
                            border: "1px solid #00aaff",
                          },
                          "&:active": {
                            backgroundColor: "#00aaff",
                            color: "white",
                          },
                        }}
                        onClick={handleCompareClick}
                      >
                        <MdCompareArrows />
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </div>
              <br />

              <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", p: 3 }}>
                <StyledTabs
                  value={tabValue}
                  onChange={memoizedHandleTabChange}
                  variant="fullWidth"
                >
                  <Tab
                    sx={{
                      fontFamily: "Dosis, sans-serif",
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                    }}
                    label="Mô tả"
                  />
                  <Tab
                    sx={{
                      fontFamily: "Dosis, sans-serif",
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                    }}
                    label="Thông số"
                  />
                  <Tab
                    sx={{
                      fontFamily: "Dosis, sans-serif",
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                    }}
                    label={`Đánh giá (${reviews.length || 0})`}
                  />
                </StyledTabs>

                <ContentBox>
                  {tabValue === 0 && (
                    <Typography
                      fontSize="1.1rem"
                      lineHeight={1.7}
                      fontFamily="Dosis, sans-serif"
                    >
                      {product?.description || "Không có mô tả."}
                    </Typography>
                  )}

                  {tabValue === 1 && (
                    <Table
                      sx={{
                        "& .MuiTableCell-root": { fontSize: "1.05rem", py: 2 },
                        fontFamily: "Dosis, sans-serif",
                      }}
                    >
                      <TableBody>
                        <TableRow
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell
                            component="th"
                            scope="row"
                            sx={{
                              fontWeight: "medium",
                              color: "#333",
                              width: "40%",
                              fontFamily: "Dosis, sans-serif",
                            }}
                          >
                            Danh mục
                          </TableCell>
                          <TableCell
                            sx={{
                              fontFamily: "Dosis, sans-serif",
                            }}
                          >
                            {product.category?.name || "Chưa có danh mục"}
                          </TableCell>
                        </TableRow>
                        <TableRow
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell
                            component="th"
                            scope="row"
                            sx={{
                              fontWeight: "medium",
                              color: "#333",
                              width: "40%",
                              fontFamily: "Dosis, sans-serif",
                            }}
                          >
                            Thương hiệu
                          </TableCell>
                          <TableCell
                            sx={{
                              fontFamily: "Dosis, sans-serif",
                            }}
                          >
                            {brandName || "Chưa có thương hiệu"}
                          </TableCell>
                        </TableRow>
                        <TableRow
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell
                            component="th"
                            scope="row"
                            sx={{
                              fontWeight: "medium",
                              color: "#333",
                              width: "40%",
                              fontFamily: "Dosis, sans-serif",
                            }}
                          >
                            Tình trạng
                          </TableCell>
                          <TableCell
                            sx={{
                              fontFamily: "Dosis, sans-serif",
                            }}
                            className={
                              isInStock ? "text-success" : "text-danger"
                            }
                          >
                            {isInStock ? "Còn hàng" : "Hết hàng"}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  )}

                  {tabValue === 2 && (
                    <Box>
                      {/* Add a review section - only show if user hasn't already reviewed */}
                      {!hasReviewed && (
                        <Box sx={{ mb: 5, fontFamily: "Dosis, sans-serif" }}>
                          <Typography
                            variant="h6"
                            sx={{ mb: 3, fontWeight: 500 }}
                          >
                            Đánh giá sản phẩm
                          </Typography>

                          {!isAuthenticated() && (
                            <Alert severity="info" sx={{ mb: 3 }}>
                              Bạn cần đăng nhập để gửi đánh giá
                            </Alert>
                          )}

                          <ReviewTextField
                            multiline
                            rows={6}
                            placeholder="Viết đánh giá"
                            value={review}
                            onChange={memoizedHandleReviewChange}
                            variant="outlined"
                            disabled={!isAuthenticated()}
                          />

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 3,
                            }}
                          >
                            <Rating
                              value={rating}
                              onChange={memoizedHandleRatingChange}
                              disabled={!isAuthenticated()}
                              sx={{
                                "& .MuiRating-iconFilled": {
                                  fontSize: "1.8rem",
                                  color: "#ffc107",
                                },
                                "& .MuiRating-iconEmpty": {
                                  fontSize: "1.8rem",
                                },
                              }}
                            />

                            <SubmitButton
                              variant="contained"
                              onClick={handleSubmitReview}
                              disabled={!isAuthenticated()}
                            >
                              Gửi đánh giá
                            </SubmitButton>
                          </Box>
                        </Box>
                      )}

                      {hasReviewed && (
                        <Alert severity="success" sx={{ mb: 4 }}>
                          Cảm ơn bạn đã gửi đánh giá cho sản phẩm này!
                        </Alert>
                      )}

                      {/* Divider */}
                      <Box
                        sx={{ height: 1, backgroundColor: "#e0e0e0", mb: 4 }}
                      />

                      {/* Existing reviews */}
                      <Typography variant="h5" sx={{ mb: 4, fontWeight: 500 }}>
                        Đánh giá khách hàng{" "}
                        {reviews.length > 0 ? `(${reviews.length})` : ""}
                      </Typography>

                      {reviews.length === 0 && (
                        <Typography
                          variant="body1"
                          sx={{ fontStyle: "italic", color: "text.secondary" }}
                        >
                          Chưa có đánh giá nào cho sản phẩm này.
                        </Typography>
                      )}

                      {sortedReviews.map((review) => {
                        const isAdminReview =
                          review.isAdminComment ||
                          review.adminRole === "admin" ||
                          review.adminRole === "superadmin";

                        return (
                          <Box
                            key={review._id}
                            sx={{
                              mb: 2,
                              p: 2,
                              borderRadius: 1,
                              bgcolor: isAdminReview
                                ? "rgba(25, 118, 210, 0.08)"
                                : "background.paper",
                              border: isAdminReview
                                ? "1px solid #1976d2"
                                : "1px solid #e0e0e0",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: "bold" }}
                              >
                                {review.user?.name || "Khách hàng"}
                              </Typography>
                              {isAdminReview && (
                                <Box
                                  sx={{
                                    ml: 1,
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    bgcolor:
                                      review.adminRole === "superadmin"
                                        ? "#d32f2f"
                                        : "#1976d2",
                                    color: "white",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  {review.adminRole === "superadmin"
                                    ? "Super Admin"
                                    : "Quản trị viên"}
                                </Box>
                              )}
                              <Rating
                                value={review.rating}
                                readOnly
                                sx={{ ml: 1 }}
                              />
                            </Box>
                            <Typography
                              variant="body1"
                              sx={{
                                color: isAdminReview
                                  ? "#1976d2"
                                  : "text.primary",
                                fontWeight: isAdminReview ? "bold" : "normal",
                              }}
                            >
                              {review.comment && review.comment.trim() ? (
                                review.comment
                              ) : (
                                <span style={{ color: "red" }}>
                                  Không có nội dung bình luận
                                </span>
                              )}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {new Date(review.date).toLocaleDateString()}
                            </Typography>

                            {review.adminReplies?.map((reply) => (
                              <Box
                                key={reply._id}
                                sx={{
                                  mt: 1,
                                  ml: 2,
                                  pl: 2,
                                  borderLeft: "2px solid #1976d2",
                                }}
                              >
                                <Typography variant="subtitle2" color="primary">
                                  {reply.adminRole === "superadmin"
                                    ? "Super Admin"
                                    : "Quản trị viên"}
                                </Typography>
                                <Typography variant="body2">
                                  {reply.content || reply.comment}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {reply.createdAt
                                    ? new Date(
                                        reply.createdAt
                                      ).toLocaleDateString()
                                    : ""}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </ContentBox>
              </Box>

              <br />
              {/* Sản phẩm gợi ý */}
              {memoizedProduct?._id && memoizedRelatedProducts?.length > 0 && (
                <RelatedProducts
                  title="Sản phẩm tương tự"
                  initialProducts={memoizedRelatedProducts}
                />
              )}
            </div>
          </section>
        </>
      )}
    </Container>
  );
};
export default ProductDetails;
