pipeline {
    agent any
    tools {
        nodejs 'nodejs' // Trùng với tên đã đặt ở bước trên
    }

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
        stage('Deploy to Docker Hub') {
            steps {
                withDockerRegistry(credentialsId: 'docker-hub', url: 'https://index.docker.io/v1/') {
                    echo "Building Docker image..."
                    // dir('backend') {
                    //     sh 'docker build -t huyhoang8704/grabbootcamp:latest .'
                    // }

                    echo "Pushing Docker image to Docker Hub..."
                    // dir('backend') {
                    //     sh 'docker push huyhoang8704/grabbootcamp:latest'
                    // }
                    echo "Deploying to production server..."
                }
            }
        }
    }

    post {
        success {
            echo "✅ CI/CD Pipeline succeeded!"
        }
        failure {
            echo "❌ CI/CD Pipeline failed!"
        }
    }
}