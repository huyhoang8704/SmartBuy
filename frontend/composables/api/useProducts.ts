// Update useProducts to accept an object
export const useProducts = ({
  page = 1,
  sortKey = "price",
  sortValue = "desc",
  limit = 8,
  search = "",
}: {
  page?: number;
  sortKey?: string;
  sortValue?: string;
  limit?: number;
  search?: string | number;
}) => {
  const { data, error } = useFetch("http://localhost:4000/", {
    query: {
      page,
      sortKey,
      sortValue,
      limit,
      search,
    },
    immediate: true,
    onResponse({ response }) {
      console.log(response._data);
    },
    onRequestError({ request }) {
      console.log("Request Error:", request.toString());
    },
  });

  if (error.value) {
    console.log("Error fetching products:", error.value);
  }

  return { data };
};
