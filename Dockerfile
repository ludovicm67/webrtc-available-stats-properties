FROM docker.io/library/node:16-bullseye

# install required dependencies
RUN apt-get update && apt-get install -y \
  libgtk-3-0 \
  libnss3 \
  libdrm-dev \
  libgbm-dev \
  libasound2 \
  libxshmfence-dev \
  libx11-xcb-dev \
  libdbus-glib-1-2

WORKDIR /app

# install the app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# run the app
CMD ["npm", "run", "start"]
