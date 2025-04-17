import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const LoadingButton = ({ isLoading, setIsLoading, handleClick }) => {
  return (
    <button
      className="btn btn-primary btn-sm"
      type="button"
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
        </>
      ) : (
        'Submit'
      )}
    </button>
  );
};

export default LoadingButton;
