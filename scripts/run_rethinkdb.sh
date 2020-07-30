#!/bin/sh

docker run                     \
  --name my_rethink            \
  -v $PWD/rethinkdb_data:/data \
  -d                           \
  -p 8080:8080                 \
  -p 28015:28015               \
  rethinkdb
