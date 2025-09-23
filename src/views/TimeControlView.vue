<template>
  <div class="admin-layout">
    <!-- Боковая панель -->
    <aside class="sidebar">
      <div class="sidebar-item" :class="{active:isCurrent('inner')}" @click="setCurrent(0)">
        <span class="icon">+</span>
        <span class="label">Настройка внутренней озвучки</span>
      </div>
      <div class="sidebar-item" :class="{active:isCurrent('outer')}" @click="setCurrent(1)">
        <span class="icon">+</span>
        <span class="label">Настройка внешней озвучки</span>
      </div>
      <div class="sidebar-item" :class="{active:isCurrent('outer_controls')}" @click="setCurrent(2)">
        <span class="icon">+</span>
        <span class="label">Управление временем</span>
      </div>
    </aside>

    <!-- Основной контент -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
         <component :is="Component" />
      </router-view>
    </main>
  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue';
import router from "@/router/index.js";
import {useRoute} from "vue-router";
const route = useRoute();
// Состояние подключения


const isCurrent = (id) => {
  return id === route.name;



}
const setCurrent = (id) => {
  switch (id){
    case 0:{
      router.push('inner')
      return
    }
    case 1:{
      router.push('outer')
      return
    }
    case 2:{
      router.push('outer_controls')
      return
    }


  }
  return 0
}

</script>

<style scoped>
/* Общие стили */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', 'SF Pro Display', -apple-system, sans-serif;
  background-color: #f9f9f9;
  color: #1a1a1a;
}

.admin-layout {
  display: flex;
  min-height: 100vh;
  max-height: 100vh;
}

/* Боковая панель */
.sidebar {
  width: 24rem;
  background: #ffffff;
  padding: 24px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #555;
}

.sidebar-item:hover {
  background-color: #f0f0f0;
}

.sidebar-item.active {
  background-color: #e8e8e8;
  color: #1a1a1a;
  font-weight: 600;
}

.sidebar-item .icon {
  margin-right: 12px;
  font-weight: bold;
  color: #666;
}

/* Основной контент */
.main-content {
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  overflow-y: scroll;
  background: #ffffff;
  min-height: 100vh;
}



/* Адаптивность */
@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .main-content {
    padding: 16px;
  }

  .card {
    padding: 24px 16px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .connection-status {
    align-self: flex-end;
  }
}
</style>