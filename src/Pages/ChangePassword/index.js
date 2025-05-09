import { useEffect, useContext, useState } from "react";
import { MyContext } from "../../App";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  ThemeProvider,
  createTheme,
  Snackbar,
  Alert,
} from "@mui/material";
import { changePassword } from "../../services/api";

// Tạo theme tùy chỉnh với #00aaff làm màu chính
const theme = createTheme({
  palette: {
    primary: {
      main: "#00aaff",
    },
  },
});

const ChangePassword = () => {
  const context = useContext(MyContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    context.setIsHeaderFooterShow(false);
  }, []);

  const validateForm = () => {
    const errors = {};

    // Kiểm tra mật khẩu hiện tại
    if (!formData.currentPassword) {
      errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    // Kiểm tra mật khẩu mới
    if (!formData.newPassword) {
      errors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
    }

    // Kiểm tra xác nhận mật khẩu mới
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Xóa lỗi validation khi người dùng bắt đầu nhập lại
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Kiểm tra validation trước khi gửi form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setShowSuccess(true);

      setTimeout(() => {
        context.setIsHeaderFooterShow(true);
        navigate("/profile");
      }, 1500);
    } catch (err) {
      if (err.response?.data?.message?.includes("current password")) {
        setError("Mật khẩu hiện tại không đúng");
      } else {
        setError(
          err.response?.data?.message ||
            "Đổi mật khẩu thất bại. Vui lòng thử lại."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        className="section changePasswordPage"
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #00aaff 0%, #0077cc 100%)",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Hình dạng nền */}
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
              Đổi mật khẩu
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
              {error && (
                <Typography color="error" align="center" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                name="currentPassword"
                label="Mật khẩu hiện tại"
                type="password"
                id="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                variant="outlined"
                sx={{ mb: 2 }}
                error={!!validationErrors.currentPassword}
                helperText={validationErrors.currentPassword}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="Mật khẩu mới"
                type="password"
                id="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                variant="outlined"
                sx={{ mb: 2 }}
                error={!!validationErrors.newPassword}
                helperText={validationErrors.newPassword}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                variant="outlined"
                sx={{ mb: 2 }}
                error={!!validationErrors.confirmPassword}
                helperText={validationErrors.confirmPassword}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    sx={{ py: 1.5, color: "white" }}
                  >
                    {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{ py: 1.5 }}
                    onClick={() => navigate("/profile")}
                  >
                    Hủy bỏ
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Container>

        {/* Hình dạng bổ sung cho sự thú vị về mặt hình ảnh */}
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

        <Snackbar
          open={showSuccess}
          autoHideDuration={1500}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="success" sx={{ width: "100%" }}>
            Đổi mật khẩu thành công!
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default ChangePassword;
