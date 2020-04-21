# How to use API
This API is only use for Webradio - Stream. This API work with two Databases :
* First DB : MySQL
* Second DB : MongoDB

## Installation

Use the package manager [npm](https://www.npmjs.com/get-npm) to install packages.

```bash
cd server
npm install
```

## Usage
You need to create .env file with this informations :\
Contact me for special datas like Firebase or Facebook

```.env file
#OAuth2
CLIENT_ID=
SECRET_ID=
CALLBACK_URL=
AUTHORIZATION_URL=
TOKEN_URL=

#Facebook
FACEBOOK_API_KEY=
FACEBOOK_API_SECRET=
FACEBOOK_CALLBACK_URL=

#MySQL
USE_DATABASE=
MYSQL_HOST=
PORT=
USERNAME=
PASSWORD=
DATABASE=

#MongoDB
CONNECT_URL=

#Firebase
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_DATABASE_URL=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SEND_ID=
FIREBASE_APP_ID=

```

## Run API
```
cd server
nodemon app.js
```

## Contributing
For major changes, please open an issue first to discuss what you would like to change.
Please make sure to update tests as appropriate.
