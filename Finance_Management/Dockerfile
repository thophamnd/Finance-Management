# Stage 1: Build file JAR bằng Maven
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Build bỏ qua test để chạy nhanh hơn
RUN mvn clean package -DskipTests

# Stage 2: Chạy ứng dụng bằng JDK 17 (Dùng bản temurin chuẩn công nghiệp mới nhất)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Copy file JAR đã build từ Stage 1 sang Stage 2
COPY --from=build /app/target/*.jar app.jar
# Mở port 8080 cho Backend
EXPOSE 8080
# Lệnh khởi chạy Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]