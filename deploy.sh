#!/bin/sh
ENV=""
BUILD_TARGET=""

case $(git status) in
  *'Changes not staged for commit'*|*'Changes to be committed'*)  echo "Please commit changes and then continue."
  exit -1;;
esac

if [ "$1" == "staging" ]; then
  echo "Deploying to staging"
  ENV="staging"
  BUILD_TARGET="staging"
elif [ "$1" == "prod-blue" ]; then
  echo "Deploying to prod-blue"
  ENV="prod-blue"
  BUILD_TARGET="dist"
elif [ "$1" == "prod-new" ]; then
  echo "Deploying to prod-new"
  ENV="production-new02"
  BUILD_TARGET="dist"
else
  echo "You have to specify environment (staging | prod)"
  exit -1
fi

eb use hirepool-$ENV

# statements
now=$(date)
commit_hash=`git rev-parse HEAD`
cd client
set -e
grunt prep-for-build
grunt build:$BUILD_TARGET --force
set +e
cd ..; git add .; git commit -m "deployed $commit_hash $now"; eb deploy;
