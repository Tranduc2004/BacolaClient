import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { handleFacebookCallback } from "../../services/api";
import { toast } from "react-toastify";
import { CircularProgress, Box, Typography } from "@mui/material";
import { useAuth } from "../../hooks/useAuth";

const FacebookCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setIsLoggedIn, setUser } = useAuth();

  const getTokenFromUrl = async (retryCount = 0) => {
    const searchParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.substring(1));
    let token = searchParams.get("token") || hashParams.get("token");

    if (!token && retryCount < 3) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return getTokenFromUrl(retryCount + 1);
    }
    return token;
  };

  useEffect(() => {
    const processToken = async () => {
      try {
        const token = await getTokenFromUrl();
        if (!token) throw new Error("Không tìm thấy token trong URL");
        localStorage.setItem("token", token);

        const result = await handleFacebookCallback(token);
        if (!result.success)
          throw new Error(result.message || "Đăng nhập Facebook thất bại");

        localStorage.setItem("user", JSON.stringify(result.data));
        const api = (await import("../../services/api")).api;
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const event = new CustomEvent("authStateChanged", {
          detail: { isLoggedIn: true, user: result.data },
        });
        window.dispatchEvent(event);

        await new Promise((resolve) => setTimeout(resolve, 100));
        setIsLoggedIn(true);
        setUser(result.data);

        await new Promise((resolve) => setTimeout(resolve, 100));
        toast.success("Đăng nhập thành công!");
        navigate("/", { replace: true });
        await new Promise((resolve) => setTimeout(resolve, 100));
        window.location.reload();
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError(err.message);
        toast.error(err.message);
        navigate("/signin", {
          replace: true,
          state: { error: err.message, from: location.state?.from || "/" },
        });
      } finally {
        setLoading(false);
      }
    };
    processToken();
  }, [location, navigate, setIsLoggedIn, setUser, getTokenFromUrl]);

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
          Đang xử lý đăng nhập Facebook...
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

export default FacebookCallback;
