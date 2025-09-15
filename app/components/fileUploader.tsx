import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { formatSize } from '../lib/utils';

interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const [selected, setSelected] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0] || null;
      setSelected(file);           // keep local copy so we can clear UI
      onFileSelect?.(file);
    },
    [onFileSelect]
  );

  const maxFileSize = 20 * 1024 * 1024;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: maxFileSize,
  });

  const clearFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();          // don't open file dialog
    setSelected(null);
    onFileSelect?.(null);
  };

  return (
    <div className="w-full gradient-border">
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <div className="space-y-4 cursor-pointer">
          <div className="mx-auto w-16 h-16 flex items-center justify-center">
            <img src="/icons/info.svg" alt="upload" className="size-20" />
          </div>

          {selected ? (
            <div
              className="uploader-selected-file"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3">
                <img src="/images/pdf.png" alt="pdf" className="size-9" />
                <div>
                  <p className="text-sm text-gray-600 font-medium truncate">
                    {selected.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatSize(selected.size)}
                  </p>
                </div>
              </div>

              <button
                type="button"                // <-- important: prevent form submit
                className="p-2 cursor-pointer"
                onClick={clearFile}
                aria-label="Remove file"
              >
                <img src="/icons/cross.svg" alt="remove" className="size-16" />
              </button>
            </div>
          ) : (
            <div>
              <p className="text-lg text-gray-500">
                <span className="font-semibold text-white">
                  {isDragActive ? 'Drop the PDF here' : 'Click here to upload Resume'}
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-lg text-gray-500">
                PDF (max {formatSize(maxFileSize)})
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
