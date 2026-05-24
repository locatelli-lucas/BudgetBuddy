FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apk add --no-cache maven && mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# Create non-root user
RUN addgroup -S budgetbuddy && adduser -S budgetbuddy -G budgetbuddy
USER budgetbuddy

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
