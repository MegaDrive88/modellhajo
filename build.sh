#!/bin/bash
# build_and_run.sh

# Build the Docker image
docker build . -t modellhajo_laravel:0.1

# Run the container in detached mode and map port 8009 to 8000 inside the container
docker run -d -p 192.168.1.115:8009:8000 -t modellhajo_laravel:0.1