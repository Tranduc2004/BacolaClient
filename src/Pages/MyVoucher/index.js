import React, { useEffect, useState, useCallback } from "react";
import { getSavedVouchers, removeSavedVoucher } from "../../services/api";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Search,
  Tag,
  Gift,
  Clock,
  Info,
  ShoppingBag,
  Star,
  Check,
  Filter,
  Award,
  Scissors,
  Zap,
  Percent,
  CreditCard,
  TrendingUp,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";

const MyVoucher = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(""); // voucherId đang xóa
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("Tất cả");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { label: "Tất cả", value: "Tất cả", icon: <Tag size={16} /> },
    {
      label: "Đang hoạt động",
      value: "Đang hoạt động",
      icon: <Check size={16} />,
    },
    { label: "Đã sử dụng", value: "Đã sử dụng", icon: <Info size={16} /> },
    { label: "Sắp hết hạn", value: "Sắp hết hạn", icon: <Clock size={16} /> },
  ];

  const notify = (message, type = "success") => {
    console.log(`${type}: ${message}`);
  };

  const fetchVouchers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getSavedVouchers();

      if (response.success) {
        const voucherData = Array.isArray(response.data) ? response.data : [];
        setVouchers(voucherData);
      } else {
        console.error("Lỗi khi lấy danh sách voucher:", response.message);
        notify(
          response.message || "Không thể lấy danh sách mã giảm giá",
          "error"
        );
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách voucher:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        notify("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại", "error");
        navigate("/signin");
      } else {
        notify("Có lỗi xảy ra khi tải danh sách mã giảm giá", "error");
      }
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  // Helper functions (đặt lên trên để tránh lỗi ReferenceError)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const isExpiringSoon = (endDate) => {
    const now = new Date();
    const expiry = new Date(endDate);
    const daysRemaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return daysRemaining <= 3 && daysRemaining >= 0;
  };

  const getDiscountTypeIcon = (discountType) => {
    if (discountType === "PERCENTAGE") {
      return <Percent size={20} className="text-yellow-500" />;
    } else {
      return <CreditCard size={20} className="text-green-500" />;
    }
  };

  const getBgGradient = (voucher) => {
    if (voucher.used) {
      return "bg-gradient-to-r from-gray-600 to-gray-500";
    }
    if (voucher.name?.toLowerCase().includes("freeship")) {
      return "bg-gradient-to-r from-green-600 to-green-500";
    } else if (
      voucher.discountType === "PERCENTAGE" &&
      voucher.discountValue >= 50
    ) {
      return "bg-gradient-to-r from-red-600 to-orange-500";
    } else if (voucher.discountType === "PERCENTAGE") {
      return "bg-gradient-to-r from-blue-600 to-indigo-500";
    } else {
      return "bg-gradient-to-r from-purple-600 to-pink-500";
    }
  };

  const getRemainingDays = (endDate) => {
    const now = new Date();
    const expiry = new Date(endDate);
    return Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)));
  };

  // Hàm xóa voucher
  const handleRemoveVoucher = async (voucherId) => {
    try {
      setRemoving(voucherId);
      const response = await removeSavedVoucher(voucherId);

      if (response.success) {
        // Cập nhật danh sách voucher sau khi xóa
        setVouchers((prevVouchers) =>
          prevVouchers.filter((voucher) => voucher._id !== voucherId)
        );
        notify(response.message || "Đã xóa mã giảm giá khỏi kho");
      } else {
        notify(response.message || "Không thể xóa mã giảm giá", "error");
      }
    } catch (error) {
      console.error("Lỗi khi xóa voucher:", error);
      notify(error.message || "Có lỗi xảy ra khi xóa mã giảm giá", "error");
    } finally {
      setRemoving("");
    }
  };

  // Hàm lọc vouchers dựa trên tìm kiếm và danh mục
  const filteredVouchers = vouchers.filter((voucher) => {
    // Lọc theo từ khóa tìm kiếm
    const matchesSearch =
      !searchTerm ||
      voucher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // Lọc theo tab được chọn
    let matchesTab = selectedTab === "Tất cả";

    if (selectedTab === "Đang hoạt động") {
      matchesTab = !voucher.used;
    } else if (selectedTab === "Đã sử dụng") {
      matchesTab = voucher.used;
    } else if (selectedTab === "Sắp hết hạn") {
      matchesTab = isExpiringSoon(voucher.endDate) && !voucher.used;
    }

    return matchesSearch && matchesTab;
  });

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="flex flex-col gap-6">
          <div className="bg-gray-100 animate-pulse h-12 rounded-lg w-full"></div>
          <div className="bg-gray-100 animate-pulse h-8 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-gray-100 animate-pulse h-32 rounded-lg"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeVouchers = filteredVouchers.filter((v) => !v.used);
  const usedVouchers = filteredVouchers.filter((v) => v.used);

  return (
    <div className="bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 md:p-6 bg-white rounded-lg shadow-md">
        {/* Header with background and decoration */}
        <div
          className="rounded-lg shadow-lg mb-6 p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(to right, #00aaff, #0077cc)",
          }}
        >
          <div className="absolute top-0 right-0 opacity-10">
            <ShoppingBag size={120} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Kho Mã Giảm Giá Của Tôi
          </h1>
          <p className="text-red-100 mb-4">
            Quản lý các mã giảm giá bạn đã lưu
          </p>
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 mt-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm kiếm voucher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 shadow-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{ color: "#00aaff" }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white  border border-blue-100 rounded-lg hover:bg-blue-50 shadow-sm transition-all font-medium"
            >
              <Filter size={16} />
              <span>Bộ lọc</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Categories */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 animate-fadeIn">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Trạng thái:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedTab(cat.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    selectedTab === cat.value
                      ? "font-medium shadow-sm"
                      : "bg-white text-gray-600 border border-gray-100 hover:bg-[#fff5f5] hover:text-[#FF6B6B] hover:border-[#ffd6d6]"
                  }`}
                  style={
                    selectedTab === cat.value
                      ? {
                          backgroundColor: "#e0f7ff", // màu nền nhạt của #00aaff
                          color: "#00aaff",
                          border: "1px solid #b3ecff",
                        }
                      : {}
                  }
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Vouchers */}
        {(selectedTab === "Tất cả" ||
          selectedTab === "Đang hoạt động" ||
          selectedTab === "Sắp hết hạn") &&
          activeVouchers.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Gift size={20} style={{ color: "#00aaff" }} />
                  Voucher đang hoạt động
                  <span
                    className="ml-1 text-sm px-2 py-0.5 rounded-full"
                    style={{ color: "#00aaff", backgroundColor: "#e0f7ff" }}
                  >
                    {activeVouchers.length}
                  </span>
                </h2>

                {activeVouchers.filter((v) => isExpiringSoon(v.endDate))
                  .length > 0 && (
                  <div
                    className="text-sm  font-medium flex items-center"
                    style={{ color: "#00aaff" }}
                  >
                    <AlertCircle size={16} className="mr-1" />
                    Có{" "}
                    {
                      activeVouchers.filter((v) => isExpiringSoon(v.endDate))
                        .length
                    }{" "}
                    voucher sắp hết hạn
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeVouchers.map((voucher) => (
                  <div
                    key={voucher._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all border border-gray-100 group flex relative"
                  >
                    {/* Decorative edge */}
                    <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="h-2 w-2 rounded-full bg-gray-200"
                        ></div>
                      ))}
                    </div>

                    {/* Left part with enhanced styling */}
                    <div
                      className={`${getBgGradient(
                        voucher
                      )} w-1/3 p-4 flex flex-col justify-between relative overflow-hidden`}
                    >
                      <div className="absolute -right-4 -bottom-4 opacity-20">
                        <Scissors size={40} className="transform rotate-45" />
                      </div>

                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          {getDiscountTypeIcon(voucher.discountType)}
                          <div className="font-bold text-xl text-white">
                            {voucher.discountType === "PERCENTAGE"
                              ? `${voucher.discountValue}%`
                              : `${voucher.discountValue.toLocaleString()}đ`}
                          </div>
                        </div>
                        <div className="text-xs bg-white bg-opacity-20 rounded px-2 py-0.5 inline-block text-bkack">
                          {voucher.discountType === "PERCENTAGE"
                            ? "GIẢM GIÁ"
                            : "GIẢM TRỰC TIẾP"}
                        </div>
                      </div>

                      <div className="mt-2">
                        <div className="text-xs bg-black bg-opacity-10 rounded px-2 py-1 text-white flex items-center gap-1">
                          <Clock size={12} />
                          <span>
                            Còn {getRemainingDays(voucher.endDate)} ngày
                          </span>
                        </div>
                        {isExpiringSoon(voucher.endDate) && (
                          <div className="mt-1 bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-medium flex items-center">
                            <Zap size={12} className="mr-1" />
                            Sắp hết hạn
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right part - voucher details with enhanced styling */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <div className="font-medium text-gray-800 flex items-center gap-1">
                          {voucher.name?.toLowerCase().includes("freeship") && (
                            <Gift size={16} className="text-green-500" />
                          )}
                          {voucher.name}
                        </div>

                        {voucher.description && (
                          <div className="text-sm mt-2 text-gray-600 bg-gray-50 p-2 rounded">
                            {voucher.description.length > 60
                              ? voucher.description.slice(0, 60) + "..."
                              : voucher.description}
                          </div>
                        )}

                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                          <ShoppingBag size={14} />
                          <span>
                            Đơn tối thiểu:{" "}
                            <span className="font-medium text-gray-700">
                              {voucher.minOrderValue
                                ? `${voucher.minOrderValue.toLocaleString()}đ`
                                : "Không giới hạn"}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end mt-3">
                        <button
                          disabled={removing === voucher._id}
                          onClick={() => handleRemoveVoucher(voucher._id)}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                            removing === voucher._id
                              ? "bg-gray-100 text-gray-500"
                              : "bg-red-100 text-red-600 hover:bg-red-200"
                          }`}
                        >
                          <Trash2 size={14} />
                          {removing === voucher._id
                            ? "Đang xóa..."
                            : "Xóa khỏi kho"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Used Vouchers */}
        {(selectedTab === "Tất cả" || selectedTab === "Đã sử dụng") &&
          usedVouchers.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Info size={20} className="text-gray-500" />
                Voucher đã sử dụng
                <span className="ml-1 bg-gray-100 text-gray-600 text-sm px-2 py-0.5 rounded-full">
                  {usedVouchers.length}
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {usedVouchers.map((voucher) => (
                  <div
                    key={voucher._id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 flex opacity-70 relative"
                  >
                    {/* Decorative edge */}
                    <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="h-2 w-2 rounded-full bg-gray-200"
                        ></div>
                      ))}
                    </div>

                    {/* Left part */}
                    <div className="bg-gray-500 text-white w-1/3 p-4 flex flex-col justify-between relative">
                      <div className="absolute right-0 top-0 bottom-0 w-4 overflow-hidden">
                        <div className="absolute top-0 right-0 left-4 bottom-0 bg-gray-400 transform skew-x-6 origin-top-right"></div>
                      </div>

                      <div>
                        <div className="font-bold mb-1 text-lg">
                          {voucher.discountType === "PERCENTAGE"
                            ? `${voucher.discountValue}%`
                            : `${voucher.discountValue.toLocaleString()}đ`}
                        </div>
                        <div className="text-xs bg-white bg-opacity-20 rounded px-2 py-0.5 inline-block text-black">
                          {voucher.discountType === "PERCENTAGE"
                            ? "GIẢM GIÁ"
                            : "GIẢM TRỰC TIẾP"}
                        </div>
                      </div>

                      <div className="mt-2 text-xs">
                        <div className="flex items-center gap-1 opacity-80">
                          <Clock size={12} />
                          <span>HSD: {formatDate(voucher.endDate)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right part */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <div className="font-medium">{voucher.name}</div>
                        {voucher.description && (
                          <div className="text-sm mt-1 text-gray-600">
                            {voucher.description.length > 60
                              ? voucher.description.slice(0, 60) + "..."
                              : voucher.description}
                          </div>
                        )}

                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                          <ShoppingBag size={14} />
                          <span>
                            Đơn tối thiểu:{" "}
                            <span className="font-medium text-gray-700">
                              {voucher.minOrderValue
                                ? `${voucher.minOrderValue.toLocaleString()}đ`
                                : "Không giới hạn"}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full inline-block flex items-center">
                          <Check size={14} className="mr-1" />
                          Đã sử dụng
                        </div>
                      </div>
                    </div>

                    {/* Diagonal "used" watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                      <div className="bg-gray-800 text-white text-xs font-bold py-1 px-12 opacity-20 transform rotate-45 translate-x-8">
                        ĐÃ SỬ DỤNG
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* No vouchers case */}
        {filteredVouchers.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 mb-3">
              <ShoppingBag size={48} className="mx-auto opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">
              {searchTerm
                ? "Không tìm thấy voucher nào phù hợp"
                : selectedTab !== "Tất cả"
                ? `Không có voucher nào ở mục ${selectedTab}`
                : "Bạn chưa lưu voucher nào"}
            </h3>
            <p className="text-gray-500 mt-2">
              {searchTerm
                ? "Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác"
                : "Khám phá các mã giảm giá và lưu vào kho của bạn"}
            </p>
            <button
              onClick={() => navigate("/voucher")}
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all flex items-center gap-2 mx-auto"
            >
              <Tag size={16} />
              Khám phá voucher
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVoucher;
