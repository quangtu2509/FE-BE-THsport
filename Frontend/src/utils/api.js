// Frontend/src/utils/api.js
export const API_BASE_URL = "http://localhost:5000/api";

/**
 * Hàm trợ giúp để gọi API và xử lý lỗi/token
 * @param {string} endpoint - Ví dụ: "/auth/login"
 * @param {object} options - Các tùy chọn fetch
 */
export async function fetchApi(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    // Thêm JWT Token vào header Authorization
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok && response.status !== 304) {
    // Đọc lỗi từ response body của Backend
    const errorData = await response
      .json()
      .catch(() => ({ message: "Lỗi không xác định" }));
    const error = new Error(errorData.error || errorData.message || "Lỗi mạng");
    error.status = response.status;
    throw error;
  }

  // Trả về null nếu không có nội dung (ví dụ: DELETE, POST/204)
  if (
    response.status === 204 ||
    response.status === 304 ||
    response.headers.get("content-length") === "0"
  ) {
    return null; // Trả về null để tránh lỗi parse JSON trên body rỗng
  }

  return response.json();
}

export function buildQueryParams(params) {
  const query = new URLSearchParams();
  for (const key in params) {
    // Chỉ thêm vào nếu giá trị không rỗng hoặc không phải null
    if (
      params[key] !== null &&
      params[key] !== undefined &&
      params[key] !== ""
    ) {
      // Xử lý mảng (ví dụ: filter theo nhiều brand)
      if (Array.isArray(params[key])) {
        params[key].forEach((value) => query.append(key, value));
      } else {
        query.append(key, params[key]);
      }
    }
  }
  return query.toString();
}
