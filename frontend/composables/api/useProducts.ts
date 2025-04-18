export const useProducts = () => {
  const { data, error } = useFetch("http://localhost:4000/product", {
    // Ensure immediate fetching
    immediate: true,
    // Handle general errors
    onResponseError({ response }) {
      console.log("API Error:", response._data);
    },
    // Handle request errors
    onRequestError({ request }) {
      console.log("Request Error:", request.toString);
    },
  });

  // Log any errors that occur
  if (error.value) {
    console.log("Error fetching products:", error.value);
  }

  // Return the data reference
  return { data };
};
