import api from './api';

export const fetchStoreProducts = async ({
  page = 1,
  limit = 20,
  search = '',
  sortBy = '',
  sortOrder = '',
  categoryId = null,
  filterBy = 'all',
  isActive = null,
  minStock = null,
  stockState = null,
} = {}) => {
  const payload = {
    page,
    limit,
  };

  // Add search if provided
  if (search) {
    payload.search = search;
  }

  // Add sort if provided
  if (sortBy) {
    payload.sortBy = sortBy;
    // Convert 'asc'/'desc' to '1'/'-1' for backend
    payload.sortOrder = sortOrder === 'desc' ? '-1' : '1';
  }

  // Add categoryId if provided
  if (categoryId !== null && categoryId !== undefined && categoryId !== '') {
    payload.categoryId = categoryId;
  }

  // Add isActive filter if provided
  if (typeof isActive === 'boolean') {
    payload.isActive = isActive;
  }

  // Add minStock filter if provided
  if (minStock !== null && minStock !== undefined) {
    payload.minStock = minStock;
  }

  // Add stockState filter if provided
  if (stockState) {
    payload.stockState = stockState; // 'yellowLine' or 'redLine'
  }

  // Note: filterBy (withStock/withoutStock) will be handled client-side
  // as backend doesn't have this filter yet

  return api.post('/store/product/paging', payload);
};

export const createStoreProduct = async (data) => {
  // storeId avtomatik qo'shiladi backend da
  return api.post('/store/product/create', data);
};

export const updateStoreProduct = async (data) => {
  return api.put('/store/product/update', data);
};

export const deleteStoreProduct = async (id) => {
  return api.delete(`/store/product/delete/${id}`);
};

export const getStoreProductById = async (id) => {
  return api.get(`/store/product/get-by-id/${id}`);
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/image/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Helper function to fetch categories for product form
export const fetchCategories = async () => {
  // Store admin backend exposes category paging via POST /store/category/paging
  // default to first page with high limit to populate select box
  return api.post('/store/category/paging', {
    page: 1,
    limit: 100,
  });
};
