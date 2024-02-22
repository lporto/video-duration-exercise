from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from moviepy.editor import VideoFileClip
import os, shutil, datetime
from google.cloud import firestore

app = FastAPI()

# Allow requests from the Next.js app
origins = os.getenv("ORIGINS", "http://localhost:3000")

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOADS_DIR = os.getenv("UPLOADS_DIR", "uploads")
db = firestore.Client()

@app.post("/upload", status_code=201)
def upload_video(files: list[UploadFile]):

    try:
        course = { "videos": [] }

        for file in files:
            file_path = os.path.join(UPLOADS_DIR, file.filename)
            # Save the uploaded video to uploads directory
            with open(file_path, "wb") as video_file:
                shutil.copyfileobj(file.file, video_file)

            # Get the duration of the video using moviepy
            with VideoFileClip(file_path) as video:
                course["videos"].append({ "file": file.filename, "duration": video.duration })

        # Calculate total course duration in seconds
        course["duration"] = sum([ video["duration"] for video in course["videos"] ])
        _, doc_ref = db.collection("courses").add(course)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing video: {file.filename}")

    return { "course_id": doc_ref.id }

@app.get("/course/{course_id}/duration")
def course_duration(course_id: str):
    try:
        course_ref = db.collection("courses").document(course_id)
        course = course_ref.get().to_dict()
        total_duration = str(datetime.timedelta(seconds=course['duration']))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding course: {str(e)}")

    return { "duration": total_duration }
