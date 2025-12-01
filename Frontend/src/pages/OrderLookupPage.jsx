// src/pages/OrderLookupPage.jsx
import React, { useState } from "react";

export default function OrderLookupPage() {
  // State để lưu mã đơn hàng người dùng nhập
  const [orderId, setOrderId] = useState("");
  // State để lưu kết quả tra cứu
  const [lookupResult, setLookupResult] = useState(null);
  // State để biết có đang "tải" (giả) hay không
  const [isLoading, setIsLoading] = useState(false);

  // Hàm xử lý khi nhấn nút "Tra cứu"
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLookupResult(null); // Xóa kết quả cũ

    // --- LOGIC GIẢ LẬP TRUY VẤN CÔNG KHAI (MOCK LOGIC) ---
    // Chúng ta giả vờ gọi API trong 1 giây
    setTimeout(() => {
      // Mã "ma thuật" (magic code) để tra cứu thành công
      const magicCode = "12345";

      // Kiểm tra thành công nếu mã là "12345" hoặc có chứa "0123" (giả lập số điện thoại)
      if (orderId === magicCode || orderId.includes("0123")) {
        // Nếu đúng, trả về kết quả thành công
        setLookupResult({
          status: "success",
          id: orderId, // Dùng mã người dùng nhập
          date: "10/11/2025",
          customer: "Khách Hàng Tra Cứu",
          item: "Giày Adidas Predator Accuracy.3 TF (Size: 41) x 1",
          orderStatus: "Đang trên đường giao",
        });
      } else {
        // Nếu sai, trả về lỗi
        setLookupResult({
          status: "error",
          message:
            "Không tìm thấy đơn hàng. Vui lòng kiểm tra lại Mã đơn hàng hoặc Số điện thoại (Thử: 12345).",
        });
      }
      setIsLoading(false); // Tắt loading
    }, 1000); // Giả lập 1 giây chờ mạng
    // --- KẾT THÚC LOGIC "GIẢ" ---
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
