# --- Этап 1: Сборка (Builder) ---
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей для кэширования слоев Docker
COPY package*.json ./

# Устанавливаем все зависимости (включая devDependencies для компиляции TS)
RUN npm ci

# Копируем исходный код и конфигурацию TypeScript
COPY tsconfig.json ./
COPY cmd/ ./cmd/
COPY internal/ ./internal/

# Компилируем TypeScript в JavaScript (в папку ./dist)
RUN npm run build

# --- Этап 2: Финальный легковесный образ (Runner) ---
FROM node:20-alpine

WORKDIR /app

# Устанавливаем окружение production по умолчанию
ENV NODE_ENV=production

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем только production-зависимости без лишних пакетов
RUN npm ci --only=production && npm cache clean --force

# Копируем скомпилированный код из этапа builder
COPY --from=builder /app/dist ./dist

# Открываем порт приложения
EXPOSE 3000

# Команда для запуска скомпилированного сервера
CMD ["node", "dist/cmd/app/index.js"]