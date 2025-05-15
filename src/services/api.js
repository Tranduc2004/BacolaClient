import axios from "axios";

// Tạo instance axios cho tất cả API
const api = axios.create({
  baseURL: "https://bacola.onrender.com/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Nếu là response từ API auth, giữ nguyên response
    if (response.config.url.includes("/auth")) {
      return response;
    }
    return response.data;
  },
  (error) => {
    // Xử lý lỗi xác thực
    if (error.response?.status === 401 || error.response?.status === 403) {
      const currentPath = window.location.pathname;
      const isAuthPage =
        currentPath.includes("/signin") ||
        currentPath.includes("/googlecallback") ||
        currentPath.includes("/register");

      // Chỉ xử lý logout khi không phải ở trang auth
      if (!isAuthPage) {
        // Kiểm tra xem có phải lỗi token hết hạn không
        if (error.response?.data?.message?.includes("token expired")) {
          // Xóa token và user data
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          // Chuyển hướng về trang đăng nhập
          window.location.href = "/signin";
        } else {
          // Nếu là lỗi 403, kiểm tra xem có phải do chưa đăng nhập không
          if (
            error.response?.status === 403 &&
            !localStorage.getItem("token")
          ) {
            window.location.href = "/signin";
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

// Kiểm tra xác thực
export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      return false;
    }

    // Kiểm tra xem token có hợp lệ không
    const tokenData = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;

    // Nếu token hết hạn, xóa token và user data
    if (tokenData.exp < currentTime) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Lỗi khi kiểm tra xác thực:", error);
    return false;
  }
};

// Lấy thông tin user từ localStorage
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin user:", error);
    return null;
  }
};

// API cho cart
export const getCart = async () => {
  try {
    if (!isAuthenticated()) {
      return { items: [] };
    }
    const response = await api.get("/cart");
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng:", error);
    // Trả về giỏ hàng rỗng cho tất cả các lỗi
    return { items: [] };
  }
};

export const fetchCartCount = async () => {
  try {
    if (!isAuthenticated()) {
      return 0;
    }
    const cart = await getCart();
    return cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  } catch (error) {
    console.error("Lỗi khi lấy số lượng giỏ hàng:", error);
    return 0;
  }
};

export const addToCart = async (productId, quantity) => {
  if (!isAuthenticated()) {
    throw new Error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
  }

  try {
    const response = await api.post("/cart/add", { productId, quantity });
    return response;
  } catch (error) {
    console.error("Lỗi khi thêm vào giỏ hàng:", error);
    if (error.response?.status === 500) {
      throw new Error(
        "Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau."
      );
    }
    throw error;
  }
};

export const updateCartItem = async (productId, quantity) => {
  if (!isAuthenticated()) {
    throw new Error("Vui lòng đăng nhập để cập nhật giỏ hàng");
  }
  try {
    const response = await api.put("/cart/update", { productId, quantity });
    return response;
  } catch (error) {
    console.error("Lỗi khi cập nhật giỏ hàng:", error);
    if (error.response?.status === 500) {
      throw new Error(
        "Có lỗi xảy ra khi cập nhật giỏ hàng. Vui lòng thử lại sau."
      );
    }
    throw error;
  }
};

export const removeFromCart = async (productId) => {
  if (!isAuthenticated()) {
    throw new Error("Vui lòng đăng nhập để xóa sản phẩm khỏi giỏ hàng");
  }
  try {
    const response = await api.delete(`/cart/remove/${productId}`);
    return response;
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
    if (error.response?.status === 500) {
      throw new Error(
        "Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng. Vui lòng thử lại sau."
      );
    }
    throw error;
  }
};

export const clearCart = async () => {
  if (!isAuthenticated()) {
    throw new Error("Vui lòng đăng nhập để xóa giỏ hàng");
  }
  try {
    const response = await api.delete("/cart/clear");
    return response;
  } catch (error) {
    console.error("Lỗi khi xóa giỏ hàng:", error);
    if (error.response?.status === 500) {
      throw new Error("Có lỗi xảy ra khi xóa giỏ hàng. Vui lòng thử lại sau.");
    }
    throw error;
  }
};

// API cho categories (sử dụng api gốc)
const getCategories = () => api.get("/categories");

const getCategoryById = async (id) => {
  try {
    const response = await api.get(`/category/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy danh mục với ID ${id}:`, error);
    throw error;
  }
};

// API cho products
const getProducts = () => api.get("/products");
const getProductById = (id) => api.get(`/products/${id}`);
const searchProducts = (params) => {
  return api.get("/products", { params });
};
const getSearchSuggestions = (query) => {
  return api.get("/products/suggestions", { params: { q: query } });
};

// API cho brands
const getBrands = () => api.get("/brands");
const getBrandById = async (id) => {
  try {
    const response = await api.get(`/brands/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy thương hiệu với ID ${id}:`, error);
    throw error;
  }
};

// API cho authentication
const register = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    if (response.token) {
      localStorage.setItem("token", response.token);
    }
    return response;
  } catch (error) {
    throw error;
  }
};

