import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  Container,
  Rating,
  Avatar,
  Chip,
  Stack,
  Tooltip,
  IconButton,
  useMediaQuery,
  Card,
  CardContent,
  Fade,
  Badge,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from "@mui/material";
import {
  Home as HomeIcon,
  LocalShipping,
  Payment,
  ContentCopy,
  Person,
  Phone,
  LocationOn,
  NoteAlt,
  Inventory,
  RestaurantMenu,
  AccessTime,
  Celebration,
  Receipt,
  LocalOffer,
  HelpOutline,
  WhatsApp,
  Facebook,
  Instagram,
} from "@mui/icons-material";
import { styled, useTheme } from "@mui/material/styles";
import Confetti from "react-confetti";

// Định nghĩa các component styled
const ModernContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(8),
}));

const HeroCard = styled(Paper)(({ theme }) => ({
  background: "linear-gradient(120deg, #00aaff 0%, #0077cc 100%)", // màu chủ đạo mới
  color: "#fff",
  borderRadius: 20,
  boxShadow: "0 10px 30px rgba(0, 170, 255, 0.3)", // đổi màu bóng phù hợp
  padding: theme.spacing(4),
  position: "relative",
  overflow: "hidden",
  marginBottom: theme.spacing(4),
  textAlign: "center",
}));

const OrderIDCard = styled(Paper)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.15)",
  backdropFilter: "blur(10px)",
  borderRadius: 12,
  padding: theme.spacing(2, 3),
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  maxWidth: "100%",
  margin: "0 auto",
  marginTop: theme.spacing(2),
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
}));

const ContentCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: "0 5px 20px rgba(0, 0, 0, 0.05)",
  height: "100%",
  transition: " 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
  },
  overflow: "visible",
}));

const ProductItem = styled(Box)(({ theme }) => ({
  display: "flex",
  padding: theme.spacing(2),
  borderRadius: 8,
  background: "#f9fafc",
  marginBottom: theme.spacing(2),
  transition: "transform 0.2s ease",
}));

const ProductImage = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
  border: "2px solid white",
}));

const StatusStepper = styled(Stepper)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  "& .MuiStepLabel-label": {
    fontWeight: 500,
  },
  "& .MuiStepLabel-iconContainer": {
    paddingRight: theme.spacing(1),
  },
}));

const StatusLabel = styled(Typography)(({ theme, status }) => {
  const getStatusColor = () => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "#ff9800";
      case "PROCESSING":
        return "#2196f3";
      case "SHIPPED":
        return "#9c27b0";
      case "DELIVERED":
        return "#4caf50";
      case "CANCELLED":
      case "FAILED":
        return "#f44336";
      default:
        return "#00aaff";
    }
  };

  return {
    color: getStatusColor(),
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    "& svg": {
      marginRight: theme.spacing(0.5),
    },
  };
});

const SocialButton = styled(IconButton)(({ theme, color }) => ({
  backgroundColor: color,
  color: "#fff",
  margin: theme.spacing(0, 1),
  transition: "transform 0.2s ease",
  "&:hover": {
    backgroundColor: color,
  },
}));

