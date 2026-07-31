#el db ely asln 3ndy
resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
}

#repo lel docker 
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = "atlas-repo"
  description   = "Docker repository for Atlas of Stories"
  format        = "DOCKER"
  depends_on    = [google_project_service.artifact_registry_api]
}


resource "google_secret_manager_secret" "geocoding_key" {
  secret_id = "geocoding-api-key"
  replication {
    auto {}
  }
}

# acc lel app bta3y
resource "google_service_account" "cloudrun_sa" {
  account_id   = "atlas-cloudrun-sa"
  display_name = "Atlas of Stories Cloud Run Service Account"
}

#iam user lel acc dah
resource "google_secret_manager_secret_iam_member" "secret_access" {
  secret_id = google_secret_manager_secret.geocoding_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}
resource "google_project_iam_member" "firestore_access" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}
resource "google_project_iam_member" "ai_access" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}
