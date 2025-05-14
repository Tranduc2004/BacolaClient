import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Chip,
  Button,
  useTheme,
  useMediaQuery,
  Paper,
  Fade,
  Skeleton,
} from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import ExploreIcon from "@mui/icons-material/Explore";
import ProductCard from "../../Components/ProductItem";
import { getWishlist, addToCart } from "../../services/api";
import { toast } from "react-toastify";

const Wishlist = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingAll, setAddingAll] = useState(false);
  const [addingIds, setAddingIds] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const response = await getWishlist();

        if (response?.success && Array.isArray(response.products)) {
          // Add a small delay for better UX with skeleton loaders
          setTimeout(() => {
            setProducts(response.products);
            setLoading(false);
          }, 600);
        } else {
          setProducts([]);
          toast.warning("Không có sản phẩm yêu thích nào", {
            position: "bottom-center",
            autoClose: 3000,
          });
          setLoading(false);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách yêu thích:", error);
        toast.error("Không thể tải danh sách yêu thích", {
          position: "bottom-center",
        });
        setProducts([]);
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
        toast.success(`Đã thêm ${successCount} sản phẩm vào giỏ hàng!`, {
          position: "bottom-center",
          icon: <ShoppingCartOutlinedIcon fontSize="small" />,
        });
      } else {
        toast.error("Không thể thêm sản phẩm vào giỏ hàng", {
          position: "bottom-center",
        });
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng", {
        position: "bottom-center",
      });
    } finally {
      setAddingAll(false);
    }
  };

  // Thêm một sản phẩm vào giỏ hàng
  const handleAddToCart = async (productId) => {
    setAddingIds((prev) => [...prev, productId]);
    try {
      await addToCart(productId, 1);
      toast.success("Đã thêm sản phẩm vào giỏ hàng", {
        position: "bottom-center",
        icon: <ShoppingCartOutlinedIcon fontSize="small" />,
      });
    } catch (error) {
      toast.error("Không thể thêm sản phẩm vào giỏ hàng", {
        position: "bottom-center",
      });
    } finally {
      setAddingIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  // Render skeleton loaders
  const renderSkeletons = () => {
    return Array(8)
      .fill(0)
      .map((_, index) => (
        <Grid item xs={6} sm={6} md={4} lg={3} key={`skeleton-${index}`}>
          <Paper
            elevation={1}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              height: "100%",
              p: 2,
              background: theme.palette.background.paper,
              transition: "transform 0.3s, box-shadow 0.3s",
            }}
          >
            <Skeleton
              variant="rectangular"
              height={200}
              sx={{ borderRadius: 2, mb: 1 }}
            />
            <Skeleton variant="text" height={32} sx={{ mt: 1 }} />
            <Skeleton variant="text" width="60%" height={24} />
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
            >
              <Skeleton variant="text" width={80} height={32} />
              <Skeleton variant="circular" width={40} height={40} />
            </Box>
          </Paper>
        </Grid>
      ));
  };

  const renderEmptyState = () => (
    <Fade in={!loading && products.length === 0}>
      <Box
        component={Paper}
        elevation={2}
        sx={{
          textAlign: "center",
          py: { xs: 6, sm: 8, md: 10 },
          px: { xs: 3, sm: 4, md: 5 },
          borderRadius: 4,
          mx: "auto",
          maxWidth: 600,
          background: `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
        }}
      >
        <Box
          sx={{
            backgroundColor: theme.palette.grey[100],
            width: 80,
            height: 80,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <SentimentDissatisfiedIcon
            sx={{
              fontSize: { xs: 40, sm: 42, md: 44 },
              color: theme.palette.text.secondary,
            }}
          />
        </Box>
        <Typography
          variant="h5"
          fontWeight={600}
          fontFamily="Dosis, sans-serif"
          sx={{
            mb: 1.5,
            fontSize: { xs: 22, sm: 24, md: 26 },
          }}
        >
          Chưa có sản phẩm yêu thích
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mb: 4,
            fontSize: { xs: 15, sm: 16 },
            maxWidth: 400,
            mx: "auto",
          }}
        >
          Hãy thêm sản phẩm yêu thích để dễ dàng theo dõi và mua sau này
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ExploreIcon />}
          sx={{
            borderRadius: 8,
            px: { xs: 3, sm: 4 },
            py: { xs: 1.2, sm: 1.5 },
            fontWeight: 600,
            fontSize: { xs: 15, sm: 16 },
            textTransform: "none",
            boxShadow: theme.shadows[4],
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            "&:hover": {
              boxShadow: theme.shadows[8],
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s ease",
          }}
          href="/"
        >
          Khám phá sản phẩm
        </Button>
      </Box>
    </Fade>
  );

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 3, sm: 4, md: 5 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* Header section */}
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          borderRadius: 3,
          mb: { xs: 3, sm: 4 },
          p: { xs: 2, sm: 3 },
          background: theme.palette.background.paper,
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "center", sm: "flex-start" },
            mb: { xs: 2, sm: 0 },
          }}
        >
          <FavoriteIcon
            color="error"
            sx={{
              fontSize: { xs: 24, sm: 28 },
              animation: products.length > 0 ? "pulse 1.5s infinite" : "none",
              "@keyframes pulse": {
                "0%": { transform: "scale(1)" },
                "50%": { transform: "scale(1.1)" },
                "100%": { transform: "scale(1)" },
              },
            }}
          />
          <Typography
            variant="h5"
            component="h1"
            fontWeight={700}
            fontFamily="Dosis, sans-serif"
            fontSize={{ xs: 22, sm: 24, md: 26 }}
            textAlign={{ xs: "center", sm: "left" }}
          >
            Danh sách yêu thích
          </Typography>
          {!loading && (
            <Chip
              label={products.length}
              color="error"
              size={isMobile ? "small" : "medium"}
              sx={{
                fontWeight: 600,
                fontSize: { xs: 13, sm: 14 },
                height: { xs: 24, sm: 28 },
              }}
            />
          )}
        </Box>

        {!loading && products.length > 0 && (
          <Button
            variant="contained"
            startIcon={<ShoppingCartOutlinedIcon />}
            sx={{
              borderRadius: 10,
              px: { xs: 2, sm: 2.5 },
              py: { xs: 1, sm: 1.2 },
              fontSize: { xs: 14, sm: 15 },
              fontWeight: 600,
              width: { xs: "100%", sm: "auto" },
              fontFamily: "Dosis, sans-serif",
              backgroundColor: theme.palette.primary.main,
              textTransform: "none",
              boxShadow: theme.shadows[2],
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
                boxShadow: theme.shadows[4],
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
            onClick={handleAddAllToCart}
            disabled={addingAll}
          >
            {addingAll ? "Đang thêm..." : "Thêm tất cả vào giỏ hàng"}
          </Button>
        )}
      </Paper>

      {/* Main content */}
      {loading ? (
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {renderSkeletons()}
        </Grid>
      ) : products.length === 0 ? (
        renderEmptyState()
      ) : (
        <Fade in={!loading}>
          <Grid
            container
            spacing={{ xs: 2, sm: 2.5, md: 3 }}
            sx={{ mt: { xs: 0.5, sm: 1 } }}
          >
            {products.map((product) => (
              <Grid item xs={6} sm={6} md={4} lg={3} xl={2.4} key={product._id}>
                <Paper
                  elevation={1}
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    height: "100%",
                    background: theme.palette.background.paper,
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: theme.shadows[6],
                    },
                  }}
                >
                  <Box sx={{ position: "relative", height: "100%" }}>
                    <ProductCard product={product} />

                    {/* Add to cart button overlay */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 2,
                        background: "rgba(255,255,255,0.9)",
                        backdropFilter: "blur(8px)",
                        borderTop: `1px solid ${theme.palette.divider}`,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<ShoppingCartOutlinedIcon />}
                        onClick={() => handleAddToCart(product._id)}
                        disabled={addingIds.includes(product._id)}
                        sx={{
                          borderRadius: 6,
                          textTransform: "none",
                          fontSize: 14,
                          fontWeight: 600,
                          boxShadow: theme.shadows[1],
                          width: "100%",
                          "&:hover": {
                            boxShadow: theme.shadows[3],
                          },
                        }}
                      >
                        {addingIds.includes(product._id)
                          ? "Đang thêm..."
                          : "Thêm vào giỏ"}
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Fade>
      )}
    </Container>
  );
};

export default Wishlist;
