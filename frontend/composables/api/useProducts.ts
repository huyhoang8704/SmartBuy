export const useProducts = async ({
  page = 1,
  sortKey = null, // Allow null for default
  sortValue = null, // Allow null for default
  limit = 8,
  search = "",
  category = "",
}: {
  page?: number;
  sortKey?: string | null; // Updated type to allow null
  sortValue?: string | null; // Updated type to allow null
  limit?: number;
  search?: string | number;
  category?: string;
}) => {
  console.log("Calling useProducts with:", {
    page,
    sortKey,
    sortValue,
    limit,
    search,
    category,
  });
  const { data, error } = await useFetch("http://localhost:4000/", {
    query: {
      page,
      ...(sortKey && sortValue ? { sortKey, sortValue } : {}), // Exclude sortKey and sortValue if not needed
      limit,
      search,
      category,
    },

    onResponse({ response }) {
      console.log(response._data);
    },
    onRequestError({ request }) {
      console.log("Request Error:", request.toString());
    },
  });

  return { data };
};
