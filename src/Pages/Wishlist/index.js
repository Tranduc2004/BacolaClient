import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Button,
} from "@mui/material";
import { GrCart } from "react-icons/gr";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ProductCard from "../../Components/ProductItem";
import { getWishlist, addToCart } from "../../services/api";
import { toast } from "react-toastify";

const Wishlist = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingAll, setAddingAll] = useState(false);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const response = await getWishlist();

        if (response?.success && Array.isArray(response.products)) {
          setProducts(response.products);
        } else {
          setProducts([]);
          toast.warning("Không có sản phẩm yêu thích nào");
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách yêu thích:", error);
        toast.error("Không thể tải danh sách yêu thích");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  // Thêm tất cả vào giỏ hàng
  const handleAddAllToCart = async () => {
    if (!products.length) return;
    setAddingAll(true);
    try {
      let successCount = 0;
      for (const product of products) {
        try {
          await addToCart(product._id, 1);
          successCount++;
        } catch (err) {
          // Có thể log lỗi từng sản phẩm nếu muốn
        }
      }
      if (successCount > 0) {
        toast.success(`Đã thêm ${successCount} sản phẩm vào giỏ hàng!`);
      } else {
        toast.error("Không thể thêm sản phẩm vào giỏ hàng");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng");
    } finally {
      setAddingAll(false);
    }
  };

  if (loading) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          mb: 3,
          gap: 2,
        }}
      >
        {/* Tiêu đề và số lượng */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="h5"
            component="h1"
            fontWeight={700}
            fontFamily="Dosis"
            fontSize={24}
          >
            Sản phẩm yêu thích
          </Typography>
          <Chip
            label={products.length}
            color="error"
            sx={{ fontWeight: 600, fontSize: 14 }}
          />
        </Box>

        {/* Nút thêm vào giỏ hàng */}
        {products.length > 0 && (
          <Button
            variant="contained"
            startIcon={<GrCart />}
            sx={{
              borderRadius: 2,
              px: 2,
              py: 1,
              fontSize: 16,
              minWidth: 0,
              fontFamily: "Dosis, sans-serif",
              ml: "auto",
              backgroundColor: "#00aaff",
            }}
            onClick={handleAddAllToCart}
            disabled={addingAll}
          >
            {addingAll ? "Đang thêm..." : "Thêm tất cả"}
          </Button>
        )}
      </Box>

      {products.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <SentimentDissatisfiedIcon sx={{ fontSize: 64, color: "#bdbdbd" }} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            Bạn chưa có sản phẩm yêu thích nào
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ShoppingCartIcon />}
            sx={{ mt: 3, borderRadius: 2, px: 4, py: 1.5, fontWeight: 600 }}
            href="/"
          >
            Khám phá sản phẩm
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Box
                sx={{
                  boxShadow: 3,
                  borderRadius: 3,
                  overflow: "hidden",
                  ":hover": {
                    boxShadow: 6,
                  },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <ProductCard product={product} />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Wishlist;
