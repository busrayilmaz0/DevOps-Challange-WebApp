@echo off
echo ================= DEVOPS PROJE KURESSEL KAYNAK LISTESI ================
echo.

echo 1. POD'LAR (Pods):
kubectl get pods
echo.

echo 2. SERVISLER (Services):
kubectl get services
echo.

echo 3. DEPLOYMENT'LAR (Deployments):
kubectl get deployments
echo.

echo 4. OTOMATİK ÖLÇEKLENDİRME (HPA):
kubectl get hpa
echo.

echo =======================================================================
pause



