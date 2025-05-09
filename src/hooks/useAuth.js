import { createContext, useContext, useState, useEffect } from "react";
import { isAuthenticated, getCurrentUser } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hàm cập nhật trạng thái đăng nhập
  const updateAuthState = () => {
    try {
      const loggedIn = isAuthenticated();
      const currentUser = getCurrentUser();
      setIsLoggedIn(loggedIn);
      setUser(currentUser);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đăng nhập:", error);
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập khi component mount
    updateAuthState();

    // Lắng nghe sự kiện storage để cập nhật khi có thay đổi
    const handleStorageChange = (event) => {
      if (event.key === "token" || event.key === "user") {
        updateAuthState();
      }
    };

    // Lắng nghe sự kiện authStateChanged
    const handleAuthStateChanged = (event) => {
      if (event.detail) {
        setIsLoggedIn(event.detail.isLoggedIn);
        setUser(event.detail.user);
        setIsLoading(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authStateChanged", handleAuthStateChanged);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authStateChanged", handleAuthStateChanged);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        setIsLoggedIn,
        setUser,
        isLoading,
        updateAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
