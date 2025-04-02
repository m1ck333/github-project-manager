import React from "react";
import { FiRefreshCw } from "react-icons/fi";

import Button from "../Button";
import InfoBox from "../InfoBox";

/**
 * @deprecated Use InfoBox with variant="error" instead.
 * This component is kept for backward compatibility.
 */
interface ErrorProps {
  message?: string;
  retry?: () => void;
}

const Error: React.FC<ErrorProps> = ({
  message = "Something went wrong. Please try again.",
  retry,
}) => {
  return (
    <InfoBox variant="error" title="Error">
      <div>
        <p>{message}</p>
        {retry && (
          <Button variant="primary" onClick={retry} style={{ marginTop: "10px" }}>
            <FiRefreshCw size={16} style={{ marginRight: "5px" }} />
            Try Again
          </Button>
        )}
      </div>
    </InfoBox>
  );
};

export default Error;
