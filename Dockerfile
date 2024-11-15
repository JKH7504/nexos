FROM openjdk:17
VOLUME /tmp
EXPOSE 8070
ENTRYPOINT ["java","-jar","/nexos.jar"]