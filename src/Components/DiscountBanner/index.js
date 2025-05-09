import React from "react";

const DiscountBanner = () => {
  return (
    <div
      style={{
        backgroundColor: "#fff3f5",
        color: "#e5003c",
        padding: "16px 24px",
        borderRadius: "8px",
        fontSize: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontWeight: 500 }}>
        Giảm giá cực khủng cho lần mua hàng{" "}
        <strong style={{ textDecoration: "underline" }}>
          đầu tiên của bạn.
        </strong>
        .
      </span>
      <span
        style={{
          border: "1px dashed #e5003c",
          padding: "4px 12px",
          borderRadius: "999px",
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        FIRSTORDER
      </span>
      <span style={{ color: "#999", fontSize: "14px" }}>
        Sử dụng mã giảm giá khi thanh toán!
      </span>
    </div>
  );
};

export default DiscountBanner;
