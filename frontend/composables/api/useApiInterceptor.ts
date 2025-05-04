// composables/useApiInterceptor.ts
export const useApiInterceptor = (
  emitMessage: (msg: string, isError?: boolean) => void
) => {
  const { $fetch } = useNuxtApp();

  $fetch.create({
    onResponse({ response }) {
      const message = response._data?.message;
      if (message) emitMessage(message, false);
    },
    onResponseError({ response }) {
      const message =
        response._data?.message || "An unexpected error occurred.";
      emitMessage(message, true);
    },
  });
};
