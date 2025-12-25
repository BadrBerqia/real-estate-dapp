def label = "worker-${UUID.randomUUID().toString()}"
podTemplate(label: label, yaml: """
apiVersion: v1
kind: Pod
metadata:
  labels:
    some-label: some-value
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
    image: google/cloud-sdk:slim
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
        try {
            stage('Checkout') {
                checkout scm
            }
            
            stage('Build Maven') {
                container('maven') {
                    sh 'cd backend && mvn clean package -DskipTests -T 1C'
                }
            }
            
            stage('Build & Push Image') {
                container('kaniko') {
                    sh '''
                    /kaniko/executor \
                    --context `pwd`/backend \
                    --dockerfile `pwd`/backend/Dockerfile \
                    --destination us-central1-docker.pkg.dev/real-estate-dapp-jee/jee-repo/backend:latest
                    '''
                }
            }
            
            stage('Deploy to Kubernetes') {
                container('gcloud') {
                    sh 'echo "Testing kubectl..."'
                    sh 'kubectl version --client || true'
                    sh 'kubectl get pods || true'
                    sh 'kubectl set image deployment/real-estate-backend backend=us-central1-docker.pkg.dev/real-estate-dapp-jee/jee-repo/backend:latest || echo "Deployment not found yet"'
                }
            }
        } catch (e) {
            currentBuild.result = 'FAILURE'
            throw e
        }
    }
}