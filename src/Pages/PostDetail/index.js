import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  TextField,
  Button,
  Avatar,
  Stack,
  Chip,
  Container,
  Grid,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { api } from "../../services/api";
import { toast } from "react-hot-toast";
import PersonIcon from "@mui/icons-material/Person";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ShareIcon from "@mui/icons-material/Share";
import SearchIcon from "@mui/icons-material/Search";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAuthenticated = !!localStorage.getItem("token");
  const [error, setError] = useState(null);

  const fetchRelatedPosts = useCallback(
    async (tags) => {
      try {
        const response = await api.get("/posts");
        if (Array.isArray(response) && response.length > 0) {
          const filtered = response.filter((p) => p._id !== id).slice(0, 3);
          setRelatedPosts(filtered);
        }
      } catch (error) {
        console.error("Lỗi khi lấy bài viết liên quan:", error);
      }
    },
    [id]
  );

  const fetchPost = useCallback(async () => {
    try {
      const response = await api.get(`/posts/${id}`);
      setPost(response);
      fetchRelatedPosts(response.tags);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết bài viết:", error);
      setError("Không thể tải chi tiết bài viết");
    } finally {
      setLoading(false);
    }
  }, [id, fetchRelatedPosts]);

  useEffect(() => {
    fetchPost();
    window.scrollTo(0, 0);
  }, [fetchPost]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để bình luận");
      navigate("/signin");
      return;
    }

    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post(`/posts/${id}/comments`, {
        content: comment,
      });
      console.log("Comment response:", response);
      toast.success("Bình luận thành công");
      setComment("");
      fetchPost();
    } catch (error) {
      console.error("Lỗi khi bình luận:", error);
      if (error.response?.status === 401) {
        toast.error("Vui lòng đăng nhập để bình luận");
        navigate("/signin");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Không thể gửi bình luận. Vui lòng thử lại sau");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  if (!post) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Typography>Không tìm thấy bài viết</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: "none", bgcolor: "transparent", mb: 4 }}>
            {post.image && (
              <Box
                component="img"
                src={post.image}
                alt={post.title}
                sx={{
                  width: "100%",
                  height: "500px",
                  objectFit: "cover",
                  borderRadius: 2,
                  mb: 3,
                }}
              />
            )}

            <Box sx={{ px: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mr: 1 }}
                >
                  {new Date(post.createdAt).toLocaleDateString()}
                </Typography>

                <Box component="span" sx={{ mx: 1, color: "#ccc" }}>
                  •
                </Box>

                {post.tags?.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    sx={{
                      bgcolor: "#f0f0f0",
                      color: "#666",
                      fontWeight: 500,
                      fontSize: "0.75rem",
                      mr: 1,
                      borderRadius: 1,
                    }}
                  />
                ))}
              </Box>

              <Typography
                variant="h4"
                sx={{
                  mb: 3,
                  fontWeight: 700,
                  color: "#333",
                  lineHeight: 1.4,
                }}
              >
                {post.title}
              </Typography>

              <Stack
                direction="row"
                spacing={2}
                sx={{ mb: 4, color: "text.secondary" }}
                divider={
                  <Box component="span" sx={{ mx: 1, color: "#ccc" }}>
                    •
                  </Box>
                }
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <PersonIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2">
                    {post.author?.name || "Admin"}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2">
                    {post.comments?.length || 0} bình luận
                  </Typography>
                </Stack>
              </Stack>

              <Box
                sx={{
                  mb: 4,
                  color: "#555",
                  lineHeight: 1.8,
                  fontSize: "1.05rem",
                  "& p": { mb: 3 },
                  "& img": {
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: 2,
                    my: 3,
                  },
                }}
              >
                <Typography
                  component="div"
                  sx={{
                    color: "#555",
                    lineHeight: 1.8,
                    fontSize: "1.05rem",
                    whiteSpace: "pre-line",
                  }}
                >
                  {post.content}
                </Typography>
              </Box>

              {/* Social Sharing */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  my: 4,
                  py: 3,
                  borderTop: "1px solid #eee",
                  borderBottom: "1px solid #eee",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="body2"
                    sx={{ mr: 2, color: "#666", fontWeight: 500 }}
                  >
                    Chia sẻ:
                  </Typography>
                  {["#3b5998", "#1da1f2", "#e60023", "#0077b5", "#ff4500"].map(
                    (color, index) => (
                      <IconButton
                        key={index}
                        sx={{
                          bgcolor: color,
                          color: "white",
                          mr: 1,
                          width: 36,
                          height: 36,
                          "&:hover": {
                            bgcolor: color,
                            opacity: 0.9,
                          },
                        }}
                      >
                        <ShareIcon fontSize="small" />
                      </IconButton>
                    )
                  )}
                </Box>
              </Box>

              {/* Comments Section */}
              <Box sx={{ mt: 5, mb: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    fontWeight: 600,
                    fontSize: "1.5rem",
                    position: "relative",
                    pb: 2,
                    "&:after": {
                      content: '""',
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: 40,
                      height: 3,
                      backgroundColor: "primary.main",
                    },
                  }}
                >
                  Bình luận ({post.comments?.length || 0})
                </Typography>

                <Box sx={{ mb: 4, bgcolor: "#f9f9f9", p: 3, borderRadius: 2 }}>
                  {!isAuthenticated ? (
                    <Box sx={{ textAlign: "center", py: 2 }}>
                      <Typography sx={{ mb: 2, color: "text.secondary" }}>
                        Vui lòng đăng nhập để bình luận
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => navigate("/signin")}
                        sx={{
                          bgcolor: "primary.main",
                          px: 4,
                          py: 1,
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          "&:hover": {
                            bgcolor: "primary.dark",
                          },
                        }}
                      >
                        Đăng nhập
                      </Button>
                    </Box>
                  ) : (
                    <form onSubmit={handleCommentSubmit}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Viết bình luận của bạn..."
                        sx={{
                          mb: 2,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        sx={{
                          bgcolor: "primary.main",
                          px: 4,
                          py: 1,
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          "&:hover": {
                            bgcolor: "primary.dark",
                          },
                        }}
                      >
                        {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
                      </Button>
                    </form>
                  )}
                </Box>

                <Stack spacing={3}>
                  {post.comments?.map((comment) => (
                    <Box
                      key={comment._id}
                      sx={{
                        p: 3,
                        bgcolor: "#f9f9f9",
                        borderRadius: 2,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="flex-start"
                      >
                        <Avatar
                          src={comment.user?.avatar}
                          alt={comment.user?.name}
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: "primary.main",
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mb: 1 }}
                          >
                            <Typography sx={{ fontWeight: 600, color: "#333" }}>
                              {comment.user?.name || "Người dùng"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {new Date(comment.createdAt).toLocaleString(
                                "vi-VN"
                              )}
                            </Typography>
                          </Stack>
                          <Typography
                            sx={{
                              color: "#555",
                              lineHeight: 1.6,
                              whiteSpace: "pre-line",
                            }}
                          >
                            {comment.content}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Box>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <Box sx={{ mt: 6 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 4,
                      fontWeight: 600,
                      fontSize: "1.5rem",
                      position: "relative",
                      pb: 2,
                      "&:after": {
                        content: '""',
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: 40,
                        height: 3,
                        backgroundColor: "primary.main",
                      },
                    }}
                  >
                    Bài viết liên quan
                  </Typography>

                  <Grid container spacing={3}>
                    {relatedPosts.map((relatedPost) => (
                      <Grid item xs={12} sm={4} key={relatedPost._id}>
                        <Card
                          sx={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            boxShadow: "none",
                            bgcolor: "transparent",
                          }}
                        >
                          <Link
                            to={`/posts/${relatedPost._id}`}
                            style={{ textDecoration: "none" }}
                          >
                            <CardMedia
                              component="img"
                              height="180"
                              image={
                                relatedPost.image ||
                                "https://via.placeholder.com/300x180"
                              }
                              alt={relatedPost.title}
                              sx={{
                                objectFit: "cover",
                                borderRadius: 2,
                                mb: 2,
                              }}
                            />
                          </Link>

                          <CardContent sx={{ p: 0 }}>
                            <Typography
                              variant="h6"
                              component={Link}
                              to={`/posts/${relatedPost._id}`}
                              sx={{
                                mb: 1,
                                fontWeight: 600,
                                fontSize: "1rem",
                                color: "#333",
                                textDecoration: "none",
                                display: "block",
                                lineHeight: 1.4,
                                overflow: "hidden",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                "&:hover": { color: "primary.main" },
                              }}
                            >
                              {relatedPost.title}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {new Date(
                                relatedPost.createdAt
                              ).toLocaleDateString()}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Box sx={{ position: "sticky", top: 20 }}>
            {/* Search */}
            <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: 2, mb: 4 }}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm..."
                variant="outlined"
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 3,
                  },
                }}
              />
            </Box>

            {/* Popular Posts */}
            <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: 2, mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  position: "relative",
                  pb: 1,
                  "&:after": {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: 40,
                    height: 3,
                    backgroundColor: "primary.main",
                  },
                }}
              >
                BÀI VIẾT PHỔ BIẾN
              </Typography>

              <Stack spacing={3}>
                {relatedPosts.map((popularPost, index) => (
                  <Box
                    key={popularPost._id}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Chip
                      label={index + 1}
                      sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        borderRadius: "50%",
                        width: 30,
                        height: 30,
                        mr: 2,
                      }}
                    />
                    <Box>
                      <Link
                        to={`/posts/${popularPost._id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <CardMedia
                          component="img"
                          sx={{
                            width: 70,
                            height: 70,
                            borderRadius: 1,
                            objectFit: "cover",
                          }}
                          image={
                            popularPost.image ||
                            "https://via.placeholder.com/70x70"
                          }
                          alt={popularPost.title}
                        />
                      </Link>
                    </Box>
                    <Box sx={{ ml: 2, flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        component={Link}
                        to={`/posts/${popularPost._id}`}
                        sx={{
                          color: "#333",
                          fontWeight: 600,
                          textDecoration: "none",
                          display: "block",
                          lineHeight: 1.4,
                          fontSize: "0.875rem",
                          "&:hover": { color: "primary.main" },
                          overflow: "hidden",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {popularPost.title}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Social Media */}
            <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: 2, mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  position: "relative",
                  pb: 1,
                  "&:after": {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: 40,
                    height: 3,
                    backgroundColor: "primary.main",
                  },
                }}
              >
                MẠNG XÃ HỘI
              </Typography>

              <Stack spacing={2}>
                <Box
                  sx={{
                    bgcolor: "#4267B2",
                    color: "white",
                    p: 1.5,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  FACEBOOK
                </Box>
                <Box
                  sx={{
                    bgcolor: "#1DA1F2",
                    color: "white",
                    p: 1.5,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  TWITTER
                </Box>
                <Box
                  sx={{
                    bgcolor: "#E60023",
                    color: "white",
                    p: 1.5,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  PINTEREST
                </Box>
                <Box
                  sx={{
                    bgcolor: "#0077B5",
                    color: "white",
                    p: 1.5,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  LINKEDIN
                </Box>
                <Box
                  sx={{
                    bgcolor: "#FF4500",
                    color: "white",
                    p: 1.5,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  REDDIT
                </Box>
              </Stack>
            </Box>

            {/* Banner Widget */}
            <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  position: "relative",
                  pb: 1,
                  "&:after": {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: 40,
                    height: 3,
                    backgroundColor: "primary.main",
                  },
                }}
              >
                WIDGET BANNER
              </Typography>

              <Box
                component="img"
                src="https://klbtheme.com/bacola/wp-content/uploads/2021/05/sidebar-banner.gif"
                alt="Banner"
                sx={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 2,
                }}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PostDetail;
