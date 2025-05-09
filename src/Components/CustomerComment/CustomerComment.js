import { Box, Typography, Avatar } from "@mui/material";

const CustomerComment = ({ comment }) => (
  <Box
    sx={{
      bgcolor: "#fffbea",
      borderRadius: 2,
      p: 3,
      boxShadow: 1,
      maxWidth: 320,
      minHeight: 200,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    <div>
      <Typography fontWeight="bold" mb={1} fontSize={18}>
        {comment.title}
      </Typography>
      <Typography color="text.secondary" mb={2} fontSize={15}>
        {comment.content}
      </Typography>
    </div>
    <Box display="flex" alignItems="center">
      <Avatar
        src={comment.avatar}
        alt={comment.name}
        sx={{ mr: 2, width: 48, height: 48 }}
      />
      <Box>
        <Typography fontWeight="bold">{comment.name}</Typography>
        <Typography fontSize={14} color="text.secondary">
          {comment.role}
        </Typography>
      </Box>
    </Box>
  </Box>
);

export default CustomerComment;