const login = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);

    if (!response || !response.data) {
      throw new Error("Không nhận được phản hồi từ server");
    }

    const { token, ...userData } = response.data;

    if (!token) {
      throw new Error("Không tìm thấy token trong phản hồi");
    }

    // Lưu token vào localStorage
    localStorage.setItem("token", token);

    // Lưu thông tin user vào localStorage
    localStorage.setItem("user", JSON.stringify(userData));

    // Cập nhật header Authorization
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Kiểm tra xem token và user data đã được lưu thành công chưa
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!savedToken || !savedUser) {
      throw new Error("Không thể lưu thông tin đăng nhập");
    }

    // Cập nhật context
    const event = new CustomEvent("authStateChanged", {
      detail: {
        isLoggedIn: true,
        user: userData,
      },
    });
    window.dispatchEvent(event);

    // Thêm delay nhỏ để đảm bảo context được cập nhật
    await new Promise((resolve) => setTimeout(resolve, 100));

    return response.data;
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    // Rollback nếu có lỗi
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    throw error;
  }
};

// API cho quên mật khẩu
// API cho quên mật khẩu - Cải tiến xử lý lỗi
const forgotPassword = async (data) => {
  try {
    const response = await api.post(
      "/auth/forgot-password",
      typeof data === "string" ? { email: data } : data
    );

    // Đảm bảo trả về đúng định dạng đã được chuẩn hóa
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi gửi yêu cầu quên mật khẩu:", error);

    // Xử lý phản hồi lỗi từ server (nếu có)
    if (error.response) {
      return {
        success: false,
        message:
          error.response.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.",
        statusCode: error.response.status,
      };
    }

    // Lỗi mạng hoặc lỗi khác
    return {
      success: false,
      message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
      error: error,
    };
  }
};

// API cho đặt lại mật khẩu
const resetPassword = async (token, password) => {
  try {
    if (!token) {
      throw new Error("Token không hợp lệ");
    }

    const response = await api.post(`/auth/reset-password/${token}`, {
      password,
    });

    // Kiểm tra nếu response có success: true
    if (response.data?.success) {
      return response.data;
    }

    // Nếu không có success, trả về response gốc
    return response.data;
  } catch (error) {
    console.error("Lỗi khi đặt lại mật khẩu:", error);

    // Nếu server trả về success: true trong error.response.data
    if (error.response?.data?.success) {
      return error.response.data;
    }

    // Nếu có message trong error.response.data
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    // Nếu không có message, ném lỗi mặc định
    throw new Error("Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.");
  }
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Lấy thông tin người dùng
export const getUserProfile = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// Cập nhật thông tin người dùng
export const updateUserProfile = async (data) => {
  const response = await api.put("/auth/me", data);
  return response.data;
};

// Đổi mật khẩu
export const changePassword = (data) => {
  return api.put("/auth/change-password", data);
};

export const getSliders = () => {
  return api.get("/sliders");
};

// Lấy danh sách đánh giá theo productId
export const getReviewsByProduct = async (productId) => {
  try {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy đánh giá:", error);
    throw error;
  }
};

// Thêm đánh giá mới
export const addReview = async ({ productId, rating, comment }) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Vui lòng đăng nhập để gửi đánh giá");
    }

    const response = await api.post("/reviews", {
      productId,
      rating,
      comment,
    });

    if (response.success === false) {
      throw new Error(response.message || "Không thể thêm đánh giá");
    }

    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm đánh giá:", error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

