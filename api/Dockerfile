# start from base
FROM ubuntu:latest

# install system wide dependencies
RUN apt-get -yqq update
RUN apt-get -yqq install curl gnupg unzip sqlite3
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash
RUN apt-get install -yq nodejs

# copy the source code
ADD . /opt/autocomplete-address-api
WORKDIR /opt/autocomplete-address-api

# fetch dependencies
RUN npm install

# expose
EXPOSE 3001

CMD ["npm", "start"]
