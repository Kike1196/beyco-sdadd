# Etapa 1: Construcción
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN javac -cp libs/mysql-connector-j-8.0.33.jar Main.java

# Etapa 2: Ejecución
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app /app
COPY libs/mysql-connector-j-8.0.33.jar /app/libs/
CMD ["java", "-cp", ".:/app/libs/mysql-connector-j-8.0.33.jar", "Main"]