// Cập nhật đánh giá
export const updateReview = async (reviewId, { rating, comment }) => {
  try {
    const response = await api.put(`/reviews/${reviewId}`, { rating, comment });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật đánh giá:", error);
    throw error;
  }
};

// Xóa đánh giá
export const deleteReview = async (reviewId) => {
  try {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa đánh giá:", error);
    throw error;
  }
};

// API cho sản phẩm yêu thích
export const getWishlist = async () => {
  try {
    if (!isAuthenticated()) {
      return [];
    }
    const response = await api.get("/products/likes");
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách yêu thích:", error);
    if (error.response?.status === 401) {
      return [];
    }
    throw error;
  }
};

// Cache cho trạng thái yêu thích
const wishlistStatusCache = new Map();

export const checkWishlistStatus = async (productId) => {
  if (!isAuthenticated()) {
    return { isLiked: false };
  }

  // Kiểm tra cache
  const cacheKey = `${productId}_${localStorage.getItem("token")}`;
  if (wishlistStatusCache.has(cacheKey)) {
    return wishlistStatusCache.get(cacheKey);
  }

  try {
    const response = await api.get(`/products/${productId}/like`);
    // Lưu vào cache với thời gian hết hạn 5 phút
    wishlistStatusCache.set(cacheKey, response);
    setTimeout(() => wishlistStatusCache.delete(cacheKey), 5 * 60 * 1000);
    return response;
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái yêu thích:", error);
    return { isLiked: false };
  }
};

// Hàm xóa cache khi thay đổi trạng thái yêu thích
export const clearWishlistCache = (productId) => {
  const cacheKey = `${productId}_${localStorage.getItem("token")}`;
  wishlistStatusCache.delete(cacheKey);
};

// Cập nhật hàm addToWishlist và removeFromWishlist
export const addToWishlist = async (productId) => {
  if (!isAuthenticated()) {
    throw new Error(
      "Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích"
    );
  }
  try {
    const response = await api.post(`/products/${productId}/like`);
    clearWishlistCache(productId);
    return response;
  } catch (error) {
    console.error("Lỗi khi thêm vào danh sách yêu thích:", error);
    throw error;
  }
};

export const removeFromWishlist = async (productId) => {
  if (!isAuthenticated()) {
    throw new Error(
      "Vui lòng đăng nhập để xóa sản phẩm khỏi danh sách yêu thích"
    );
  }
  try {
    const response = await api.delete(`/products/${productId}/like`);
    clearWishlistCache(productId);
    return response;
  } catch (error) {
    console.error("Lỗi khi xóa khỏi danh sách yêu thích:", error);
    throw error;
  }
};

// Lấy danh sách sản phẩm yêu thích
export const getFavoriteProducts = async () => {
  try {
    const response = await api.get("/products/likes");
    return response.data.products;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm yêu thích:", error);
    throw error;
  }
};

// Lấy sản phẩm theo danh mục
export const getProductsByCategory = async (categoryId) => {
  try {
    const response = await api.get(`/products/category/${categoryId}`);

    if (response.data) {
      // Nếu response.data là mảng, trả về trực tiếp
      if (Array.isArray(response.data)) {
        return response.data;
      }

      // Nếu response.data có cấu trúc {success, data}
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
    }

    return [];
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo danh mục:", error);
    return [];
  }
};

