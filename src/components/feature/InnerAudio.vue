<script setup>

// Продолжительность экзамена
import {onMounted, ref, watchEffect} from "vue";
import helper from "@/utils/api.js";
import Api from "@/utils/api.js";

const ApiHelper = helper()

const isConnected = ref(false);
// Имитация подключения
onMounted(async () => {
  const res = await ApiHelper.get('status/sber')
  if (res.status ==='ok'){
    isConnected.value = true
  }
  await gatherData()
});
const examDuration = ref({
  duration_seconds: null,
  duration_minutes: null
});

// Аудионастройки
const audioSettings = ref([
  {
    seconds: 0,
    minutes: 0,
    phrase: '',
    file_id: undefined,
    saved: false,
  }
]);

// Добавление новой строки
const addAudioSetting = () => {
  audioSettings.value.push({
    seconds: 0,
    minutes: 0,
    phrase: '',
    file_id: undefined,
    saved: false,
  });
};

// Воспроизведение фразы (заглушка)
const playPhrase = async (index) => {
  console.log(audioSettings.value[index])
  if (!audioSettings.value[index].saved) {
    alert('Сохраните фразу');
    return;
  }
  // Здесь можно интегрировать SpeechSynthesis API
  const arrayBuffer = await ApiHelper.fetchAudio('audio/' + audioSettings.value[index].file_id)
  const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url);
  await audio.play();

};

// Сохранение фразы
const savePhrase = async (index) => {
  if (!audioSettings.value[index].phrase.trim()) {
    alert('Введите текст фразы перед сохранением');
    return;
  }
  const seconds_delay = parseInt(audioSettings.value[index].seconds) + parseInt(audioSettings.value[index].minutes)*60
  const exam_dur_sec = parseInt(examDuration.value.duration_seconds) + parseInt(examDuration.value.duration_minutes)*60
  console.log(seconds_delay + 'and '+exam_dur_sec)
  if (seconds_delay > exam_dur_sec)
  {
    alert('Время срабатывания фразы не может превышать общую продолжительность экзамена')
    return
  }

  audioSettings.value[index].saved = true;
  audioSettings.value[index].file_id = await sendPhrase(audioSettings.value[index])
  alert(`Фраза ${index + 1} сохранена`);
};

// Удаление фразы
const removePhrase = (index) => {
  if (audioSettings.value.length <= 1) {
    alert('Нельзя удалить последнюю настройку');
    return;
  }
  deletePhrase(audioSettings.value[index].file_id)

  audioSettings.value.splice(index, 1);
};

watchEffect(() => {
  if (examDuration.value.duration_seconds || examDuration.value.duration_minutes) {
    ApiHelper.post('exam/config', examDuration.value)
  }


})

const resetSaveState =  (index) =>{
  audioSettings.value[index].saved = false
}

