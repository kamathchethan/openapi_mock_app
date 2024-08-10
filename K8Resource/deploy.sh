#!/bin/bash -ex
kubectl apply -f ./namespace.yaml
kubectl apply -f ./configmap.yaml
kubectl apply -f ./deployment.yaml
kubectl apply -f ./service.yaml
# kubectl apply -f ./route.yaml
# kubectl -n mockopenapi get routes/mockopenapi --output custom-columns=NODE:.spec.host