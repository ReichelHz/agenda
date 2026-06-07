FROM openjdk:17-jdk-slim AS builder

WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends curl ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

COPY . .

RUN chmod +x mvnw && ./mvnw clean package -DskipTests

FROM openjdk:17-jdk-slim

WORKDIR /app

ENV PORT=8080

COPY --from=builder /app/target/*.jar /app/app.jar

EXPOSE 8080

CMD ["java", "-jar", "/app/app.jar"]