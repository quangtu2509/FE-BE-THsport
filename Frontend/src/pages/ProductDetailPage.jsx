// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect, useCallback } from "react"; // Thêm useEffect, useCallback
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
// import { allProductsData } from "../data/products.js"; // ĐÃ BỎ: Không dùng mock data nữa
import { toast } from "react-toastify";
import { fetchApi } from "../utils/api"; // ĐÃ CÓ: Dùng để gọi API

// Import các component con
import ProductGallery from "../components/ProductGallery.jsx";
import ProductCard from "../components/ProductCard"; // Dùng cho "Sản phẩm liên quan"

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();

  // State chính để lưu trữ thông tin sản phẩm từ API
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // State cho các lựa chọn của người dùng (Chỉ giữ một lần khai báo)
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  // 1. HÀM TẢI DỮ LIỆU TỪ API
  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      // Endpoint: /products/:id (ID sản phẩm từ URL)
      const fetchedProduct = await fetchApi(`/products/${id}`);

      // Chuẩn hóa/Ánh xạ dữ liệu từ Backend về cấu trúc Frontend
      const formattedProduct = {
        id: fetchedProduct._id,
        name: fetchedProduct.name,
        price: fetchedProduct.price,
        brand: fetchedProduct.brand?.name || "N/A",
        description: fetchedProduct.description,
        // Sử dụng trường images làm galleryImages
        galleryImages: fetchedProduct.images || [],
        availableSizes: fetchedProduct.availableSizes || [],
      };

      setProduct(formattedProduct);
      // Chọn size đầu tiên làm mặc định nếu có
      if (formattedProduct.availableSizes.length > 0) {
        setSelectedSize(formattedProduct.availableSizes[0]);
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết sản phẩm:", error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // 2. LOGIC TẢI SẢN PHẨM LIÊN QUAN (MOCK ĐỂ TRÁNH LỖI)
  // Trong ứng dụng API hoàn chỉnh, bạn sẽ cần gọi API để lấy sản phẩm liên quan.
  // Hiện tại sử dụng mock đơn giản để tránh lỗi
  const relatedProducts = [
    {
      id: "mock1",
      name: "SP Liên Quan 1",
      price: 1000000,
      imageUrl: product?.galleryImages[0] || "https://via.placeholder.com/300",
    },
    {
      id: "mock2",
      name: "SP Liên Quan 2",
      price: 2000000,
      imageUrl: product?.galleryImages[0] || "https://via.placeholder.com/300",
    },
    {
      id: "mock3",
      name: "SP Liên Quan 3",
      price: 3000000,
      imageUrl: product?.galleryImages[0] || "https://via.placeholder.com/300",
    },
    {
      id: "mock4",
      name: "SP Liên Quan 4",
      price: 4000000,
      imageUrl: product?.galleryImages[0] || "https://via.placeholder.com/300",
    },
  ];

  // 3. Xử lý bộ chọn số lượng
  const handleQuantityChange = (amount) => {
    setQuantity((prev) => Math.max(1, prev + amount)); // Không cho phép < 1
  };

  // 4. Xử lý Thêm vào giỏ (Đã cập nhật để dùng API thông qua Context)
  const handleAddToCart = async () => {
    // Thêm async
    if (!selectedSize) {
      toast.error("Vui lòng chọn size!");
      return;
    }
    if (!product) return;

    // Gọi hàm addToCart trong CartContext. Hàm này sẽ gọi API Backend.
    const success = await addToCart(product, quantity, selectedSize);

    if (success) {
      toast.success(
        `Đã thêm ${quantity} x ${product.name} (Size: ${selectedSize}) vào giỏ!`
      );
    } else {
      // Thất bại thường là do chưa đăng nhập
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
    }
  };

  // 5. Xử lý trạng thái Loading
  if (loading) {
    return (
      <div className="container w-[90%] max-w-[1000px] mx-auto mt-10 py-20 text-center">
        <h1 className="text-3xl font-bold text-primary">
          Đang tải sản phẩm...
        </h1>
      </div>
    );
  }

  // 6. Xử lý nếu không tìm thấy sản phẩm (hoặc lỗi tải)
  if (!product) {
    return (
      <div className="container w-[90%] max-w-[1000px] mx-auto mt-10 py-20 text-center">
        <h1 className="text-3xl font-bold">404 - Không tìm thấy sản phẩm</h1>
        <Link
          to="/"
          className="text-lg text-primary hover:underline mt-4 block"
        >
          Quay về Trang chủ
        </Link>
      </div>
    );
  }

  // 7. Render giao diện
  return (
    <div className="container w-[90%] max-w-[1200px] mx-auto mt-10 py-10">
      {/* === PHẦN CHÍNH: 2 CỘT === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* CỘT TRÁI: GALLERY ẢNH */}
        <div className="md:col-span-1">
          <ProductGallery images={product.galleryImages} />
        </div>

        {/* CỘT PHẢI: THÔNG TIN & LỰA CHỌN */}
        <div className="md:col-span-1">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-3xl font-bold text-red-600 mb-6">
            {product.price.toLocaleString("vi-VN")} ₫
          </p>

          {/* LỰA CHỌN SIZE */}
          <div className="mb-6">
            <label className="block font-bold mb-2">Kích thước:</label>
            <div className="flex flex-wrap gap-2">
              {(product.availableSizes || []).map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`border rounded-md w-14 h-10 transition-all ${
                    selectedSize === size
                      ? "bg-primary text-white border-primary" // Nổi bật size đã chọn
                      : "bg-white text-gray-800 border-gray-300"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* LỰA CHỌN SỐ LƯỢNG */}
          <div className="mb-6">
            <label className="block font-bold mb-2">Số lượng:</label>
            <div className="flex items-center border border-gray-300 rounded-md max-w-[150px]">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="px-5 py-2 text-xl font-bold"
              >
                -
              </button>
              <input
                type="text"
                readOnly
                value={quantity}
                className="w-14 text-center font-bold outline-none"
              />
              <button
                onClick={() => handleQuantityChange(1)}
                className="px-5 py-2 text-xl font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* CÁC NÚT HÀNH ĐỘNG */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleAddToCart}
              className="w-full bg-primary text-white text-lg font-bold uppercase py-4 px-6 rounded-md transition-colors hover:bg-primary-dark"
            >
              Thêm vào giỏ hàng
            </button>
            <button className="w-full bg-dark-color text-white text-lg font-bold uppercase py-4 px-6 rounded-md transition-colors hover:bg-black">
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      {/* === PHẦN DƯỚI: TABS & SẢN PHẨM LIÊN QUAN === */}
      <div className="mt-16">
        {/* Thanh TABS (Mô tả, Bảo hành...) */}
        <div className="border-b border-gray-300 mb-6">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab("description")}
              className={`text-lg font-bold uppercase pb-3 border-b-2 ${
                activeTab === "description"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-600"
              }`}
            >
              Mô tả sản phẩm
            </button>
            <button
              onClick={() => setActiveTab("warranty")}
              className={`text-lg font-bold uppercase pb-3 border-b-2 ${
                activeTab === "warranty"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-600"
              }`}
            >
              Chính sách bảo hành
            </button>
            {/* Thêm các tab khác ở đây */}
          </nav>
        </div>

        {/* Nội dung TABS */}
        <div className="content-tabs">
          {activeTab === "description" && (
            <div className="prose max-w-none">
              <p>{product.description}</p>
            </div>
          )}
          {activeTab === "warranty" && (
            <div className="prose max-w-none">
              <p>Nội dung chính sách bảo hành sẽ được cập nhật tại đây...</p>
            </div>
          )}
        </div>

        {/* SẢN PHẨM LIÊN QUAN */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8 uppercase">
            Sản phẩm liên quan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Sử dụng dữ liệu mock đơn giản để giữ UI không bị lỗi */}
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
