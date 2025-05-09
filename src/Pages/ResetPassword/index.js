import React, { useState, useContext, useEffect } from "react";
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
import { useNavigate, useParams } from "react-router-dom";
import { MyContext } from "../../App";
import { resetPassword } from "../../services/api";

// Create a custom theme with #00aaff as the primary color
const theme = createTheme({
  palette: {
    primary: {
      main: "#00aaff",
    },
  },
});

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();
  const { setUser } = useContext(MyContext);

  useEffect(() => {
    if (!token) {
      setError("Token không hợp lệ. Vui lòng thử lại.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!token) {
      setError("Token không hợp lệ. Vui lòng thử lại.");
      setLoading(false);
      return;
    }

    if (!password || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      setLoading(false);
      return;
    }

    try {
      console.log("Đang gửi yêu cầu đặt lại mật khẩu với token:", token);
      const response = await resetPassword(token, password);
      console.log("Phản hồi từ server:", response);

      if (response.success) {
        setSuccess("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
        setPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
      } else {
        setError(response.message || "Có lỗi xảy ra khi đặt lại mật khẩu");
      }
    } catch (err) {
      console.error("Lỗi khi đặt lại mật khẩu:", err);
      setError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại."
      );
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
              Đặt lại mật khẩu
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
                id="password"
                label="Mật khẩu mới"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                variant="outlined"
                sx={{ mb: 2 }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="confirmPassword"
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                variant="outlined"
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
                  "Đặt lại mật khẩu"
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

export default ResetPassword;
