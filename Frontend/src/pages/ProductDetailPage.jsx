// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { fetchApi, buildQueryParams } from "../utils/api";
import ProductGallery from "../components/ProductGallery.jsx";
import ProductCard from "../components/ProductCard";

const RELATED_PRODUCTS_LIMIT = 4;

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();

  // State chính để lưu trữ thông tin sản phẩm từ API
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]); // THÊM: State cho sản phẩm liên quan
  const [loading, setLoading] = useState(true);

  // State cho các lựa chọn của người dùng
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  // 1. HÀM TẢI SẢN PHẨM LIÊN QUAN TỪ API
  const fetchRelatedProducts = useCallback(async (productData) => {
    // Chỉ lấy sản phẩm liên quan nếu có Brand (để lọc cùng hãng)
    if (!productData.brand?.slug) {
      setRelatedProducts([]);
      return;
    }

    // Sử dụng Brand slug để tìm sản phẩm cùng hãng
    const brandSlug = productData.brand.slug;

    // Chuẩn bị tham số truy vấn: Giới hạn + Brand
    const params = {
      limit: RELATED_PRODUCTS_LIMIT + 1, // Lấy dư 1 để lọc sản phẩm hiện tại
      brand: brandSlug,
      // Có thể thêm category: productData.category.slug nếu muốn lọc sâu hơn
    };

    const queryString = buildQueryParams(params);

    try {
      // Gọi API: /products?brand=...&limit=...
      const response = await fetchApi(`/products?${queryString}`);

      // Lọc ra sản phẩm hiện tại và ánh xạ dữ liệu
      const mappedRelated = response.products
        .filter((p) => p._id !== productData.id) // Loại bỏ sản phẩm đang xem
        .slice(0, RELATED_PRODUCTS_LIMIT) // Lấy số lượng cần thiết
        .map((p) => ({
          id: p._id,
          slug: p.slug, // Dữ liệu slug hợp lệ để ProductCard tạo link
          name: p.name,
          price: p.price,
          imageUrl:
            p.images?.length > 0
              ? p.images[0]
              : "https://via.placeholder.com/300",
        }));

      setRelatedProducts(mappedRelated);
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm liên quan:", error);
      setRelatedProducts([]);
    }
  }, []);

  // 2. HÀM TẢI DỮ LIỆU SẢN PHẨM CHÍNH TỪ API
  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      // Endpoint: /products/slug/:slug
      const fetchedProduct = await fetchApi(`/products/slug/${slug}`);

      // Chuẩn hóa/Ánh xạ dữ liệu từ Backend sang cấu trúc Frontend
      const formattedProduct = {
        id: fetchedProduct._id,
        slug: fetchedProduct.slug,
        name: fetchedProduct.name,
        price: fetchedProduct.price,
        // Đảm bảo Brand và Category có slug để dùng cho Related Products
        brand: {
          name: fetchedProduct.brand?.name || "N/A",
          slug: fetchedProduct.brand?.slug,
        },
        category: {
          name: fetchedProduct.category?.name || "N/A",
          slug: fetchedProduct.category?.slug,
        },
        description: fetchedProduct.description,
        galleryImages: fetchedProduct.images || [],
        availableSizes: fetchedProduct.availableSizes || [],
      };

      setProduct(formattedProduct);

      // Chọn size đầu tiên làm mặc định nếu có
      if (formattedProduct.availableSizes.length > 0) {
        setSelectedSize(formattedProduct.availableSizes[0]);
      }

      // KÍCH HOẠT TẢI SẢN PHẨM LIÊN QUAN NGAY LẬP TỨC
      fetchRelatedProducts(formattedProduct);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết sản phẩm:", error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [slug, fetchRelatedProducts]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // --- CÁC LOGIC KHÁC GIỮ NGUYÊN ---
  const handleQuantityChange = (amount) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  const handleAddToCart = async () => {
    if (
      product.availableSizes &&
      product.availableSizes.length > 0 &&
      !selectedSize
    ) {
      toast.error("Vui lòng chọn size!");
      return;
    }
    if (!product) return;

    const success = await addToCart(product, quantity, selectedSize);

    if (success) {
      const sizeText = selectedSize ? ` (Size: ${selectedSize})` : "";
      toast.success(
        `Đã thêm ${quantity} x ${product.name}${sizeText} vào giỏ!`
      );
    } else {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
    }
  };

  // Xử lý trạng thái Loading
  if (loading) {
    return (
      <div className="container w-[90%] max-w-[1000px] mx-auto mt-10 py-20 text-center">
        <h1 className="text-3xl font-bold text-primary">
          Đang tải sản phẩm...
        </h1>
      </div>
    );
  }

  // Xử lý nếu không tìm thấy sản phẩm (FIX: Đây là lý do ảnh 2 của bạn)
  if (!product) {
    return (
      <div className="container w-[90%] max-w-[1000px] mx-auto mt-10 py-20 text-center">
        <h1 className="text-3xl font-bold">404 - Không tìm thấy sản phẩm</h1>
        <p className="text-lg text-gray-600 mb-4">
          Sản phẩm với slug '{slug}' không tồn tại.
        </p>
        <Link
          to="/"
          className="text-lg text-primary hover:underline mt-4 block"
        >
          Quay về Trang chủ
        </Link>
      </div>
    );
  }

  // Render giao diện
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
            {product.price ? product.price.toLocaleString("vi-VN") : "0"} ₫
          </p>

          {/* LỰA CHỌN SIZE */}
          <div className="mb-6">
            <label className="block font-bold mb-2">Kích thước:</label>
            {product.availableSizes && product.availableSizes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {product.availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`border rounded-md w-14 h-10 transition-all ${
                      selectedSize === size
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-800 border-gray-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Sản phẩm này không cần chọn size
              </p>
            )}
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
        {/* Thanh TABS */}
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
          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Sử dụng dữ liệu thực từ API Backend */}
              {relatedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              Không tìm thấy sản phẩm liên quan cùng hãng.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
