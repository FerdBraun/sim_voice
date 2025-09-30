import {createRouter, createWebHistory} from 'vue-router'
import TimeControlView from "@/views/TimeControlView.vue";
import InnerAudio from "@/components/feature/InnerAudio.vue";
import OuterAudio from "@/components/feature/OuterAudio.vue";
import OuterAudioControls from "@/components/feature/OuterAudioControls.vue";
import TimerPage from "@/components/feature/TimerPage.vue";



const routes = [


    {
        path: '/',
        name: 'home',
        component: TimeControlView,
        redirect: 'inner',
        meta: {
            title: 'Главная страница'
        },
        children: [{
            path: '/inner',
            name: 'inner',
            component: InnerAudio,
            meta: {
                title: 'Внутренняя озвучка'
            },
        },
            {
                path: '/outer',
                name: 'outer',
                component: OuterAudio,
                meta: {
                    title: 'Внутренняя озвучка'
                },
            },
            {
                path: '/outer_controls',
                name: 'outer_controls',
                component: OuterAudioControls,
                meta: {
                    title: 'Внутренняя озвучка'
                },
            },

        ]
    },
    {
        path: '/timer',
        name: 'timer',
        component: TimerPage,
        meta: {
            title: 'Таймер'
        },
    },
    {
        path: '/room/:id',
        name: 'room',
        component: () => import('@/views/RoomPageView.vue'),
        meta: {
            title: 'Комната'
        },
    }


]


const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    // Плавная прокрутка
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else if (to.hash) {
            return {
                el: to.hash,
                behavior: 'smooth'
            }
        } else {
            return {top: 0, behavior: 'smooth'}
        }
    }
})

export default router