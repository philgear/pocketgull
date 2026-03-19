terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# 1. VPC Network for secure egress
resource "google_compute_network" "pocketgull_vpc" {
  name                    = "pocketgull-secure-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "pocketgull_subnet" {
  name          = "pocketgull-subnet"
  ip_cidr_range = "10.0.0.0/28"
  region        = var.region
  network       = google_compute_network.pocketgull_vpc.id
}

# 2. Serverless VPC Access Connector
# Ensures outbound traffic to Gemini/Vertex stays within Google's private network
resource "google_vpc_access_connector" "connector" {
  name          = "pg-vpc-conn"
  region        = var.region
  subnet {
    name = google_compute_subnetwork.pocketgull_subnet.name
  }
  machine_type  = "e2-micro"
  min_instances = 2
  max_instances = 3
}

# 3. Cloud Run Service (HIPAA Configured)
resource "google_cloud_run_v2_service" "pocketgull_service" {
  name     = "pocket-gull-secure"
  location = var.region
  
  # Only accessible via internal load balancer (e.g., VPN/Intranet)
  ingress  = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"

  template {
    containers {
      image = var.container_image
      
      env {
        name = "GEMINI_API_KEY"
        value_source {
          secret_key_ref {
            secret  = "GEMINI_API_KEY"
            version = "latest"
          }
        }
      }
      
      # Explicitly setting logging levels to avoid capturing PHI payload in stdout
      env {
        name  = "LOG_LEVEL"
        value = "warn"
      }
    }
    
    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "ALL_TRAFFIC"
    }
  }
}
