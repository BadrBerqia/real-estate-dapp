pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: jenkins-agent
spec:
  serviceAccountName: default
  containers:
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    command:
    - cat
    tty: true
  - name: kubectl
    image: google/cloud-sdk:slim
    command:
    - cat
    tty: true
"""
        }
    }

    environment {
        PROJECT_ID = 'real-estate-dapp-jee'
        REGION = 'us-central1'
        REPO_NAME = 'jee-repo'
        IMAGE_NAME = 'backend' 
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build & Push Docker') {
            steps {
                container('kaniko') {
                    withCredentials([file(credentialsId: 'gcp-key', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
                        sh """
                        /kaniko/executor --context `pwd`/backend \
                        --dockerfile `pwd`/backend/Dockerfile \
                        --destination us-central1-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME:latest \
                        --force
                        """
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    // Test de connexion avant de déployer
                    sh 'echo "Test de connexion..."'
                    sh 'kubectl get pods' 
                    
                    // Le vrai déploiement
                    sh 'kubectl apply -f k8s/backend.yaml'
                    sh 'kubectl rollout restart deployment/real-estate-backend'
                }
            }
        }
    }
}