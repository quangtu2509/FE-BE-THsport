// src/pages/AccountPage.jsx (Đã sửa hoàn chỉnh)
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { fetchApi } from "../utils/api"; // THÊM: Import fetchApi
import { toast } from "react-toastify"; // THÊM: Import toast

// (Component con cho nội dung Tab Profile) - ĐÃ SỬA để Cập nhật
function ProfileTab({ user }) {
  // State để quản lý dữ liệu form, sử dụng các trường từ user object
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    address: user.address || "",
  });

  // Hàm xử lý nhập liệu
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // HÀM GỌI API CẬP NHẬT PROFILE
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      // Endpoint: PUT /users/:id (Backend API để cập nhật thông tin)
      const updatedUser = await fetchApi(`/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      // Trong một ứng dụng thật, bạn sẽ cần gọi hàm từ AuthContext
      // để cập nhật state currentUser trên toàn bộ ứng dụng (ví dụ: updateAuth(updatedUser)).
      // Ở đây, ta chỉ dựa vào thông báo và reload thủ công nếu cần.

      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật profile:", error);
      toast.error(error.message || "Cập nhật thất bại.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Thông tin tài khoản</h2>
      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-bold mb-1">
            Họ và tên
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full p-3 border rounded-md"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-bold mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={user.email}
            readOnly
            className="w-full p-3 border rounded-md bg-gray-100 text-gray-500"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-bold mb-1">
            Số điện thoại
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-md"
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-bold mb-1">
            Địa chỉ
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-md"
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-white font-bold py-3 px-6 rounded-md hover:bg-primary-dark transition-colors"
        >
          Cập nhật
        </button>
      </form>
    </div>
  );
}

// (Component con cho nội dung Tab "Orders") - ĐÃ CÓ LOGIC API
function OrdersTab({ currentUser }) {
  // Nhận currentUser từ component cha
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    if (!currentUser) return; // Không fetch nếu chưa đăng nhập

    setLoading(true);
    try {
      // Endpoint: GET /orders (Lấy tất cả đơn hàng của user)
      const response = await fetchApi("/orders?limit=100");
      setOrders(response.orders || []);
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Helper để hiển thị trạng thái và màu sắc
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "shipping":
        return "text-blue-600";
      case "pending":
        return "text-yellow-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Lịch sử đơn hàng</h2>
        <p>Đang tải đơn hàng...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Lịch sử đơn hàng</h2>
        <p>Bạn chưa có đơn hàng nào.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        Lịch sử đơn hàng ({orders.length})
      </h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="p-4 border rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <p className="font-bold">
                Mã đơn hàng: #{order._id.slice(-6).toUpperCase()}
              </p>
              <span className={`font-bold ${getStatusColor(order.status)}`}>
                {order.status.toUpperCase()}
              </span>
            </div>
            <p>
              <strong>Tổng tiền:</strong> {order.total ? order.total.toLocaleString("vi-VN") : "0"}{" "}
              ₫
            </p>
            <p>
              <strong>Ngày đặt:</strong>{" "}
              {new Date(order.createdAt).toLocaleDateString("vi-VN")}
            </p>
            <div className="mt-2 text-sm text-gray-600">
              {order.items.slice(0, 2).map((item) => (
                <p key={item.productId || item.name} className="truncate">
                  - {item.name} x {item.quantity}
                </p>
              ))}
              {order.items.length > 2 && (
                <p>... và {order.items.length - 2} sản phẩm khác</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Component chính
export default function AccountPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");

  // LOGIC BẢO VỆ LỘ TRÌNH (PRIVATE ROUTE)
  useEffect(() => {
    if (currentUser === null) {
      navigate("/dang-nhap");
    }
  }, [currentUser, navigate]);

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (currentUser === null) {
    return null;
  }

  // Nếu đã đăng nhập, hiển thị layout 2 cột
  return (
    <div className="container w-[90%] max-w-[1000px] mx-auto mt-10 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Tài Khoản Của Bạn</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* CỘT TRÁI: MENU ĐIỀU HƯỚNG */}
        <div className="md:col-span-1">
          <div className="flex flex-col gap-2 bg-white p-4 rounded-lg shadow-md">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full text-left p-3 rounded-md font-bold ${
                activeTab === "profile"
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              Thông tin tài khoản
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full text-left p-3 rounded-md font-bold ${
                activeTab === "orders"
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              Lịch sử đơn hàng
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left p-3 rounded-md font-bold text-red-500 hover:bg-gray-100"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* CỘT PHẢI: NỘI DUNG TAB */}
        <div className="md:col-span-3 bg-white p-8 rounded-lg shadow-md">
          {activeTab === "profile" && <ProfileTab user={currentUser} />}
          {/* SỬA: Truyền currentUser prop cho OrdersTab để khớp với định nghĩa hàm */}
          {activeTab === "orders" && <OrdersTab currentUser={currentUser} />}
        </div>
      </div>
    </div>
  );
}
