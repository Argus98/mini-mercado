const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productoId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    nombre: { type: String, required: true },
    precio: { type: Number, required: true, min: 0.01 },
    cantidad: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0.01 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true, min: 0.01 },
    estado: { type: String, enum: ["pagada", "pendiente"], default: "pagada" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);