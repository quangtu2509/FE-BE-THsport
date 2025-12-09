// src/pages/OrderLookupPage.jsx
import React, { useState } from "react";
import { fetchApi } from "../utils/api";
import { toast } from "react-toastify";

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
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

export default function OrderLookupPage() {
  // State để lưu mã đơn hàng người dùng nhập
  const [orderId, setOrderId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(""); // State để lưu kết quả tra cứu (Sửa cấu trúc để lưu chi tiết items)
  const [lookupResult, setLookupResult] = useState(null); // State để biết có đang "tải" hay không
  const [isLoading, setIsLoading] = useState(false); // Hàm xử lý khi nhấn nút "Tra cứu"

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderId.trim() && !phoneNumber.trim()) {
      toast.error("Vui lòng nhập mã đơn hàng hoặc số điện thoại");
      return;
    }

    setIsLoading(true);
    setLookupResult(null);

    try {
      // Gọi API tra cứu đơn hàng công khai (dùng Query string)
      const data = await fetchApi(
        `/orders/lookup?orderId=${orderId}&phone=${phoneNumber}`
      ); // Backend trả về dữ liệu đơn hàng trực tiếp
      if (data && data._id) {
        // Map dữ liệu từ Backend
        setLookupResult({
          status: "success", // Lấy 6 ký tự cuối của ID
          id: data._id.slice(-6).toUpperCase(),
          date: new Date(data.createdAt).toLocaleDateString("vi-VN"), // Sử dụng trường 'customer' được Backend map từ shippingAddress
          customer: data.customer || "Khách hàng",
          items: data.items, // LƯU TRỮ TOÀN BỘ MẢNG ITEMS
          total: data.total, // Lưu tổng tiền dưới dạng số
          orderStatus: data.status,
        });
      } else {
        setLookupResult({
          status: "error",
          message:
            "Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn hàng hoặc số điện thoại.",
        });
      }
    } catch (error) {
      // Xử lý lỗi từ fetchApi (bao gồm lỗi 404 từ Backend)
      const errorMessage =
        error.response?.error || "Lỗi khi tra cứu. Vui lòng thử lại.";
      setLookupResult({
        status: "error",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container w-[90%] max-w-[700px] mx-auto mt-10 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Tra Cứu Đơn Hàng</h1> 
      <p className="text-center text-gray-600 mb-6">
        Vui lòng nhập Mã đơn hàng hoặc Số điện thoại để tra cứu thông tin đơn
        hàng của bạn.
      </p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-white p-8 rounded-lg shadow-md"
      >
        <div>
          <label htmlFor="orderId" className="block text-sm font-bold mb-1">
            Mã đơn hàng
          </label>
          <input
            type="text"
            id="orderId"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="Nhập mã đơn hàng"
          />
        </div>
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-bold mb-1">
            Số điện thoại
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="Nhập số điện thoại"
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
      {lookupResult && (
        <div className="mt-8 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Kết quả tra cứu</h2>
          {/* Nếu tra cứu thất bại */}
          {lookupResult.status === "error" && (
            <p className="text-red-500">{lookupResult.message}</p>
          )}
          {/* Nếu tra cứu thành công */}
          {lookupResult.status === "success" && (
            <div className="flex flex-col gap-4">
              {/* Thông tin chung */}
              <div className="border-b pb-4 space-y-2">
                <p>
                  <strong>Mã đơn hàng:</strong>
                  {lookupResult.id}
                </p>
                <p>
                  <strong>Ngày đặt:</strong>
                  {lookupResult.date}
                </p>

                <p>
                  <strong>Khách hàng:</strong>
                  {lookupResult.customer}
                </p>
                <p>
                  <strong>Trạng thái:</strong>

                  <span
                    className={`font-bold ml-2 ${getStatusColor(
                      lookupResult.orderStatus
                    )}`}
                  >
                    {lookupResult.orderStatus.toUpperCase()}
                  </span>
                </p>
              </div>
              <h3 className="text-lg font-bold">Sản phẩm đã đặt:</h3>
              {Array.isArray(lookupResult.items) &&
                lookupResult.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between border-b pb-2 last:border-b-0"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <img
                        src={
                          item.imageUrl ||
                          item.image ||
                          "https://via.placeholder.com/50"
                        }
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md border"
                      />
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          SL: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">
                      {((item.price || 0) * item.quantity).toLocaleString(
                        "vi-VN"
                      )}
                      ₫
                    </p>
                  </div>
                ))}
              <div className="flex justify-between font-bold text-lg border-t pt-4">
                <span>Tổng cộng:</span>
                <span className="text-red-600">
                  {lookupResult.total
                    ? lookupResult.total.toLocaleString("vi-VN")
                    : "0"}
                  ₫
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
