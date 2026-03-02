const Product = require("../models/Product");
const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "items es requerido y debe tener al menos 1 elemento" });
  }

  for (const it of items) {
    const cantidad = Number(it.cantidad);
    if (!it.productoId || !Number.isFinite(cantidad) || cantidad < 1) {
      return res.status(400).json({ message: "Cada item requiere productoId y cantidad >= 1" });
    }
  }

  const productIds = items.map((i) => i.productoId);
  const products = await Product.find({ _id: { $in: productIds } });

  if (products.length !== productIds.length) {
    return res.status(400).json({ message: "Uno o más productos no existen" });
  }

  const byId = new Map(products.map((p) => [String(p._id), p]));

  const orderItems = [];
  let total = 0;

  for (const it of items) {
    const p = byId.get(String(it.productoId));
    const cantidad = Number(it.cantidad);

    if (p.stock < cantidad) {
      return res.status(400).json({
        message: `Stock insuficiente para ${p.nombre}. Disponible: ${p.stock}`
      });
    }

    const subtotal = p.precio * cantidad;
    total += subtotal;

    orderItems.push({
      productoId: p._id,
      nombre: p.nombre,
      precio: p.precio,
      cantidad,
      subtotal
    });
  }


  for (const oi of orderItems) {
    await Product.findByIdAndUpdate(oi.productoId, { $inc: { stock: -oi.cantidad } });
  }

  const order = await Order.create({
    items: orderItems,
    total,
    estado: "pagada"
  });

  return res.status(201).json(order);
};

exports.getOrders = async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
};