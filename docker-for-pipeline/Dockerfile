FROM node:12-alpine
RUN apk update

LABEL maintainer="Simone Zennaro <dottorsaimon@gmail.com>"
#RUN apk -Uuv add curl
#RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
#RUN unzip awscliv2.zip
#RUN ./aws/install
RUN apk -Uuv add groff less python py-pip
RUN pip install awscli==1.18.39
RUN apk --purge -v del py-pip
RUN npm install serverless@1.67.3 -g
RUN rm /var/cache/apk/*