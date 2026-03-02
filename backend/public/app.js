const $productos = document.getElementById("productos");
const $carrito = document.getElementById("carrito");
const $total = document.getElementById("total");
const $count = document.getElementById("carritoCount");
const $msg = document.getElementById("msg");

const $txtBuscar = document.getElementById("txtBuscar");
const $btnBuscar = document.getElementById("btnBuscar");
const $btnComprar = document.getElementById("btnComprar");

let carrito = [];

function setMessage(text, type = "success") {
  $msg.innerHTML = text ? `<div class="alert alert-${type} py-2 mb-0">${text}</div>` : "";
}

function updateCartUI() {
  const total = carrito.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
  const count = carrito.reduce((acc, it) => acc + it.cantidad, 0);

  $total.textContent = total.toFixed(2);
  $count.textContent = String(count);

  if (carrito.length === 0) {
    $carrito.innerHTML = `<div class="text-muted">Carrito vacío.</div>`;
    return;
  }

  $carrito.innerHTML = carrito.map(it => `
    <div class="d-flex justify-content-between align-items-center mb-2">
      <div>
        <div class="fw-semibold">${it.nombre}</div>
        <div class="text-muted">$${it.precio.toFixed(2)} x ${it.cantidad}</div>
      </div>
      <div class="d-flex gap-1">
        <button class="btn btn-sm btn-outline-secondary" data-action="dec" data-id="${it.productoId}">-</button>
        <button class="btn btn-sm btn-outline-secondary" data-action="inc" data-id="${it.productoId}">+</button>
        <button class="btn btn-sm btn-outline-danger" data-action="del" data-id="${it.productoId}">x</button>
      </div>
    </div>
  `).join("");

  $carrito.querySelectorAll("button[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      const idx = carrito.findIndex(x => x.productoId === id);
      if (idx === -1) return;

      if (action === "inc") {
        if (carrito[idx].cantidad + 1 > carrito[idx].stock) {
          setMessage("No hay más stock disponible.", "warning");
          return;
        }
        carrito[idx].cantidad += 1;
      } else if (action === "dec") {
        carrito[idx].cantidad -= 1;
        if (carrito[idx].cantidad <= 0) carrito.splice(idx, 1);
      } else if (action === "del") {
        carrito.splice(idx, 1);
      }

      setMessage("");
      updateCartUI();
    });
  });
}

function productCard(p) {
  const stockTxt = p.stock > 0 ? `Stock: ${p.stock}` : "Sin stock";
  const disabled = p.stock <= 0 ? "disabled" : "";

  return `
  <div class="col-12 col-md-6">
    <div class="card shadow-sm h-100">
      <div class="card-body">
        <div class="d-flex justify-content-between">
          <h5 class="card-title mb-1">${p.nombre}</h5>
          <span class="badge text-bg-secondary">${p.categoria ?? "General"}</span>
        </div>
        <div class="text-muted small mb-2">${stockTxt}</div>
        <div class="fs-5 fw-semibold mb-3">$${Number(p.precio).toFixed(2)}</div>
        <button class="btn btn-primary w-100" ${disabled} data-add="${p._id}">
          Agregar
        </button>
      </div>
    </div>
  </div>`;
}

async function fetchProducts(q = "") {
  const url = q ? `/api/productos?q=${encodeURIComponent(q)}` : "/api/productos";
  const res = await fetch(url);
  const data = await res.json();

  $productos.innerHTML = data.map(productCard).join("");

  document.querySelectorAll("button[data-add]").forEach(btn => {
    btn.addEventListener("click", () => addToCart(btn.dataset.add, data));
  });
}

function addToCart(productId, products) {
  const p = products.find(x => x._id === productId);
  if (!p) return;

  const existing = carrito.find(x => x.productoId === productId);
  if (existing) {
    if (existing.cantidad + 1 > p.stock) {
      setMessage("No hay más stock disponible.", "warning");
      return;
    }
    existing.cantidad += 1;
    existing.stock = Number(p.stock);
  } else {
    carrito.push({
      productoId: p._id,
      nombre: p.nombre,
      precio: Number(p.precio),
      cantidad: 1,
      stock: Number(p.stock)
    });
  }

  setMessage("");
  updateCartUI();
}

async function comprar() {
  if (carrito.length === 0) {
    setMessage("El carrito está vacío.", "warning");
    return;
  }

  const payload = {
    items: carrito.map(it => ({ productoId: it.productoId, cantidad: it.cantidad }))
  };

  const res = await fetch("/api/ordenes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok) {
    setMessage(data?.message || "Error al comprar", "danger");
    return;
  }

  setMessage(`Compra confirmada. Orden: <code>${data._id}</code>`, "success");
  carrito = [];
  updateCartUI();
  await fetchProducts($txtBuscar.value.trim());
}

$btnBuscar.addEventListener("click", () => fetchProducts($txtBuscar.value.trim()));
$txtBuscar.addEventListener("keydown", (e) => {
  if (e.key === "Enter") fetchProducts($txtBuscar.value.trim());
});
$btnComprar.addEventListener("click", comprar);


fetchProducts();
updateCartUI();