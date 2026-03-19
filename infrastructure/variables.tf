variable "project_id" {
  description = "The Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "The region to deploy to"
  type        = string
  default     = "us-west1"
}

variable "container_image" {
  description = "The Docker image URL for Pocket Gull (from Artifact Registry / Container Registry)"
  type        = string
}
