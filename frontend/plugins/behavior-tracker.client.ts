const VALID_ACTIONS = ["view", "search", "addtocart", "transaction"] as const;
type ValidAction = (typeof VALID_ACTIONS)[number];
export default defineNuxtPlugin((nuxtApp) => {
  const behaviorQueue: Array<{ action: string; payload: Record<string, any> }> =
    [];
  let pageEnterTime: number | null = null;
  let previousPage: string | null = null;

  const trackBehavior = async (
    action: string,
    payload: Record<string, any> = {}
  ) => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) return;

    const fullPayload = {
      action,
      userId,
      ...payload,
    };

    if (VALID_ACTIONS.includes(action as ValidAction)) {
      try {
        const response = await $fetch(
          `${process.env.SERVER_URL || "http://localhost:4000"}/behavior/track`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            body: fullPayload,
          }
        );
      } catch (error) {
        console.error("[$trackBehavior] Error sending behavior:", error);
      }
    } else {
      behaviorQueue.push({ action, payload: fullPayload });
      console.debug("⚠️ Collected (not sent):", fullPayload);
    }
  };

  // Log time spent on page (not sent to backend)
  if (process.client) {
    const router = useRouter();

    router.beforeEach((_to, _from) => {
      if (pageEnterTime && previousPage) {
        const timeSpent = Date.now() - pageEnterTime;
        console.log(
          `[🕒] Time spent on ${previousPage}: ${(timeSpent / 1000).toFixed(
            2
          )}s`
        );
      }
    });

    router.afterEach((to) => {
      pageEnterTime = Date.now();
      previousPage = to.fullPath;
    });
  }

  nuxtApp.provide("trackBehavior", trackBehavior);
});
