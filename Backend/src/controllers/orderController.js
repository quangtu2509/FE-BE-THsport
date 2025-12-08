const Order = require("../models/Order");
const Cart = require("../models/Cart");

exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      total,
      paymentMethod = "cod",
      shippingAddress,
      notes,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Items không thể rỗng" });
    }

    if (!total || total < 0) {
      return res.status(400).json({ error: "Total phải hợp lệ" });
    }

    // Create order with snapshot of items
    const order = new Order({
      user: req.user.id,
      items,
      total,
      paymentMethod,
      shippingAddress,
      notes,
      status: "pending",
    });

    await order.save();

    // Clear cart after order created
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = { user: req.user.id };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      orders,
      pagination: {
        currentPage: Number(page),
        totalPages,
        total,
        limit: Number(limit),
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if order belongs to user (unless admin)
    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Không có quyền truy cập" });
    }

    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "shipping",
      "completed",
      "cancelled",
    ];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Status không hợp lệ" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if order belongs to user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Không có quyền xóa" });
    }

    // Only allow deleting pending orders
    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Chỉ có thể xóa đơn hàng chờ xác nhận" });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted successfully", id: req.params.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getOrderHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find({ user: req.user.id, status: "completed" })
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments({
      user: req.user.id,
      status: "completed",
    });
    const totalPages = Math.ceil(total / limit);

    res.json({
      orders,
      pagination: {
        currentPage: Number(page),
        totalPages,
        total,
        limit: Number(limit),
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.lookupOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // 1. Chuẩn hóa input: Loại bỏ '#' và chuyển sang chữ hoa
    const lookupKey = orderId.replace(/^#/, "").toUpperCase();
    const isObjectId = /^[0-9A-F]{24}$/i.test(lookupKey); // 24 ký tự (ID đầy đủ)
    const isShortHex = /^[0-9A-F]{6}$/i.test(lookupKey); // 6 ký tự (ID rút gọn)

    let order;

    if (isObjectId) {
      // TRƯỜNG HỢP A: ID MongoDB ĐẦY ĐỦ
      order = await Order.findById(lookupKey).select("-user");
    }

    if (!order && isShortHex) {
      // TRƯỜNG HỢP B: ID RÚT GỌN (6 KÝ TỰ HEX)
      // Dùng Aggregation Pipeline để so khớp 6 ký tự cuối của ObjectId
      const orders = await Order.aggregate([
        {
          $match: {
            // So khớp 6 ký tự cuối của _id.toString() với lookupKey
            $expr: {
              $eq: [
                // Lấy 6 ký tự cuối của ID (chuyển sang HOA để so sánh)
                {
                  $substrCP: [
                    { $toUpper: { $toString: "$_id" } },
                    { $subtract: [{ $strLenCP: { $toString: "$_id" } }, 6] },
                    6,
                  ],
                },
                lookupKey, // Đã được chuẩn hóa là HOA
              ],
            },
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 1 },
      ]);
      order = orders[0];
    }

    if (!order && !isObjectId) {
      // TRƯỜNG HỢP C: SĐT/TÊN (Hoặc ID rút gọn không tìm thấy bằng Aggregation)
      // Dùng findOne với regex cho SĐT/Tên/Mã đơn hàng không phải hex
      order = await Order.findOne({
        shippingAddress: { $regex: lookupKey, $options: "i" },
      })
        .select("-user")
        .sort("-createdAt");
    }

    if (!order) {
      // Trả về lỗi 404 nếu không tìm thấy sau tất cả các lần thử
      return res.status(404).json({
        error:
          "Không tìm thấy đơn hàng. Vui lòng kiểm tra lại Mã đơn hàng hoặc SĐT.",
      });
    }

    // 2. Map dữ liệu
    const orderToMap = order.toObject ? order.toObject() : order;

    const lookupData = {
      id: orderToMap._id,
      date: orderToMap.createdAt,
      status: orderToMap.status,
      total: orderToMap.total,
      items: orderToMap.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        imageUrl: item.image,
        price: item.price,
      })),
      shippingAddress: orderToMap.shippingAddress.split(",")[0],
      createdAt: orderToMap.createdAt,
    };

    res.json(lookupData);
  } catch (err) {
    console.error("Lỗi tra cứu:", err);
    res.status(400).json({
      error: err.message || "Lỗi không xác định khi tra cứu đơn hàng.",
    });
  }
};
