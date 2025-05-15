import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Tooltip,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { sendMessage } from "../../services/api";
import ProductItem from "../ProductItem";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    // Add user message immediately
    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);

    try {
      const res = await sendMessage(trimmed);

      // Validate response
      if (!res || typeof res !== "object") {
        throw new Error("Invalid server response");
      }

      if (res.success === false) {
        throw new Error(res.message || "Request failed");
      }

      // Construct bot message
      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        timestamp: new Date(),
      };

      // Handle product responses
      if (res.isProduct) {
        botMessage.text =
          res.message || "Here are some products you might like:";

        if (res.products?.length) {
          botMessage.products = res.products.map((p) => ({
            _id: p.id || p._id,
            name: p.name,
            price: p.price,
            description: p.description,
            images: [p.image || p.images?.[0]],
            rating: p.rating || 0,
            numReviews: p.numReviews || 0,
            countInStock: p.countInStock || 1,
          }));
        } else if (res.product) {
          botMessage.product = {
            _id: res.product.id || res.product._id,
            name: res.product.name,
            price: res.product.price,
            description: res.product.description,
            images: [res.product.image || res.product.images?.[0]],
            rating: res.product.rating || 0,
            numReviews: res.product.numReviews || 0,
            countInStock: res.product.countInStock || 1,
          };
        }
      } else {
        // Handle text responses
        botMessage.text = res.message || "I couldn't understand your request.";
      }

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chatbot error:", err);
      const errorMsg = err.message || "An unknown error occurred";

      toast.error(errorMsg);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: errorMsg,
          isError: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setNewMessage(suggestion);
    setShowSuggestions(false);
  };

  const renderSuggestions = () => {
    if (!showSuggestions || messages.length > 0) return null;

    const suggestions = [
      "Bạn có thể giúp tôi tìm sản phẩm không?",
      "Có sản phẩm nào đang giảm giá không?",
      "Tôi muốn xem các sản phẩm mới nhất",
      "Làm sao để đặt hàng online?",
    ];

    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          bgcolor: "background.paper",
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Bạn có thể hỏi tôi về:
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {suggestions.map((suggestion, index) => (
            <Typography
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              sx={{
                p: 1,
                borderRadius: 1,
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "grey.100",
                },
                color: "primary.main",
              }}
            >
              {suggestion}
            </Typography>
          ))}
        </Box>
      </Paper>
    );
  };

  const renderMessageContent = (msg) => {
    return (
      <>
        {msg.text && (
          <Typography
            sx={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              mb: msg.products || msg.product ? 1 : 0,
              color: msg.isError ? "error.main" : "inherit",
            }}
          >
            {msg.text}
          </Typography>
        )}

        {msg.product && (
          <Box sx={{ mt: 1 }}>
            <ProductItem product={msg.product} itemView="list" />
          </Box>
        )}

        {msg.products && (
          <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
            {msg.products.map((product, idx) => (
              <ProductItem
                key={`${msg.id}-${idx}`}
                product={product}
                itemView="list"
              />
            ))}
          </Box>
        )}
      </>
    );
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: isMobile ? 80 : 32, // Điều chỉnh vị trí bottom cho mobile
        right: isMobile ? 16 : 32, // Điều chỉnh vị trí right cho mobile
        zIndex: 50,
      }}
    >
      <Tooltip title="Trợ lí ảo - Nhấn để chat" placement="left" arrow>
        <IconButton
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              toast.success(
                "Chào bạn! Tôi là trợ lí ảo, tôi có thể giúp gì cho bạn?",
                {
                  duration: 4000,
                }
              );
            }
          }}
          sx={{
            bgcolor: "#00aaff",
            color: "white",
            p: isMobile ? 2 : 3, // Điều chỉnh padding cho mobile
            "&:hover": {
              bgcolor: "#0095e0",
              transform: "scale(1.1)",
            },
            transition: "transform 0.2s",
          }}
        >
          {isOpen ? (
            <FaTimes size={isMobile ? 18 : 22} />
          ) : (
            <FaRobot size={isMobile ? 18 : 22} />
          )}
        </IconButton>
      </Tooltip>

      {isOpen && (
        <Box
          sx={{
            position: "absolute",
            bottom: isMobile ? 60 : 80, // Điều chỉnh vị trí bottom cho mobile
            right: 0,
            width: isMobile ? "calc(100vw - 32px)" : 360, // Điều chỉnh width cho mobile
            height: isMobile ? "calc(100vh - 200px)" : 500, // Điều chỉnh height cho mobile
            bgcolor: "background.paper",
            borderRadius: 1,
            boxShadow: 24,
            border: 1,
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              bgcolor: "#00aaff",
              color: "white",
              px: 2,
              py: 1.5,
              display: "flex",
              alignItems: "center",
            }}
          >
            <FaRobot size={isMobile ? 24 : 28} style={{ marginRight: 8 }} />
            <Typography
              variant="subtitle1"
              fontWeight="medium"
              fontSize={isMobile ? 16 : 18}
            >
              Chat với trợ lí ảo
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
              bgcolor: "grey.50",
            }}
          >
            {renderSuggestions()}
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  mb: 2,
                  display: "flex",
                  justifyContent:
                    msg.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <Box
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    boxShadow: 1,
                    maxWidth: "80%",
                    bgcolor:
                      msg.sender === "user"
                        ? "#00aaff"
                        : msg.isError
                        ? "error.light"
                        : "background.paper",
                    color:
                      msg.sender === "user" ? "common.white" : "text.primary",
                    border: msg.sender === "bot" && !msg.isError ? 1 : 0,
                    borderColor: "divider",
                  }}
                >
                  {renderMessageContent(msg)}
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          <Box
            component="form"
            onSubmit={handleSend}
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Nhập tin nhắn..."
                size="small"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isLoading}
                inputRef={inputRef}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <IconButton
                type="submit"
                disabled={isLoading || !newMessage.trim()}
                sx={{
                  bgcolor: "#00aaff",
                  color: "white",
                  "&:hover": { bgcolor: "#0095e0" },
                  "&.Mui-disabled": { bgcolor: "grey.300" },
                  borderRadius: 2,
                }}
              >
                {isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SendIcon />
                )}
              </IconButton>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Chatbot;