const gatherData = async () => {
  const res = await ApiHelper.get("exam/config")
  examDuration.value.duration_minutes = res.duration_minutes
  examDuration.value.duration_seconds = res.duration_seconds
  const phrases = res.phrases
  audioSettings.value = phrases.map(phrase => {
        // Парсим JSON-строку
        const parsed =phrase

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
const sendPhrase = async (phrase) => {
  const res = await ApiHelper.post('phrases',{at_minute: phrase.minutes,at_second: phrase.seconds,text:phrase.phrase})
  return res.file_id
}
const deletePhrase = async (id) => {
  const res = await ApiHelper.remove('phrases',id)
}
</script>

<template>
  <div class="card">
    <!-- Заголовок и статус -->
    <div class="card-header">
      <h2 class="title">Настройка звукового сопровождения на станции</h2>
      <div class="connection-status">
        <span>Статус подключения</span>
        <div
            class="status-pill"
            :class="{ connected: isConnected }"
        ></div>
      </div>
    </div>

    <!-- Общая продолжительность экзамена -->
    <div class="duration-section">
      <label class="section-label">Укажите общую продолжительность экзамена</label>
      <div class="duration-inputs">
        <select v-model="examDuration.duration_minutes" class="input-field">
          <option v-for="h in 24" :key="h-1" :value="h-1">{{ String(h - 1).padStart(2, '0') }}</option>
        </select>
        <span class="colon">:</span>
        <select v-model="examDuration.duration_seconds" class="input-field">
          <option v-for="m in 60" :key="m-1" :value="m-1">{{ String(m - 1).padStart(2, '0') }}</option>
        </select>
      </div>
    </div>

    <!-- Раздел аудионастроек -->
    <div class="audio-section">
      <button @click="addAudioSetting" class="add-btn">
        <span>+</span> Добавить аудионастройки
      </button>

      <div v-for="(setting, index) in audioSettings" :key="index" class="audio-row">
        <div class="row-header">
          <span class="row-type">{{ index === 0 ? 'Начало объявления' : 'Интервал' }}</span>
        </div>

        <div class="time-inputs">
          <select v-model="setting.minutes" @change="resetSaveState(index)" class="input-field small">
            <option v-for="h in 24" :key="h-1" :value="h-1">{{ String(h - 1).padStart(2, '0') }}</option>
          </select>
          <span class="colon">:</span>
          <select v-model="setting.seconds" @change="resetSaveState(index)" class="input-field small">
            <option v-for="m in 60" :key="m-1" :value="m-1">{{ String(m - 1).padStart(2, '0') }}</option>
          </select>
        </div>

        <div class="phrase-field">
          <label :for="`phrase-${index}`" class="phrase-label">Фраза {{ index + 1 }}</label>
          <p class="save_warn" v-if="!setting.saved" >Ваши изменения не сохранены</p>
          <div style="display: flex; align-items: center">
              <textarea
                  :id="`phrase-${index}`"
                  v-model="setting.phrase"
                  @beforeinput="resetSaveState(index)"
                  class="textarea-field"
                  placeholder="Введите текст объявления..."
              ></textarea>
            <div class="action-icons">
              <button @click="playPhrase(index)" v-if="setting.saved" class="icon-btn play">
                ▶
              </button>
              <button @click="savePhrase(index)" class="icon-btn save">
                💾
              </button>
              <button @click="removePhrase(index)" class="icon-btn delete">
                🗑️
              </button>
            </div>
          </div>
        </div>


      </div>
    </div>
  </div>
</template>

<style scoped>
.save_warn{
  color: red;
}
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

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.status-pill {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ff4d4d;
  transition: background-color 0.3s ease;
}

.status-pill.connected {
  background-color: #4caf50;
}

/* Продолжительность экзамена */
.duration-section {
  margin-bottom: 32px;
}

.section-label {
  display: block;
  margin-bottom: 12px;
  font-weight: 500;
  color: #333;
}

.duration-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.colon {
  font-weight: bold;
  color: #333;
}

/* Аудионастройки */
.audio-section {
  margin-top: 24px;
}

.add-btn {
  background: #f0f0f0;
  color: #333;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  margin-bottom: 24px;
}

.add-btn:hover {
  background: #e0e0e0;
}

/* Строка аудионастройки */
.audio-row {
  padding: 24px;
  background: #fafafa;
  border-radius: 12px;
  margin-bottom: 16px;
  position: relative;
  transition: all 0.2s ease;
}

.audio-row:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.row-header {
  margin-bottom: 16px;
}

.row-type {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 16px;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.phrase-field {
  margin-bottom: 16px;

}

.phrase-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.textarea-field {
  width: 80%;
  max-width: 50rem;
  min-height: 3rem;
  padding: 0.5rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.textarea-field:focus {
  outline: none;
  border-color: #4caf50;
}

/* Иконки действий */
.action-icons {
  margin-left: 3rem;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
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
  color: #757575;
}

.icon-btn.delete:hover {
  background: #eeeeee;
  color: #212121;
}

/* Поля ввода */
.input-field {
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