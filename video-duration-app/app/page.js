'use client'

import { useState } from 'react'

export function UploadForm() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [courseId, setCourseId] = useState(null);
  const [courseDuration, setCourseDuration] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0 || loading) return;

    try {
      setLoading(true);

      const data = new FormData();
      files.forEach((file) => data.append('files', file));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: 'POST',
        body: data,
      });

      if (!res.ok) throw new Error(await res.text());

      const result = await res.json();
      setCourseId(result.course_id);

      // Fetch course duration after successful upload
      const durationRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/course/${result.course_id}/duration`);
      const durationResult = await durationRes.json();
      setCourseDuration(durationResult.duration);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-gray-100 border rounded-md">
      <form onSubmit={onSubmit} className="flex flex-col space-y-4">
        <label className="text-lg font-semibold">Select Video Files:</label>
        <input
          type="file"
          name="files"
          multiple
          accept="video/*"
          onChange={(e) => setFiles(Array.from(e.target.files))}
          className="border p-2"
        />
        <p className="text-sm text-gray-500">
          Note: You can select as many files as needed.
        </p>
        <button
          type="submit"
          className={`bg-blue-500 text-white p-2 rounded-md hover:bg-blue-700 ${ loading ? 'opacity-50 cursor-not-allowed' : '' }`}
          disabled={loading}
        >
          { loading ? 'Uploading...' : 'Upload' }
        </button>
      </form>

      {courseId && (
        <div className="mt-4">
          <p className="text-lg font-semibold">Course Duration:</p>
          <p>{courseDuration}</p>
        </div>
      )}
    </div>
  )
}

export default function Home() {  
  return (
    <UploadForm />
  );
}
