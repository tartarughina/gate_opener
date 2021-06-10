Backend of the gate_opener service.
Based on NodeJS with ExpressJS the server uses an SQLite database to save info about users, devices and trigger events.
In order to trigger the devices an open source library has been used, ewelink-api.
It also serves the front end if a GET request has been received on the path '/'.
