Backend of the gate_opener service.
Based on NodeJS with ExpressJS the server uses an SQLite database to save info about users, devices and trigger events.
It also serves the front end if a GET request has been received on the path '/'.
