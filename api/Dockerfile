#
# Build stage
#
FROM maven:3.8.4-openjdk-17-slim AS build
COPY lib ./lib
COPY src ./src
COPY pom.xml .
RUN mvn validate
RUN mvn -f ./pom.xml clean package

#
# Package stage
#
FROM openjdk:latest
COPY --from=build ./target/connector-api-0.0.1-SNAPSHOT.jar /usr/local/lib/connector-api.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/usr/local/lib/connector-api.jar"]
