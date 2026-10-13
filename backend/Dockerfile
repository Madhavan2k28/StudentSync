# Render builds and runs the backend from this file.

# 1) Build the jar with Maven and Java 17
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q -DskipTests package

# 2) Run it on a small Java 17 runtime image
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/studentsync-backend-1.0.0.jar app.jar
# Fit inside the 512 MB free instance
ENV JAVA_OPTS="-XX:MaxRAMPercentage=70 -XX:+UseSerialGC -Xss512k"
EXPOSE 8081
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
