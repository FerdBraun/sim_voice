<script setup>

// Продолжительность экзамена
import {computed, onMounted, ref} from "vue";
const isConnected = ref(false);
// Имитация подключения
const selectedDate = ref("");
const schedules = ref(['sosal?','aboba'])
const cur_schedule = ref({})
import helper from "@/utils/api.js";
const ApiHepler = helper()


onMounted(()=>{
  gatherData()
})

const dateFormatter = computed(()=>{
  if(cur_schedule.value.date){

  const str_date = cur_schedule.value.date
  const [day, month, year] = str_date?.split('.').map(Number);
  const date = new Date(year, month - 1, day);
  const formatted = date.toISOString().split('T')[0];
  console.log(formatted)
  return formatted
    }
  console.log(cur_schedule.value)
  return 0
})
const gatherData = async () =>{
  const res = await ApiHepler.get("schedules")
  schedules.value=res.schedules
}
const start = () =>{
  const res = ApiHepler.post('exam/prep',{specialization: cur_schedule.value.specialization,  date: cur_schedule.value.date})
}
</script>

<template>
      <div class="card">
        <!-- Заголовок и статус -->
        <div class="card-header">
          <h2 class="title">Управление звуковым сопровождением</h2>
        </div>

        <!-- Общая продолжительность экзамена -->

        <!-- Раздел аудионастроек -->
        <div class="audio-section">

          <div class="audio-row">
            <div class="time-inputs">
              <div style="display: flex; justify-content: space-around; width: 19rem; align-items: center">
              <label>Дата </label>
              <input type="date"  disabled v-model="dateFormatter">
                </div>
              <div style="display: flex; justify-content: space-around; width: 19rem; align-items: center">
              <label>Расписание </label>
              <select v-model="cur_schedule" class="input-field">
                <option  style="color: black" v-for="schedule in schedules" :value="schedule" :key="schedule">{{ schedule.specialization}}</option>
              </select>
                </div>
            </div>

            <div class="phrase-field">
              <div style="display: flex; align-items: center">
                <div class="action-icons">
                  <button @click="start" class="icon-btn play">
                    ▶ Запустить
                  </button>
                  <button @click="" class="icon-btn delete">
                    ❚❚ Остановить
                  </button>

                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
</template>

<style scoped>
.card {
  width: 100%;
  background: white;
  height: fit-content;
  padding: 32px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.7);
}

/* Заголовок и статус */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}

/* Аудионастройки */
.audio-section {
  margin-top: 24px;
}

/* Строка аудионастройки */
.audio-row {
  padding-left: 10rem;
  padding-top: 2rem;
  padding-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #fafafa;
  border-radius: 12px;
  margin-bottom: 16px;
  position: relative;
  transition: all 0.2s ease;
}

.audio-row:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.time-inputs {
  color: #1a1a1a;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-bottom: 16px;
}

.phrase-field {
  margin-bottom: 16px;

}

/* Иконки действий */
.action-icons {
  margin-top: 2rem;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.icon-btn {
  width: 9rem;
  height: 2rem;
  border: none;
  border-radius: 10%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.icon-btn.play {
  background: #e3f2fd;
  color: #1976d2;
}

.icon-btn.play:hover {
  background: #bbdefb;
}

.icon-btn.save {
  background: #e8f5e9;
  color: #388e3c;
}

.icon-btn.save:hover {
  background: #c8e6c9;
}

.icon-btn.delete {
  background: #f5f5f5;
  color: coral;
}

.icon-btn.delete:hover {
  background: #eeeeee;
  color: #212121;
}

/* Поля ввода */
.input-field {
  margin-left: 0px;
  width: 10rem;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: #4caf50;
}

.input-field.small {
  width: 70px;
}
</style>