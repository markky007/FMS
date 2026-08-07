<template>
  <q-layout view="lHh Lpr lFf">
    <AppHeader :show-menu-button="true" @toggle-left-drawer="leftDrawerOpen = !leftDrawerOpen" />

    <q-drawer v-model="leftDrawerOpen" side="left" overlay behavior="mobile" class="bg-white">
      <DesktopSidebar />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <MobileBottomTabs />
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AppHeader from "./components/AppHeader.vue";
import DesktopSidebar from "./components/DesktopSidebar.vue";
import MobileBottomTabs from "./components/MobileBottomTabs.vue";

const leftDrawerOpen = ref(false);
</script>
