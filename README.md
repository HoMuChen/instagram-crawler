# instagram-crawler

crawling instagram medias and users

## Installation
``` bash
$ git clone https://github.com/HoMuChen/instagram-cralwer.git
$ cd instagram-crawler
$ npm i
```

## Configuration
``` bash
$ cd envs
$ cp dev.dev.sample dev.env
$ vi dev.env  ## add all you need in the dev.env as system environment
```

## Dispatch jobs
``` bash
$ source envs/dev.env # souce system environment
$ cd src/cli

# dispatch popular user jobs with users having fans count from 100000 to 200000
# more options and parameters shown below
$ node dispatch.js popular-users -f 100000 -t 200000
```

## Run workers
``` bash
$ source envs/dev.env # souce system environment
$ cd src/cli

# launch 10 concurrent workers consuming medias jobs
# more options and parameters shown below
$ node workerjs medias -c 10
```
