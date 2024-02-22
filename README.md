# Coding exercise: video duration
Upload 1+ videos and get the total duration of a "course"
- backend: **FastAPI**
- frontend: **Next.js**
- database: Google Cloud **Firestore**
- deployment: Docker Dompose on **Google Compute Engine**
- [online demo](http://104.196.209.243:3000/)

## How to run the demo locally
1. Set up upload directory for video uploads. Example:
   ```bash
   cd video-duration-api
   mkdir uploads
   echo "UPLOADS_DIR=uploads" >> .env
   ```
2. Set up CORS for Next.js client on FastAPI backend
   ```bash
   echo "ORIGINS=http://your_hostname:3000" >> .env
   ```
3. Set up Firestore authentication credentials
   You should have a functioning Firestore database on Google Cloud. Create a [service account key](https://cloud.google.com/iam/docs/keys-create-delete#iam-service-account-keys-create-console) and set up [authentication](https://cloud.google.com/firestore/docs/create-database-server-client-library#set_up_authentication):
   ```bash
   echo "GOOGLE_APPLICATION_CREDENTIALS=your-firestore-auth-key.json" >> .env
   ```
4. Set up Next.js public API URL
   This will tell Next.js where to find the FastAPI backend.
   ```bash
   cd ../video-duration-app
   echo "NEXT_PUBLIC_API_URL=http://your_hostname:8000" > .env
   ```
5. Create and run containers
   ```bash
   cd ..
   docker-compose up --build
   ```

## API endpoints
FastAPI endpoints on http://104.196.209.243:8000
[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://app.getpostman.com/run-collection/33030078-97f97a57-78fa-4d6a-a817-cad25813252c?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D33030078-97f97a57-78fa-4d6a-a817-cad25813252c%26entityType%3Dcollection%26workspaceId%3D9222205e-2931-4bf9-ae62-763c01d3a015)

### POST /upload
Upload 1+ video files for a "course"

Parameters: `files` 1+ video files as form-data on request body

Response status: 201 Created

Response body: `{ "course_id": [course_id] }`

[Example on Postman](https://www.postman.com/lucaspporto/workspace/coding-exercise/request/33030078-3f6307b0-8070-4071-90e4-e173633591f2)

### GET /course/{course_id}/duration
Query total duration for a course

Parameters: `course_id` on URL

Response: `{ "duration": "HH:MM:SS.ss" }`

[Example on Postman](https://www.postman.com/lucaspporto/workspace/coding-exercise/request/33030078-d39a1ca1-a045-4d54-bc6b-cec5b533675c)

## Sequence diagram

```mermaid
sequenceDiagram
    participant Browser
    participant Next.js
    Browser->>Next.js: GET /
    Next.js-->>Browser: User gets UI from Next.js running on port 3000
    participant FastAPI
    Browser->>FastAPI: POST /upload on port 8000
    Note right of Browser: user clicks on Upload submit button, video files are sent in form-data
    Note left of FastAPI: backend saves video files to local storage for processing
    participant Firestore
    FastAPI->>Firestore: Add "course" with total duration to courses collection
    Firestore-->>FastAPI: returns newly created {course_id}
    FastAPI-->>Browser: 201 Created
    Note left of FastAPI: backend returns newly created {course_id} to Next.js app
    Browser->>FastAPI: GET /course/{course_id}/duration
    Note right of Browser: Next.js fetches course duration
    FastAPI->>Firestore: Get "course" with {course_id}
    Firestore-->>FastAPI: { "videos": [], "duration": total_duration_in_seconds }
    FastAPI-->Browser: { "duration": "HH:MM:SS.ss" }
    Note right of Browser: total video duration rendered on page
```