// API cho sản phẩm gợi ý
export const getSuggestedProducts = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}/suggestions`);

    if (response && response.success && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("[getSuggestedProducts] Lỗi:", error);
    return [];
  }
};

// API cho chatbot
export const sendMessage = async (message) => {
  try {
    const response = await api.post("/chatbot/chat", { message });

    if (!response) {
      throw new Error("Không nhận được phản hồi từ server");
    }

    if (typeof response === "string") {
      return {
        success: true,
        isProduct: false,
        message: response,
      };
    }

    return {
      success: true,
      ...response,
      isProduct: response.isProduct || false,
      message: response.message || response.text || "",
    };
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn:", error);
    throw new Error(
      error.response?.message || error.message || "Lỗi kết nối đến server"
    );
  }
};

// API cho orders
export const createOrderFromCart = async (orderData) => {
  try {
    // Kiểm tra dữ liệu đơn hàng
    if (!orderData.shippingAddress || !orderData.paymentMethod) {
      throw new Error("Thiếu thông tin bắt buộc");
    }

    // Kiểm tra định dạng địa chỉ
    const { fullName, phone, address, city, district, ward } =
      orderData.shippingAddress;
    if (!fullName || !phone || !address || !city || !district || !ward) {
      throw new Error("Vui lòng nhập đầy đủ thông tin địa chỉ");
    }

    console.log("Dữ liệu đơn hàng:", orderData);
    const response = await api.post("/orders", orderData);
    return response;
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

// Lấy danh sách đơn hàng của người dùng
export const getUserOrders = async () => {
  try {
    const response = await api.get("/orders");
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    throw error;
  }
};

// Lấy chi tiết đơn hàng
export const getOrderDetail = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    throw error;
  }
};

// Hủy đơn hàng
export const cancelOrder = async (orderId) => {
  try {
    const response = await api.put(`/orders/${orderId}/cancel`);
    return response;
  } catch (error) {
    console.error("Lỗi khi hủy đơn hàng:", error);
    throw error;
  }
};

export const handleGoogleLogin = () => {
  window.location.href = `${api.defaults.baseURL}/auth/google`;
};

export const handleGoogleCallback = async (token) => {
  try {
    if (!token) {
      throw new Error("Không tìm thấy token");
    }

    // Hàm lấy thông tin user với retry
    const getUserInfo = async (retryCount = 0) => {
      try {
        const userResponse = await api.get("/auth/me");

        if (!userResponse.data) {
          throw new Error("Không thể lấy thông tin người dùng");
        }

        // Đảm bảo email được lưu từ tài khoản Google
        const userData = {
          ...userResponse.data,
          email:
            userResponse.data.email ||
            userResponse.data.googleEmail ||
            userResponse.data.emails?.[0]?.value,
          authProvider: "google",
        };

        return userData;
      } catch (error) {
        if (error.response?.status === 401 && retryCount < 3) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          return getUserInfo(retryCount + 1);
        }
        throw error;
      }
    };

    // Lấy thông tin user với retry mechanism
    const userData = await getUserInfo();

    // Lưu user data vào localStorage
    localStorage.setItem("user", JSON.stringify(userData));

    // Kiểm tra xem user data đã được lưu thành công chưa
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      throw new Error("Không thể lưu thông tin đăng nhập");
    }

    // Cập nhật context
    const event = new CustomEvent("authStateChanged", {
      detail: {
        isLoggedIn: true,
        user: userData,
      },
    });
    window.dispatchEvent(event);

    return {
      success: true,
      message: "Đăng nhập thành công",
      data: userData,
    };
  } catch (error) {
    console.error("Lỗi xử lý Google callback:", error);
    // Rollback nếu có lỗi
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    throw error;
  }
};

// API cho Facebook OAuth
export const handleFacebookLogin = () => {
  window.location.href = `${api.defaults.baseURL}/auth/facebook`;
};

export const handleFacebookCallback = async (token) => {
  try {
    if (!token) {
      throw new Error("Không tìm thấy token");
    }

    // Hàm lấy thông tin user với retry
    const getUserInfo = async (retryCount = 0) => {
      try {
        const userResponse = await api.get("/auth/me");

        if (!userResponse.data) {
          throw new Error("Không thể lấy thông tin người dùng");
        }

        // Đảm bảo email được lưu từ tài khoản Facebook
        const userData = {
          ...userResponse.data,
          email:
            userResponse.data.email ||
            userResponse.data.facebookEmail ||
            userResponse.data.emails?.[0]?.value,
          authProvider: "facebook",
        };

        return userData;
      } catch (error) {
        if (error.response?.status === 401 && retryCount < 3) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          return getUserInfo(retryCount + 1);
        }
        throw error;
      }
    };

    // Lấy thông tin user với retry mechanism
    const userData = await getUserInfo();

    // Lưu user data vào localStorage
    localStorage.setItem("user", JSON.stringify(userData));

    // Kiểm tra xem user data đã được lưu thành công chưa
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      throw new Error("Không thể lưu thông tin đăng nhập");
    }

    // Cập nhật context
    const event = new CustomEvent("authStateChanged", {
      detail: {
        isLoggedIn: true,
        user: userData,
      },
    });
    window.dispatchEvent(event);

    return {
      success: true,
      message: "Đăng nhập thành công",
      data: userData,
    };
  } catch (error) {
    console.error("Lỗi xử lý Facebook callback:", error);
    // Rollback nếu có lỗi
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    throw error;
  }
};

// API cho voucher (mã giảm giá)
export const getVouchers = async () => {
  try {
    const response = await api.get("/vouchers");
    // Admin và backend trả về { success, data }
    if (response && response.data) {
      // Lấy thêm thông tin về voucher đã lưu và đã sử dụng
      const savedVouchersResponse = await getSavedVouchers();
      const savedVouchers = savedVouchersResponse.data || [];

      // Map thông tin used vào danh sách voucher
      const vouchersWithStatus = response.data.map((voucher) => {
        const savedVoucher = savedVouchers.find((sv) => sv._id === voucher._id);
        return {
          ...voucher,
          used: savedVoucher?.used || false,
        };
      });

      return vouchersWithStatus;
    }
    return [];
  } catch (error) {
    console.error("Lỗi khi lấy danh sách voucher:", error);
    return [];
  }
};

// Lấy danh sách voucher đã lưu của user
export const getSavedVouchers = async () => {
  try {
    if (!isAuthenticated()) {
      return [];
    }
    const response = await api.get("/auth/vouchers/saved");
    return response.data || [];
  } catch (error) {
    console.error("Lỗi khi lấy danh sách voucher đã lưu:", error);
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/signin";
    }
    return [];
  }
};

// Lưu voucher vào kho của user
export const saveVoucher = async (voucherId) => {
  try {
    const response = await api.post(`/auth/vouchers/save/${voucherId}`);
    // Nếu response có success = true hoặc không có lỗi, coi như thành công
    if (response.data?.success || !response.data?.message?.includes("đã lưu")) {
      return response.data;
    }
    // Nếu voucher đã được lưu trước đó, vẫn coi là thành công
    if (response.data?.message?.includes("đã lưu")) {
      return {
        success: true,
        message: "Voucher đã được lưu trước đó",
      };
    }
    throw new Error(response.data?.message || "Không thể lưu mã giảm giá");
  } catch (error) {
    console.error("Lỗi khi lưu voucher:", error);
    // Nếu lỗi là do voucher đã được lưu, vẫn coi là thành công
    if (error.response?.data?.message?.includes("đã lưu")) {
      return {
        success: true,
        message: "Voucher đã được lưu trước đó",
      };
    }
    throw error;
  }
};

// Xóa voucher đã lưu
export const removeSavedVoucher = async (voucherId) => {
  try {
    const response = await api.delete(`/auth/vouchers/save/${voucherId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa voucher:", error);
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    }
    throw (
      error.response?.data?.message ||
      "Không thể xóa mã giảm giá. Vui lòng thử lại sau!"
    );
  }
};

// API tạo thanh toán VNPAY
export const createVnpayPayment = async (orderData) => {
  try {
    const response = await api.post("/orders/create_payment_url", orderData);
    return response;
  } catch (error) {
    console.error("Lỗi khi tạo thanh toán VNPAY:", error);
    throw error;
  }
};

export {
  api,
  getCategories,
  getCategoryById,
  getProducts,
  getProductById,
  getBrands,
  getBrandById,
  register,
  login,
  logout,
  resetPassword,
  searchProducts,
  getSearchSuggestions,
  forgotPassword,
};
