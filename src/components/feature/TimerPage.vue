<template>
  <div class="timer-container">
    <!-- ID -->
    <div class="id-row">
      <p>ID (уникальный идентификатор)</p>
      <input v-model="id" type="text" placeholder="Введите ID" :disabled="isRunning" @input="saveToStorage"/>
      <p style="width: fit-content">Комната</p>
      <select v-model="cur_room_number" @change="saveToStorage" :disabled="isRunning" class="input-field">
        <option v-for="room in availableRooms" :key="room.id" :value="room.number">{{ room.number }}</option>
      </select>
    </div>

    <!-- Таймер -->
    <div class="timer-wrapper">
      <div class="timer-circle">
        <span class="timer-text">{{ formattedTime }}</span>
      </div>
    </div>

    <!-- Кнопки управления -->
    <div class="button-group">
      <button @click="startTimer" :disabled="isRunning||id===''||cur_room_number===undefined" class="start-button">
        Запустить таймер ▶
      </button>
      <button @click="stopTimer" :disabled="!isRunning" class="stop-button">
        Остановить таймер ⏸
      </button>
      <button @click="resetTimerHandler" class="reset-button">
        Сбросить таймер 🔄
      </button>
    </div>
  </div>
  <div class="confirmation_window" id="confirmation">
    <p>Вы уверены что хотите завершить экзамен?</p>

    <button  class="start-button" @click="resetTimer">Да</button>
    <button class="reset-button" @click="hideConfirmation">Нет</button>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, onUnmounted, watchEffect} from 'vue'
import Api from "@/utils/api.js";

// Реактивные данные
const id = ref('')
const isRunning = ref(false)
const timeLeft = ref(0) // 10 минут в секундах
const ExamDuration = ref(0) // 10 минут в секундах
const startTime = ref(null)
const intervalId = ref(null)
const rooms = ref([])
const cur_room_number = ref(undefined)

const audioSettings = ref([])
import helper from "@/utils/api.js";

const ApiHelper = helper()


// Ключ для localStorage
const STORAGE_KEY = 'vue-timer-state'
const availableRooms = computed(() => {
  return rooms.value.filter(room => room?.status !== 'busy');
})
// Форматирование времени: MM:SS
const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})
const cur_room_id = computed(()=>{
  const room_object = rooms.value.find(room => room.number === cur_room_number.value)
  return room_object.id
})
// Сохранение состояния в localStorage
const saveToStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    id: id.value,
    room_number: cur_room_number.value,
    timeLeft: timeLeft.value,
    isRunning: isRunning.value,
  }))
}


// Загрузка состояния из localStorage
const loadFromStorage = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const state = JSON.parse(saved)
      id.value = state.id
      timeLeft.value = state.timeLeft || ExamDuration.value
      cur_room_number.value = state.room_number
      if (state.isRunning) {

        startTimer() // возобновляем таймер
      }
    } catch (e) {
      console.error('Ошибка при восстановлении состояния:', e)
      resetTimer() // сброс при ошибке
    }
  }
}

// Запуск таймера
const startTimer = () => {
  if (!isRunning.value) {
    ApiHelper.post("exam/start",{student_id:id.value,room_id:cur_room_id.value})
    isRunning.value = true
    saveToStorage()
    intervalId.value = setInterval(() => {
      audioSettings.value.forEach(audio => {
        if ( parseInt( ExamDuration.value) - parseInt( timeLeft.value) === secondefier(audio.minutes, audio.seconds)) {
          ApiHelper.post('notify/'+ cur_room_number.value + '?file_id='+audio.file_id)

        }

      })
      timeLeft.value--
      saveToStorage()
      if (timeLeft.value <= 0) {
        resetTimer()
      }
    }, 1000)
  }
}
const secondefier = (min, sec) => {
  const minsec = parseInt(min) * 60
  const secsec = parseInt(sec)
  return minsec + secsec
}


// Остановка таймера
const stopTimer = () => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
  isRunning.value = false
  saveToStorage()
}

// Сброс таймера

const resetTimerHandler= () =>{
  const notifier = document.getElementById('confirmation')
  notifier.style.display="flex"
}
const hideConfirmation = () =>{
  document.getElementById('confirmation').style.display='none'
}

const resetTimer = () => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
  isRunning.value = false
  document.getElementById('confirmation').style.display='none'
  timeLeft.value = ExamDuration.value
  id.value = ''
  ApiHelper.post('exam/reset/' + cur_room_id.value)
  localStorage.removeItem(STORAGE_KEY) // очищаем сохранённое состояние
}

// При монтировании — восстанавливаем состояние
onMounted(async () => {
  await gatherData()
  timeLeft.value = ExamDuration.value
  loadFromStorage()

})

// При размонтировании — очищаем интервал
onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
})

//////////////////////////////////////////////////////////////////////////////////////////
const gatherData = async () => {
  let res = await ApiHelper.get('rooms')
  rooms.value = res
  res = await ApiHelper.get('exam/config')
  ExamDuration.value = parseInt(res.duration_minutes) * 60 + parseInt(res.duration_seconds)
  const phrases = res.phrases
  audioSettings.value = phrases.map(phrase => {
        // Парсим JSON-строку
        const parsed = phrase

        return {
          // по умолчанию 0
          minutes: parsed.start_minute || 0,
          seconds: parsed.start_second || 0, // ← добавлено!
          phrase: parsed.text || '',
          file_id: phrase.file_id || undefined,
          saved: true,                 // ← если пришло из API — считаем "сохранённым"
        };
      }
  );



}

</script>

<style scoped>

.confirmation_window{
  width: 20rem;
  height: 20rem;
  background: #aaa ;
  border: 1px solid #ccc;
  border-radius: 1rem;

  flex-direction: column;
  color: black;
  padding: 4rem;
  gap: 1rem;

  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  display: none;
}
.timer-container {
  padding: 20px;
  border: 1px solid #ccc;
  width: fit-content;
  height: fit-content;
  margin: 20px auto;
  font-family: Arial, sans-serif;
}

.id-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 10px;
  margin-bottom: 20px;
}

.id-row p {
  width: 10rem;
  color: #1a1a1a;
  padding-right: 2rem;
}

.id-row input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 10rem;
}

.timer-wrapper {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

.timer-circle {
  width: 150px;
  height: 150px;
  border: 4px solid #aaa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
  justify-content: center;
}

.start-button,
.stop-button,
.reset-button {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.start-button {
  background-color: #4caf50;
  color: white;
}

.start-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.stop-button {
  background-color: #2196f3;
  color: white;
}

.stop-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.input-field {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s ease;
}

.reset-button {
  background-color: #ff5722;
  color: white;
}

.reset-button:hover {
  background-color: #e64a19;
}
</style>