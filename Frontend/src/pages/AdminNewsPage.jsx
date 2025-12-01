// Frontend/src/pages/AdminNewsPage.jsx
import React from "react";

export default function AdminNewsPage() {
  return (
    <div className="py-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Quản lý Tin tức/Blog
      </h2>
      <p className="text-gray-600">
        Sử dụng API /news để quản lý CRUD bài viết (title, content, tags).
      </p>
    </div>
  );
}
