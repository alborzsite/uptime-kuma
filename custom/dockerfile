FROM node:20-bookworm-slim AS base

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    chromium fonts-indic fontconfig fonts-noto fonts-noto-cjk \
    fonts-noto-color-emoji locales dumb-init curl ca-certificates \
    python3 build-essential git \
    && rm -rf /var/lib/apt/lists/* && \
    chmod 755 /usr/bin/dumb-init

RUN echo "en_US.UTF-8 UTF-8" > /etc/locale.gen && locale-gen en_US.UTF-8

ENV LANG=en_US.UTF-8 \
    LANGUAGE=en_US:en \
    LC_ALL=en_US.UTF-8 \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

FROM base AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN echo "legacy-peer-deps=true" > .npmrc
RUN npm ci || npm install

COPY . .

# DEBUG: چک کردن فایل‌های custom قبل از کپی
RUN echo "=== Checking custom files ===" && \
    if [ -d "custom" ]; then \
        ls -la custom/; \
        echo "=== Custom files found ==="; \
    else \
        echo "=== No custom directory ==="; \
    fi

# کپی فایل‌های سفارشی
RUN if [ -d "custom" ]; then \
    echo "Copying 360messenger.js..." && \
    cp -v custom/360messenger.js ./server/notification-providers/ 2>/dev/null || true; \
    echo "Copying 360messenger.vue..." && \
    cp -v custom/360messenger.vue ./src/components/notifications/ 2>/dev/null || true; \
    echo "Copying index.js..." && \
    cp -v custom/index.js ./src/components/notifications/index.js 2>/dev/null || true; \
    echo "Copying notification.js..." && \
    cp -v custom/notification.js ./server/ 2>/dev/null || true; \
    fi

# DEBUG: بررسی محتوای فایل‌ها بعد از کپی
RUN echo "=== Verifying copied files ===" && \
    echo "--- 360messenger.js class name ---" && \
    grep "^class" ./server/notification-providers/360messenger.js || echo "File not found" && \
    echo "--- notification.js require ---" && \
    grep "messenger360" ./server/notification.js | head -3 || echo "Not found in notification.js" && \
    echo "--- index.js import ---" && \
    grep -A1 "360messenger.vue" ./src/components/notifications/index.js || echo "Not found in index.js" && \
    echo "--- index.js export ---" && \
    grep "messenger360" ./src/components/notifications/index.js | tail -3 || echo "Not in exports"

# Build
RUN npm run build && \
    echo "Build completed. Checking dist folder:" && \
    ls -lah dist/ && \
    test -f dist/index.html && \
    echo "✓ dist/index.html exists"

# بررسی فایل‌های build شده
RUN echo "=== Checking built assets ===" && \
    ls -lh dist/assets/*.js | head -5

RUN rm -rf node_modules && \
    (npm ci --omit=dev || npm install --production)

RUN mkdir -p ./data

FROM base AS release
WORKDIR /app

ENV UPTIME_KUMA_IS_CONTAINER=1 \
    NODE_ENV=production

COPY --from=build /app /app

# DEBUG نهایی
RUN echo "=== Final verification ===" && \
    echo "Backend file:" && \
    ls -lh /app/server/notification-providers/360messenger.js && \
    grep "class messenger360" /app/server/notification-providers/360messenger.js && \
    echo "notification.js:" && \
    grep "messenger360" /app/server/notification.js | head -2 && \
    echo "dist exists:" && \
    ls -lh /app/dist/index.html && \
    echo "✓ All verified"

EXPOSE 3001

HEALTHCHECK --interval=60s --timeout=30s --start-period=180s --retries=5 \
    CMD node extra/healthcheck || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server/server.js"]