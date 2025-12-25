def label = "worker-${UUID.randomUUID().toString()}"

podTemplate(label: label, yaml: """
apiVersion: v1
kind: Pod
metadata:
  labels:
    some-label: some-value
spec:
  containers:
  # 1. Maven container for building the JAR
  - name: maven
    image: maven:3.8-eclipse-temurin-17
    command:
    - cat
    tty: true
    
  # 2. Kaniko container for building/pushing Docker image
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    command:
    - /busybox/cat
    tty: true
    volumeMounts:
      - name: kaniko-secret
        mountPath: /secret
        
  # 3. [NEW] Kubectl container for deployment (Fix for 'kubectl: not found')
  - name: kubectl
    image: bitnami/kubectl:latest
    command:
    - cat
    tty: true

  volumes:
  - name: kaniko-secret
    secret:
      secretName: gcp-service-account-key # Ensure this secret exists in your K8s
"""
) {
    node(label) {
        try {
            stage('Checkout') {
                checkout scm
            }

            stage('Build Maven') {
                container('maven') {
                    // Builds the JAR file visible in your logs
                    sh 'mvn clean package -DskipTests'
                }
            }

            stage('Build & Push Image') {
                container('kaniko') {
                    // Uses the Kaniko arguments seen in your logs
                    // Ensure your Dockerfile copies the JAR from the build context
                    sh '''
                    /kaniko/executor \
                    --context `pwd` \
                    --dockerfile ./Dockerfile \
                    --destination us-central1-docker.pkg.dev/real-estate-dapp-jee/jee-repo/backend:latest
                    '''
                }
            }

            stage('Deploy to Kubernetes') {
                // [NEW] Run these commands inside the kubectl container
                container('kubectl') {
                    withCredentials([file(credentialsId: 'kubeconfig-credentials-id', variable: 'KUBECONFIG')]) {
                        sh 'echo Test de connexion...'
                        
                        // This should now work
                        sh 'kubectl get pods'
                        
                        // Actual deployment command (Example update)
                        sh 'kubectl set image deployment/real-estate-backend backend=us-central1-docker.pkg.dev/real-estate-dapp-jee/jee-repo/backend:latest'
                        
                        // Or if you use a yaml file:
                        // sh 'kubectl apply -f k8s/deployment.yaml'
                    }
                }
            }

        } catch (e) {
            currentBuild.result = 'FAILURE'
            throw e
        }
    }
}