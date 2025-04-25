export const useTrackBehavior = async (
  action: "view" | "search" | "addtocart" | "transaction",
  payload: Record<string, any>
): Promise<boolean> => {
  let success = false;
  const response = await $fetch("http://localhost:4000/behavior/track", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
    body: {
      action,
      userId: localStorage.getItem("userId"),
      ...payload,
    },
    onResponse({ response }) {
      console.log(response);
      if (response.status !== 201) {
        success = false;
      } else {
        success = true;
      }
    },
  });

  return success;
};
