import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Chip,
  Divider,
  Button,
  Avatar,
  Stack,
  Skeleton,
  Badge,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderDetail, cancelOrder } from "../../services/api";
import { toast } from "react-hot-toast";
import {
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Cancel as CancelledIcon,
  AccessTime as PendingIcon,
  ShoppingBag as ProcessingIcon,
  ArrowBack as BackIcon,
  Payment as PaymentIcon,
  LocationOn as AddressIcon,
  Receipt as OrderIcon,
  Discount as DiscountIcon,
} from "@mui/icons-material";

const OrderDetail = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const { orderId } = useParams();
  const navigate = useNavigate();

  const fetchOrderDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getOrderDetail(orderId);
      if (response.success) {
        setOrder(response.data);
      } else {
        toast.error("Không thể tải thông tin đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
      toast.error("Có lỗi xảy ra khi tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const handleCancelOrder = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;

    try {
      setCancelling(true);
      const response = await cancelOrder(orderId);
      if (response.success) {
        toast.success("Hủy đơn hàng thành công");
        fetchOrderDetail();
      } else {
        toast.error(response.message || "Không thể hủy đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      toast.error("Có lỗi xảy ra khi hủy đơn hàng");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: <PendingIcon fontSize="small" />,
      PROCESSING: <ProcessingIcon fontSize="small" />,
      SHIPPED: <ShippingIcon fontSize="small" />,
      DELIVERED: <DeliveredIcon fontSize="small" />,
      CANCELLED: <CancelledIcon fontSize="small" />,
    };
    return icons[status] || <PendingIcon fontSize="small" />;
  };

  const getStatusColor = (status) => {
    const styles = {
      PENDING: {
        color: "#b26a00",
        backgroundColor: "#fff3cd",
        iconColor: "#b26a00",
      },
      PROCESSING: {
        color: "#1976d2",
        backgroundColor: "#e3f2fd",
        iconColor: "#1976d2",
      },
      SHIPPED: {
        color: "#6f42c1",
        backgroundColor: "#ede7f6",
        iconColor: "#6f42c1",
      },
      DELIVERED: {
        color: "#388e3c",
        backgroundColor: "#e8f5e9",
        iconColor: "#388e3c",
      },
      CANCELLED: {
        color: "#d32f2f",
        backgroundColor: "#ffebee",
        iconColor: "#d32f2f",
      },
      DEFAULT: {
        color: "#757575",
        backgroundColor: "#f5f5f5",
        iconColor: "#757575",
      },
    };
    return styles[status] || styles.DEFAULT;
  };

  const getStatusText = (status) => {
    const textMap = {
      PENDING: "Chờ xác nhận",
      PROCESSING: "Đang xử lý",
      SHIPPED: "Đang giao hàng",
      DELIVERED: "Đã giao hàng",
      CANCELLED: "Đã hủy",
    };
    return textMap[status] || "Không xác định";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getDiscountedTotal = (order) => {
    if (!order.items || order.items.length === 0) return order.totalAmount;
    let discountedTotal = 0;
    order.items.forEach((item) => {
      const price = item.price || item.product?.price || 0;
      const discount =
        typeof item.discount === "number"
          ? item.discount
          : item.product?.discount || 0;
      const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;
      discountedTotal += finalPrice * (item.quantity || 1);
    });
    discountedTotal -= order.discountAmount || 0;
    return Math.round(discountedTotal);
  };

  const LoadingSkeleton = () => (
    <Box>
      <Skeleton
        variant="rectangular"
        height={56}
        sx={{ mb: 3, borderRadius: 2 }}
      />
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Skeleton
            variant="rectangular"
            height={400}
            sx={{ borderRadius: 2 }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Skeleton
            variant="rectangular"
            height={400}
            sx={{ borderRadius: 2 }}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const ErrorState = () => (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        textAlign: "center",
        borderRadius: 4,
        background: "linear-gradient(135deg, #f5f9ff 0%, #e6f2ff 100%)",
        border: "1px dashed #00aaff",
      }}
    >
      <Avatar
        sx={{
          bgcolor: "#00aaff20",
          color: "#00aaff",
          width: 80,
          height: 80,
          mb: 3,
          margin: "0 auto",
        }}
      >
        <OrderIcon sx={{ fontSize: 40 }} />
      </Avatar>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Không tìm thấy đơn hàng
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ maxWidth: 500, mx: "auto" }}
        gutterBottom
      >
        Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa
      </Typography>
      <Button
        variant="contained"
        startIcon={<BackIcon />}
        sx={{
          mt: 3,
          backgroundColor: "#00aaff",
          color: "#fff",
          borderRadius: 3,
          px: 5,
          py: 1.5,
          textTransform: "none",
          fontWeight: 600,
          boxShadow: "0 4px 12px rgba(0, 170, 255, 0.3)",
          "&:hover": {
            backgroundColor: "#008ecc",
            boxShadow: "0 6px 16px rgba(0, 170, 255, 0.4)",
          },
        }}
        onClick={() => navigate("/orders")}
      >
        Quay lại danh sách đơn hàng
      </Button>
    </Paper>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <LoadingSkeleton />
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <ErrorState />
      </Container>
    );
  }

  const discountedTotal = getDiscountedTotal(order);
  const originalTotal = order.totalAmount;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h4" fontWeight={700} sx={{ color: "#2d3748" }}>
          Chi tiết đơn hàng
        </Typography>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate("/orders")}
          sx={{
            color: "#00aaff",
            borderColor: "#00aaff",
            textTransform: "none",
            borderRadius: 3,
            px: 3,
            "&:hover": {
              backgroundColor: "#00aaff10",
              borderColor: "#008ecc",
            },
          }}
        >
          Quay lại
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Order Items Section */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 3,
              borderRadius: 4,
              border: "1px solid #e2e8f0",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 3,
                pb: 2,
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <OrderIcon
                sx={{
                  mr: 2,
                  color: "#00aaff",
                  fontSize: 32,
                }}
              />
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Thông tin đơn hàng
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mã đơn hàng: #{order._id.slice(-8).toUpperCase()}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Ngày đặt hàng
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formatDate(order.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Trạng thái
                  </Typography>
                  <Chip
                    icon={getStatusIcon(order.status)}
                    label={getStatusText(order.status)}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      ...getStatusColor(order.status),
                      borderRadius: 1,
                      "& .MuiChip-icon": {
                        color: getStatusColor(order.status).iconColor,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Sản phẩm đã đặt
            </Typography>

            <Stack spacing={3}>
              {order.items.map((item) => {
                const productImage =
                  item.product?.images?.[0] ||
                  item.product?.image ||
                  item.images?.[0] ||
                  item.image;
                const defaultImage =
                  "https://res.cloudinary.com/dy81ccuzq/image/upload/v1/products/no-image.png";
                const imageUrl = productImage || defaultImage;

                const discount =
                  typeof item.discount === "number"
                    ? item.discount
                    : item.product?.discount || 0;
                const price = item.price || item.product?.price || 0;
                const discountedPrice =
                  discount > 0 ? price * (1 - discount / 100) : price;
                const itemTotal = discountedPrice * (item.quantity || 1);

                return (
                  <Box
                    key={item._id}
                    sx={{
                      display: "flex",
                      gap: 3,
                      pb: 3,
                      borderBottom: "1px solid #f0f4f8",
                    }}
                  >
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        flexShrink: 0,
                        bgcolor: "grey.100",
                        borderRadius: 2,
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <Box
                        component="img"
                        src={imageUrl}
                        alt={item.product?.name || "Sản phẩm"}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          if (e.target.src !== defaultImage) {
                            e.target.src = defaultImage;
                          }
                        }}
                      />
                      {discount > 0 && (
                        <Badge
                          badgeContent={`-${discount}%`}
                          color="error"
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            "& .MuiBadge-badge": {
                              fontWeight: 600,
                              borderRadius: 2,
                            },
                          }}
                        />
                      )}
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {item.product?.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Số lượng: {item.quantity}
                      </Typography>

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {discount > 0 ? (
                          <>
                            <Typography
                              variant="body1"
                              sx={{
                                textDecoration: "line-through",
                                color: "#a0aec0",
                                fontSize: 14,
                              }}
                            >
                              {price.toLocaleString("vi-VN")}đ
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                color: "#ed174a",
                                fontWeight: 600,
                                fontSize: 16,
                              }}
                            >
                              {discountedPrice.toLocaleString("vi-VN")}đ
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body1" fontWeight={500}>
                            {price.toLocaleString("vi-VN")}đ
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {itemTotal.toLocaleString("vi-VN")}đ
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Grid>

        {/* Order Summary Section */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Shipping Information */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                border: "1px solid #e2e8f0",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 3,
                  pb: 2,
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <AddressIcon
                  sx={{
                    mr: 2,
                    color: "#00aaff",
                    fontSize: 32,
                  }}
                />
                <Typography variant="h6" fontWeight={600}>
                  Thông tin giao hàng
                </Typography>
              </Box>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Người nhận
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {order.shippingAddress.fullName}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Số điện thoại
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {order.shippingAddress.phone}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Địa chỉ
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {order.shippingAddress.address},{" "}
                    {order.shippingAddress.ward},{" "}
                    {order.shippingAddress.district},{" "}
                    {order.shippingAddress.city}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Payment Summary */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                border: "1px solid #e2e8f0",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 3,
                  pb: 2,
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <PaymentIcon
                  sx={{
                    mr: 2,
                    color: "#00aaff",
                    fontSize: 32,
                  }}
                />
                <Typography variant="h6" fontWeight={600}>
                  Thanh toán
                </Typography>
              </Box>

              <Stack spacing={2} sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Phương thức
                  </Typography>
                  <Chip
                    label={
                      order.paymentMethod === "COD"
                        ? "Thanh toán khi nhận hàng"
                        : order.paymentMethod === "VNPAY"
                        ? "Thanh toán VNPAY"
                        : "Thanh toán MOMO"
                    }
                    size="small"
                    sx={{
                      backgroundColor:
                        order.paymentMethod === "COD"
                          ? "#e6fffa"
                          : order.paymentMethod === "VNPAY"
                          ? "#f0f5ff"
                          : "#f0f5ff",
                      color:
                        order.paymentMethod === "COD"
                          ? "#38b2ac"
                          : order.paymentMethod === "VNPAY"
                          ? "#5a67d8"
                          : "#5a67d8",
                      fontWeight: 500,
                      borderRadius: 1,
                    }}
                  />
                </Box>

                {order.paymentMethod === "VNPAY" && (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 2,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Mã giao dịch VNPAY
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {order.vnpayTransactionId || "Chưa có"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Mã đơn hàng VNPAY
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {order.vnpayOrderId || "Chưa có"}
                      </Typography>
                    </Box>
                  </>
                )}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Tạm tính
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {originalTotal.toLocaleString("vi-VN")}đ
                  </Typography>
                </Box>

                {order.discountAmount > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Giảm giá
                    </Typography>
                    <Typography variant="body1" color="error" fontWeight={500}>
                      -{order.discountAmount.toLocaleString("vi-VN")}đ
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 1 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    Tổng cộng
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ color: "#00aaff" }}
                  >
                    {discountedTotal.toLocaleString("vi-VN")}đ
                  </Typography>
                </Box>

                {discountedTotal < originalTotal && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#38a169",
                        fontWeight: 500,
                      }}
                    >
                      <DiscountIcon
                        sx={{ fontSize: 16, verticalAlign: "middle", mr: 0.5 }}
                      />
                      Tiết kiệm{" "}
                      {(originalTotal - discountedTotal).toLocaleString(
                        "vi-VN"
                      )}
                      đ
                    </Typography>
                  </Box>
                )}
              </Stack>

              {order.status === "PENDING" && (
                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "0 4px 12px rgba(220, 53, 69, 0.2)",
                    "&:hover": {
                      boxShadow: "0 6px 16px rgba(220, 53, 69, 0.3)",
                    },
                  }}
                >
                  {cancelling ? "Đang xử lý..." : "Hủy đơn hàng"}
                </Button>
              )}
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderDetail;
