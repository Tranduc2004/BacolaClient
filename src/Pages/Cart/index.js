import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Rating from "@mui/material/Rating";
import QuantityBox from "../../Components/QuantityBox";
import { IoIosClose } from "react-icons/io";
import Button from "@mui/material/Button";
import { IoCartSharp } from "react-icons/io5";
import { getCart, updateCartItem, removeFromCart } from "../../services/api";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await getCart();
      setCartItems(response.items || []);
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      await updateCartItem(productId, quantity);
      fetchCart();
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromCart(productId);
      fetchCart();
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      if (!item || !item.product) return total;
      const discount = item.product.discount || 0;
      const price = item.product.price || item.price;
      const discountedPrice = price * (1 - discount / 100);
      return total + discountedPrice * item.quantity;
    }, 0);
  };

  if (loading) {
    return <div className="container">Đang tải...</div>;
  }

  return (
    <>
      <section className="section cartPage">
        <div className="container">
          <h2 className="hd mb-2">Your Cart</h2>
          <p>
            There are <b className="text-red">{cartItems.length}</b> products in
            your cart
          </p>

          <div className="row">
            {/* Bảng sản phẩm giỏ hàng */}
            <div className="col-lg-9 col-12 mb-4">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr className="bg-slate-100">
                      <th width="35%">Tên sản phẩm</th>
                      <th width="20%">Giá thành</th>
                      <th width="20%">Số lượng</th>
                      <th width="15%">Thành tiền</th>
                      <th width="10%">Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => {
                      if (!item || !item.product) {
                        return null;
                      }

                      return (
                        <tr key={item.product._id}>
                          <td>
                            <Link to={`/product/${item.product._id}`}>
                              <div className="d-flex align-items-center cartItemimgWrapper">
                                <div className="imgWrapper">
                                  <img
                                    src={item.product.images?.[0] || ""}
                                    alt={item.product.name}
                                    className="w-100"
                                    style={{ maxWidth: "80px" }}
                                  />
                                </div>
                                <div className="info px-3">
                                  <h6 className="product-name">
                                    {item.product.name}
                                  </h6>
                                  <Rating
                                    name="read-only"
                                    value={item.product.rating || 0}
                                    readOnly
                                    precision={0.5}
                                    size="small"
                                  />
                                </div>
                              </div>
                            </Link>
                          </td>
                          <td>
                            {item.product.discount > 0 ? (
                              <>
                                <span
                                  style={{
                                    textDecoration: "line-through",
                                    color: "#888",
                                    marginRight: 4,
                                  }}
                                >
                                  {item.product.price.toLocaleString("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  })}
                                </span>
                                <span
                                  style={{ color: "#ed174a", fontWeight: 600 }}
                                >
                                  {(
                                    item.product.price *
                                    (1 - item.product.discount / 100)
                                  ).toLocaleString("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  })}
                                </span>
                              </>
                            ) : (
                              <span>
                                {item.product.price.toLocaleString("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                })}
                              </span>
                            )}
                          </td>
                          <td>
                            <QuantityBox
                              value={item.quantity}
                              onChange={(newQuantity) =>
                                handleUpdateQuantity(
                                  item.product._id,
                                  newQuantity
                                )
                              }
                            />
                          </td>
                          <td>
                            {(item.product.discount > 0
                              ? item.product.price *
                                (1 - item.product.discount / 100) *
                                item.quantity
                              : item.product.price * item.quantity
                            ).toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            })}
                          </td>
                          <td>
                            <span
                              className="remove"
                              onClick={() => handleRemoveItem(item.product._id)}
                              style={{ cursor: "pointer" }}
                            >
                              <IoIosClose />
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tổng thanh toán */}
            <div className="col-lg-3 col-12">
              <div className="card border p-3 cartDetails">
                <h4>HÓA ĐƠN</h4>
                <div className="d-flex justify-content-between mb-3">
                  <span>Tổng thu:</span>
                  <b className="text-red">
                    {calculateTotal().toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </b>
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <span>Phí vận chuyển:</span>
                  <b>Miễn phí</b>
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <span>Estimate for:</span>
                  <b>Việt Nam</b>
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <span>Total:</span>
                  <b className="text-red">
                    {calculateTotal().toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </b>
                </div>

                <Button
                  className="btn-lg btn-big w-100"
                  sx={{
                    backgroundColor: "#00aaff",
                    color: "white",
                    "&:hover": { backgroundColor: "#0088cc" },
                  }}
                  onClick={() => navigate("/checkout")}
                >
                  <IoCartSharp /> &nbsp; Tiếp tục
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Cart;
