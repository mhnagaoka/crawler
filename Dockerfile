FROM node:14-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Utilizando multi-stage build para evitar incluir as sujeiras
# geradas pelo npm (ex: cache) na imagem final
FROM node:14-alpine
WORKDIR /app
COPY --from=build /app /app
COPY src/ src/
COPY bin/ bin/

CMD [ "node", "src/server" ]
