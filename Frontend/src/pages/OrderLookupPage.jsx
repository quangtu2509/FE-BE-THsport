// src/pages/OrderLookupPage.jsx
import React, { useState } from "react";
import { fetchApi } from "../utils/api";
import { toast } from "react-toastify";

export default function OrderLookupPage() {
  // State để lưu mã đơn hàng người dùng nhập
  const [orderId, setOrderId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  // State để lưu kết quả tra cứu
  const [lookupResult, setLookupResult] = useState(null);
  // State để biết có đang "tải" hay không
  const [isLoading, setIsLoading] = useState(false);

  // Hàm xử lý khi nhấn nút "Tra cứu"
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!orderId.trim() && !phoneNumber.trim()) {
      toast.error("Vui lòng nhập mã đơn hàng hoặc số điện thoại");
      return;
    }

    setIsLoading(true);
    setLookupResult(null);

    try {
      // Gọi API tra cứu đơn hàng công khai (không cần auth)
      const result = await fetchApi(`/orders/lookup?orderId=${orderId}&phone=${phoneNumber}`);
      
      if (result && result._id) {
        setLookupResult({
          status: "success",
          id: result._id,
          date: new Date(result.createdAt).toLocaleDateString("vi-VN"),
          customer: result.user?.name || "Khách hàng",
          items: result.items.map(i => `${i.name} x ${i.quantity}`).join(", "),
          total: result.total?.toLocaleString("vi-VN") || "0",
          orderStatus: result.status,
        });
      } else {
        setLookupResult({
          status: "error",
          message: "Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn hàng hoặc số điện thoại.",
        });
      }
    } catch (error) {
      setLookupResult({
        status: "error",
        message: error.message || "Lỗi khi tra cứu. Vui lòng thử lại.",
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
