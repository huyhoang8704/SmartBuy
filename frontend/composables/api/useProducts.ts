// composables/useProducts.ts

export const useProducts = async (params: {
  page?: number;
  limit?: number;
  sortKey?: string | null;
  sortValue?: string | null;
  search?: string | number;
  category?: string | null;
}) => {
  const serverUrl = process.env.SERVER_URL || "http://localhost:4000";

  return await $fetch(`${serverUrl}`, {
    query: {
      page: params.page,
      limit: params.limit,
      ...(params.sortKey && params.sortValue
        ? { sortKey: params.sortKey, sortValue: params.sortValue }
        : {}),
      search: params.search,
      category: params.category,
    },
  });
};
