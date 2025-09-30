<script setup>
import {useRoute} from 'vue-router'
import helper from "@/utils/api.js";
import Api from "@/utils/api.js";
import {onMounted, onUnmounted, ref} from "vue";

const route = useRoute()
const ApiHelper = helper()
const roomId = ref()
const roomName = ref()
const curStudent = ref()
const nextStudent = ref()
const intervalId = ref(null)
roomId.value = route.params.id
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const host = ApiHelper.MainROUTE.split('/')

const wsUrl = protocol + '://' + host[2] + '/ws/' + encodeURIComponent(roomId.value.toString());


console.log('WS URL:', wsUrl);
let ws;

function connect() {
  {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      {

        console.log('WS open');
      }
    };

    ws.onmessage = async (event) => {
      {
        try {
          {
            const data = JSON.parse(event.data);
            console.log('WS message', data);
            if (data.action === 'play' && data.file_id) {
              {
                try {
                  {
                    const arrayBuffer = await ApiHelper.fetchAudio('audio/' + data.file_id)
                    const blob = new Blob([arrayBuffer], {type: 'audio/wav'});
                    const url = URL.createObjectURL(blob)
                    const audio = new Audio(url);
                    await audio.play();
                  }
                } catch (e) {
                  {
                    console.warn('Auto-play failed', e);
                  }
                }
              }
            }
          }
        } catch (e) {
          {
            console.warn('Invalid WS message', e);
          }
        }
      }
    };

    ws.onclose = (ev) => {
      {

        console.log('WS closed', ev);
        setTimeout(connect, 3000);
      }
    };

    ws.onerror = (err) => {
      {
        console.error('WS error', err);
        ws.close();
      }
    };
  }
}

const gatherData = async () => {
  let res = await ApiHelper.get('rooms/' + roomId.value)
  roomName.value = res.name
  res = await ApiHelper.get('current-students')

  curStudent.value = res[roomId.value]?.current ?? "-"
  nextStudent.value = res[roomId.value]?.next ?? "-"


}

onMounted(async () => {
  await connect();
  await gatherData()
  intervalId.value = setInterval(async () => {
    const res = await ApiHelper.get('current-students')

    curStudent.value = res[roomId.value]?.current ?? "-"
    nextStudent.value = res[roomId.value]?.next ?? "-"
  }, 5000)

});
// При размонтировании — очищаем интервал
onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
})

</script>

<template>
  <div class="main_container">
    <div class="box station_name_box">
      <h1>НАИМЕНОВАНИЕ СТАНЦИИ</h1>
      <span class="line"></span>
      <p class="station_name_text">{{
          roomName
        }}</p>
    </div>
    <div class="box occupied_box">
      <h1>СЕЙЧАС НА СТАНЦИИ</h1>
      <span class="line"></span>
      <p class="station_name_text">{{ curStudent }}</p>
    </div>
    <div class="box next_person_box">
      <h1>СЛЕДУЮЩИЙ НА СТАНЦИИ</h1>
      <span class="line"></span>
      <p class="station_name_text">{{ nextStudent }}</p>
    </div>


  </div>
</template>

<style scoped>
.station_name_text {
  font-weight: 500;
  font-size: 3.8rem;
  overflow: hidden;
}

h1 {
  font-weight: 600;
  font-size: 5rem;

}

.line {
  width: 100%;
  height: 0.2rem;
  background: #1D6259;
}

.next_person_box {
  height: 21.1rem;
  width: 169.4rem;
  min-height: 21.1rem;
}

.occupied_box {
  height: 21.1rem;
  min-height: 21.1rem;
  width: 169.4rem;
}

.station_name_box {
  height: 30.6rem;
  min-height: 30.6rem;
  width: 169.4rem;
}

.box {
  padding-left: 3.5rem;

  background: white;
  display: flex;
  flex-direction: column;
  color: #1D6259;
  border-radius: 1.6rem;
}

.main_container {
  background: url('../assets/RoomPageBgr.svg') no-repeat center center, linear-gradient(180deg, #1B5A52, #288E81);
  gap: 4.6rem;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 11.3rem;
  overflow: hidden;

}
</style>