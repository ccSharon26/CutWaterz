import axios from "axios";
import { API_BASE } from "./config";

export const fetchProducts = async () => {
  const res = await axios.get(`${API_BASE}/products`);
  return res.data;
};

export const addProduct = async (product) => {
  const res = await axios.post(`${API_BASE}/admin/products`, product);
  return res.data;
};

export const updateProduct = async (id, product) => {
  const res = await axios.put(`${API_BASE}/admin/products/${id}`, product);
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await axios.delete(`${API_BASE}/admin/products/${id}`);
  return res.data;
};

export const stockIn = async (productId, quantity) => {
  const res = await axios.post(`${API_BASE}/stock-in`, { productId, quantity });
  return res.data;
};

export const fetchSales = async () => {
  const res = await axios.get(`${API_BASE}/sales`);
  return res.data;
};
