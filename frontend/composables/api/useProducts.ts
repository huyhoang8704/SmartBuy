export const useProducts = async ({
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
  console.log("Calling useProducts with:", {
    page,
    sortKey,
    sortValue,
    limit,
    search,
  });
  const { data, error } = await useFetch("http://localhost:4000/", {
    query: {
      page,
      sortKey,
      sortValue,
      limit,
      search,
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
