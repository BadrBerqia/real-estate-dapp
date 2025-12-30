def label = "worker-${UUID.randomUUID().toString()}"

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

        stage('Build Microservices') {
            container('maven') {
                sh '''
                cd backend
                for service in service-discovery api-gateway user-service property-service; do
                    echo "Building $service..."
                    cd $service
                    mvn clean package -DskipTests -q
                    cd ..
                done
                '''
            }
        }

        stage('Push Microservices Images') {
            container('kaniko') {
                sh 'echo "Pushing service-discovery..." && /kaniko/executor --context `pwd`/backend/service-discovery --dockerfile `pwd`/backend/service-discovery/Dockerfile --destination us-central1-docker.pkg.dev/real-estate-dapp-jee/jee-repo/service-discovery:latest'
                sh 'echo "Pushing api-gateway..." && /kaniko/executor --context `pwd`/backend/api-gateway --dockerfile `pwd`/backend/api-gateway/Dockerfile --destination us-central1-docker.pkg.dev/real-estate-dapp-jee/jee-repo/api-gateway:latest'
                sh 'echo "Pushing user-service..." && /kaniko/executor --context `pwd`/backend/user-service --dockerfile `pwd`/backend/user-service/Dockerfile --destination us-central1-docker.pkg.dev/real-estate-dapp-jee/jee-repo/user-service:latest'
                sh 'echo "Pushing property-service..." && /kaniko/executor --context `pwd`/backend/property-service --dockerfile `pwd`/backend/property-service/Dockerfile --destination us-central1-docker.pkg.dev/real-estate-dapp-jee/jee-repo/property-service:latest'
            }
        }

        stage('Push AI Service Image') {
            container('kaniko') {
                sh 'echo "Pushing ai-service..." && /kaniko/executor --context `pwd`/backend/ai-service --dockerfile `pwd`/backend/ai-service/Dockerfile --destination us-central1-docker.pkg.dev/real-estate-dapp-jee/jee-repo/ai-service:latest'
            }
        }

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
                sh '/kaniko/executor --context `pwd`/frontend --dockerfile `pwd`/frontend/Dockerfile --destination us-central1-docker.pkg.dev/real-estate-dapp-jee/jee-repo/frontend:latest'
            }
        }

        stage('Deploy to Kubernetes') {
            container('gcloud') {
                sh '''
                kubectl apply -f k8s/backend/postgres.yaml
                kubectl wait --for=condition=available --timeout=120s deployment/postgres || true
                kubectl apply -f k8s/backend/service-discovery.yaml
                sleep 30
                kubectl apply -f k8s/backend/api-gateway.yaml
                kubectl apply -f k8s/backend/user-service.yaml
                kubectl apply -f k8s/backend/property-service.yaml
                kubectl apply -f k8s/ai-service.yaml
                kubectl apply -f k8s/frontend.yaml
                kubectl rollout restart deployment/service-discovery
                kubectl rollout restart deployment/api-gateway
                kubectl rollout restart deployment/user-service
                kubectl rollout restart deployment/property-service
                kubectl rollout restart deployment/ai-service
                kubectl rollout restart deployment/real-estate-frontend
                '''
            }
        }
    }
}