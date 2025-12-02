// src/context/AuthContext.jsx (Đã sửa đổi)
import React, { createContext, useState, useContext, useEffect } from "react";
import { fetchApi } from "../utils/api";
import { toast } from "react-toastify";

const AuthContext = createContext();

// Hàm lấy trạng thái đăng nhập ban đầu từ localStorage
const getInitialUser = () => {
  try {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (user && token) {
      return JSON.parse(user);
    }
  } catch (e) {
    console.error("Failed to load user from local storage", e);
  }
  return null;
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(getInitialUser);

  // Dùng useCallback để tránh re-render không cần thiết
  const login = async (email, password) => {
    try {
      const data = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // Lưu token và user vào localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setCurrentUser(data.user);
      return data.user; // Trả về user để LoginPage có thể kiểm tra role
    } catch (error) {
      // Ném lỗi để component LoginPage có thể bắt và hiển thị toast
      throw new Error(error.message || "Đăng nhập thất bại.");
    }
  };

  const register = async (name, email, password) => {
    try {
      // Backend cần username, nên dùng email làm username tạm thời
      await fetchApi("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, username: email, password }),
      });
      return true;
    } catch (error) {
      throw new Error(error.message || "Đăng ký thất bại.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    // Không cần gọi API logout, chỉ cần xóa token client-side
    toast.info("Đã đăng xuất.");
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  return useContext(AuthContext);
};
