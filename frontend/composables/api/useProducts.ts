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

  const authToken = useAuthStore().isAuthenticated
    ? localStorage.getItem("authToken")
    : null;

  return await $fetch(`${serverUrl}`, {
    headers: {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
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
