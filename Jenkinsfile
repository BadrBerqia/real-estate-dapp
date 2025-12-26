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
        cpu: 150m
        memory: 300Mi
  - name: node
    image: node:18-alpine
    command:
    - cat
    tty: true
    resources:
      requests:
        cpu: 100m
        memory: 256Mi
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
  volumes:
  - name: kaniko-secret
    secret:
      secretName: gcp-service-account-key
"""
) {
    node(label) {
        def hasAngular = false
        
        stage('Checkout') {
            checkout scm
            hasAngular = fileExists('frontend/package.json')
        }
        
        // ==================== BACKEND ====================
        stage('Build Backend') {
            container('maven') {
                sh 'cd backend && mvn clean package -DskipTests -T 1C'
            }
        }
        
        stage('Push Backend Image') {
            container('kaniko') {
                sh '''
                /kaniko/executor \
                --context `pwd`/backend \
                --dockerfile `pwd`/backend/Dockerfile \
                --destination us-central1-docker.pkg.dev/real-estate-dapp-jee/jee-repo/backend:latest
                '''
            }
        }
        
        // ==================== FRONTEND ====================
        if (hasAngular) {
            stage('Build Frontend (Angular)') {
                container('node') {
                    sh '''
                    cd frontend
                    npm install
                    npm run build --prod
                    '''
                }
            }
        } else {
            stage('Frontend (Static)') {
                echo 'Static HTML frontend - no build needed'
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
                sh 'kubectl set image deployment/real-estate-backend backend=us-central1-docker.pkg.dev/real-estate-dapp-jee/jee-repo/backend:latest'
                sh 'kubectl set image deployment/real-estate-frontend frontend=us-central1-docker.pkg.dev/real-estate-dapp-jee/jee-repo/frontend:latest'
            }
        }
    }
}