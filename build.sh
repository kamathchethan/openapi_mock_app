#!/bin/bash -ex
image_name=openapi_mock_app
image_tag=`date +%s`
docker login --username "${ARTIFACTORY_API_USER}" --password "${ARTIFACTORY_API_KEY}" "${DOCKER_REGISTRY}"
SCRIPT_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
docker build --platform=linux/amd64 --rm --no-cache --file $SCRIPT_DIR/DOCKERFILE \
       ${image_tag:+ --tag "${DOCKER_REGISTRY}/${image_name}:${image_tag}"} \
       $SCRIPT_DIR
docker push "${DOCKER_REGISTRY}/${image_name}:${image_tag}"

echo "Pick image ${DOCKER_REGISTRY}/${image_name}:${image_tag}"
