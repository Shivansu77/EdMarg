'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Loader2, X, Check } from 'lucide-react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/utils/cropImage';

interface ProfileImageUploadProps {
  currentImage?: string;
  userName?: string;
  onUploadSuccess?: (newImageUrl: string) => void;
}

export default function ProfileImageUpload({ 
  currentImage, 
  userName,
  onUploadSuccess 
}: ProfileImageUploadProps) {
  const [imagePreview, setImagePreview] = useState<string>(currentImage || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropping states
  const [showCropper, setShowCropper] = useState(false);
  const [srcImage, setSrcImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/v1\/?$/, "");

  useEffect(() => {
    if (currentImage) {
      setImagePreview(currentImage.startsWith('http') || currentImage.startsWith('data:') ? currentImage : `${API_URL}${currentImage}`);
    }
  }, [currentImage, API_URL]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit before crop
      alert('File is too large. Maximum size allows before crop is 5MB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Only images are allowed.');
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setSrcImage(reader.result as string);
      setShowCropper(true);
    });
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input to allow choosing the same file again
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    if (!srcImage || !croppedAreaPixels) return;

    try {
      setIsUploading(true);
      const croppedBlob = await getCroppedImg(srcImage, croppedAreaPixels);
      if (!croppedBlob) {
        throw new Error('Failed to crop image');
      }

      // Convert Blob to File to pass correctly to FormData
      const croppedFile = new File([croppedBlob], `profile_crop_${Date.now()}.webp`, { type: 'image/webp' });

      // Locally preview instantly
      const objUrl = URL.createObjectURL(croppedBlob);
      setImagePreview(objUrl);
      setShowCropper(false);

      // Upload to server safely (this hits the existing API logic we created yesterday: Multer + Sharp)
      const formData = new FormData();
      formData.append('profileImage', croppedFile);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/v1/profile/update-image`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        const fullUrl = `${API_URL}${result.profileImage}`;
        setImagePreview(fullUrl);
        if (onUploadSuccess) onUploadSuccess(result.profileImage);
        alert('Profile picture updated successfully!');
      } else {
        throw new Error(result.message);
      }

    } catch (error: any) {
      alert(error.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const getFallbackAvatar = () => {
    return `https://ui-avatars.com/api/?name=${userName || 'User'}&background=e2e8f0&color=475569&size=160&bold=true`;
  };

  const displaySrc = imagePreview || getFallbackAvatar();

  return (
    <div className="flex flex-col items-center sm:items-start gap-4">
      {/* Avatar Container */}
      <div className="relative group">
        <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100 flex-shrink-0 relative">
          <img 
            src={displaySrc} 
            alt="Profile Avatar" 
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getFallbackAvatar();
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
          >
            {isUploading ? (
              <Loader2 className="animate-spin text-white h-7 w-7" />
            ) : (
              <Camera className="text-white h-7 w-7" />
            )}
          </button>
        </div>
        
        <button
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2 rounded-full shadow-lg border-2 border-white hover:bg-indigo-700 transition-colors z-20"
          title="Change Picture"
        >
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      {/* Cropper Modal Overlay */}
      {showCropper && srcImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-lg flex flex-col">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-800">Crop Profile Picture</h3>
              <button 
                onClick={() => setShowCropper(false)}
                className="text-gray-500 hover:text-gray-900 rounded-full p-1 hover:bg-gray-200 transition-colors"
                disabled={isUploading}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="relative w-full h-[400px] bg-gray-900">
              <Cropper
                image={srcImage}
                crop={crop}
                zoom={zoom}
                aspect={1} // 1:1 aspect ratio for profile pictures
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-4 bg-white space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-2 block font-medium">Zoom (Double tap/pinch to zoom)</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCropper(false)}
                  disabled={isUploading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCropSave}
                  disabled={isUploading}
                  className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 flex items-center justify-center gap-2 min-w-[120px]"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Crop & Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
