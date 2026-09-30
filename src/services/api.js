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
