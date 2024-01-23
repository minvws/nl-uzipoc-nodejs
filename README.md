# UziPoc NodeJS client example
This client provides an example how to connect to the https://github.com/minvws/nl-uzipoc-max OIDC service.
This Repository is created as a PoC (Proof of Concept), and should not be used as it is in production.

## Requirements
This NodeJS example is tested with `node v16.13.2` and `npm 8.1.2`.

Run this example with:
```
npm run setup
npm install
npm start
```

## Registration
To use this client an RSA certificate needs to be provided to the 
UziPoc OIDC service. The matching key needs te be configured in the .env.
