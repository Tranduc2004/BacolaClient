import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Search,
  Send,
  ChevronLeft,
  MoreVertical,
  Phone,
  Video,
  CheckCheck,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Giải mã JWT để lấy userId
function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id || payload._id;
  } catch {
    return null;
  }
}

// Format thời gian
function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Format ngày tháng
function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Hôm nay";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Hôm qua";
  } else {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
}

export default function Chat() {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadMessages, setUnreadMessages] = useState({});
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);
  const userId = getUserIdFromToken();
  const prevMessagesLength = useRef({});
  const messageInputRef = useRef(null);

  // Lấy danh sách superadmin
  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/admin/users/superadmins", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.data && response.data.data) {
        setAdmins(response.data.data);
        setFilteredAdmins(response.data.data);

        // Khởi tạo prevMessagesLength cho mỗi admin
        const initialLengths = {};
        response.data.data.forEach((admin) => {
          initialLengths[admin._id] = 0;
        });
        prevMessagesLength.current = initialLengths;
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách superadmin:", error);
      toast.error("Không thể lấy danh sách superadmin");
    }
  };

  // Lấy tin nhắn với admin được chọn
  const fetchMessages = async (adminId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/messages/user", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.data.success) {
        const filteredMessages = response.data.data.filter(
          (msg) =>
            (msg.sender._id === userId && msg.receiver._id === adminId) ||
            (msg.sender._id === adminId && msg.receiver._id === userId)
        );

        // Kiểm tra tin nhắn mới
        const hasNewMessages = filteredMessages.length > messages.length;
        const lastMessage = filteredMessages[filteredMessages.length - 1];
        const isNewMessageFromAdmin =
          hasNewMessages && lastMessage?.senderType === "superadmin";
        const isAtBottom =
          messagesEndRef.current?.getBoundingClientRect().top <=
          window.innerHeight + 100;

        // Chỉ cập nhật tin nhắn nếu có tin nhắn mới
        if (hasNewMessages) {
          if (
            prevMessagesLength.current[adminId] > 0 &&
            filteredMessages.length > prevMessagesLength.current[adminId]
          ) {
            const newMessages = filteredMessages.slice(
              prevMessagesLength.current[adminId]
            );
            const unreadFromAdmin = newMessages.filter(
              (msg) => msg.senderType === "superadmin"
            ).length;

            if (unreadFromAdmin > 0) {
              // Cập nhật số tin nhắn chưa đọc
              const currentUnread = JSON.parse(
                localStorage.getItem("unread_messages") || "{}"
              );
              currentUnread[adminId] =
                (currentUnread[adminId] || 0) + unreadFromAdmin;
              localStorage.setItem(
                "unread_messages",
                JSON.stringify(currentUnread)
              );
              setUnreadMessages(currentUnread);

              // Hiển thị thông báo
              if (document.visibilityState !== "visible") {
                toast(
                  `Bạn có ${unreadFromAdmin} tin nhắn mới từ ${
                    admins.find((a) => a._id === adminId)?.name
                  }`,
                  {
                    icon: "🔔",
                    style: {
                      borderRadius: "10px",
                      background: "#E0F2FE",
                      color: "#0C4A6E",
                    },
                  }
                );
              }
            }
          }

          prevMessagesLength.current[adminId] = filteredMessages.length;
          setMessages(filteredMessages);

          // Chỉ cuộn xuống khi có tin nhắn mới từ admin và người dùng đang ở gần cuối
          if (isNewMessageFromAdmin && isAtBottom) {
            setTimeout(scrollToBottom, 100);
          }
        }

        // Reset số tin nhắn chưa đọc khi đang xem chat với admin này
        if (
          selectedAdmin?._id === adminId &&
          document.visibilityState === "visible"
        ) {
          const currentUnread = JSON.parse(
            localStorage.getItem("unread_messages") || "{}"
          );
          delete currentUnread[adminId];
          localStorage.setItem(
            "unread_messages",
            JSON.stringify(currentUnread)
          );
          setUnreadMessages(currentUnread);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn:", error);
      toast("Không thể lấy tin nhắn", {
        icon: "❌",
        style: {
          borderRadius: "10px",
          background: "#FEE2E2",
          color: "#7F1D1D",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Gửi tin nhắn mới
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedAdmin) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/messages/user/send",
        {
          receiverId: selectedAdmin._id,
          content: newMessage,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (response.data.success) {
        setMessages((prevMessages) => [...prevMessages, response.data.data]);
        setNewMessage("");
        messageInputRef.current?.focus();
        // Luôn cuộn xuống khi gửi tin nhắn mới
        setTimeout(scrollToBottom, 100);
        toast.success("Gửi tin nhắn thành công!");
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      toast.error("Không thể gửi tin nhắn");
    }
  };

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Hàm lấy số tin nhắn chưa đọc
  const fetchUnreadMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/messages/user/unread", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.data.success) {
        setUnreadMessages(response.data.data);
        localStorage.setItem(
          "unread_messages",
          JSON.stringify(response.data.data)
        );
      }
    } catch (error) {
      console.error("Lỗi khi lấy số tin nhắn chưa đọc:", error);
    }
  };

  // Hàm đánh dấu tin nhắn đã đọc
  const markMessagesAsRead = async (adminId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/api/messages/read/${adminId}`, null, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setUnreadMessages((prev) => {
        const newState = { ...prev };
        delete newState[adminId];
        return newState;
      });
      localStorage.setItem("unread_messages", JSON.stringify(unreadMessages));
    } catch (error) {
      console.error("Lỗi khi đánh dấu tin nhắn đã đọc:", error);
    }
  };

  // Tìm kiếm admin
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term.trim() === "") {
      setFilteredAdmins(admins);
    } else {
      setFilteredAdmins(
        admins.filter(
          (admin) =>
            (admin.name?.toLowerCase() || "").includes(term) ||
            (admin.email?.toLowerCase() || "").includes(term)
        )
      );
    }
  };

  // Tạo danh sách ngày
  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach((message) => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  // Sắp xếp các ngày theo thứ tự tăng dần (ngày cũ trước, ngày mới sau)
  const sortedDates = Object.keys(groupMessagesByDate()).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  // Cập nhật useEffect để gọi fetchUnreadMessages
  useEffect(() => {
    fetchAdmins();
    fetchUnreadMessages();
    // Thiết lập interval để cập nhật số tin nhắn chưa đọc mỗi 30 giây
    const interval = setInterval(fetchUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cập nhật hàm handleAdminSelect
  const handleAdminSelect = (admin) => {
    setSelectedAdmin(admin);
    markMessagesAsRead(admin._id);
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  useEffect(() => {
    if (!selectedAdmin) return;
    fetchMessages(selectedAdmin._id); // Gọi ngay khi chọn admin
    const interval = setInterval(() => {
      fetchMessages(selectedAdmin._id);
    }, 5000); // Tăng lên 5 giây
    return () => clearInterval(interval);
  }, [selectedAdmin]);

  const getLastMessage = (adminId) => {
    const adminMessages = messages.filter(
      (msg) =>
        (msg.sender._id === userId && msg.receiver._id === adminId) ||
        (msg.sender._id === adminId && msg.receiver._id === userId)
    );
    if (adminMessages.length === 0) return null;
    return adminMessages[adminMessages.length - 1];
  };

  return (
    <div className="h-screen max-h-screen flex bg-gray-50">
      {/* Sidebar - Danh sách admin */}
      <div
        className={`${
          showSidebar ? "block" : "hidden"
        } md:block w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex-shrink-0`}
      >
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Tin nhắn</h2>
          <div className="relative">
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Tìm kiếm admin..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search
              className="absolute top-2.5 left-3 text-gray-400"
              size={18}
            />
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-120px)]">
          {filteredAdmins.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <MessageCircle size={24} className="mb-2" />
              <p>Không tìm thấy admin nào</p>
            </div>
          ) : (
            <ul>
              {filteredAdmins.map((admin) => {
                const lastMsg = getLastMessage(admin._id);
                return (
                  <li
                    key={admin._id}
                    onClick={() => handleAdminSelect(admin)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                      selectedAdmin?._id === admin._id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 flex-shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                        {(admin.name && admin.name[0]) || "A"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h3 className="font-medium text-gray-900 truncate">
                            {admin.name}
                          </h3>
                          {lastMsg && (
                            <span className="text-xs text-gray-500">
                              {formatTime(lastMsg.createdAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {lastMsg
                            ? lastMsg.content
                            : "Bắt đầu cuộc trò chuyện"}
                        </p>
                      </div>
                      {unreadMessages[admin._id] > 0 && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">
                            {unreadMessages[admin._id]}
                          </span>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Khu vực chat */}
      <div className="flex-1 flex flex-col">
        {selectedAdmin ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  className="md:hidden text-gray-600 hover:text-gray-900"
                  onClick={() => setShowSidebar(true)}
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                  {(selectedAdmin.name && selectedAdmin.name[0]) || "A"}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {selectedAdmin.name}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedAdmin.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600">
                  <Phone size={20} />
                </button>
                <button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600">
                  <Video size={20} />
                </button>
                <button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Tin nhắn */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <MessageCircle size={32} className="text-blue-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">
                    Bắt đầu cuộc trò chuyện
                  </h3>
                  <p className="text-sm">
                    Gửi tin nhắn đầu tiên tới {selectedAdmin.name}
                  </p>
                </div>
              ) : (
                sortedDates.map((date) => (
                  <div key={date} className="mb-6">
                    <div className="flex justify-center mb-4">
                      <span className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full">
                        {formatDate(date)}
                      </span>
                    </div>
                    {groupMessagesByDate()
                      [date].sort(
                        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                      )
                      .map((message, index) => {
                        const isMine = message.senderType === "User";
                        const isConsecutive =
                          index > 0 &&
                          groupMessagesByDate()[date][index - 1].senderType ===
                            message.senderType;

                        return (
                          <div
                            key={message._id}
                            className={`flex ${
                              isMine ? "justify-end" : "justify-start"
                            } ${!isConsecutive ? "mt-4" : "mt-1"}`}
                          >
                            {!isMine && !isConsecutive && (
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                                {(selectedAdmin.name &&
                                  selectedAdmin.name[0]) ||
                                  "A"}
                              </div>
                            )}
                            {!isMine && isConsecutive && (
                              <div className="w-8 mr-2"></div>
                            )}
                            <div
                              className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                                isMine
                                  ? "bg-blue-500 text-white rounded-br-none"
                                  : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                              }`}
                            >
                              <p className="whitespace-pre-wrap">
                                {message.content}
                              </p>
                              <div
                                className={`text-xs mt-1 flex justify-end items-center gap-1 ${
                                  isMine ? "text-blue-100" : "text-gray-500"
                                }`}
                              >
                                {formatTime(message.createdAt)}
                                {isMine && (
                                  <CheckCheck size={14} className="ml-1" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input gửi tin nhắn */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  ref={messageInputRef}
                  type="text"
                  className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                />
                <button
                  onClick={sendMessage}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    newMessage.trim()
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                  disabled={!newMessage.trim()}
                >
                  <Send
                    size={18}
                    className={newMessage.trim() ? "" : "opacity-50"}
                  />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6">
              <MessageCircle size={40} className="text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Tin nhắn của bạn
            </h2>
            <p className="text-gray-500 text-center max-w-md mb-4">
              Chọn một admin từ danh sách để bắt đầu cuộc trò chuyện
            </p>
            <button
              className="md:hidden bg-blue-500 text-white px-6 py-2 rounded-lg"
              onClick={() => setShowSidebar(true)}
            >
              Xem danh sách admin
            </button>
          </div>
        )}
      </div>

      {/* CSS cho animations */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes fadeOut {
            from {
              opacity: 1;
              transform: translateY(0);
            }
            to {
              opacity: 0;
              transform: translateY(-20px);
            }
          }
        `}
      </style>
    </div>
  );
}
