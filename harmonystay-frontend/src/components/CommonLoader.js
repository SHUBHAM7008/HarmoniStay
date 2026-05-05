import React from "react";
import "./CommonLoader.css";

const CommonLoader = ({ show, message = "Please wait..." }) => {
  if (!show) return null;

  return (
    <div className="common-loader" role="status" aria-live="polite">
      <div className="common-loader__box">
        <span className="common-loader__spinner" aria-hidden="true" />
        <p>{message}</p>
      </div>
    </div>
  );
};

export default CommonLoader;
