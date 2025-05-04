export const useSingleProduct = async ({ slug = "" }: { slug?: string }) => {
  const serverUrl = process.env.SERVER_URL || "http://localhost:4000";

  const { data, error } = await useFetch(`${serverUrl}/product/${slug}`, {
    onResponse({ response }) {
      console.log(response._data);
    },
    onRequestError({ request }) {
      console.log("Request Error:", request.toString());
    },
  });

  return { data };
};
