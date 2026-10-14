'use client';

import { useState, useRef } from 'react';
import { uploadImage, uploadVideo, uploadAttachment } from '@/services/upload.service';
import { getErrorMessage } from '@/utils/error';

interface FileUploadProps {
  type: 'image' | 'video' | 'attachment';
  value?: string | null;
  onChange: (url: string, fileInfo?: { name: string; size: number; type: string }) => void;
  label?: string;
  placeholder?: string;
  accept?: string;
}

export default function FileUpload({
  type,
  value,
  onChange,
  label,
  placeholder,
  accept,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultAccept =
    accept ||
    (type === 'image'
      ? 'image/jpeg,image/png,image/webp,image/gif'
      : type === 'video'
        ? 'video/mp4,video/webm,video/ogg,video/quicktime'
        : '.pdf,.zip,.rar,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt');

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);
    setProgress(0);

    // Instant local preview for images
    if (type === 'image') {
      const localPreviewUrl = URL.createObjectURL(file);
      setPreview(localPreviewUrl);
    }

    try {
      if (type === 'image') {
        const res = await uploadImage(file);
        setPreview(res.url);
        onChange(res.url);
      } else if (type === 'video') {
        const res = await uploadVideo(file, (percent) => setProgress(percent));
        setPreview(res.url);
        onChange(res.url);
      } else {
        const res = await uploadAttachment(file);
        onChange(res.attachment.url, {
          name: res.attachment.name,
          size: res.attachment.size,
          type: res.attachment.type,
        });
      }
    } catch (err) {
      console.warn('Upload error:', err);
      setError(getErrorMessage(err));
      setPreview(value || null);
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  function handleRemove() {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}

      {error && (
        <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Image preview mode */}
      {type === 'image' && preview && (
        <div className="relative mb-3 inline-block overflow-hidden rounded-xl border border-slate-200 shadow-sm">
          <img
            src={preview}
            alt="Upload preview"
            className="h-44 w-auto max-w-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 rounded-full bg-red-600 p-1.5 text-white shadow hover:bg-red-700"
            title="Remove image"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Upload button & drop zone */}
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept={defaultAccept}
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id={`file-upload-${type}`}
        />

        <label
          htmlFor={`file-upload-${type}`}
          className={`flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <svg
            className="h-5 w-5 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <span>
            {uploading
              ? progress > 0
                ? `Uploading ${progress}%...`
                : 'Uploading...'
              : placeholder || (type === 'image' ? 'Upload Image' : type === 'video' ? 'Upload Video' : 'Upload File')}
          </span>
        </label>

        {value && type !== 'image' && (
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="truncate max-w-xs">{value}</span>
            <button
              type="button"
              onClick={handleRemove}
              className="text-red-500 hover:text-red-700 ml-1 font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {uploading && progress > 0 && (
        <div className="w-full max-w-md bg-slate-200 rounded-full h-2 overflow-hidden mt-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
