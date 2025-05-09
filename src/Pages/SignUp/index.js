import React, { useEffect, useContext, useState } from "react";
import { MyContext } from "../../App";
import { Link, useNavigate } from "react-router-dom";
import {
  register,
  handleGoogleLogin,
  handleFacebookLogin,
} from "../../services/api";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Divider,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { toast } from "react-hot-toast";

// Tạo một theme tùy chỉnh với #00aaff làm màu chính
const theme = createTheme({
  palette: {
    primary: {
      main: "#00aaff",
    },
  },
});

// Biểu tượng Google dưới dạng một component
const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    style={{ width: "20px", height: "20px", marginRight: "8px" }}
  >
    <path
      fill="#fbc02d"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20 s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
    <path
      fill="#e53935"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    ></path>
    <path
      fill="#4caf50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    ></path>
    <path
      fill="#1565c0"
      d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
  </svg>
);
const FacebookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 36 36"
    style={{ width: "20px", height: "20px", marginRight: "8px" }}
  >
    <circle cx="18" cy="18" r="18" fill="#fff" />
    <path
      fill="#1877F2"
      d="M13.651 35.471v-11.97H9.936V18h3.715v-2.37c0-6.127 2.772-8.964 8.784-8.964 
         1.138 0 3.103.223 3.91.446v4.983c-.425-.043-1.167-.065-2.081-.065-2.952 0-4.09 1.116-4.09 4.025V18h5.883l-1.008 
         5.5h-4.867v12.37a18.183 18.183 0 0 1-6.53-.399Z"
    />
  </svg>
);

const SignUp = () => {
  const context = useContext(MyContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (context.user) {
      navigate("/");
    }
  }, [context, navigate]);

  const validateForm = () => {
    const errors = {};

    // Kiểm tra email
    if (!formData.email) {
      errors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email không hợp lệ";
    }

    // Kiểm tra mật khẩu
    if (!formData.password) {
      errors.password = "Mật khẩu không được để trống";
    } else if (formData.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    // Kiểm tra xác nhận mật khẩu
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    // Kiểm tra tên
    if (!formData.name) {
      errors.name = "Tên không được để trống";
    }

    // Kiểm tra số điện thoại
    if (!formData.phone) {
      errors.phone = "Số điện thoại không được để trống";
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

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      toast.success("Đăng ký thành công!");
      navigate("/signin");
    } catch (err) {
      if (err.response?.data?.message?.includes("email")) {
        setError("Email đã tồn tại. Vui lòng sử dụng email khác.");
      } else {
        setError(
          err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        className="section signUpPage"
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
              Đăng ký
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
              {error && (
                <Typography color="error" align="center" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="name"
                    label="Tên"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{ mb: 2 }}
                    error={!!validationErrors.name}
                    helperText={validationErrors.name}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="phone"
                    label="Số điện thoại"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{ mb: 2 }}
                    error={!!validationErrors.phone}
                    helperText={validationErrors.phone}
                  />
                </Grid>
              </Grid>

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                variant="outlined"
                sx={{ mb: 2 }}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Mật khẩu"
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                variant="outlined"
                sx={{ mb: 1 }}
                error={!!validationErrors.password}
                helperText={validationErrors.password}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                variant="outlined"
                sx={{ mb: 1 }}
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
                    {loading ? "Đang xử lý..." : "Đăng ký"}
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{ py: 1.5 }}
                    onClick={() => {
                      context.setIsHeaderFooterShow(true);
                      setTimeout(() => {
                        window.location.href = "/";
                      }, 80);
                    }}
                  >
                    Hủy bỏ
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mt: 2, mb: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Đã có tài khoản?
                <Button
                  component={Link}
                  to="/signin"
                  color="primary"
                  size="small"
                  sx={{ textTransform: "none" }}
                >
                  Đăng nhập
                </Button>
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Hoặc tiếp tục với tài khoản mạng xã hội
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              sx={{
                py: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => handleGoogleLogin(true)}
            >
              <GoogleIcon /> Đăng ký bằng Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              sx={{
                py: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 1,
                backgroundColor: "#1877F2",
                color: "white",
                "&:hover": {
                  backgroundColor: "#1565C0",
                },
                "& svg": {
                  fill: "white",
                },
              }}
              onClick={handleFacebookLogin}
            >
              <FacebookIcon /> Đăng nhập với Facebook
            </Button>
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
      </Box>
    </ThemeProvider>
  );
};

export default SignUp;
