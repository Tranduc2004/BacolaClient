import React, { useState, useEffect } from "react";
import { Container, Grid, Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { getProductById } from "../../services/api";

const CompareContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: "#f5f5f5",
  minHeight: "100vh",
}));

const ProductCard = styled(Box)(({ theme }) => ({
  backgroundColor: "white",
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  height: "100%",
}));

const Compare = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const compareItems = JSON.parse(
      localStorage.getItem("compareItems") || "[]"
    );
    const fetchProducts = async () => {
      const productPromises = compareItems.map((id) => getProductById(id));
      const productData = await Promise.all(productPromises);
      setProducts(productData);
    };
    fetchProducts();
  }, []);

  const handleRemove = (productId) => {
    const updatedProducts = products.filter((p) => p._id !== productId);
    setProducts(updatedProducts);
    localStorage.setItem(
      "compareItems",
      JSON.stringify(updatedProducts.map((p) => p._id))
    );
  };

  if (products.length === 0) {
    return (
      <CompareContainer>
        <Box textAlign="center" py={4}>
          <Typography variant="h5" gutterBottom>
            Không có sản phẩm nào để so sánh
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/")}
          >
            Quay lại trang chủ
          </Button>
        </Box>
      </CompareContainer>
    );
  }

  return (
    <CompareContainer>
      <Typography variant="h4" gutterBottom>
        So sánh sản phẩm
      </Typography>
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product._id}>
            <ProductCard>
              <Box textAlign="center">
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    maxWidth: "100%",
                    height: "200px",
                    objectFit: "contain",
                  }}
                />
                <Typography variant="h6" gutterBottom>
                  {product.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Giá: ${product.price}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {product.description}
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleRemove(product._id)}
                >
                  Xóa
                </Button>
              </Box>
            </ProductCard>
          </Grid>
        ))}
      </Grid>
    </CompareContainer>
  );
};

export default Compare;
