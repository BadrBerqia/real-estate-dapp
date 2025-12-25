variable "project_id" {
  description = "L'ID de ton projet Google Cloud (ex: real-estate-dapp-jee)"
  type        = string
}

variable "region" {
  description = "La région GCP (us-central1 est souvent la moins chère)"
  default     = "us-central1"
}

variable "zone" {
  description = "La zone spécifique pour éviter les frais de cluster régional"
  default     = "us-central1-a"
}