import React, { useEffect, useState } from "react";
import {
  getVouchers,
  getSavedVouchers,
  saveVoucher,
  isAuthenticated,
} from "../../services/api";
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
} from "lucide-react";

const VoucherList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [savedVoucherIds, setSavedVoucherIds] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { label: "Tất cả", value: "Tất cả", icon: <Tag size={16} /> },
    { label: "Toàn Sàn", value: "Toàn Sàn", icon: <ShoppingBag size={16} /> },
    {
      label: "Shopee Choice",
      value: "Shopee Choice",
      icon: <Star size={16} />,
    },
    { label: "Freeship", value: "Freeship", icon: <Gift size={16} /> },
    { label: "Shopee Video", value: "Shopee Video", icon: <Award size={16} /> },
    { label: "Tiêu Dùng", value: "Tiêu Dùng", icon: <ShoppingBag size={16} /> },
    { label: "Voucher Xtra", value: "Voucher Xtra", icon: <Award size={16} /> },
    {
      label: "Thời Trang",
      value: "Thời Trang",
      icon: <ShoppingBag size={16} />,
    },
    { label: "Sắc Đẹp", value: "Sắc Đẹp", icon: <Star size={16} /> },
  ];

  const notify = (message, type = "success") => {
    console.log(`${type}: ${message}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getVouchers();
        const voucherData = Array.isArray(response)
          ? response
          : response?.data
          ? response.data
          : response?.vouchers
          ? response.vouchers
          : [];
        setVouchers(voucherData);

        if (isAuthenticated()) {
          try {
            const response = await getSavedVouchers();
            if (response.success) {
              setSavedVoucherIds(response.data.map((v) => v._id));
            } else {
              console.error(
                "Lỗi khi lấy danh sách voucher đã lưu:",
                response.message
              );
            }
          } catch (error) {
            console.error("Lỗi khi lấy danh sách voucher đã lưu:", error);
            if (error.response?.status === 401) {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              notify(
                "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại",
                "error"
              );
              navigate("/signin");
            }
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        notify("Có lỗi xảy ra khi tải danh sách voucher", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleSaveVoucher = async (voucherId) => {
    if (!isAuthenticated()) {
      notify("Vui lòng đăng nhập để lưu mã giảm giá", "error");
      localStorage.setItem("redirectUrl", window.location.pathname);
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
      return;
    }

    setSaving(voucherId);
    try {
      const response = await saveVoucher(voucherId);
      if (response.success) {
        setSavedVoucherIds((prev) => [...prev, voucherId]);
        notify(response.message || "Đã lưu mã giảm giá vào kho");
      } else {
        if (response.message?.includes("hết lượt")) {
          notify(
            "Voucher này đã hết lượt sử dụng, không thể lưu vào kho!",
            "error"
          );
        } else {
          notify(response.message || "Không thể lưu mã giảm giá", "error");
        }
      }
    } catch (error) {
      console.error("Lỗi khi lưu voucher:", error);
      if (error.response?.data?.message?.includes("hết lượt")) {
        notify(
          "Voucher này đã hết lượt sử dụng, không thể lưu vào kho!",
          "error"
        );
      } else if (error.response?.data?.message?.includes("đã lưu")) {
        setSavedVoucherIds((prev) => [...prev, voucherId]);
        notify("Voucher đã được lưu trước đó");
      } else {
        notify(
          error.message || "Không thể lưu mã giảm giá. Vui lòng thử lại sau!",
          "error"
        );
      }
    } finally {
      setSaving("");
    }
  };

  // Lấy tất cả danh mục từ voucher
  const allCategories = [
    ...new Set(
      vouchers
        .flatMap((v) => v.applicableCategories?.map((cat) => cat.name) || [])
        .filter(Boolean)
    ),
  ];

  // Tạo danh sách tab filter động
  const tabs = [
    { label: "Tất cả", value: "Tất cả", icon: <Tag size={16} /> },
    ...allCategories.map((cat) => ({
      label: cat,
      value: cat,
      icon: <Tag size={16} />,
    })),
  ];

  // Lọc voucher theo tab
  const filteredVouchers = vouchers.filter((voucher) => {
    if (selectedTab === "Tất cả") return true;
    return (
      voucher.applicableCategories &&
      voucher.applicableCategories.some((cat) => cat.name === selectedTab)
    );
  });

  const activeVouchers = filteredVouchers.filter(
    (v) => !v.used && v.usedCount < v.usageLimit
  );
  const usedOrExpiredVouchers = filteredVouchers.filter(
    (v) => v.used || v.usedCount >= v.usageLimit
  );

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
    // Phối màu dựa trên loại voucher
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

  // Tính số ngày còn lại
  const getRemainingDays = (endDate) => {
    const now = new Date();
    const expiry = new Date(endDate);
    return Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)));
  };

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
            <Gift size={120} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Kho Mã Giảm Giá
          </h1>
          <p className="text-blue-100 mb-4">
            Khám phá và lưu trữ những ưu đãi tốt nhất cho bạn
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
                className="pl-10 pr-4 py-3 w-full border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
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
              Danh mục:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {tabs.map((cat) => (
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Gift size={20} style={{ color: "#00aaff" }} />
              Voucher có thể sử dụng
              <span
                className="ml-1 bg-blue-100 text-sm px-2 py-0.5 rounded-full"
                style={{ color: "#00aaff" }}
              >
                {activeVouchers.length}
              </span>
            </h2>

            {activeVouchers.length > 0 && (
              <div
                className="text-sm  font-medium flex items-center"
                style={{ color: "#00aaff" }}
              >
                <TrendingUp size={16} className="mr-1" />
                Có{" "}
                {
                  activeVouchers.filter((v) => isExpiringSoon(v.endDate)).length
                }{" "}
                voucher sắp hết hạn
              </div>
            )}
          </div>

          {activeVouchers.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Không có voucher nào khả dụng
            </div>
          ) : (
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
                      <div className="text-xs bg-white bg-opacity-20 rounded px-2 py-0.5 inline-block text-black">
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

                    <div className="flex items-center justify-between mt-3">
                      <div className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                        <span className="font-medium">
                          {voucher.usageLimit - voucher.usedCount}
                        </span>
                        /{voucher.usageLimit} lượt còn lại
                      </div>
                      <button
                        disabled={
                          saving === voucher._id ||
                          savedVoucherIds.includes(voucher._id)
                        }
                        onClick={() => handleSaveVoucher(voucher._id)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                          savedVoucherIds.includes(voucher._id)
                            ? "bg-green-100 text-green-700 flex items-center gap-1"
                            : saving === voucher._id
                            ? "bg-gray-100 text-gray-500"
                            : "text-white shadow-sm hover:shadow group-hover:scale-105"
                        }`}
                        style={
                          !savedVoucherIds.includes(voucher._id) &&
                          saving !== voucher._id
                            ? {
                                backgroundColor: "#00aaff",
                                transition: "background 0.2s",
                              }
                            : {}
                        }
                      >
                        {savedVoucherIds.includes(voucher._id) ? (
                          <>
                            <Check size={14} />
                            <span>Đã lưu</span>
                          </>
                        ) : saving === voucher._id ? (
                          "Đang lưu..."
                        ) : (
                          "Lưu vào kho"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Used/Expired Vouchers */}
        {usedOrExpiredVouchers.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Info size={20} className="text-gray-500" />
              Voucher đã sử dụng/hết hạn
              <span className="ml-1 bg-gray-100 text-gray-600 text-sm px-2 py-0.5 rounded-full">
                {usedOrExpiredVouchers.length}
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usedOrExpiredVouchers.map((voucher) => (
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
                    </div>

                    <div className="mt-3">
                      <div className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full inline-block">
                        {voucher.used ? "Đã sử dụng" : "Hết lượt sử dụng"}
                      </div>
                    </div>
                  </div>

                  {/* Diagonal "expired" watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                    <div className="bg-gray-800 text-white text-xs font-bold py-1 px-12 opacity-20 transform rotate-45 translate-x-8">
                      ĐÃ HẾT HẠN
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {filteredVouchers.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 mb-3">
              <Search size={48} className="mx-auto opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">
              Không tìm thấy voucher nào
            </h3>
            <p className="text-gray-500 mt-2">
              Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoucherList;
