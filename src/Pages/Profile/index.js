import { useEffect, useContext, useState, useCallback } from "react";
import { MyContext } from "../../App";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Grid,
  Snackbar,
  Alert,
  Divider,
  Avatar,
  IconButton,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { getUserProfile, updateUserProfile } from "../../services/api";

// Các icon component
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const SaveIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

const CancelIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const EmailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const PhoneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 48 48"
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    />
    <path
      fill="#1976D2"
      d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);

// Hàm lấy chữ cái đầu từ tên người dùng
const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

// Hàm tạo màu ngẫu nhiên nhưng ổn định cho avatar
const stringToColor = (string) => {
  if (!string) return "#00aaff";
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).substr(-2);
  }
  return color;
};

const Profile = () => {
  const context = useContext(MyContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isGoogleUser] = useState(false);
  const [avatarColor, setAvatarColor] = useState("#00aaff");

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await getUserProfile();
      if (response.success) {
        setFormData(response.data);
        context.setUser(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      navigate("/signin");
    }
  }, [context, navigate]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (formData.name) {
      setAvatarColor(stringToColor(formData.name));
    }
  }, [formData.name]);

  const validateForm = () => {
    const errors = {};

    if (!formData.name) {
      errors.name = "Tên không được để trống";
    }

    if (!formData.phone) {
      errors.phone = "Số điện thoại không được để trống";
    } else if (!/^\d{10,11}$/.test(formData.phone)) {
      errors.phone = "Số điện thoại không hợp lệ";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || "",
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
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
      // Xử lý riêng cho Google user
      if (isGoogleUser) {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUserData = {
          ...currentUser,
          name: formData.name || "",
          phone: formData.phone || "",
        };

        localStorage.setItem("user", JSON.stringify(updatedUserData));
        context.setUser(updatedUserData);
        setShowSuccess(true);
        setIsEditing(false);
        return;
      }

      // Xử lý cho user thông thường
      const token = localStorage.getItem("token");
      if (!token) {
        context.setIsLogin(false);
        navigate("/signin");
        return;
      }

      const updatedUser = await updateUserProfile(formData);
      const formattedUser = {
        ...updatedUser,
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
      };

      context.setUser(formattedUser);
      localStorage.setItem("user", JSON.stringify(formattedUser));
      setShowSuccess(true);
      setIsEditing(false);
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      if (
        err.response?.status === 401 ||
        err.message === "Không tìm thấy token"
      ) {
        localStorage.removeItem("token");
        context.setIsLogin(false);
        navigate("/signin");
      } else {
        setError(
          err.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "grey.100",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{ backgroundColor: "white", borderRadius: 3, padding: 4 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="700"
            sx={{
              color: "#00aaff",
              mb: 1,
              textAlign: { xs: "center", md: "left" },
            }}
          >
            Hồ sơ cá nhân
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              textAlign: { xs: "center", md: "left" },
            }}
          >
            Quản lý thông tin cá nhân của bạn
          </Typography>
        </Box>

        {/* Thẻ thông tin cá nhân */}
        <Card
          elevation={3}
          sx={{
            borderRadius: 3,
            mb: 4,
            overflow: "visible",
            position: "relative",
            backgroundColor: "white",
          }}
        >
          {/* Phần header với avatar và action buttons */}
          <Box
            sx={{
              p: { xs: 2, md: 4 },
              pb: { xs: 2, md: 2 },
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "center", sm: "flex-start" },
              gap: 3,
              position: "relative",
            }}
          >
            {/* Avatar lớn */}
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: avatarColor,
                fontSize: 36,
                fontWeight: "bold",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              {getInitials(formData.name)}
            </Avatar>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                alignItems: { xs: "center", sm: "flex-start" },
              }}
            >
              <Typography
                variant="h5"
                component="h2"
                fontWeight="bold"
                sx={{ mb: 0.5 }}
              >
                {formData.name || "Chưa cập nhật tên"}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1,
                  flexWrap: "wrap",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mr: 2,
                    color: "text.secondary",
                  }}
                >
                  <EmailIcon />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {formData.email || "Chưa cập nhật email"}
                  </Typography>
                </Box>

                {formData.phone && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "text.secondary",
                    }}
                  >
                    <PhoneIcon />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {formData.phone}
                    </Typography>
                  </Box>
                )}
              </Box>

              {isGoogleUser && (
                <Chip
                  icon={<GoogleIcon />}
                  label="Tài khoản Google"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              )}
            </Box>

            {/* Nút chỉnh sửa */}
            {!isEditing ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  alignSelf: { xs: "center", sm: "flex-start" },
                  boxShadow: 2,
                }}
              >
                Chỉnh sửa
              </Button>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  position: { xs: "static", sm: "absolute" },
                  right: { sm: 24 },
                  alignSelf: "center",
                }}
              >
                <Tooltip title="Hủy">
                  <IconButton
                    color="error"
                    onClick={() => {
                      setIsEditing(false);
                      setValidationErrors({});
                      fetchUserProfile();
                    }}
                    disabled={loading}
                    sx={{ boxShadow: 1 }}
                  >
                    <CancelIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Lưu thay đổi">
                  <IconButton
                    color="primary"
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{ boxShadow: 1 }}
                  >
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>

          <Divider sx={{ mx: 3 }} />

          {/* Phần form */}
          <CardContent sx={{ p: { xs: 2, md: 4 }, pt: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {isGoogleUser && (
              <Alert
                severity="info"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  "& .MuiAlert-icon": { alignSelf: "center" },
                }}
              >
                Bạn đang sử dụng tài khoản Google. Một số thông tin có thể bị
                giới hạn chỉnh sửa.
              </Alert>
            )}

            <Box component="form" noValidate>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    id="name"
                    label="Họ và tên"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    variant="outlined"
                    error={!!validationErrors.name}
                    helperText={validationErrors.name}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <UserIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="email"
                    label="Email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    variant="outlined"
                    disabled={true} // Email luôn bị vô hiệu hóa chỉnh sửa
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    id="phone"
                    label="Số điện thoại"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    variant="outlined"
                    error={!!validationErrors.phone}
                    helperText={validationErrors.phone}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                {isEditing && !isGoogleUser && (
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => navigate("/change-password")}
                      disabled={loading}
                      startIcon={<LockIcon />}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                      }}
                    >
                      Đổi mật khẩu
                    </Button>
                  </Grid>
                )}

                {isEditing && isMobile && (
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          setIsEditing(false);
                          setValidationErrors({});
                          fetchUserProfile();
                        }}
                        disabled={loading}
                        startIcon={<CancelIcon />}
                        sx={{ borderRadius: 2 }}
                      >
                        Hủy
                      </Button>

                      <Button
                        fullWidth
                        type="button"
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={loading}
                        startIcon={<SaveIcon />}
                        sx={{ borderRadius: 2 }}
                      >
                        {loading ? "Đang xử lý..." : "Lưu thay đổi"}
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Container>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setShowSuccess(false)}
      >
        <Alert
          severity="success"
          sx={{
            width: "100%",
            boxShadow: 3,
            borderRadius: 2,
          }}
        >
          Cập nhật thông tin thành công!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
