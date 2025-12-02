// src/pages/ProductListPage.jsx (Đã sửa đổi)
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
// import { allProductsData } from "../data/products.js"; // ĐÃ BỎ: Không dùng mock data
import ProductSidebar from "../components/ProductSidebar.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import Pagination from "../components/Pagination.jsx";
import { fetchApi, buildQueryParams } from "../utils/api"; // THÊM buildQueryParams

// Cài đặt số lượng sản phẩm mỗi trang
const PRODUCTS_PER_PAGE = 12; // Đã đổi từ 18 sang 12 để phù hợp với mặc định Backend

// Hàm ánh xạ tên sắp xếp Frontend sang trường sort của Backend
const SORT_MAPPING = {
  "Sản phẩm nổi bật": "-createdAt",
  "Giá: Tăng dần": "price",
  "Giá: Giảm dần": "-price",
  "Tên: A-Z": "name",
  "Tên: Z-A": "-name",
  "Mới nhất": "-createdAt", // Backend dùng -createdAt
  "Cũ nhất": "createdAt",
};

// Hàm trợ giúp để chuyển khoảng giá sang min/maxPrice (Dùng trên Frontend)
function getPriceQuery(activePriceFilters) {
  let minPrice, maxPrice;
  // Logic đơn giản: chỉ lấy min/max từ filter đầu tiên được chọn
  const range = activePriceFilters[0];

  if (range === "Dưới 1,000,000₫") maxPrice = 1000000;
  if (range === "1,000,000₫ - 2,000,000₫") {
    minPrice = 1000000;
    maxPrice = 2000000;
  }
  if (range === "2,000,000₫ - 3,000,000₫") {
    minPrice = 2000000;
    maxPrice = 3000000;
  }
  if (range === "3,000,000₫ - 4,000,000₫") {
    minPrice = 3000000;
    maxPrice = 4000000;
  }
  if (range === "Trên 4,000,000₫") minPrice = 4000000;

  return { minPrice, maxPrice };
}

