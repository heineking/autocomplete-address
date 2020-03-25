# start from base
FROM ubuntu:latest

# install system wide dependencies
RUN apt-get -yqq update
RUN apt-get -yqq install gnupg curl
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash
RUN apt-get install -yq nodejs

# copy the source code
ADD . /opt/autocomplete-address-app
WORKDIR /opt/autocomplete-address-app

# fetch dependencies
RUN npm install

# expose
EXPOSE 3000

CMD ["npm", "start"]
