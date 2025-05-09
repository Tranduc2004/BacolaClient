import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Fade,
  Box,
  Typography,
  InputAdornment,
} from "@mui/material";
import { FaAngleDown, FaSearch } from "react-icons/fa";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export const LocationSelector = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(
          "https://countriesnow.space/api/v0.1/countries"
        );
        const data = await response.json();

        if (data && data.data) {
          // Chuyển đổi dữ liệu để chỉ lấy tên quốc gia
          const countriesList = data.data.map((country) => ({
            name: country.country,
          }));
          setLocations(countriesList);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách quốc gia:", error);
      }
    };

    fetchLocations();
  }, []);

  // Mở / Đóng Dialog
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Chọn vị trí
  const selectLocation = (location) => {
    setSelectedLocation(location);
    setOpen(false);
  };

  // Lọc danh sách theo từ khóa
  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      {/* Button chọn vị trí */}
      <Button
        onClick={handleOpen}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          py: 1.5,
          px: 2,
          borderRadius: 2,
          bgcolor: "white",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          border: "1px solid #E5E7EB",
          transition: "all 0.3s ease",
          "&:hover": {
            bgcolor: "#F9FAFB",
            transform: "translateY(-2px)",
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
          },
          width: "13rem",
        }}
      >
        <span className="text-xs text-gray-500 w-full text-left">
          Khu vực giao hàng
        </span>
        <div className="flex items-center justify-between w-full mt-1">
          <span
            className="font-bold text-gray-800 text-[14px] truncate w-40"
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: "#00aaff",
              fontSize: "16px",
            }}
          >
            {selectedLocation ? selectedLocation.name : "Chọn vị trí"}
          </span>
          <FaAngleDown className="text-blue-500 w-[18px] h-[18px] transition-transform duration-300" />
        </div>
      </Button>

      {/* Dialog chọn địa điểm */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="xs"
        TransitionComponent={Fade}
        transitionDuration={400}
        PaperProps={{
          elevation: 24,
          sx: {
            borderRadius: 3,
            background: "white",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "#f8fafc",
            borderBottom: "1px solid #E5E7EB",
            p: 2,
          }}
        >
          <LocationOnIcon sx={{ color: "#3b82f6" }} />
          <Typography variant="h10" sx={{ fontWeight: 600, color: "#1e293b" }}>
            Chọn khu vực giao hàng
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 12,
              top: 12,
              color: "#64748b",
              bgcolor: "#f1f5f9",
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: "#e2e8f0",
                color: "#0f172a",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {/* Ô tìm kiếm */}
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Tìm khu vực..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaSearch color="#94a3b8" />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              mt: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "#f8fafc",
                transition: "all 0.3s",
                border: "1px solid #e2e8f0",
                "&:hover": {
                  bgcolor: "#f1f5f9",
                },
                "&.Mui-focused": {
                  boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)",
                  borderColor: "#3b82f6",
                },
              },
            }}
          />

          {/* Danh sách địa điểm */}
          <Box sx={{ height: "10px" }} />
          <List
            sx={{
              maxHeight: "350px",
              overflowY: "auto",
              bgcolor: "#f8fafc",
              borderRadius: 2,
              p: 1,
              "&::-webkit-scrollbar": { width: "8px" },
              "&::-webkit-scrollbar-track": {
                bgcolor: "#f1f5f9",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#cbd5e1",
                borderRadius: "10px",
                border: "2px solid #f1f5f9",
                "&:hover": {
                  background: "#94a3b8",
                },
              },
            }}
          >
            {filteredLocations.length > 0 ? (
              filteredLocations.map((loc, index) => (
                <React.Fragment key={loc.name}>
                  <ListItemButton
                    onClick={() => selectLocation(loc)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      "&:hover": {
                        bgcolor: "#e0f2fe",
                        transform: "translateX(3px)",
                      },
                      bgcolor:
                        selectedLocation?.name === loc.name
                          ? "#e0f2fe"
                          : "white",
                      transition: "all 0.2s ease",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 500, color: "#334155" }}>
                          {loc.name}
                        </Typography>
                      }
                    />
                    {selectedLocation?.name === loc.name && (
                      <CheckCircleIcon sx={{ color: "#3b82f6", ml: 1 }} />
                    )}
                  </ListItemButton>
                  {index !== filteredLocations.length - 1 && (
                    <Divider sx={{ opacity: 0.5 }} />
                  )}
                </React.Fragment>
              ))
            ) : (
              <Box
                sx={{
                  p: 3,
                  textAlign: "center",
                  color: "#64748b",
                  bgcolor: "white",
                  borderRadius: 2,
                }}
              >
                <Typography>Không tìm thấy khu vực phù hợp</Typography>
              </Box>
            )}
          </List>
        </DialogContent>

        <DialogActions
          sx={{ p: 2, bgcolor: "#f8fafc", borderTop: "1px solid #E5E7EB" }}
        >
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              borderRadius: 2,
              bgcolor: "#3b82f6",
              px: 3,
              py: 1,
              textTransform: "none",
              boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.3)",
              "&:hover": {
                bgcolor: "#2563eb",
                boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.4)",
              },
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export const MobileLocationSelector = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(
          "https://countriesnow.space/api/v0.1/countries"
        );
        const data = await response.json();

        if (data && data.data) {
          // Chuyển đổi dữ liệu để chỉ lấy tên quốc gia
          const countriesList = data.data.map((country) => ({
            name: country.country,
          }));
          setLocations(countriesList);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách quốc gia:", error);
      }
    };

    fetchLocations();
  }, []);

  // Mở / Đóng Dialog
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Chọn vị trí
  const selectLocation = (location) => {
    setSelectedLocation(location);
    setOpen(false);
  };

  // Lọc danh sách theo từ khóa
  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      {/* Button chọn vị trí */}
      <Button
        onClick={handleOpen}
        sx={{
          width: "100%", // Chiếm toàn bộ chiều rộng của div
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          py: 1.5,
          px: 2,
          borderRadius: 2,
          bgcolor: "white",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          border: "1px solid #E5E7EB",
          transition: "all 0.3s ease",
          "&:hover": {
            bgcolor: "#F9FAFB",
            transform: "translateY(-2px)",
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
          },
        }}
      >
        <span className="text-xs text-gray-500 w-full text-left">
          Khu vực giao hàng
        </span>
        <div className="flex items-center justify-between w-full mt-1">
          <span
            className="font-bold text-gray-800 text-[14px] truncate w-40"
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: "#00aaff",
            }}
          >
            {selectedLocation ? selectedLocation.name : "Chọn vị trí"}
          </span>
          <FaAngleDown className="text-blue-500 w-[18px] h-[18px] transition-transform duration-300" />
        </div>
      </Button>

      {/* Dialog chọn địa điểm */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="xs"
        TransitionComponent={Fade}
        transitionDuration={400}
        PaperProps={{
          elevation: 24,
          sx: {
            borderRadius: 3,
            background: "white",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "#f8fafc",
            borderBottom: "1px solid #E5E7EB",
            p: 2,
          }}
        >
          <LocationOnIcon sx={{ color: "#3b82f6" }} />
          <Typography variant="h10" sx={{ fontWeight: 600, color: "#1e293b" }}>
            Chọn khu vực giao hàng
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 12,
              top: 12,
              color: "#64748b",
              bgcolor: "#f1f5f9",
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: "#e2e8f0",
                color: "#0f172a",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {/* Ô tìm kiếm */}
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Tìm khu vực..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaSearch color="#94a3b8" />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              mt: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "#f8fafc",
                transition: "all 0.3s",
                border: "1px solid #e2e8f0",
                "&:hover": {
                  bgcolor: "#f1f5f9",
                },
                "&.Mui-focused": {
                  boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)",
                  borderColor: "#3b82f6",
                },
              },
            }}
          />

          {/* Danh sách địa điểm */}
          <Box sx={{ height: "10px" }} />
          <List
            sx={{
              maxHeight: "350px",
              overflowY: "auto",
              bgcolor: "#f8fafc",
              borderRadius: 2,
              p: 1,
              "&::-webkit-scrollbar": { width: "8px" },
              "&::-webkit-scrollbar-track": {
                bgcolor: "#f1f5f9",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#cbd5e1",
                borderRadius: "10px",
                border: "2px solid #f1f5f9",
                "&:hover": {
                  background: "#94a3b8",
                },
              },
            }}
          >
            {filteredLocations.length > 0 ? (
              filteredLocations.map((loc, index) => (
                <React.Fragment key={loc.name}>
                  <ListItemButton
                    onClick={() => selectLocation(loc)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      "&:hover": {
                        bgcolor: "#e0f2fe",
                        transform: "translateX(3px)",
                      },
                      bgcolor:
                        selectedLocation?.name === loc.name
                          ? "#e0f2fe"
                          : "white",
                      transition: "all 0.2s ease",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 500, color: "#334155" }}>
                          {loc.name}
                        </Typography>
                      }
                    />
                    {selectedLocation?.name === loc.name && (
                      <CheckCircleIcon sx={{ color: "#3b82f6", ml: 1 }} />
                    )}
                  </ListItemButton>
                  {index !== filteredLocations.length - 1 && (
                    <Divider sx={{ opacity: 0.5 }} />
                  )}
                </React.Fragment>
              ))
            ) : (
              <Box
                sx={{
                  p: 3,
                  textAlign: "center",
                  color: "#64748b",
                  bgcolor: "white",
                  borderRadius: 2,
                }}
              >
                <Typography>Không tìm thấy khu vực phù hợp</Typography>
              </Box>
            )}
          </List>
        </DialogContent>

        <DialogActions
          sx={{ p: 2, bgcolor: "#f8fafc", borderTop: "1px solid #E5E7EB" }}
        >
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              borderRadius: 2,
              bgcolor: "#3b82f6",
              px: 3,
              py: 1,
              textTransform: "none",
              boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.3)",
              "&:hover": {
                bgcolor: "#2563eb",
                boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.4)",
              },
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
