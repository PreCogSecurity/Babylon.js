# Babylon.js development/test container.
#
# This image installs the pinned dependencies from the committed lockfile and
# runs the unit test suite, so the repository can be evaluated in a fully
# isolated environment without a local Node.js toolchain.
FROM node:20

WORKDIR /app

# Install dependencies first so the layer is cached across rebuilds.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

CMD ["npm", "test"]