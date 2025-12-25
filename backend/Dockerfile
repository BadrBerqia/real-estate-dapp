# --- Stage 1 : Build (Compilation avec Maven) ---
# On utilise une image Maven avec Java 17 (OpenJDK) comme demandé 
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app

# On copie d'abord le pom.xml pour profiter du cache Docker (télécharge les dépendances une seule fois)
COPY pom.xml .
# (Note: Cette étape échouera tant que ton collègue n'a pas mis son pom.xml, c'est normal pour l'instant)
# COPY src ./src

# On compile le projet et on crée le JAR
# RUN mvn clean package -DskipTests

# --- Stage 2 : Run (Exécution) ---
# Image légère juste pour lancer Java 17
FROM openjdk:17-jdk-slim
WORKDIR /app

# On copie le JAR généré depuis l'étape de build
# COPY --from=build /app/target/*.jar app.jar

# Port standard Spring Boot
EXPOSE 8080

# Commande de lancement
ENTRYPOINT ["java", "-jar", "app.jar"]