import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Avatar,
  Stack,
  Skeleton,
} from "@mui/material";
import {
  Receipt as ReceiptIcon,
  ShoppingBag as ShoppingBagIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Cancel as CancelledIcon,
  AccessTime as PendingIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { getUserOrders } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const response = await getUserOrders();
      if (response.success) {
        setOrders(response.data);
      } else {
        toast.error("Không thể tải lịch sử đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử đơn hàng:", error);
      toast.error("Có lỗi xảy ra khi tải lịch sử đơn hàng");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: <PendingIcon fontSize="small" />,
      PROCESSING: <ShoppingBagIcon fontSize="small" />,
      SHIPPED: <ShippingIcon fontSize="small" />,
      DELIVERED: <DeliveredIcon fontSize="small" />,
      CANCELLED: <CancelledIcon fontSize="small" />,
    };
    return icons[status] || <PendingIcon fontSize="small" />;
  };

  const getStatusStyle = (status) => {
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
    if (!order.items?.length) return order.totalAmount;
    let total = 0;
    order.items.forEach(({ price, quantity, product, discount }) => {
      const base = price || product?.price || 0;
      const sale =
        typeof discount === "number" ? discount : product?.discount || 0;
      const final = sale > 0 ? base * (1 - sale / 100) : base;
      total += final * (quantity || 1);
    });
    total -= order.discountAmount || 0;
    return Math.round(total);
  };

  const EmptyState = () => (
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
        <ReceiptIcon sx={{ fontSize: 40 }} />
      </Avatar>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Bạn chưa có đơn hàng nào
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ maxWidth: 500, mx: "auto" }}
        gutterBottom
      >
        Hãy khám phá cửa hàng của chúng tôi và tìm kiếm những sản phẩm tuyệt vời
        đầu tiên của bạn!
      </Typography>
      <Button
        variant="contained"
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
        onClick={() => navigate("/products")}
      >
        Mua sắm ngay
      </Button>
    </Paper>
  );

  const LoadingSkeleton = () => (
    <Box>
      {[...Array(5)].map((_, index) => (
        <Skeleton
          key={index}
          variant="rectangular"
          height={80}
          sx={{
            mb: 2,
            borderRadius: 2,
            bgcolor: index % 2 === 0 ? "#f5f5f5" : "#fafafa",
          }}
        />
      ))}
    </Box>
  );

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
        <Typography variant="h4" fontWeight={700} sx={{ color: "#00aaff" }}>
          Lịch sử đơn hàng
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchOrders}
          disabled={refreshing}
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
          variant="outlined"
        >
          {refreshing ? "Đang tải..." : "Làm mới"}
        </Button>
      </Box>

      {loading ? (
        <LoadingSkeleton />
      ) : orders.length === 0 ? (
        <EmptyState />
      ) : (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          <TableContainer>
            <Table>
              <TableHead
                sx={{
                  backgroundColor: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "#2d3748" }}>
                    Mã đơn hàng
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#2d3748" }}>
                    Ngày đặt
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#2d3748" }}>
                    Tổng tiền
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#2d3748" }}>
                    Thanh toán
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#2d3748" }}>
                    Trạng thái
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 700, color: "#2d3748" }}
                  >
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => {
                  const discounted = getDiscountedTotal(order);
                  const original = order.totalAmount;
                  const statusStyle = getStatusStyle(order.status);

                  return (
                    <TableRow
                      key={order._id}
                      hover
                      sx={{
                        "&:last-child td": { borderBottom: 0 },
                        "&:hover": { backgroundColor: "#f8fafc" },
                      }}
                    >
                      <TableCell sx={{ color: "#4a5568", fontWeight: 500 }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </TableCell>
                      <TableCell sx={{ color: "#718096" }}>
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Stack direction="column" spacing={0.5}>
                          {discounted < original ? (
                            <>
                              <Typography
                                variant="body2"
                                sx={{
                                  textDecoration: "line-through",
                                  color: "#a0aec0",
                                }}
                              >
                                {original.toLocaleString("vi-VN")}đ
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  color: "#ed174a",
                                  fontWeight: 600,
                                }}
                              >
                                {discounted.toLocaleString("vi-VN")}đ
                              </Typography>
                            </>
                          ) : (
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 500 }}
                            >
                              {original.toLocaleString("vi-VN")}đ
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(order.status)}
                          label={getStatusText(order.status)}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            backgroundColor: statusStyle.backgroundColor,
                            color: statusStyle.color,
                            borderRadius: 1,
                            "& .MuiChip-icon": {
                              color: statusStyle.iconColor,
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            borderRadius: 3,
                            textTransform: "none",
                            color: "#00aaff",
                            borderColor: "#00aaff",
                            fontWeight: 500,
                            "&:hover": {
                              backgroundColor: "#00aaff10",
                              borderColor: "#008ecc",
                            },
                          }}
                          onClick={() => navigate(`/orders/${order._id}`)}
                        >
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
};

export default OrderHistory;
