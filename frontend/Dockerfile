# --- Stage 1 : Build (Compilation Angular) ---
FROM node:18-alpine AS build
WORKDIR /app

# Installation des dépendances
COPY package*.json ./
# RUN npm install

# Copie du code source
COPY . .
# Construction pour la production
# RUN npm run build --prod

# --- Stage 2 : Serve (Serveur Web Nginx) ---
# On utilise Nginx pour servir les fichiers statiques (très performant)
FROM nginx:alpine

# On copie les fichiers compilés depuis le stage build vers le dossier Nginx
# (Le dossier 'dist/' dépend du nom du projet Angular, il faudra vérifier ce nom avec ton collègue Frontend)
# COPY --from=build /app/dist/nom-du-projet /usr/share/nginx/html

# Configuration Nginx pour gérer le routage Angular (Single Page App)
# On crée une config simple inline pour éviter les erreurs 404 au refresh
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]