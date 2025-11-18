import api from './api';

export const fetchStoreCategories = async ({
  page = 1,
  limit = 100,
  parentId = null,
  search = '',
  sortBy = '',
  sortOrder = '',
  filterBy = 'all',
} = {}) => {
  const payload = {
    page,
    limit,
  };

  // Only add parentId if it's a valid value (not null, undefined, or empty string)
  if (parentId !== null && parentId !== undefined && parentId !== '') {
    payload.parentId = parentId;
  }

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

  // Note: filterBy (withProducts/withoutProducts) will be handled client-side
  // as backend doesn't have this filter yet

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

