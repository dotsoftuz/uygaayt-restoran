import api from './api';

export const fetchStoreProducts = async ({
  page = 1,
  limit = 20,
  search = '',
  status,
  categoryId,
} = {}) => {
  const payload = {
    page,
    limit,
  };

  if (search) {
    payload.search = search;
  }

  if (typeof status === 'boolean') {
    payload.isActive = status;
  }

  if (categoryId) {
    payload.categoryId = categoryId;
  }

  return api.post('/product/paging', payload);
};

export const createStoreProduct = async (data) => {
  return api.post('/product/create', data);
};

export const updateStoreProduct = async (data) => {
  return api.put('/product/update', data);
};

export const deleteStoreProduct = async (id) => {
  return api.delete(`/product/delete/${id}`);
};

export const getStoreProductById = async (id) => {
  return api.get(`/product/get-by-id/${id}`);
};

export const fetchCategories = async () => {
  // store admin backend may expose category paging via POST /category/paging
  // default to first page with high limit to populate select box
  return api.post('/category/paging', {
    page: 1,
    limit: 100,
  });
};




