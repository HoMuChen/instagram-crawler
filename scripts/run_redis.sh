#!/bin/sh

docker run                        \
  -d                              \
  -p 6379:6379                    \
  -v $PWD/redis_data:/data        \
  --name my-redis                 \
  redis
