FROM daocloud.io/node:0.10-onbuild
# replace this with your application's default port
RUN mkdir -p /usr/src/ddc_tcpserver
COPY . /usr/src/ddc_tcpserver
WORKDIR /usr/src/ddc_tcpserver
RUN npm install

EXPOSE 2008
CMD node tcpServer.js