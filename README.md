# 🏠 Real Estate dApp - Decentralized Rentals

Application décentralisée de location immobilière sur Ethereum, déployée sur Google Kubernetes Engine (GKE).

## 📋 Table des matières

- [Architecture](#architecture)
- [Services déployés](#services-déployés)
- [Stack technique](#stack-technique)
- [Infrastructure](#infrastructure)
- [CI/CD Pipeline](#cicd-pipeline)
- [Commandes utiles](#commandes-utiles)
- [Intégration des composants](#intégration-des-composants)
- [Monitoring](#monitoring)
- [Coûts estimés](#coûts-estimés)

---

## 🏗️ Architecture
```
┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│    Backend      │
│    (Nginx)      │     │  (Spring Boot)  │
│ 104.197.229.223 │     │  34.70.204.161  │
└─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│ Smart Contracts │  (À venir)
│   (Sepolia)     │
└─────────────────┘
```

---

## 🌐 Services déployés

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://104.197.229.223 | Interface utilisateur |
| **Backend** | http://34.70.204.161 | API REST Spring Boot |
| **Jenkins** | http://136.111.124.86 | CI/CD Pipeline |
| **Grafana** | http://136.115.174.225 | Dashboards monitoring |

---

## 🛠️ Stack technique

| Composant | Technologie |
|-----------|-------------|
| **Frontend** | HTML/CSS/JS (Angular prévu) |
| **Backend** | Java 17, Spring Boot, Maven |
| **Smart Contracts** | Solidity, Hardhat (à venir) |
| **ML Service** | Python, FastAPI, sklearn (à venir) |
| **Infrastructure** | Terraform, GCP, GKE |
| **CI/CD** | Jenkins, Kaniko |
| **Containerisation** | Docker, Kubernetes |
| **Monitoring** | Prometheus, Grafana |
| **Registry** | Google Artifact Registry |

---

## ☁️ Infrastructure

### Cluster GKE

- **Nom** : `jee-cluster`
- **Zone** : `us-central1-a`
- **Machine** : `e2-standard-2` (Spot VM)
- **Disque** : 50 GB

### Terraform
```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

### Fichiers Terraform
```
infrastructure/
├── main.tf           # Ressources GCP
├── variables.tf      # Variables
└── jenkins-key.json  # Service account (gitignored)
```

---

## 🔄 CI/CD Pipeline

### Workflow
```
Push GitHub → Webhook → Jenkins → Build → Push Image → Deploy K8s
```

### Stages du pipeline

1. **Checkout** - Clone le repo
2. **Build Backend** - Maven compile
3. **Push Backend Image** - Kaniko → Artifact Registry
4. **Build Frontend** - (si package.json existe)
5. **Push Frontend Image** - Kaniko → Artifact Registry
6. **Deploy** - kubectl update deployment

### Trigger

Le pipeline se déclenche automatiquement à chaque push sur `main`.

---

## 📁 Structure du projet
```
real-estate-dapp/
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
├── frontend/
│   ├── index.html
│   └── Dockerfile
├── k8s/
│   ├── backend.yaml
│   └── frontend.yaml
├── infrastructure/
│   ├── main.tf
│   └── variables.tf
├── smart-contracts/      # À venir
├── ml-service/           # À venir
├── Jenkinsfile
└── README.md
```

---

## 🔧 Commandes utiles

### Cluster
```bash
# Voir les pods
kubectl get pods

# Voir les services
kubectl get services

# Voir les logs d'un pod
kubectl logs <pod-name>

# Redémarrer un deployment
kubectl rollout restart deployment <deployment-name>
```

### Debug
```bash
# Décrire un pod
kubectl describe pod <pod-name>

# Exec dans un container
kubectl exec -it <pod-name> -- sh

# Voir les events
kubectl get events --sort-by=.metadata.creationTimestamp
```

### Gestion des coûts
```bash
# Scale down (arrêter les coûts)
gcloud container clusters resize jee-cluster --zone us-central1-a --num-nodes=0

# Scale up (reprendre)
gcloud container clusters resize jee-cluster --zone us-central1-a --num-nodes=1
```

---

## 🔌 Intégration des composants

### Frontend Angular

Quand le Frontend Engineer fournit son code :

1. Remplacer le contenu de `frontend/`
2. Mettre à jour `frontend/Dockerfile` :
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

FROM nginx:alpine
COPY --from=build /app/dist/[NOM-PROJET] /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

3. Push → Pipeline déploie automatiquement

---

### Smart Contracts (Blockchain)

Quand le Blockchain Engineer fournit son code :

1. Ajouter le dossier `smart-contracts/`
2. Configurer les secrets Jenkins :
   - `sepolia-private-key` : Clé privée du wallet
   - `infura-api-key` : Clé API Infura

3. Son `hardhat.config.js` doit utiliser :
```javascript
module.exports = {
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

---

### ML Service

Quand le ML Engineer fournit son code :

1. Ajouter le dossier `ml-service/`
2. Créer `ml-service/Dockerfile` :
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app/ ./app/
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

3. Créer `k8s/ml-service.yaml`
4. Mettre à jour le Jenkinsfile

---

## 📊 Monitoring

### Grafana

- **URL** : http://136.115.174.225
- **User** : admin
- **Password** : 
```bash
kubectl get secret monitoring-grafana -o jsonpath="{.data.admin-password}" | base64 --decode
```

### Dashboards disponibles

- Kubernetes / Compute Resources / Cluster
- Kubernetes / Compute Resources / Pod
- Node Exporter / Nodes

---

## 💰 Coûts estimés (24/7)

| Ressource | Coût/mois |
|-----------|-----------|
| GKE Node (e2-standard-2 Spot) | ~$15 |
| Load Balancer x3 | ~$54 |
| Artifact Registry | ~$1 |
| Network | ~$5 |
| **Total** | **~$75/mois** |

> 💡 Pour réduire : Scale down le cluster quand non utilisé

---

## 👥 Équipe

| Rôle | Responsabilité |
|------|----------------|
| **Cloud/DevOps Engineer** | Infrastructure, CI/CD, Déploiement |
| **Backend Engineer** | API Spring Boot |
| **Frontend Engineer** | Interface Angular |
| **Blockchain Engineer** | Smart Contracts Solidity |
| **ML Engineer** | Modèles ML, FastAPI |

---
