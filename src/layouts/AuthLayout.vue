<template>
  <q-layout view="lHh Lpr lFf" class="auth-layout-container">
    <q-page-container class="full-screen-container flex flex-center">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.auth-layout-container {
  min-height: 100vh;
  width: 100vw;
  background-color: #0f172a;
  overflow: hidden;
}

.full-screen-container {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
