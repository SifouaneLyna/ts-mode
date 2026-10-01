const API_BASE_URL = "https://backend-5anz.onrender.com";
const SITE_SUBDOMAIN = "ts-mode";

export async function getProducts(categoryId) {
  const url = categoryId
    ? `${API_BASE_URL}/products?categoryId=${categoryId}`
    : `${API_BASE_URL}/products`;

  const res = await fetch(url, {
    headers: { "x-site-subdomain": SITE_SUBDOMAIN },
  });

  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function getCategories(parentCategoryId = "null") {
  const res = await fetch(
    `${API_BASE_URL}/categories?parentCategoryId=${parentCategoryId}`,
    {
      headers: { "x-site-subdomain": SITE_SUBDOMAIN },
    },
  );

  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function getAllCategories() {
  const res = await fetch(`${API_BASE_URL}/categories`, {
    headers: { "x-site-subdomain": SITE_SUBDOMAIN },
  });

  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function getProductById(id) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    headers: { "x-site-subdomain": SITE_SUBDOMAIN },
  });

  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function getLeafCategories() {
  const res = await fetch(`${API_BASE_URL}/categories`, {
    headers: { "x-site-subdomain": SITE_SUBDOMAIN },
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  const all = await res.json();

  const parentIds = new Set(all.map((c) => c.parentCategoryId).filter(Boolean));
  return all.filter((c) => !parentIds.has(c._id));
}


async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "x-site-subdomain": SITE_SUBDOMAIN };
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || data.error || "Request failed");
    err.status = res.status;
    throw err;
  }
  return data;
}

export const signup = (body) => request("/auth/signup", { method: "POST", body });
export const login = (body) => request("/auth/login", { method: "POST", body });
export const getDeliveryRates = () => request("/delivery-rates");
export const createOrder = (body, token) =>
  request("/orders", { method: "POST", body, token });
export const getMyOrders = (token) => request("/orders/mine", { token });
export const getMe = (token) => request("/auth/me", { token });
export const updateMe = (body, token) => request("/auth/me", { method: "PATCH", body, token });
export const cancelMyOrder = (id, token) => request(`/orders/${id}/cancel`, { method: "PATCH", token });
export const trackOrder = (body) => request("/orders/track", { method: "POST", body });
export const cancelTrackedOrder = (body) => request("/orders/track/cancel", { method: "POST", body });
