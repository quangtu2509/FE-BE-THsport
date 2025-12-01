// Frontend/src/pages/AdminPromotionsPage.jsx
import React from "react";

export default function AdminPromotionsPage() {
  return (
    <div className="py-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Quản lý Khuyến mãi/Mã giảm giá
      </h2>
      <p className="text-gray-600">
        Sử dụng API /promotions để quản lý CRUD mã giảm giá (code, discount,
        startDate, endDate).
      </p>
    </div>
  );
}
