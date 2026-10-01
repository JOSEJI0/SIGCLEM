# Etapa 1: compilación
FROM eclipse-temurin:21-jdk AS compilacion
WORKDIR /app
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x ./mvnw && ./mvnw -q dependency:go-offline
COPY src src
RUN ./mvnw -q clean package -DskipTests

# Etapa 2: ejecución
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S sigclem && adduser -S sigclem -G sigclem \
    && mkdir -p /srv/sigclem/archivos && chown -R sigclem:sigclem /srv/sigclem
COPY --from=compilacion /app/target/*.jar app.jar
USER sigclem
ENV TZ=America/Mexico_City
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
