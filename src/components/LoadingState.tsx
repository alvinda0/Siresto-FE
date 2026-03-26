// components/LoadingState.tsx
import React from "react";

interface LoadingStateProps {
  message?: string;
  submessage?: string;
  fullScreen?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading data...",
  submessage = "Please wait a moment",
  fullScreen = true,
}) => {
  return (
    <div
      className={`${
        fullScreen ? "min-h-screen" : "min-h-[400px]"
      } w-full flex items-center justify-center`}
    >
      {/* Loading Card */}
      <div className="text-center">
        {/* Spinner */}

        <div className="w-12 h-12 mx-auto mb-4 border-4 border-gray-200 border-t-[#007BFF] rounded-full animate-spin"></div>

        {/* Text */}

        <p className="text-gray-700 font-medium mb-1">{message}</p>

        <p className="text-gray-500 text-sm">{submessage}</p>
      </div>
    </div>
  );
};

export default LoadingState;
