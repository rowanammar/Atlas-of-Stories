# 🗺️ Atlas of Stories

**Atlas of Stories** is an interactive literary map application. Search for any book and instantly see every real-world place connected to it on a dynamic map. Discover plot settings, author inspirations, and historical contexts accompanied by trivia and quotes.
Try it here: [Atlas of Stories](https://atlas-app-666753333780.us-central1.run.app/)

## ✨ Features

- **Book Search & Discovery**: Search for books using the [OpenLibrary API](https://openlibrary.org/developers/api) and select a title to map its story.
- **AI-Powered Location Extraction**: Uses the **Google Gemini API** to intelligently extract locations, context, and quotes based on the selected book's plot and history.
- **Interactive Mapping**: Visualizes extracted locations on an interactive world map powered by **MapLibre GL** and Carto tiles.
- **Performance & Caching**: Employs **Google Cloud Firestore** to cache book data and geocoding results, ensuring fast response times on repeated searches.
- **Surprise Me**: Click the surprise button to discover random classic books and their geographical journeys.

## 🏗️ Architecture & Tech Stack
   
- **Frontend**: React (Vite), MapLibre GL
- **Backend**: Node.js, Express.js
- **Cloud & Infrastructure** (GCP):
  - **Deployment**: Google Cloud Run
  - **CI/CD**: Google Cloud Build (building Docker images and pushing to Artifact Registry)
  - **Infrastructure as Code**: Terraform (provisions Cloud Run and Artifact Registry)
  - **Database**: Google Cloud Firestore
  - **Secrets Management**: Google Cloud Secret Manager

## ☁️ Deployment

The application is fully containerized and configured for CI/CD via **Google Cloud Build**.

1. **Infrastructure Provisioning**: Use the provided Terraform configurations in the `Terraform/` directory to create the Artifact Registry and enable necessary APIs.
2. **CI/CD**: Any push to the main branch triggers `cloudbuild.yaml` which:
   - Builds the Docker image.
   - Pushes it to Artifact Registry.
   - Deploys the new revision to **Google Cloud Run**.
3. **Secrets**: Ensure your `GEOCODING_API_KEY` and `GEMINI_API_KEY` are stored in Google Secret Manager and accessible by the Cloud Run Service Account.

## 📄 License
This project is open-source and available under the MIT License.
