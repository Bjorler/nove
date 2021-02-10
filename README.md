# Requirements

- First install mysql.
- Install all npm packages, run in console npm install.
- Create database and fill

```
npm run db
```

- Creare a dummy config

```
npm run format:config
```

# Config

- Before run, you need to set a config.js file:

- HOST: Fill the HOST variable with your host
- USER: Fill the USER variable with the database user
- PASSWORD: Fill the PASSWORD variable with the database password
- DATABASE: Fill the DATABASE vriable with the database name
- SECRET: Fill this variable with the key that will be used to decode the JWT
- METHOD: Fill the METHOD variable with the server protocol http/https
- DOMAIN: Fill the DOMAIN variable with the server domain
- IS_DEVELOPMENT set to true only when the server is on a local machine; otherwise it is false

# Commands

- To run the API in a local machie, please run

```
npm run start:dev
```

- To run in release mode, please run

```
npm run build
```

# To see the Api's documentation please go to

- http://localhost:4057/noveve-api/api
