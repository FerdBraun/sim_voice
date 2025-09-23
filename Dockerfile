FROM ubuntu:latest
LABEL authors="Polukhin"

ENTRYPOINT ["top", "-b"]