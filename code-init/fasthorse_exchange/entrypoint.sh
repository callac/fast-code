#!/usr/bin/env bash
cd bvip_web
cross-env defaultTheme='zg' defaultTemplate='zg' node server-index.js --host 0.0.0.0
