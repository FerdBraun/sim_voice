# Dockerfile

# Шаг 1: Сборка приложения
FROM node:18-alpine AS builder

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем весь проект
COPY . .

# Собираем приложение
RUN npm run dev



# Копируем конфиг nginx (если нужен кастомный)

# Копируем собранную папку dist из builder-стадии
COPY --from=builder /app/dist /usr/share/nginx/html

# Открываем порт 80
EXPOSE 80

