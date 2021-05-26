#!/bin/bash
export NODE_ENV=production
forever start -l forever.log -o forever.out -e forever.err ./server.js
nginx -g "daemon off;"