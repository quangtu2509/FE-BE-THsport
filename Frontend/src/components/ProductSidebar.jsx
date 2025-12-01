import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchApi } from "../utils/api"; // THÊM fetchApi

// Component con nội bộ để tái sử dụng
function FilterGroup({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold uppercase border-b border-gray-300 pb-2 mb-4">
        {title}
      </h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

// Danh sách Price Ranges không đổi (lọc client-side trong ProductListPage)
const priceRanges = [
  "Dưới 1,000,000₫",
  "1,000,000₫ - 2,000,000₫",
  "2,000,000₫ - 3,000,000₫",
  "3,000,000₫ - 4,000,000₫",
  "Trên 4,000,000₫",
];

export default function ProductSidebar({ activeFilters, onFilterChange }) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Categories và Brands
  const fetchData = useCallback(async () => {
    try {
      // Fetch Categories
      const fetchedCategories = await fetchApi("/categories");
      setCategories(
        fetchedCategories.map((c) => ({
          name: c.name,
          slug: c.slug,
          id: c._id, // Quan trọng: dùng ID cho filtering
        }))
      );

      // Fetch Brands
      const fetchedBrands = await fetchApi("/brands");
      setBrands(
        fetchedBrands.map((b) => ({
          name: b.name,
          slug: b.slug,
          id: b._id, // Quan trọng: dùng ID cho filtering
        }))
      );
    } catch (error) {
      console.error("Lỗi khi tải danh mục/thương hiệu:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    // Không cần loading overlay, chỉ cần hiển thị loading state nhỏ
    return (
      <aside className="w-full text-center text-sm text-gray-500">
        Đang tải bộ lọc...
      </aside>
    );
  }

  return (
    <aside className="w-full">
      {/* 1. Danh mục sản phẩm */}
      <FilterGroup title="Danh mục sản phẩm">
        <Link to="/danh-muc/tat-ca" className="text-sm hover:text-primary">
          TẤT CẢ SẢN PHẨM
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/danh-muc/${cat.slug}`} // Sử dụng slug cho URL
            className="text-sm hover:text-primary"
          >
            {cat.name.toUpperCase()}
          </Link>
        ))}
      </FilterGroup>

      {/* 2. Lọc theo giá (Dùng logic getPriceQuery trên ProductListPage) */}
      <FilterGroup title="Giá">
        {priceRanges.map((range) => (
          <label key={range} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="rounded"
              // Kiểm tra xem range này có đang được chọn không
              checked={activeFilters.prices.includes(range)}
              // Khi thay đổi, cập nhật state của component cha
              onChange={() => onFilterChange("prices", range)}
            />
            {range}
          </label>
        ))}
      </FilterGroup>

      {/* 3. Lọc theo thương hiệu (SỬ DỤNG ID TỪ API) */}
      <FilterGroup title="Thương hiệu">
        {brands.map((brand) => (
          <label key={brand.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="rounded"
              // Quan trọng: Sử dụng ID của Brand để kiểm tra và gửi lên API
              checked={activeFilters.brands.includes(brand.id)}
              // Quan trọng: Gửi ID của Brand lên component cha
              onChange={() => onFilterChange("brands", brand.id)}
            />
            {brand.name}
          </label>
        ))}
      </FilterGroup>
    </aside>
  );
}
