# Import Sản Phẩm từ CSV

## Cách sử dụng

### 1. Chuẩn bị file CSV

Copy file `neymar_50_products_with_images.csv` vào folder này (`backend/data-import/`)

### 2. Cài đặt package (nếu chưa có)

```bash
cd backend
npm install csv-parser
```

### 3. Chạy script import

```bash
cd backend/data-import
node import-products.js
```

## Format CSV được hỗ trợ

Script sẽ tự động đọc các cột sau (không phân biệt hoa thường):

| Tên cột | Bắt buộc | Mô tả |
|---------|----------|-------|
| `name` hoặc `Name` hoặc `Product Name` | ✅ Có | Tên sản phẩm |
| `price` hoặc `Price` | ✅ Có | Giá sản phẩm (số) |
| `description` hoặc `Description` | ⚠️ Không | Mô tả sản phẩm |
| `stock` hoặc `Stock` | ⚠️ Không | Số lượng tồn kho (mặc định: 100) |
| `sizes` | ⚠️ Không | Các size, phân cách bằng dấu phẩy (VD: 39,40,41,42) |
| `colors` | ⚠️ Không | Các màu, phân cách bằng dấu phẩy |
| `tags` | ⚠️ Không | Các tag, phân cách bằng dấu phẩy |

## Lưu ý

- **URL ảnh**: Script hiện tại KHÔNG import URL ảnh. Bạn cần thêm ảnh sau bằng cách:
  - Vào trang admin
  - Hoặc chạy script riêng để cập nhật ảnh
  
- **Category và Brand**: Mặc định là `null`. Bạn cần:
  - Tạo category và brand trước
  - Sau đó cập nhật sản phẩm để gán category/brand

- **Xóa sản phẩm cũ**: Nếu muốn xóa toàn bộ sản phẩm cũ trước khi import, bỏ comment dòng này trong file `import-products.js`:
  ```javascript
  await Product.deleteMany({});
  ```

## Kiểm tra kết quả

Sau khi import xong, bạn có thể:

1. **Kiểm tra qua MongoDB**:
   ```bash
   mongo webdemo-thsport
   db.products.count()
   db.products.find().limit(5)
   ```

2. **Kiểm tra qua API**:
   ```bash
   curl http://localhost:5000/api/products
   ```

3. **Kiểm tra qua website**: Vào trang danh sách sản phẩm

## Troubleshooting

### Lỗi "Module not found: csv-parser"
```bash
cd backend
npm install csv-parser
```

### Lỗi "File CSV không tồn tại"
- Kiểm tra file `neymar_50_products_with_images.csv` có trong folder `backend/data-import/` không
- Kiểm tra tên file có đúng không (phân biệt hoa thường trên Linux/Mac)

### Lỗi "MongoDB connection error"
- Kiểm tra MongoDB có đang chạy không
- Kiểm tra chuỗi kết nối trong file `.env`

### Sản phẩm bị trùng
- Script sẽ thêm tất cả sản phẩm mỗi lần chạy
- Nếu muốn tránh trùng, xóa sản phẩm cũ trước (bỏ comment dòng `deleteMany`)
