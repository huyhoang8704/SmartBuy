export const useSingleProduct = async ({ slug = "" }: { slug?: string }) => {
  const { data, error } = await useFetch(
    `http://localhost:4000/product/${slug}`,
    {
      onResponse({ response }) {
        console.log(response._data);
      },
      onRequestError({ request }) {
        console.log("Request Error:", request.toString());
      },
    }
  );

  return { data };
};
