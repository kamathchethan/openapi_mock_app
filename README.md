# openapi_mock_app

This Express application server is designed to mock an uploaded OpenAPI specification for local or server-side testing. The server utilizes the examples provided in the OpenAPI specification for both parameters and request bodies. These examples are used to generate responses, with keys from the request being matched to produce the corresponding mock responses. This allows for easy and efficient testing of your API without needing a fully developed backend.

## Route 

`/explorer`: loads swagger explorer
`/doc/<file name>`: Serve openapi doc

## Run locally
```sh
npm i
npm start
```

## Build Docker image
Prerequisite packages to build image `docker` `kubectl`

```sh
# set below env
export DOCKER_REGISTRY=${DOCKER_REGISTRY}
export ARTIFACTORY_API_USER=${ARTIFACTORY_API_USER}
export ARTIFACTORY_API_KEY=${ARTIFACTORY_API_KEY}
sh build.sh
```

## Deploy this application to k8 cluster
update above image [here](K8Resource/deployment.yaml#L18), Login to cluster then run below command

Login to K8 cluster using CLI then run below command
```sh
cd K8Resource
sh deploy.sh
```
Add image pull secret with `mockopenapi` name in 

## Deploy this application to OpenShift cluster
update above image [here](K8Resource/deployment.yaml#L22), uncomment [lest 2 lines](openapi_mock_app/K8Resource/deploy.sh#L6) 

Login to OpenShift cluster using CLI then run below command
```sh
cd K8Resource
sh deploy.sh
```
Copy exposed route from above command and add `/explorer` to get the swagger explorer
Add image pull secret with `mockopenapi` name 

Once deployed in cluster upload OpenAPI doc in config map where key as name and value is OpenAPI with examples

## Coverage
![Statements](https://img.shields.io/badge/statements-92.5%25-brightgreen.svg?style=flat)
![Branches](https://img.shields.io/badge/branches-82.35%25-yellow.svg?style=flat)
![Functions](https://img.shields.io/badge/functions-100%25-brightgreen.svg?style=flat)
![Lines](https://img.shields.io/badge/lines-92.5%25-brightgreen.svg?style=flat)
