import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Stack,
  Container,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import SearchIcon from "@mui/icons-material/Search";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.get("/posts");
      if (Array.isArray(response)) {
        setPosts(response);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bài viết:", error);
      setError("Không thể tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const popularPosts = posts.slice(0, 3); // Lấy 3 bài viết đầu tiên làm popular posts

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Main Content */}
          <Box sx={{ mb: 5 }}>
            {posts.length > 0 && (
              <Box>
                <CardMedia
                  component="img"
                  height="500"
                  image={
                    posts[0].image ||
                    "https://klbtheme.com/bacola/wp-content/uploads/2021/05/blog-5-100x100.jpg"
                  }
                  alt={posts[0].title}
                  sx={{
                    objectFit: "cover",
                    borderRadius: 2,
                    mb: 2,
                  }}
                />

                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mr: 1 }}
                  >
                    {new Date(posts[0].createdAt).toLocaleDateString()}
                  </Typography>

                  <Box component="span" sx={{ mx: 1, color: "#ccc" }}>
                    •
                  </Box>

                  {posts[0].tags?.map((tag, index) => (
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
                  component={Link}
                  to={`/posts/${posts[0]._id}`}
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    color: "#333",
                    textDecoration: "none",
                    display: "block",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  {posts[0].title}
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  {posts[0].content?.substring(0, 300)}...
                </Typography>

                <Box
                  component={Link}
                  to={`/posts/${posts[0]._id}`}
                  sx={{
                    display: "inline-block",
                    bgcolor: "#00aaff ",
                    color: "#fff",
                    py: 1.5,
                    px: 3,
                    borderRadius: 1,
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    "&:hover": {
                      bgcolor: "#029be3",
                      color: "#fff",
                    },
                  }}
                >
                  Đọc Thêm
                </Box>
              </Box>
            )}
          </Box>

          {/* Additional Posts */}
          <Grid container spacing={3}>
            {posts.slice(1).map((post) => (
              <Grid item xs={12} sm={6} key={post._id}>
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
                    to={`/posts/${post._id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <CardMedia
                      component="img"
                      height="220"
                      image={
                        post.image ||
                        "https://klbtheme.com/bacola/wp-content/uploads/2021/05/blog-5-100x100.jpg"
                      }
                      alt={post.title}
                      sx={{
                        objectFit: "cover",
                        borderRadius: 2,
                        mb: 2,
                      }}
                    />
                  </Link>

                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mr: 1 }}
                      >
                        {new Date(post.createdAt).toLocaleDateString()}
                      </Typography>

                      <Box component="span" sx={{ mx: 1, color: "#ccc" }}>
                        •
                      </Box>

                      {post.tags?.slice(0, 1).map((tag, index) => (
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
                      variant="h6"
                      component={Link}
                      to={`/posts/${post._id}`}
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        color: "#333",
                        textDecoration: "none",
                        display: "block",
                        lineHeight: 1.4,
                        height: 56,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      {post.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        height: 60,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {post.content?.substring(0, 150)}...
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
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
              {popularPosts.map((post, index) => (
                <Box
                  key={post._id}
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
                      to={`/posts/${post._id}`}
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
                          post.image ||
                          "https://klbtheme.com/bacola/wp-content/uploads/2021/05/blog-5-100x100.jpg"
                        }
                        alt={post.title}
                      />
                    </Link>
                  </Box>
                  <Box sx={{ ml: 2, flex: 1 }}>
                    <Typography
                      variant="subtitle2"
                      component={Link}
                      to={`/posts/${post._id}`}
                      sx={{
                        color: "#333",
                        fontWeight: 600,
                        textDecoration: "none",
                        display: "block",
                        lineHeight: 1.4,
                        fontSize: "0.875rem",
                        "&:hover": { color: "primary.main" },
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {post.title}
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
        </Grid>
      </Grid>
    </Container>
  );
};

export default Posts;
