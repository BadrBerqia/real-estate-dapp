pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: kaniko
spec:
  containers:
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    command:
    - cat
    tty: true
"""
        }
    }

    environment {
        // TES INFOS GOOGLE CLOUD
        PROJECT_ID = 'real-estate-dapp-jee'
        REGION = 'us-central1'
        REPO_NAME = 'jee-repo'
        IMAGE_NAME = 'backend' 
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Récupérer le code depuis GitHub
                checkout scm
            }
        }

        stage('Build & Push Backend') {
            steps {
                container('kaniko') {
                    // On utilise la clé gcp-key pour se connecter
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
    }
}