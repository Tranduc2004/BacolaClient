import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Container,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../services/api";

// Create a custom theme with #00aaff as the primary color
const theme = createTheme({
  palette: {
    primary: {
      main: "#00aaff",
    },
  },
});

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Kiểm tra email hợp lệ
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Kiểm tra email trước khi gửi
    if (!email.trim()) {
      setError("Vui lòng nhập địa chỉ email");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Vui lòng nhập địa chỉ email hợp lệ");
      return;
    }

    setLoading(true);

    try {
      const result = await forgotPassword(email);
      console.log("Phản hồi từ API:", result);

      if (result.success) {
        setSuccess(
          "Email đặt lại mật khẩu đã được gửi thành công! Vui lòng kiểm tra hộp thư của bạn."
        );
        setTimeout(() => {
          navigate("/signin");
        }, 3000);
      } else {
        setError(result.message || "Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Lỗi quên mật khẩu:", err);
      setError("Có lỗi xảy ra khi kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #00aaff 0%, #0077cc 100%)",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background shape */}
        <Box
          sx={{
            position: "absolute",
            bottom: -100,
            left: -100,
            width: "50%",
            height: "80%",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            zIndex: 0,
          }}
        />

        <Container
          maxWidth="sm"
          sx={{ py: 8, position: "relative", zIndex: 1 }}
        >
          <Paper elevation={6} sx={{ p: 4, borderRadius: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
              <Box display="flex" alignItems="center">
                {/* Logo Icon */}
                <Box
                  sx={{
                    height: 48,
                    width: 48,
                    backgroundColor: "yellow",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <Typography variant="h5" color="blue">
                    😀
                  </Typography>
                </Box>

                {/* Logo Text */}
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    Bacola
                  </Typography>
                  <Typography
                    variant="body2"
                    color="gray"
                    sx={{ display: { xs: "none", sm: "block" } }}
                  >
                    Online Grocery Shopping Center
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Typography
              variant="h5"
              component="h2"
              align="center"
              fontWeight="medium"
              mb={4}
            >
              Quên mật khẩu
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ mb: 3 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                variant="outlined"
                error={!!error && error.includes("email")}
                helperText={error && error.includes("email") ? error : ""}
                sx={{ mb: 2 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ py: 1.5, color: "white" }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Gửi yêu cầu"
                )}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 2, py: 1.5 }}
                onClick={() => navigate("/signin")}
              >
                Quay lại đăng nhập
              </Button>
            </Box>
          </Paper>
        </Container>

        {/* Additional shape for visual interest */}
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: "30%",
            height: "40%",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            zIndex: 0,
          }}
        />
      </Box>
    </ThemeProvider>
  );
};

export default ForgotPassword;
