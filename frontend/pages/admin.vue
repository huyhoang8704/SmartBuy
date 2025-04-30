<template>
  <div class="w-full h-full">
    <div
      class="tableauPlaceholder"
      id="tableauViz"
      ref="tableauContainer"
      style="position: relative">
      <noscript>
        <a href="#">
          <img
            alt="Dashboard01"
            src="https://public.tableau.com/static/images/Ai/Airline_DV/Dashboard01/1_rss.png"
            style="border: none" />
        </a>
      </noscript>
      <object class="tableauViz" style="display: none">
        <param name="host_url" value="https%3A%2F%2Fpublic.tableau.com%2F" />
        <param name="embed_code_version" value="3" />
        <param name="site_root" value="" />
        <param name="name" value="Airline_DV/Dashboard01" />
        <param name="tabs" value="no" />
        <param name="toolbar" value="yes" />
        <param
          name="static_image"
          value="https://public.tableau.com/static/images/Ai/Airline_DV/Dashboard01/1.png" />
        <param name="animate_transition" value="yes" />
        <param name="display_static_image" value="yes" />
        <param name="display_spinner" value="yes" />
        <param name="display_overlay" value="yes" />
        <param name="display_count" value="yes" />
        <param name="language" value="en-US" />
      </object>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
});
import { onMounted, ref } from "vue";

const tableauContainer = ref(null);

onMounted(() => {
  const divElement = tableauContainer.value;
  const vizElement = divElement.getElementsByTagName("object")[0];

  if (divElement.offsetWidth > 800) {
    vizElement.style.width = "1600px";
    vizElement.style.height = "927px";
  } else if (divElement.offsetWidth > 500) {
    vizElement.style.width = "1600px";
    vizElement.style.height = "927px";
  } else {
    vizElement.style.width = "100%";
    vizElement.style.height = "2027px";
  }

  const scriptElement = document.createElement("script");
  scriptElement.src = "https://public.tableau.com/javascripts/api/viz_v1.js";
  vizElement.parentNode.insertBefore(scriptElement, vizElement);
});
</script>

<style scoped></style>
