import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { handleGoogleCallback } from "../../services/api";
import { toast } from "react-toastify";
import { CircularProgress, Box, Typography } from "@mui/material";
import { useAuth } from "../../hooks/useAuth";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setIsLoggedIn, setUser } = useAuth();

  // Hàm lấy token từ URL với retry
  const getTokenFromUrl = async (retryCount = 0) => {
    const searchParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.substring(1));
    let token = searchParams.get("token") || hashParams.get("token");

    // Nếu không tìm thấy token và chưa retry quá 3 lần
    if (!token && retryCount < 3) {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Đợi 500ms
      return getTokenFromUrl(retryCount + 1);
    }

    return token;
  };

  useEffect(() => {
    const processToken = async () => {
      try {
        // Thử lấy token với retry mechanism
        const token = await getTokenFromUrl();
        console.log("Token nhận được từ Google:", token);

        if (!token) {
          throw new Error("Không tìm thấy token trong URL");
        }

        // Lưu token vào localStorage trước khi gọi API
        localStorage.setItem("token", token);
        console.log("Đã lưu token vào localStorage");

        // Gọi API xử lý token
        const result = await handleGoogleCallback(token);
        console.log("Kết quả xử lý token:", result);

        if (!result.success) {
          throw new Error(result.message || "Đăng nhập Google thất bại");
        }

        // Lưu user data vào localStorage
        localStorage.setItem("user", JSON.stringify(result.data));

        // Cập nhật header Authorization
        const api = (await import("../../services/api")).api;
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Cập nhật context thông qua event trước
        const event = new CustomEvent("authStateChanged", {
          detail: {
            isLoggedIn: true,
            user: result.data,
          },
        });
        window.dispatchEvent(event);

        // Đợi event được xử lý
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Sau đó mới cập nhật state trong context
        setIsLoggedIn(true);
        setUser(result.data);

        // Đợi state được cập nhật
        await new Promise((resolve) => setTimeout(resolve, 100));

        toast.success("Đăng nhập thành công!");

        // Chuyển hướng về trang chủ với replace
        navigate("/", { replace: true });

        // Đợi một chút để đảm bảo navigation hoàn tất
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Reload trang để đảm bảo state được cập nhật
        window.location.reload();
      } catch (err) {
        console.error("Lỗi xử lý Google callback:", err);
        // Rollback nếu có lỗi
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError(err.message);
        toast.error(err.message);
        navigate("/signin", {
          replace: true,
          state: {
            error: err.message,
            from: location.state?.from || "/",
          },
        });
      } finally {
        setLoading(false);
      }
    };

    // Xử lý ngay khi component mount
    processToken();
  }, [location, navigate, setIsLoggedIn, setUser]);

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" mt={2}>
          Đang xử lý đăng nhập Google...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  return null;
};

export default GoogleCallback;
