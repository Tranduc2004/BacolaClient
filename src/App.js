import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createContext, useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./Pages/Home";
import Listing from "./Pages/Listing";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import ProductDetails from "./Pages/ProductDetails";
import Cart from "./Pages/Cart";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import Profile from "./Pages/Profile";
import ChangePassword from "./Pages/ChangePassword";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import { Toaster } from "react-hot-toast";
import Search from "./Pages/Search";
import { AuthProvider } from "./hooks/useAuth";
import Wishlist from "./Pages/Wishlist";
import ProductByCategory from "./Components/ProductByCategory";
import Checkout from "./Pages/Checkout";
import ThankYou from "./Pages/ThankYou";
import OrderHistory from "./Pages/OrderHistory";
import OrderDetail from "./Pages/OrderDetail";
import Posts from "./Pages/Posts";
import PostDetail from "./Pages/PostDetail";
import GoogleCallback from "./Pages/GoogleCallback";
import Compare from "./Pages/Compare";
import VoucherList from "./Pages/Voucher";
import MyVoucher from "./Pages/MyVoucher";
import FacebookCallback from "./Pages/FacebookCallback";
import Chat from "./Pages/Chat";
import About from "./Pages/About";

const MyContext = createContext();

function App() {
  const [countryList, setCountryList] = useState([]);
  const [isHeaderFooterShow, setIsHeaderFooterShow] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      // Lấy user từ localStorage
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (token && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLogin(true);
      } else {
        setUser(null);
        setIsLogin(false);
        // Xóa dữ liệu không hợp lệ khỏi localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Lỗi khi đọc dữ liệu từ localStorage:", error);
      // Nếu có lỗi, xóa dữ liệu không hợp lệ
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      setIsLogin(false);
    }

    // Gọi API lấy danh sách quốc gia
    getCountry("https://countriesnow.space/api/v0.1/countries");
  }, []);

  const getCountry = async (url) => {
    try {
      const res = await axios.get(url);
      // Lấy danh sách quốc gia từ API và lưu vào state
      setCountryList(res.data.data.map((item) => item.country));
    } catch (error) {
      console.error("Lỗi khi lấy danh sách quốc gia:", error);
    }
  };

  // Hàm kiểm tra có nên hiển thị header và footer không
  const shouldShowHeaderFooter = (pathname) => {
    const pathsWithoutHeaderFooter = [
      "/signin",
      "/signup",
      "/forgot-password",
      "/reset-password",
    ];
    return !pathsWithoutHeaderFooter.some((path) => pathname.startsWith(path));
  };

  const values = {
    countryList,
    isHeaderFooterShow,
    setIsHeaderFooterShow,
    isLogin,
    setIsLogin,
    user,
    setUser,
  };

  return (
    <AuthProvider>
      <MyContext.Provider value={values}>
        <BrowserRouter>
          <Toaster position="top-right" />
          {shouldShowHeaderFooter(window.location.pathname) && <Header />}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/listing" exact={true} element={<Listing />} />
            <Route
              path="/category/:categoryId"
              element={<ProductByCategory />}
            />
            <Route
              exact={true}
              path="/product/:id"
              element={<ProductDetails />}
            />
            <Route exact={true} path="/cart" element={<Cart />} />
            <Route exact={true} path="/signin" element={<SignIn />} />
            <Route exact={true} path="/signup" element={<SignUp />} />
            <Route exact={true} path="/profile" element={<Profile />} />
            <Route
              exact={true}
              path="/change-password"
              element={<ChangePassword />}
            />
            <Route
              exact={true}
              path="/forgot-password"
              element={<ForgotPassword />}
            />
            <Route
              exact={true}
              path="/reset-password/:token"
              element={<ResetPassword />}
            />
            <Route exact={true} path="/search" element={<Search />} />
            <Route exact={true} path="/wishlist" element={<Wishlist />} />
            <Route exact={true} path="/checkout" element={<Checkout />} />
            <Route exact={true} path="/thank-you" element={<ThankYou />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/orders/:orderId" element={<OrderDetail />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            <Route
              path="/auth/facebook/callback"
              element={<FacebookCallback />}
            />
            <Route path="/compare" element={<Compare />} />
            <Route path="/voucher" element={<VoucherList />} />
            <Route path="/myvoucher" element={<MyVoucher />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/about" element={<About />} />
          </Routes>
          {shouldShowHeaderFooter(window.location.pathname) && <Footer />}
        </BrowserRouter>
      </MyContext.Provider>
    </AuthProvider>
  );
}

export default App;
export { MyContext };
