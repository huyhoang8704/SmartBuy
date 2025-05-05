pipeline {
    agent {
        docker {
            image 'node:18'
        }
    }

    // environment {
    //     DOCKER_IMAGE = "your-dockerhub-username/grab-backend"
    //     DOCKER_TAG = "latest"
    //     REGISTRY_CREDENTIALS = 'docker-hub-credentials' // ID của Docker Hub credentials trong Jenkins
    //     SERVER_HOST = 'your-server-ip'
    //     SERVER_USER = 'your-server-user'
    //     SSH_CREDENTIALS = 'ssh-credentials-id' // ID của SSH credentials trong Jenkins
    // }

    stages {
        stage('Checkout Code') {
            steps {
                echo "Checking out code from Git repository..."
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo "Installing dependencies..."
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Run Tests') {
            steps {
                echo "Running unit tests..."
                dir('backend') {
                    sh 'npm test'
                }
            }
        }

        // stage('Build Docker Image') {
        //     steps {
        //         echo "Building Docker image..."
        //         dir('backend') {
        //             sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
        //         }
        //     }
        // }

        // stage('Push Docker Image') {
        //     steps {
        //         echo "Pushing Docker image to Docker Hub..."
        //         script {
        //             docker.withRegistry('', REGISTRY_CREDENTIALS) {
        //                 sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
        //             }
        //         }
        //     }
        // }

        // stage('Deploy to Server') {
        //     steps {
        //         echo "Deploying application to server..."
        //         sshagent([SSH_CREDENTIALS]) {
        //             sh """
        //             ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} << EOF
        //             docker pull ${DOCKER_IMAGE}:${DOCKER_TAG}
        //             docker stop grab-backend || true
        //             docker rm grab-backend || true
        //             docker run -d --name grab-backend -p 4000:4000 ${DOCKER_IMAGE}:${DOCKER_TAG}
        //             EOF
        //             """
        //         }
        //     }
        // }
    }

    post {
        success {
            echo "Pipeline completed successfully!"
        }
        failure {
            echo "Pipeline failed. Please check the logs."
        }
    }
}