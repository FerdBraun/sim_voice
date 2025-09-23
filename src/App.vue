<template>
  <div id="app">
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>


// Навигационные методы

</script>

<style scoped>
#app{
  padding:0 !important;
}
</style>