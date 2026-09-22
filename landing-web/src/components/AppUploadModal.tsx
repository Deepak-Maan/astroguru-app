import React, { useState, useRef } from 'react';

interface AppUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion: string;
  onReleasePublished: (newRelease: any) => void;
}

export const AppUploadModal: React.FC<AppUploadModalProps> = ({
  isOpen,
  onClose,
  currentVersion,
  onReleasePublished,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState(currentVersion);
  const [buildCode, setBuildCode] = useState(297);
  const [minAndroidVersion, setMinAndroidVersion] = useState('8.0');
  const [externalUrl, setExternalUrl] = useState('');
  const [releaseNotes, setReleaseNotes] = useState(
    '• New AstroGuru feature upgrades\n• Faster Kundli matching calculations\n• Bug fixes and stability enhancements'
  );
  const [isMandatory, setIsMandatory] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.name.endsWith('.apk')) {
        setFile(dropped);
        setStatusMessage(null);
      } else {
        setStatusMessage({ type: 'error', text: 'Please select a valid Android .apk file' });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.name.endsWith('.apk')) {
        setFile(selected);
        setStatusMessage(null);
      } else {
        setStatusMessage({ type: 'error', text: 'Please select a valid Android .apk file' });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !externalUrl) {
      setStatusMessage({ type: 'error', text: 'Please upload an APK file or specify an external download URL' });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);
    setUploadProgress(15);

    const formData = new FormData();
    if (file) {
      formData.append('apk', file);
    }
    formData.append('version', version);
    formData.append('buildCode', String(buildCode));
    formData.append('minAndroidVersion', minAndroidVersion);
    formData.append('releaseNotes', releaseNotes);
    formData.append('isMandatory', String(isMandatory));
    if (externalUrl) {
      formData.append('externalUrl', externalUrl);
    }

    try {
      setUploadProgress(45);
      const res = await fetch('/api/releases/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(85);
      const data = await res.json();

      if (data.success) {
        setUploadProgress(100);
        setStatusMessage({ type: 'success', text: `v${version} published successfully!` });
        if (data.release) {
          onReleasePublished(data.release);
        }
        setTimeout(() => {
          setIsUploading(false);
          onClose();
        }, 1200);
      } else {
        setIsUploading(false);
        setStatusMessage({ type: 'error', text: data.error || 'Failed to upload release' });
      }
    } catch (err: any) {
      setIsUploading(false);
      setStatusMessage({ type: 'error', text: err.message || 'Network error during release upload' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl liquid-glass border border-amber-500/40 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-xl shadow-lg shadow-orange-500/30">
              🚀
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Upload New App Release</h3>
              <p className="text-xs text-slate-400">Publish APK build to live website and mobile OTA engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
              file
                ? 'border-emerald-500/60 bg-emerald-500/10'
                : 'border-slate-700 hover:border-amber-400/60 bg-slate-950/60'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".apk"
              className="hidden"
            />
            {file ? (
              <div className="space-y-1">
                <span className="text-3xl">📦</span>
                <div className="text-sm font-bold text-emerald-300">{file.name}</div>
                <div className="text-xs text-slate-400">
                  Size: {(file.size / (1024 * 1024)).toFixed(1)} MB · Ready to upload
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-3xl">📤</span>
                <div className="text-sm font-bold text-white">
                  Drag and drop <span className="text-amber-400 font-extrabold">.apk</span> file here
                </div>
                <div className="text-xs text-slate-400">or click to browse your computer</div>
              </div>
            )}
          </div>

          {/* External CDN URL Alternative */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Or Provide Remote APK Download URL (EAS / S3 / Firebase)
            </label>
            <input
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="/download/apk or internal CDN URL"
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Version & Build Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Version Name</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="2.9.7"
                required
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Build Code</label>
              <input
                type="number"
                value={buildCode}
                onChange={(e) => setBuildCode(Number(e.target.value))}
                placeholder="297"
                required
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          {/* Release Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Release Notes</label>
            <textarea
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              rows={3}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
              placeholder="List major changes..."
            />
          </div>

          {/* Mandatory Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
            <input
              type="checkbox"
              checked={isMandatory}
              onChange={(e) => setIsMandatory(e.target.checked)}
              className="rounded accent-amber-500"
            />
            <span>Force Mandatory Update (requires immediate user install)</span>
          </label>

          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Publishing build package...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-bold ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/30 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
            >
              {isUploading ? 'Publishing...' : 'Publish Release Now'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
