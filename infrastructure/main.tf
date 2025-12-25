# --- 1. Le Cluster GKE (Le cerveau) ---
resource "google_container_cluster" "primary" {
  name     = "jee-cluster"
  location = var.zone  # IMPORTANT: Utiliser une ZONE (pas une région) pour la gratuité des frais de gestion

  # On commence avec un pool vide pour le personnaliser (Best Practice)
  remove_default_node_pool = true
  initial_node_count       = 1
  
  # IMPORTANT pour les étudiants : Permet de détruire le cluster facilement
  deletion_protection      = false 
}

# --- 2. Les Nœuds (Les muscles - Version Économique) ---
resource "google_container_node_pool" "primary_nodes" {
  name       = "spot-node-pool"
  location   = var.zone
  cluster    = google_container_cluster.primary.name
  node_count = 1  # Un seul serveur pour commencer

  node_config {
    #preemptible  = true  # OBSOLÈTE mais souvent utilisé, voir 'spot' ci-dessous
    spot         = true  # CRUCIAL: Active les instances "Spot" (-80% du prix)
    
    # e2-medium (2 vCPU, 4GB RAM) est le minimum vital pour Spring Boot + Angular
    # Grâce au mode Spot, ça coûtera très peu cher (quelques centimes/heure)
    machine_type = "e2-medium"

    # Réduire la taille du disque (Standard est 100GB -> on met 20GB pour économiser)
    disk_size_gb = 20
    disk_type    = "pd-standard" # Disque dur standard (moins cher que SSD)

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}
# --- 3. Artifact Registry (Le stockage des images Docker) ---
resource "google_artifact_registry_repository" "my_repo" {
  location      = var.region
  repository_id = "jee-repo"
  description   = "Repository Docker pour le projet JEE"
  format        = "DOCKER"
}