export default function ProductListPage() {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const brandFromUrl = searchParams.get("brand"); // Lấy brand từ query params
  
  const [sortOrder, setSortOrder] = useState("Sản phẩm nổi bật");

  const [activeFilters, setActiveFilters] = useState({
    brands: [],
    prices: [],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [productsData, setProductsData] = useState({
    products: [],
    totalPages: 1,
    total: 0,
    categoryName: "Đang tải...",
    categoryObject: null, // Lưu trữ object category/brand để dùng ID
  });
  const [loading, setLoading] = useState(true);

  // 1. Fetch Categories/Brands để lấy ID (Frontend dùng Slug, Backend dùng ID)
  const fetchCategoryData = useCallback(async () => {
    try {
      if (!categoryId || categoryId === "tat-ca") {
        return { categoryId: null, pageTitle: "Tất Cả Sản Phẩm" };
      }

      // Tạm thời bỏ qua lookup slug -> ID vì Backend không có endpoint này.
      // Đây là điểm cần cải thiện trong Backend. Hiện tại, ta sẽ giả lập
      // rằng categoryId là slug và cố gắng lấy tên hiển thị.
      // Trong một ứng dụng thật, nếu categoryId là slug, ta sẽ gọi:
      // await fetchApi(`/categories/slug/${categoryId}`);

      // Dựa trên mock data cũ, ta sẽ cố gắng hiển thị tên hợp lý
      return {
        categoryId: null, // Không có ID để truyền cho API
        pageTitle: categoryId.toUpperCase().replace(/-/g, " "),
      };
    } catch (e) {
      return { categoryId: null, pageTitle: "Không tìm thấy danh mục" };
    }
  }, [categoryId]);

  // 2. HÀM GỌI API CHÍNH
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const categoryInfo = await fetchCategoryData();

    // Ánh xạ filter giá sang minPrice, maxPrice
    const { minPrice, maxPrice } = getPriceQuery(activeFilters.prices);

    // Xử lý brand: Ưu tiên brand từ URL, sau đó mới đến filter
    let brandFilter = activeFilters.brands;
    if (brandFromUrl && !activeFilters.brands.includes(brandFromUrl)) {
      brandFilter = [brandFromUrl, ...activeFilters.brands];
    }

    // Xây dựng Query Params
    const params = {
      page: currentPage,
      limit: PRODUCTS_PER_PAGE,
      // category: categoryInfo.categoryId, // Đang tạm thời không dùng ID
      brand: brandFilter.length > 0 ? brandFilter : undefined, // Backend có thể nhận mảng
      minPrice: minPrice,
      maxPrice: maxPrice,
      sort: SORT_MAPPING[sortOrder] || SORT_MAPPING["Sản phẩm nổi bật"],
      // search: // Thêm search query nếu có
    };

    const queryString = buildQueryParams(params);

    try {
      const response = await fetchApi(`/products?${queryString}`);

      // Chuyển đổi dữ liệu từ Backend sang Frontend format (cần ít nhất ID, name, price)
      const products = response.products.map((p) => ({
        id: p._id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        brand: p.brand?.name,
        imageUrl:
          p.images?.length > 0
            ? p.images[0]
            : "https://via.placeholder.com/300",
      }));

      // Xác định tên trang hiển thị
      let pageTitle = categoryInfo.pageTitle;
      if (brandFromUrl) {
        // Nếu lọc theo brand, hiển thị tên brand
        pageTitle = `Sản phẩm ${brandFromUrl.toUpperCase().replace(/-/g, " ")}`;
      }

      setProductsData({
        products: products,
        totalPages: response.pagination.totalPages,
        total: response.pagination.total,
        categoryName: pageTitle,
        categoryObject: categoryInfo.categoryObject,
      });
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
      setProductsData((prev) => ({
        ...prev,
        products: [],
        totalPages: 1,
        total: 0,
      }));
    } finally {
      setLoading(false);
    }
  }, [categoryId, currentPage, sortOrder, activeFilters, fetchCategoryData, brandFromUrl]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 3. Hàm xử lý khi filter thay đổi (Giữ nguyên logic reset về trang 1)
  const handleFilterChange = (filterType, value) => {
    setActiveFilters((prevFilters) => {
      const currentFilterValues = prevFilters[filterType];
      let newFilterValues;
      if (currentFilterValues.includes(value)) {
        newFilterValues = currentFilterValues.filter((item) => item !== value);
      } else {
        newFilterValues = [...currentFilterValues, value];
      }
      return {
        ...prevFilters,
        [filterType]: newFilterValues,
      };
    });
    // Reset về trang 1 khi lọc
    setCurrentPage(1);
  };

  // Xử lý khi Product List đang tải
  if (loading) {
    return (
      <div className="container w-[90%] max-w-[1000px] mx-auto mt-10 py-20 text-center">
        <h1 className="text-3xl font-bold text-primary">
          Đang tải danh sách sản phẩm...
        </h1>
      </div>
    );
  }

  // Nếu không tìm thấy danh mục (khi categoryId là tên không hợp lệ)
  if (productsData.categoryName === "Không tìm thấy danh mục") {
    return (
      <div className="container w-[90%] max-w-[1000px] mx-auto mt-10 py-20 text-center">
        <h1 className="text-3xl font-bold">404 - Không tìm thấy danh mục</h1>
        <Link
          to="/"
          className="text-lg text-primary hover:underline mt-4 block"
        >
          Quay về Trang chủ
        </Link>
      </div>
    );
  }

  // (Phần render đã cập nhật)
  return (
    <div className="container w-[90%] max-w-[1400px] mx-auto mt-10 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">
        {productsData.categoryName} ({productsData.total} sản phẩm)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Cột Trái (Sidebar) */}
        <div className="lg:col-span-1">
          <ProductSidebar
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Cột Phải (Nội dung chính) */}
        <div className="lg:col-span-3">
          <ProductGrid
            products={productsData.products}
            sortOrder={sortOrder}
            setSortOrder={(value) => {
              setSortOrder(value);
              setCurrentPage(1); // Reset về trang 1 khi sắp xếp
            }}
          />

          {productsData.total > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={productsData.totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
          {productsData.total === 0 && (
            <p className="text-center text-xl py-10">
              Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
