const Product = require("../models/Product");

exports.getAll = async (req, res) => {
  const { q, categoria } = req.query;
  const filter = {};

  if (q) filter.nombre = { $regex: q, $options: "i" };
  if (categoria) filter.categoria = categoria;

  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
};

exports.getById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Producto no encontrado" });
  res.json(product);
};

exports.create = async (req, res) => {
  const { nombre, precio, stock, categoria, imagenUrl } = req.body;

  if (!nombre || typeof nombre !== "string") {
    return res.status(400).json({ message: "nombre es requerido" });
  }

  const p = Number(precio);
  const s = Number(stock);

  if (!Number.isFinite(p) || p <= 0) return res.status(400).json({ message: "precio debe ser > 0" });
  if (!Number.isFinite(s) || s < 0) return res.status(400).json({ message: "stock debe ser >= 0" });

  const product = await Product.create({
    nombre,
    precio: p,
    stock: s,
    categoria: categoria ?? "General",
    imagenUrl: imagenUrl ?? ""
  });

  res.status(201).json(product);
};

exports.update = async (req, res) => {
 
  if (req.body.precio !== undefined) {
    const p = Number(req.body.precio);
    if (!Number.isFinite(p) || p <= 0) return res.status(400).json({ message: "precio debe ser > 0" });
  }
  if (req.body.stock !== undefined) {
    const s = Number(req.body.stock);
    if (!Number.isFinite(s) || s < 0) return res.status(400).json({ message: "stock debe ser >= 0" });
  }

  const updated = await Product.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      ...(req.body.precio !== undefined ? { precio: Number(req.body.precio) } : {}),
      ...(req.body.stock !== undefined ? { stock: Number(req.body.stock) } : {})
    },
    { new: true }
  );

  if (!updated) return res.status(404).json({ message: "Producto no encontrado" });
  res.json(updated);
};

exports.remove = async (req, res) => {
  const deleted = await Product.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Producto no encontrado" });
  res.json({ message: "Producto eliminado" });
};