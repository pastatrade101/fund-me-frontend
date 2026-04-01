#!/bin/sh
set -eu

envsubst '${BACKEND_UPSTREAM}' < /opt/fund-me/default.conf.template > /etc/nginx/conf.d/default.conf
envsubst '${APP_API_URL}' < /opt/fund-me/runtime-config.js.template > /usr/share/nginx/html/runtime-config.js
