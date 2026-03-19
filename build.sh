#!/bin/bash
# build_and_run.sh
# sed -i 's/\r$//' build.sh

docker build -t modellhajo_laravel:0.1 .

docker run -d \
  -p 192.168.1.115:8009:8000 \
  -v "$(pwd)/storage:/app/storage" \
  -t modellhajo_laravel:0.1