import CONFIG from "./config";
const BASE_URL = CONFIG.BASE_URL;

// ================= Products =================
export const fetchProducts = async () => {
  const res = await fetch(`${BASE_URL}/api/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return await res.json();
};

export const addProduct = async (product) => {
  const res = await fetch(`${BASE_URL}/api/admin/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Failed to add product");
  return await res.json();
};

export const deleteProduct = async (id) => {
  const res = await fetch(`${BASE_URL}/api/admin/products/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete product");
  return await res.json();
};

export const stockIn = async (id, qty) => {
  const res = await fetch(`${BASE_URL}/api/admin/products/${id}/stock`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qty }),
  });
  if (!res.ok) throw new Error("Failed to update stock");
  return await res.json();
};

// ================= Sales / POS =================
// Updated to include paymentMethod
export const recordSale = async (items, total, paymentMethod) => {
  const res = await fetch(`${BASE_URL}/api/sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, total, paymentMethod }),
  });
  if (!res.ok) throw new Error("Failed to record sale");
  return await res.json();
};

export const fetchSales = async () => {
  const res = await fetch(`${BASE_URL}/api/sales`);
  if (!res.ok) throw new Error("Failed to fetch sales");
  return await res.json();
};
