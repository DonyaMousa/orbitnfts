import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, X, Loader2, Upload, AlertCircle } from "lucide-react";

interface CreatePostProps {
  onSubmit: (content: string, attachments?: File[]) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  placeholder?: string;
  maxLength?: number;
}

const CreatePost: React.FC<CreatePostProps> = ({
  onSubmit,
  isLoading = false,
  error,
  placeholder = "What's on your mind?",
  maxLength = 280,
}) => {
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update character count when content changes
  useEffect(() => {
    setCharCount(content.length);
  }, [content]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && !isLoading) {
      await onSubmit(content, attachments.length > 0 ? attachments : undefined);
      setContent("");
      setAttachments([]);
      setAttachmentPreviews([]);
    }
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      // Only allow up to 4 attachments
      const totalFiles = [...attachments, ...newFiles].slice(0, 4);
      setAttachments(totalFiles);

      // Create previews for images
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setAttachmentPreviews(
        [...attachmentPreviews, ...newPreviews].slice(0, 4)
      );
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);

    const newPreviews = [...attachmentPreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setAttachmentPreviews(newPreviews);
  };

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div
        className={`glass-card relative bg-black/40 border border-white/10 backdrop-blur-xl p-5 rounded-xl ${isFocused ? "shadow-neon-primary" : "shadow-xl"} transition-all duration-300`}
      >
        <form onSubmit={handleSubmit}>
          <div className="flex">
            <div className="flex-shrink-0 mr-3">
              <div className="w-10 h-10 rounded-full border-2 border-primary-500 overflow-hidden">
                <img
                  src="https://api.dicebear.com/6.x/identicon/svg?seed=user" // Replace with actual user avatar
                  alt="Your avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-grow">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                maxLength={maxLength}
                disabled={isLoading}
                className="w-full bg-transparent text-white placeholder-gray-500 outline-none resize-none min-h-[80px] overflow-hidden"
              />

              {/* Attachment previews */}
              {attachmentPreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {attachmentPreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative rounded-lg overflow-hidden group"
                    >
                      <img
                        src={preview}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="absolute top-1 right-1 bg-black/60 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 text-sm text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/10">
                <div className="flex space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAttachmentUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={isLoading || attachments.length >= 4}
                  />
                  <button
                    type="button"
                    onClick={triggerFileUpload}
                    disabled={isLoading || attachments.length >= 4}
                    className="p-2 rounded-full text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Image size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`text-xs ${charCount > maxLength * 0.8 ? "text-amber-400" : "text-gray-400"}`}
                  >
                    {charCount}/{maxLength}
                  </div>
                  <button
                    type="submit"
                    disabled={
                      !content.trim() || isLoading || charCount > maxLength
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full text-white font-medium shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Minting...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        <span>Mint Post</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CreatePost;
