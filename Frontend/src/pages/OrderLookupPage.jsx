// src/pages/OrderLookupPage.jsx
import React, { useState } from "react";
import { fetchApi } from "../utils/api";

export default function OrderLookupPage() {
  // State để lưu mã đơn hàng người dùng nhập
  const [orderId, setOrderId] = useState("");
  // State để lưu kết quả tra cứu
  const [lookupResult, setLookupResult] = useState(null);
  // State để biết có đang "tải" (giả) hay không
  const [isLoading, setIsLoading] = useState(false);

  // Hàm xử lý khi nhấn nút "Tra cứu"
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLookupResult(null); // Xóa kết quả cũ
    setIsLoading(true);
    try {
      // GỌI API THỰC TẾ
      const data = await fetchApi(`/orders/lookup/${orderId}`);

      // Xử lý thông tin sản phẩm (lấy 1 sản phẩm đầu tiên và đếm số lượng còn lại)
      const firstItem = data.items[0];
      const itemSummary =
        data.items.length > 1
          ? `${firstItem.name} x ${firstItem.quantity} và ${
              data.items.length - 1
            } sản phẩm khác`
          : `${firstItem.name} x ${firstItem.quantity}`;

      // Cập nhật kết quả tra cứu
      setLookupResult({
        status: "success",
        id: data.id.slice(-6).toUpperCase(),
        date: new Date(data.date).toLocaleDateString("vi-VN"),
        customer: data.shippingAddress,
        item: itemSummary,
        orderStatus: data.status,
        total: data.total,
      });
    } catch (e) {
      // Hiển thị lỗi từ Backend (ví dụ: Không tìm thấy đơn hàng)
      console.error("Lỗi tra cứu:", e);
      setLookupResult({
        status: "error",
        message: e.message || "Lỗi không xác định khi tra cứu đơn hàng.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container w-[90%] max-w-[700px] mx-auto mt-10 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Tra Cứu Đơn Hàng</h1>
      <p className="text-center text-gray-600 mb-6">
        Vui lòng nhập Mã đơn hàng (VD: 12345) hoặc Số điện thoại để tra cứu
        thông tin đơn hàng của bạn.
      </p>

      {/* Form tra cứu */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-white p-8 rounded-lg shadow-md"
      >
        <div>
          <label htmlFor="orderId" className="block text-sm font-bold mb-1">
            Mã đơn hàng hoặc SĐT *
          </label>
          <input
            type="text"
            id="orderId"
            required
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="Nhập mã đơn hàng (thử: 12345)"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white text-lg font-bold uppercase py-3 px-6 rounded-md transition-colors hover:bg-primary-dark mt-4 disabled:bg-gray-400"
        >
          {isLoading ? "Đang tra cứu..." : "Tra cứu"}
        </button>
      </form>

      {/* Khu vực hiển thị kết quả */}
      {lookupResult && (
        <div className="mt-8 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Kết quả tra cứu</h2>

          {/* Nếu tra cứu thất bại */}
          {lookupResult.status === "error" && (
            <p className="text-red-500">{lookupResult.message}</p>
          )}

          {/* Nếu tra cứu thành công */}
          {lookupResult.status === "success" && (
            <div className="flex flex-col gap-2">
              <p>
                <strong>Mã đơn hàng:</strong> {lookupResult.id}
              </p>
              <p>
                <strong>Khách hàng:</strong> {lookupResult.customer}
              </p>
              <p>
                <strong>Ngày đặt:</strong> {lookupResult.date}
              </p>
              <p>
                <strong>Sản phẩm:</strong> {lookupResult.item}
              </p>
              <p>
                <strong>Trạng thái:</strong>
                <span className="font-bold text-green-600 ml-2">
                  {lookupResult.orderStatus}
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case "completed":
      return "text-green-600";
    case "delivering":
    case "confirmed":
      return "text-blue-600";
    case "pending":
      return "text-yellow-600";
    case "cancelled":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};
