import { IoClose, IoDocument, IoImage } from 'react-icons/io5';
import { formatFileSize } from '../utils/imageUtils';

const FilePreview = ({ files, onRemove }) => {
  const getFilePreview = (file) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <IoImage className="w-8 h-8 text-blue-400" />;
    }
    return <IoDocument className="w-8 h-8 text-gray-400" />;
  };

  if (!files || files.length === 0) return null;

  return (
    <div className="mb-3 space-y-2">
      <div className="text-sm text-gray-300 mb-2">
        {files.length} file{files.length > 1 ? 's' : ''} selected:
      </div>
      <div className="flex flex-wrap gap-2">
        {files.map((file, index) => {
          const preview = getFilePreview(file);
          
          return (
            <div
              key={index}
              className="relative bg-white/10 rounded-lg overflow-hidden"
            >
              {preview ? (
                // Image preview
                <div className="relative w-24 h-24">
                  <img
                    src={preview}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs text-center px-2 truncate">
                      {file.name}
                    </span>
                  </div>
                </div>
              ) : (
                // Document preview
                <div className="w-24 h-24 flex flex-col items-center justify-center p-2">
                  {getFileIcon(file.type)}
                  <span className="text-xs text-white text-center truncate w-full mt-1">
                    {file.name}
                  </span>
                </div>
              )}
              
              {/* File size */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1 py-0.5 text-center">
                {formatFileSize(file.size)}
              </div>
              
              {/* Remove button */}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                aria-label="Remove file"
              >
                <IoClose className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FilePreview;
