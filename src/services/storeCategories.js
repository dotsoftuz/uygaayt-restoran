import api from './api';

export const fetchStoreCategories = async ({
  page = 1,
  limit = 100,
  parentId = null,
} = {}) => {
  const payload = {
    page,
    limit,
  };

  if (parentId) {
    payload.parentId = parentId;
  }

  return api.post('/store/category/paging', payload);
};

export const createStoreCategory = async (data) => {
  return api.post('/store/category/create', data);
};

export const updateStoreCategory = async (data) => {
  return api.put('/store/category/update', data);
};

export const deleteStoreCategory = async (id) => {
  return api.delete(`/store/category/delete/${id}`);
};

export const getStoreCategoryById = async (id) => {
  return api.get(`/store/category/get-by-id/${id}`);
};

export const updateCategoryPositions = async (categoryIds) => {
  return api.put('/store/category/positions', { categoryIds });
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

