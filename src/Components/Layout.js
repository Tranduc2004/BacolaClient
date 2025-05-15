import { useContext } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { MyContext } from "../App";

const Layout = ({ children }) => {
  const location = useLocation();
  const { isHeaderFooterShow } = useContext(MyContext);

  const pathsWithoutHeaderFooter = [
    "/signin",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/change-password",
  ];

  const shouldShow = !pathsWithoutHeaderFooter.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <>
      {shouldShow && isHeaderFooterShow && <Header />}
      {children}
      {shouldShow && isHeaderFooterShow && <Footer />}
    </>
  );
};

export default Layout;
