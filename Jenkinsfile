def label = "worker-${UUID.randomUUID().toString()}"

podTemplate(label: label, yaml: """
apiVersion: v1
kind: Pod
metadata:
  labels:
    some-label: some-value
spec:
  containers:
  # 1. Maven : On limite le CPU pour éviter l'erreur "Insufficient cpu"
  - name: maven
    image: maven:3.8-eclipse-temurin-17
    command:
    - cat
    tty: true
    resources:
      requests:
        cpu: 250m
        memory: 512Mi

  # 2. Kaniko : On limite aussi le CPU
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    command:
    - /busybox/cat
    tty: true
    volumeMounts:
      - name: kaniko-secret
        mountPath: /secret
    resources:
      requests:
        cpu: 250m
        memory: 512Mi

  # 3. Kubectl : Très léger, on demande le minimum
  - name: kubectl
    image: bitnami/kubectl:latest
    command:
    - cat
    tty: true
    resources:
      requests:
        cpu: 50m
        memory: 64Mi

  volumes:
  - name: kaniko-secret
    secret:
      secretName: gcp-service-account-key
"""
) {
    node(label) {
        try {
            stage('Checkout') {
                checkout scm
            }

            stage('Build Maven') {
                container('maven') {
                    sh 'mvn clean package -DskipTests'
                }
            }

            stage('Build & Push Image') {
                container('kaniko') {
                    sh '''
                    /kaniko/executor \
                    --context `pwd` \
                    --dockerfile ./Dockerfile \
                    --destination us-central1-docker.pkg.dev/real-estate-dapp-jee/jee-repo/backend:latest
                    '''
                }
            }

            stage('Deploy to Kubernetes') {
                container('kubectl') {
                    // ATTENTION : Vérifie que l'ID 'kubeconfig-credentials-id' correspond bien à tes identifiants Jenkins
                    withCredentials([file(credentialsId: 'kubeconfig-credentials-id', variable: 'KUBECONFIG')]) {
                        sh 'echo Test de connexion...'
                        sh 'kubectl get pods'
                        
                        // Commande de déploiement
                        sh 'kubectl set image deployment/real-estate-backend backend=us-central1-docker.pkg.dev/real-estate-dapp-jee/jee-repo/backend:latest'
                    }
                }
            }

        } catch (e) {
            currentBuild.result = 'FAILURE'
            throw e
        }
    }
}