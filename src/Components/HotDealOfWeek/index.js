import React, { useEffect, useState } from "react";
import { getProducts } from "../../services/api";
import { Box, Typography, Button, LinearProgress } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Link } from "react-router-dom";

function getTimeLeft(targetDate) {
  const now = new Date();
  const diff = targetDate - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

const HotDealOfWeek = () => {
  const [hotProduct, setHotProduct] = useState(null);

  const [timeLeft, setTimeLeft] = useState(
    getTimeLeft(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
  );

  useEffect(() => {
    const fetch = async () => {
      const products = await getProducts();
      if (!Array.isArray(products) || products.length === 0) return;
      // Tìm sản phẩm có discount cao nhất
      const sorted = [...products].sort(
        (a, b) => (b.discount || 0) - (a.discount || 0)
      );
      setHotProduct(sorted[0]);
    };
    fetch();
  }, []);

  // Đếm ngược đến hết tuần (ví dụ: 3 ngày nữa)
  useEffect(() => {
    const target = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(target));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!hotProduct) return null;

  const percent = hotProduct.discount || 0;
  const price = hotProduct.price;
  const salePrice =
    hotProduct.discountedPrice || Math.round(price * (1 - percent / 100));
  const progress = Math.min(100, percent * 1.2 + 40); // demo progress

  // Format giá tiền VND
  const formatVND = (value) =>
    value?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <Box
      sx={{
        border: "2px solid #ff1744",
        borderRadius: 3,
        p: { xs: 1.5, sm: 3 },
        mb: 4,
        background: "#fff",
        maxWidth: 900,
        mx: "auto",
        boxShadow: 2,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, color: "#222", mb: 0.5 }}>
        SẢN PHẨM HOT <span style={{ color: "#ff1744" }}>TRONG TUẦN</span>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Đừng bỏ lỡ cơ hội nhận ưu đãi đặc biệt chỉ trong tuần này.
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1.5, sm: 3 },
            flexDirection: { xs: "column", sm: "row" },
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: { xs: 0, sm: 120 },
              width: { xs: "100%", sm: "auto" },
              mb: { xs: 2, sm: 0 },
            }}
          >
            <Link
              to={hotProduct._id ? `/product/${hotProduct._id}` : "#"}
              style={{
                textDecoration: "none",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              <Box
                sx={{
                  background: "#ff1744",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: { xs: 16, sm: 22 },
                  borderRadius: "50%",
                  width: { xs: 40, sm: 56 },
                  height: { xs: 40, sm: 56 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1,
                  position: "relative",
                }}
              >
                {percent}%
              </Box>
              <img
                src={
                  hotProduct.image ||
                  (hotProduct.images && hotProduct.images[0])
                }
                alt={hotProduct.name}
                style={{
                  width: window.innerWidth < 600 ? 100 : 150,
                  height: window.innerWidth < 600 ? 100 : 150,
                  objectFit: "contain",
                  borderRadius: 8,
                }}
              />
            </Link>
          </Box>
          {/* Info */}
          <Box sx={{ flex: 1, width: "100%" }}>
            <Link
              to={hotProduct._id ? `/product/${hotProduct._id}` : "#"}
              style={{
                textDecoration: "none",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 1, sm: 2 },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: "#bdbdbd",
                    textDecoration: "line-through",
                    fontWeight: 500,
                    fontSize: { xs: 16, sm: 20 },
                    fontFamily: "Dosis",
                  }}
                >
                  {formatVND(price)}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: "#ff1744",
                    fontWeight: 700,
                    ml: 1,
                    fontFamily: "Dosis",
                    fontSize: { xs: 20, sm: 28 },
                  }}
                >
                  {formatVND(salePrice)}
                </Typography>
              </Box>

              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mt: 1, fontSize: { xs: 16, sm: 22 } }}
              >
                {hotProduct.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#4caf50",
                  fontWeight: 600,
                  mt: 0.5,
                  fontSize: { xs: 13, sm: 16 },
                }}
              >
                {hotProduct.countInStock > 0 ? "CÒN HÀNG" : "HẾT HÀNG"}
              </Typography>
            </Link>
            <Box sx={{ mt: 2, mb: 1 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 5,
                  background: "#eee",
                  ".MuiLinearProgress-bar": {
                    background: "linear-gradient(90deg,#ff9800,#ffe600)",
                  },
                }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mt: 1,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Box
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: 14, sm: 18 },
                    px: 1.5,
                    py: 0.5,
                    background: "#f5f5f5",
                    borderRadius: 2,
                  }}
                >
                  {String(timeLeft.days).padStart(2, "0")}
                </Box>
                <span>:</span>
                <Box
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: 14, sm: 18 },
                    px: 1.5,
                    py: 0.5,
                    background: "#f5f5f5",
                    borderRadius: 2,
                  }}
                >
                  {String(timeLeft.hours).padStart(2, "0")}
                </Box>
                <span>:</span>
                <Box
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: 14, sm: 18 },
                    px: 1.5,
                    py: 0.5,
                    background: "#f5f5f5",
                    borderRadius: 2,
                  }}
                >
                  {String(timeLeft.minutes).padStart(2, "0")}
                </Box>
                <span>:</span>
                <Box
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: 14, sm: 18 },
                    px: 1.5,
                    py: 0.5,
                    background: "#f5f5f5",
                    borderRadius: 2,
                  }}
                >
                  {String(timeLeft.seconds).padStart(2, "0")}
                </Box>
              </Box>
              <Typography
                variant="body2"
                sx={{ color: "#888", ml: 2, fontSize: { xs: 12, sm: 14 } }}
              >
                Còn lại đến hết
                <br />
                chương trình khuyến mãi
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HotDealOfWeek;
