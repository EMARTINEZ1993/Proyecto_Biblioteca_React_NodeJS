// src/components/Common/LoadingSpinner.jsx
import React from "react";

import "./LoadingSpinner.css";

const LoadingSpinner = ({ small = false }) => {
  return (
    <div className="spinner-container">
      <div className={`spinner ${small ? "small" : ""}`}></div>
      {!small && <span className="spinner-text">Cargando...</span>}
    </div>
  );
};

export default LoadingSpinner;

//css aqui
