#!/bin/bash
set -e

if ! [[ -f .env ]]
then
  echo "Use example config file as current config"
  cp .env.example .env
fi

if ! [[ -f "secrets/client.key" ]]
then
  mkdir -p secrets
  openssl req -x509 -nodes -newkey rsa:4096 -keyout secrets/client.key -out secrets/client.cert -sha256 -days 365
  echo "Submit the client.cert to the Uzi Max service:"
  cat secrets/client.cert
fi