const SummaryBox = styled(Box)(({ theme }) => ({
  background: "#f9fafc",
  borderRadius: 12,
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const ThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (location.state?.order) {
      setOrder(location.state.order);
    } else {
      navigate("/");
    }

    // Dừng hiệu ứng confetti sau 5 giây
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [location, navigate]);

  if (!order) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const calculateFinalAmount = () => {
    const itemsTotal = (order.items || []).reduce((sum, item) => {
      const discount =
        typeof item.discount === "number"
          ? item.discount
          : item.product?.discount || 0;
      const price = item.price || item.product?.price || 0;
      const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;
      return sum + finalPrice * (item.quantity || 1);
    }, 0);
    return itemsTotal - (order.discountAmount || 0);
  };

  const getOrderStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "Đang chờ xử lý";
      case "PROCESSING":
        return "Đang xử lý";
      case "SHIPPED":
        return "Đang giao hàng";
      case "DELIVERED":
        return "Đã giao hàng";
      case "CANCELLED":
        return "Đã hủy";
      case "FAILED":
        return "Thất bại";
      default:
        return status || "Không xác định";
    }
  };

  const getStepStatus = (currentStatus) => {
    const statusOrder = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
    const currentIndex = statusOrder.indexOf(currentStatus?.toUpperCase());
    if (currentIndex === -1) return 0;
    return currentIndex;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(order._id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <ModernContainer maxWidth="lg">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}

      <Fade in={true} timeout={1000}>
        <HeroCard elevation={0}>
          <Box sx={{ position: "relative", zIndex: 2 }}>
            <Avatar
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                width: 90,
                height: 90,
                margin: "0 auto 18px",
                backdropFilter: "blur(5px)",
              }}
            >
              <Celebration sx={{ fontSize: 50, color: "#fff" }} />
            </Avatar>

            <Typography variant="h4" fontWeight={700} gutterBottom>
              Đặt hàng thành công!
            </Typography>

            <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 3 }}>
              Cảm ơn bạn đã tin tưởng và mua sắm tại <b>Bacola</b>. Đơn hàng của
              bạn đang được xử lý.
            </Typography>

            <OrderIDCard>
              <Typography
                color="black"
                fontWeight="bold"
                variant="body1"
                sx={{ mr: 1, opacity: 0.9 }}
              >
                Mã đơn hàng:
              </Typography>
              <Typography
                component="span"
                fontWeight="bold"
                color="white"
                sx={{ letterSpacing: 1 }}
              >
                {order._id}
              </Typography>
              <Tooltip title={copied ? "Đã sao chép!" : "Sao chép mã"}>
                <IconButton
                  size="small"
                  onClick={handleCopy}
                  sx={{
                    ml: 1,
                    color: "#fff",
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.3)" },
                  }}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </OrderIDCard>
          </Box>

          {/* Hình nền trang trí */}
          <Box
            sx={{
              position: "absolute",
              right: -40,
              top: -40,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(5px)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              left: -20,
              bottom: -30,
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.07)",
            }}
          />
        </HeroCard>
      </Fade>

      <Grid container spacing={3}>
        {/* Cột bên trái - Thông tin đơn hàng */}
        <Grid item xs={12} md={8}>
          <Fade in={true} timeout={1200}>
            <ContentCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar sx={{ bgcolor: "#00aaff", mr: 2 }}>
                    <Receipt />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Chi tiết đơn hàng
                  </Typography>
                </Box>

                {/* Thanh trạng thái đơn hàng */}
                <StatusStepper
                  activeStep={getStepStatus(order.status)}
                  orientation={isMobile ? "vertical" : "horizontal"}
                  alternativeLabel={!isMobile}
                >
                  <Step key="pending">
                    <StepLabel>
                      <Typography variant="body2" fontWeight={500}>
                        Đã đặt hàng
                      </Typography>
                    </StepLabel>
                    {isMobile && (
                      <StepContent>
                        <Typography variant="caption">
                          Đơn hàng của bạn đã được tiếp nhận
                        </Typography>
                      </StepContent>
                    )}
                  </Step>
                  <Step key="processing">
                    <StepLabel>
                      <Typography variant="body2" fontWeight={500}>
                        Đang xử lý
                      </Typography>
                    </StepLabel>
                    {isMobile && (
                      <StepContent>
                        <Typography variant="caption">
                          Đơn hàng đang được chuẩn bị
                        </Typography>
                      </StepContent>
                    )}
                  </Step>
                  <Step key="shipped">
                    <StepLabel>
                      <Typography variant="body2" fontWeight={500}>
                        Đang giao hàng
                      </Typography>
                    </StepLabel>
                    {isMobile && (
                      <StepContent>
                        <Typography variant="caption">
                          Đơn hàng đang được vận chuyển
                        </Typography>
                      </StepContent>
                    )}
                  </Step>
                  <Step key="delivered">
                    <StepLabel>
                      <Typography variant="body2" fontWeight={500}>
                        Đã giao hàng
                      </Typography>
                    </StepLabel>
                    {isMobile && (
                      <StepContent>
                        <Typography variant="caption">
                          Đơn hàng đã được giao thành công
                        </Typography>
                      </StepContent>
                    )}
                  </Step>
                </StatusStepper>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mb: 3 }}
                >
                  Đơn hàng của bạn hiện đang ở trạng thái:{" "}
                  <StatusLabel status={order.status}>
                    {getOrderStatusText(order.status)}
                  </StatusLabel>
                </Typography>

                <Divider sx={{ mb: 3 }} />

                {/* Danh sách sản phẩm */}
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  Sản phẩm đã mua
                </Typography>

                <Stack spacing={2}>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => {
                      const discount =
                        typeof item.discount === "number"
                          ? item.discount
                          : item.product?.discount || 0;
                      const price = item.price || item.product?.price || 0;
                      const finalPrice =
                        discount > 0 ? price * (1 - discount / 100) : price;
                      return (
                        <ProductItem key={item.product?._id || index}>
                          <ProductImage
                            src={
                              item.image ||
                              item.product?.image ||
                              "/placeholder.png"
                            }
                            alt={item.name || item.product?.name}
                          />
                          <Box sx={{ ml: 2, flex: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                              }}
                            >
                              <Typography variant="subtitle1" fontWeight={600}>
                                {item.name || item.product?.name || "Sản phẩm"}
                              </Typography>
                              <Badge
                                badgeContent={item.quantity}
                                color="primary"
                                sx={{
                                  "& .MuiBadge-badge": {
                                    borderRadius: 1,
                                    fontSize: 12,
                                    height: 22,
                                    minWidth: 22,
                                  },
                                }}
                              >
                                <RestaurantMenu color="action" />
                              </Badge>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                my: 1,
                              }}
                            >
                              <Rating
                                value={item.product?.rating || 0}
                                precision={0.5}
                                readOnly
                                size="small"
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ ml: 1 }}
                              >
                                ({item.product?.numReviews || 0})
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-end",
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {discount > 0 && (
                                  <Typography
                                    component="span"
                                    sx={{
                                      bgcolor: "#ffebee",
                                      color: "#f44336",
                                      px: 1,
                                      py: 0.3,
                                      borderRadius: 1,
                                      fontSize: "0.75rem",
                                      fontWeight: 600,
                                    }}
                                  >
                                    -{discount}%
                                  </Typography>
                                )}
                              </Typography>
                              <Box sx={{ textAlign: "right" }}>
                                {discount > 0 && (
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      textDecoration: "line-through",
                                      color: "text.disabled",
                                      fontSize: "0.8rem",
                                    }}
                                  >
                                    {formatPrice(price)}
                                  </Typography>
                                )}
                                <Typography
                                  variant="subtitle2"
                                  fontWeight={600}
                                  color="primary.main"
                                >
                                  {formatPrice(finalPrice)}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </ProductItem>
                      );
                    })
                  ) : (
                    <Typography>
                      Không có sản phẩm nào trong đơn hàng.
                    </Typography>
                  )}
                </Stack>

                {/* Tổng đơn hàng */}
                <SummaryBox>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      Tổng tiền hàng:
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatPrice(
                        order.items?.reduce((sum, item) => {
                          const price = item.price || item.product?.price || 0;
                          return sum + price * (item.quantity || 1);
                        }, 0)
                      )}
                    </Typography>
                  </Box>

                  {order.discountAmount > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <LocalOffer
                          fontSize="small"
                          sx={{ mr: 0.5, color: "#f44336" }}
                        />
                        Giảm giá:
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight={500}
                        color="error"
                      >
                        -{formatPrice(order.discountAmount)}
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ my: 1.5 }} />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      Thành tiền:
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="primary.main"
                    >
                      {formatPrice(calculateFinalAmount())}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <Payment fontSize="small" sx={{ mr: 0.5 }} />
                      Phương thức thanh toán:
                    </Typography>
                    <Chip
                      label={
                        order.paymentMethod === "COD"
                          ? "Thanh toán khi nhận hàng"
                          : "Momo"
                      }
                      size="small"
                      icon={
                        order.paymentMethod === "COD" ? (
                          <Payment fontSize="small" />
                        ) : null
                      }
                      avatar={
                        order.paymentMethod !== "COD" ? (
                          <Avatar src="https://img.icons8.com/color/24/000000/momo.png" />
                        ) : null
                      }
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>
                </SummaryBox>
              </CardContent>
            </ContentCard>
          </Fade>
        </Grid>

        {/* Cột bên phải - Thông tin giao hàng và hỗ trợ */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Thông tin giao hàng */}
            <Fade in={true} timeout={1400}>
              <ContentCard>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Avatar sx={{ bgcolor: "#00aaff", mr: 2 }}>
                      <LocalShipping />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                      Thông tin giao hàng
                    </Typography>
                  </Box>

                  {order.shippingAddress ? (
                    <List disablePadding>
                      <ListItem disablePadding sx={{ mb: 2 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Person color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Người nhận"
                          secondary={order.shippingAddress.fullName}
                          primaryTypographyProps={{
                            variant: "body2",
                            color: "text.secondary",
                          }}
                          secondaryTypographyProps={{
                            variant: "subtitle2",
                            fontWeight: 600,
                          }}
                        />
                      </ListItem>

                      <ListItem disablePadding sx={{ mb: 2 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Phone color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Số điện thoại"
                          secondary={order.shippingAddress.phone}
                          primaryTypographyProps={{
                            variant: "body2",
                            color: "text.secondary",
                          }}
                          secondaryTypographyProps={{
                            variant: "subtitle2",
                            fontWeight: 600,
                          }}
                        />
                      </ListItem>

                      <ListItem
                        disablePadding
                        sx={{ alignItems: "flex-start" }}
                      >
                        <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                          <LocationOn color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Địa chỉ giao hàng"
                          secondary={`${order.shippingAddress.address}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.city}`}
                          primaryTypographyProps={{
                            variant: "body2",
                            color: "text.secondary",
                          }}
                          secondaryTypographyProps={{
                            variant: "subtitle2",
                            fontWeight: 600,
                          }}
                        />
                      </ListItem>
                    </List>
                  ) : (
                    <Typography>Không có thông tin giao hàng.</Typography>
                  )}

                  {order.note && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                        <NoteAlt color="primary" sx={{ mr: 1, fontSize: 20 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Ghi chú:
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ fontStyle: "italic", mt: 0.5 }}
                          >
                            "{order.note}"
                          </Typography>
                        </Box>
                      </Box>
                    </>
                  )}
                </CardContent>
              </ContentCard>
            </Fade>

            {/* Dự kiến thời gian nhận hàng */}
            <Fade in={true} timeout={1600}>
              <ContentCard>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: "#00aaff", mr: 2 }}>
                      <AccessTime />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                      Dự kiến nhận hàng
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: "center", py: 2 }}>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      color="primary.main"
                    >
                      {/* Tính toán ngày nhận hàng (vd: 3-5 ngày sau khi đặt) */}
                      {(() => {
                        const orderDate = new Date(order.createdAt);
                        const estimatedMin = new Date(orderDate);
                        const estimatedMax = new Date(orderDate);
                        estimatedMin.setDate(estimatedMin.getDate() + 3);
                        estimatedMax.setDate(estimatedMax.getDate() + 5);

                        const formatDate = (date) => {
                          return date.toLocaleDateString("vi-VN", {
                            day: "numeric",
                            month: "numeric",
                          });
                        };

                        return `${formatDate(estimatedMin)} - ${formatDate(
                          estimatedMax
                        )}`;
                      })()}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Đơn hàng sẽ được giao trong khoảng 3-5 ngày làm việc
                    </Typography>
                  </Box>
                </CardContent>
              </ContentCard>
            </Fade>

            {/* Hỗ trợ khách hàng */}
            <Fade in={true} timeout={1800}>
              <ContentCard>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: "#00aaff", mr: 2 }}>
                      <HelpOutline />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                      Hỗ trợ khách hàng
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Nếu bạn có bất kỳ thắc mắc nào về đơn hàng, vui lòng liên hệ
                    với chúng tôi.
                  </Typography>

                  <Box
                    sx={{ display: "flex", justifyContent: "center", mb: 2 }}
                  >
                    <SocialButton color="#25D366" aria-label="WhatsApp">
                      <WhatsApp />
                    </SocialButton>
                    <SocialButton color="#4267B2" aria-label="Facebook">
                      <Facebook />
                    </SocialButton>
                    <SocialButton color="#E1306C" aria-label="Instagram">
                      <Instagram />
                    </SocialButton>
                  </Box>

                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="body2" fontWeight={600}>
                      Hotline:{" "}
                      <span style={{ color: "#00aaff" }}>1800 6999</span>
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      Email:{" "}
                      <span style={{ color: "#00aaff" }}>
                        support@bacola.com
                      </span>
                    </Typography>
                  </Box>
                </CardContent>
              </ContentCard>
            </Fade>
          </Stack>
        </Grid>
      </Grid>

      {/* Nút tiếp tục mua sắm */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4, gap: 2 }}>
        <Button
          variant="contained"
          sx={{
            border: "2px solid #00aaff", // thêm viền cho nổi bật
            bgcolor: "transparent", // không có nền ban đầu
            color: "#00aaff", // màu chữ
            "&:hover": {
              bgcolor: "#00aaff", // nền màu xanh khi hover
              color: "#fff", // đổi màu chữ khi hover
            },
            borderRadius: 50,
            padding: "2px 20px",
            fontSize: "1rem",
            fontWeight: 600,
            textTransform: "none",
            boxShadow: "0 4px 15px rgba(0, 170, 255, 0.3)", // đồng bộ với màu chủ đạo
            fontFamily: "Dosis",
          }}
          startIcon={<HomeIcon />}
          onClick={() => navigate("/")}
        >
          Tiếp tục mua sắm
        </Button>

        <Button
          variant="outlined"
          sx={{
            border: "2px solid #00aaff", // thêm viền cho nổi bật
            bgcolor: "transparent", // không có nền ban đầu
            color: "#00aaff", // màu chữ
            "&:hover": {
              bgcolor: "#00aaff", // nền màu xanh khi hover
              color: "#fff", // đổi màu chữ khi hover
            },
            borderRadius: 50,
            padding: "12px 24px",
            fontSize: "1rem",
            fontWeight: 600,
            textTransform: "none",
            fontFamily: "Dosis",
          }}
          startIcon={<Inventory />}
          onClick={() => navigate("/orders")}
        >
          Xem đơn hàng của tôi
        </Button>
      </Box>

      {/* Footer */}
      <Box sx={{ textAlign: "center", mt: 6, color: "text.secondary" }}>
        <Typography variant="body2">
          © {new Date().getFullYear()} Bacola. Tất cả các quyền được bảo lưu.
        </Typography>
        <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
          Cảm ơn bạn đã tin tưởng và mua sắm tại Bacola!
        </Typography>
      </Box>
    </ModernContainer>
  );
};

export default ThankYou;
