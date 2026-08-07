<template>
  <q-layout view="lHh Lpr lFf">
    <AppHeader :show-menu-button="false" />

    <q-page-container>
      <router-view />
    </q-page-container>

    <MobileBottomTabs />
  </q-layout>
</template>

<script setup lang="ts">
import AppHeader from "./components/AppHeader.vue";
import MobileBottomTabs from "./components/MobileBottomTabs.vue";
</script>
