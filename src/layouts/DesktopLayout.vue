<template>
  <q-layout view="lHh Lpr lFf">
    <AppHeader @toggle-left-drawer="leftDrawerOpen = !leftDrawerOpen" />

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="260"
      class="bg-grey-1"
    >
      <DesktopSidebar />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AppHeader from "./components/AppHeader.vue";
import DesktopSidebar from "./components/DesktopSidebar.vue";

const leftDrawerOpen = ref(true);
</script>
