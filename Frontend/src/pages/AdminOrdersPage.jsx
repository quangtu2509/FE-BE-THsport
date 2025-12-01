// Frontend/src/pages/AdminOrdersPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { fetchApi } from "../utils/api";
import { toast } from "react-toastify";
import Pagination from "../components/Pagination";

const STATUSES = [
  "pending",
  "confirmed",
  "delivering",
  "completed",
  "cancelled",
];
const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  delivering: "bg-indigo-100 text-indigo-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      // API lấy tất cả đơn hàng (Admin)
      const response = await fetchApi(`/admin/orders?page=${page}&limit=20`);
      setOrders(response.orders);
      setPagination(response.pagination);
    } catch (error) {
      toast.error("Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handlePageChange = (newPage) => {
    fetchOrders(newPage);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn chuyển trạng thái đơn hàng #${orderId
          .slice(-6)
          .toUpperCase()} sang ${newStatus.toUpperCase()}?`
      )
    ) {
      return;
    }

    try {
      // API cập nhật trạng thái đơn hàng
      await fetchApi(`/admin/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(
        `Cập nhật trạng thái đơn hàng #${orderId
          .slice(-6)
          .toUpperCase()} thành công.`
      );
      fetchOrders(pagination.page); // Tải lại trang hiện tại
    } catch (error) {
      toast.error(error.message || "Cập nhật trạng thái thất bại.");
    }
  };

  if (loading)
    return <div className="text-center py-10">Đang tải đơn hàng...</div>;

  const formatCurrency = (amount) => amount.toLocaleString("vi-VN") + " ₫";

  return (
    <div>
      <div className="mb-4">
        <span className="font-medium text-gray-600">
          Tổng cộng: {pagination.total} đơn hàng
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã ĐH
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày đặt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{order._id.slice(-6).toUpperCase()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{order.user.name}</div>
                  <div className="text-xs text-gray-500">
                    {order.user.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                  {formatCurrency(order.totalAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      STATUS_COLORS[order.status]
                    }`}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <select
                    defaultValue={order.status}
                    onChange={(e) =>
                      handleUpdateStatus(order._id, e.target.value)
                    }
                    className="border border-gray-300 rounded-md p-1 text-sm"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
