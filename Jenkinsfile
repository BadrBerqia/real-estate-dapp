def label = "worker-${UUID.randomUUID().toString()}"
def services = ['service-discovery', 'api-gateway', 'user-service', 'property-service', 'rental-service', 'payment-service', 'blockchain-integration-service']

podTemplate(label: label, yaml: """
apiVersion: v1
kind: Pod
spec:
  serviceAccountName: jenkins
  containers:
  - name: jnlp
    image: jenkins/inbound-agent:latest
    resources:
      requests:
        cpu: 50m
        memory: 128Mi
  - name: maven
    image: maven:3.8-eclipse-temurin-17
    command:
    - cat
    tty: true
    resources:
      requests:
        cpu: 200m
        memory: 512Mi
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    command:
    - /busybox/cat
    tty: true
    volumeMounts:
      - name: kaniko-secret
        mountPath: /secret
    env:
      - name: GOOGLE_APPLICATION_CREDENTIALS
        value: /secret/jenkins-key.json
    resources:
      requests:
        cpu: 100m
        memory: 256Mi
  - name: gcloud
    image: google/cloud-sdk:latest
    command:
    - cat
    tty: true
    resources:
      requests:
        cpu: 20m
        memory: 64Mi
  - name: node
    image: node:18-alpine
    command:
    - cat
    tty: true
    resources:
      requests:
        cpu: 100m
        memory: 256Mi
  volumes:
  - name: kaniko-secret
    secret:
      secretName: gcp-service-account-key
"""
) {
    node(label) {
        
        stage('Checkout') {
            checkout scm
        }
        
        // ==================== BUILD MICROSERVICES ====================
        stage('Build Microservices') {
            container('maven') {
                sh '''
                cd backend
                for service in service-discovery api-gateway user-service property-service rental-service payment-service blockchain-integration-service; do
                    echo "Building $service..."
                    cd $service
                    mvn clean package -DskipTests -q
                    cd ..
                done
                '''
            }
        }
        
        // ==================== PUSH MICROSERVICES IMAGES ====================
        stage('Push Microservices Images') {
            container('kaniko') {
                sh '''
                for service in service-discovery api-gateway user-service property-service rental-service payment-service blockchain-integration-service; do
                    echo "Pushing $service image..."
                    /kaniko/executor \
                        --context `pwd`/backend/$service \
                        --dockerfile `pwd`/backend/$service/Dockerfile \
                        --destination us-central1-docker.pkg.dev/real-estate-dapp-jee/jee-repo/$service:latest
                done
                '''
            }
        }
        
        // ==================== FRONTEND ====================
        stage('Build Frontend') {
            container('node') {
                sh '''
                cd frontend
                npm install
                npm run build
                '''
            }
        }
        
        stage('Push Frontend Image') {
            container('kaniko') {
                sh '''
                /kaniko/executor \
                    --context `pwd`/frontend \
                    --dockerfile `pwd`/frontend/Dockerfile \
                    --destination us-central1-docker.pkg.dev/real-estate-dapp-jee/jee-repo/frontend:latest
                '''
            }
        }
        
        // ==================== DEPLOY ====================
        stage('Deploy to Kubernetes') {
            container('gcloud') {
                sh '''
                # Deploy PostgreSQL
                kubectl apply -f k8s/backend/postgres.yaml
                
                # Wait for PostgreSQL
                kubectl wait --for=condition=available --timeout=120s deployment/postgres || true
                
                # Deploy Service Discovery first
                kubectl apply -f k8s/backend/service-discovery.yaml
                sleep 30
                
                # Deploy other services
                kubectl apply -f k8s/backend/api-gateway.yaml
                kubectl apply -f k8s/backend/user-service.yaml
                kubectl apply -f k8s/backend/property-service.yaml
                kubectl apply -f k8s/backend/rental-service.yaml
                kubectl apply -f k8s/backend/payment-service.yaml
                kubectl apply -f k8s/backend/blockchain-service.yaml
                
                # Deploy Frontend
                kubectl apply -f k8s/frontend.yaml
                
                # Restart deployments to pull new images
                kubectl rollout restart deployment/service-discovery
                kubectl rollout restart deployment/api-gateway
                kubectl rollout restart deployment/user-service
                kubectl rollout restart deployment/property-service
                kubectl rollout restart deployment/rental-service
                kubectl rollout restart deployment/payment-service
                kubectl rollout restart deployment/blockchain-service
                kubectl rollout restart deployment/real-estate-frontend
                '''
            }
        }
    }
}