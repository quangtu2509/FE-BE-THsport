// src/components/ProductCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  // Tạo một link "giả" cho sản phẩm
  // Sau này nó sẽ là /san-pham/ten-san-pham-slug
  const productUrl = `/san-pham/${product.id}`;

  return (
    // Dịch CSS: .product-card
    <div className="product-card bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-2 group">
      <Link to={productUrl} className="block relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-auto aspect-square object-cover"
        />
        {/* Lớp phủ mờ khi hover */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      <div className="p-4 text-center">
        {/* Dịch CSS: .product-name */}
        <h3 className="text-sm font-bold text-gray-800 h-10 mb-2">
          <Link to={productUrl} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>

        {/* Dịch CSS: .product-price */}
        <p className="text-base font-bold text-red-600 mb-3">
          {product.price.toLocaleString("vi-VN")} ₫
        </p>

        {/* Nút thêm vào giỏ */}
        <button
          onClick={() => addToCart(product)}
          className="w-full bg-primary text-white text-sm font-bold uppercase py-2.5 px-4 rounded-md transition-colors hover:bg-primary-dark"
        >
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
