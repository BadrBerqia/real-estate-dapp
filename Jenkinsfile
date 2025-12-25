def label = "worker-${UUID.randomUUID().toString()}"

podTemplate(label: label, yaml: """
apiVersion: v1
kind: Pod
metadata:
  labels:
    some-label: some-value
spec:
  containers:
  # 1. JNLP (L'agent Jenkins lui-même) - On le force à être petit
  - name: jnlp
    image: jenkins/inbound-agent:latest
    resources:
      requests:
        cpu: 50m
        memory: 128Mi

  # 2. Maven - Minimum vital pour compiler
  - name: maven
    image: maven:3.8-eclipse-temurin-17
    command:
    - cat
    tty: true
    resources:
      requests:
        cpu: 150m     # Réduit de 250m à 150m
        memory: 300Mi # Réduit de 512Mi à 300Mi

  # 3. Kaniko - Minimum vital pour construire l'image
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
        cpu: 100m     # Réduit drastiquement
        memory: 256Mi # Réduit drastiquement

  # 4. Kubectl - Presque rien
  - name: kubectl
    image: bitnami/kubectl:latest
    command:
    - cat
    tty: true
    resources:
      requests:
        cpu: 20m
        memory: 32Mi

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
                    // On ajoute -T 1C pour dire à Maven d'y aller doucement sur le CPU
                    sh 'mvn clean package -DskipTests -T 1C'
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
                    withCredentials([file(credentialsId: 'kubeconfig-credentials-id', variable: 'KUBECONFIG')]) {
                        sh 'echo Test de connexion...'
                        sh 'kubectl get pods'
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