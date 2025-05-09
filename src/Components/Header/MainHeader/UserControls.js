import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import { IoBagOutline } from "react-icons/io5";
import { CiUser } from "react-icons/ci";
import { CircleButton, CircleCartButton } from "../common/CircleButtons";
import CartBadge from "../common/CartBadge";
import { FaUserLarge } from "react-icons/fa6";
import { FaHeart } from "react-icons/fa";
import { BsCartCheck } from "react-icons/bs";
import {
  useMediaQuery,
  Menu,
  MenuItem,
  Typography,
  Divider,
  CircularProgress,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { logout, isAuthenticated, getCurrentUser } from "../../../services/api";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { IoIosLogOut } from "react-icons/io";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";

const UserControls = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { isLoggedIn, user, setIsLoggedIn, setUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = isAuthenticated();
      const currentUser = getCurrentUser();
      setIsLoggedIn(loggedIn);
      setUser(currentUser);
    };

    checkAuth();

    // Lắng nghe sự kiện storage để cập nhật khi có thay đổi
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [setIsLoggedIn, setUser]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUser(null);
    handleClose();
    toast.success("Đăng xuất thành công!");
    navigate("/");
  };

  // Hiển thị loading khi đang kiểm tra trạng thái đăng nhập
  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <CircularProgress size={24} />
      </div>
    );
  }

  return (
    <>
      {!isMobile ? (
        <div
          className="Control-user"
          style={{ display: "flex", alignItems: "center", gap: "16px" }}
        >
          {!isLoggedIn ? (
            <Button
              component={Link}
              to="/signin"
              className="btn-blue btn-lg btn-big btn-round mr-3"
              sx={{
                backgroundColor: "#00aaff",
                color: "white",
                "&:hover": {
                  backgroundColor: "#0088cc",
                },
              }}
            >
              Đăng nhập
            </Button>
          ) : (
            <>
              <CircleButton
                onClick={handleClick}
                className="blue-circle-button"
              >
                <CiUser style={{ width: "24px", height: "24px" }} />
              </CircleButton>
              <Menu
                className="blue-user-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 170, 255, 0.15)",
                    border: "1px solid rgba(0, 170, 255, 0.2)",
                  },
                }}
              >
                <MenuItem
                  sx={{ pointerEvents: "none" }}
                  className="blue-menu-greeting"
                >
                  <Typography variant="body1">
                    Xin chào, {user?.name || "Khách"}
                  </Typography>
                </MenuItem>
                <Divider className="blue-menu-divider" />
                <MenuItem
                  component={Link}
                  to="/profile"
                  onClick={handleClose}
                  className="blue-menu-item"
                >
                  <FaUserLarge />
                  Tài khoản của tôi
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/myvoucher"
                  onClick={handleClose}
                  className="blue-menu-item"
                >
                  <FaUserLarge />
                  Mã giảm giá của tôi
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/wishlist"
                  onClick={handleClose}
                  className="blue-menu-item"
                >
                  <FaHeart />
                  Danh sách yêu thích
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/orders"
                  onClick={handleClose}
                  className="blue-menu-item"
                >
                  <BsCartCheck />
                  Lịch sử đơn hàng
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/cart"
                  onClick={handleClose}
                  className="blue-menu-item"
                >
                  <ShoppingCartIcon fontSize="small" />
                  Giỏ hàng của tôi
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  className="blue-menu-item blue-logout-item"
                >
                  <IoIosLogOut fontSize="small" />
                  Đăng xuất
                </MenuItem>
              </Menu>
            </>
          )}

          {isLoggedIn && (
            <Link to="/cart" style={{ textDecoration: "none" }}>
              <CircleCartButton className="blue-circle-button">
                <IoBagOutline
                  style={{ width: "24px", height: "24px", color: "#ea2b0f" }}
                />
                <CartBadge />
              </CircleCartButton>
            </Link>
          )}
        </div>
      ) : (
        <Button
          component={Link}
          to="/signin"
          size="small"
          variant="contained"
          sx={{
            backgroundColor: "#00aaff",
            "&:hover": {
              backgroundColor: "#0088cc",
            },
          }}
        >
          {isLoggedIn ? <CiUser /> : "Đăng nhập"}
        </Button>
      )}
    </>
  );
};

export default UserControls;
