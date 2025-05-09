import { styled } from "@mui/material/styles";
import { IconButton } from "@mui/material";

export const CircleCartButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: "#FFF1EE",
  border: "1px solid #d1d5db",
  boxShadow: theme.shadows[2],
  width: "48px",
  height: "48px",
  padding: 0,
  position: "relative",
}));

export const CircleButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: "white",
  border: "1px solid #d1d5db",
  boxShadow: theme.shadows[2],
  width: "48px",
  height: "48px",
  padding: 0,
}));
