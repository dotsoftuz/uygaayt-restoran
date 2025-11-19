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
  // Content-Type header'ni o'rnatmaslik kerak - axios FormData uchun avtomatik o'rnatadi
  // va to'g'ri boundary parametrini qo'shadi
  return api.post('/image/upload', formData);
};

// Helper function to fetch categories for product form
export const fetchCategories = async () => {
  // Store admin backend exposes category paging via POST /store/category/paging
  // Fetch all categories including subcategories
  // Note: MAX_LIMIT is 200 in backend
  // Backend returns only root categories when parentId is not provided
  // So we fetch root categories first, then fetch subcategories for each root category
  const allCategories = [];
  const limit = 200; // MAX_LIMIT is 200 in backend

  // Helper function to normalize ID to string
  const normalizeIdToString = (id) => {
    if (!id) return null;
    if (typeof id === 'object' && id.toString) {
      return id.toString();
    }
    return String(id);
  };

  // First, fetch all root categories (parentId not provided = root categories only)
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await api.post('/store/category/paging', {
      page,
      limit,
      // parentId not provided = root categories only
    });

    let categoriesList = [];
    if (response?.data && Array.isArray(response.data)) {
      categoriesList = response.data;
    } else if (response?.data?.data && Array.isArray(response.data.data)) {
      categoriesList = response.data.data;
    }

    allCategories.push(...categoriesList);

    // Check if there are more pages
    const total = response?.data?.total || response?.total || 0;
    hasMore = categoriesList.length === limit && allCategories.length < total;
    page++;
  }

  // Now fetch subcategories for each root category
  // We'll fetch subcategories recursively for all categories
  const fetchSubcategories = async (parentId) => {
    // Normalize parentId to string for API call
    const parentIdString = normalizeIdToString(parentId);
    if (!parentIdString) return;

    let subPage = 1;
    let subHasMore = true;
    const subCategories = [];

    while (subHasMore) {
      const subResponse = await api.post('/store/category/paging', {
        page: subPage,
        limit,
        parentId: parentIdString,
      });

      let subCategoriesList = [];
      if (subResponse?.data && Array.isArray(subResponse.data)) {
        subCategoriesList = subResponse.data;
      } else if (subResponse?.data?.data && Array.isArray(subResponse.data.data)) {
        subCategoriesList = subResponse.data.data;
      }

      // Only add categories that are not already in allCategories
      const newCategories = subCategoriesList.filter(
        (cat) => {
          const catId = normalizeIdToString(cat._id);
          return !allCategories.some((existing) => {
            const existingId = normalizeIdToString(existing._id);
            return existingId === catId;
          });
        }
      );
      subCategories.push(...newCategories);
      allCategories.push(...newCategories);

      // Check if there are more pages
      const subTotal = subResponse?.data?.total || subResponse?.total || 0;
      subHasMore = subCategoriesList.length === limit && subCategories.length < subTotal;
      subPage++;
    }

    // Recursively fetch subcategories for each subcategory
    for (const subCategory of subCategories) {
      const subCategoryId = normalizeIdToString(subCategory._id);
      if (subCategoryId) {
        await fetchSubcategories(subCategoryId);
      }
    }
  };

  // Fetch subcategories for all root categories
  // Create a copy of root categories to avoid modifying the array while iterating
  const rootCategories = [...allCategories];
  for (const rootCategory of rootCategories) {
    const rootCategoryId = normalizeIdToString(rootCategory._id);
    if (rootCategoryId) {
      await fetchSubcategories(rootCategoryId);
    }
  }

  // Return in the same format as single page request
  return {
    data: {
      total: allCategories.length,
      data: allCategories,
    },
  };
};
