# Usa una imagen base oficial de Node.js. "alpine" es una versión ligera.
FROM node:20-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias y las instala
# Esto aprovecha el caché de Docker para no reinstalar si no cambian
COPY package*.json ./
RUN npm install

# Copia el resto de los archivos de tu aplicación al contenedor
COPY . .

# Expone el puerto en el que tu aplicación se ejecuta (cámbialo si es necesario)
EXPOSE 3000

# El comando para iniciar tu aplicación cuando el contenedor arranque
CMD [ "node", "index.js" ]