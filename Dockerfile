FROM node:12@sha256:beb72fb7dab30898dad23419a58e1f995a6364b4c8b000100715aa190c323392

ENV http_proxy http://www-cache.rd.bbc.co.uk:8080
ENV https_proxy http://www-cache.rd.bbc.co.uk:8080

# need netcat for ssh so that we can use scp to deploy docs
# need zip for zap
RUN apt-get update && apt-get install -y netcat-openbsd zip

# create a dir that matches the yarn-cache location in pipeline
RUN mkdir -p /var/tmp/yarn-cache
RUN chmod 777 /var/tmp/yarn-cache

# create a directory for .npm to go in
RUN mkdir -p /var/tmp/home-for-npm
RUN chmod 777 /var/tmp/home-for-npm
