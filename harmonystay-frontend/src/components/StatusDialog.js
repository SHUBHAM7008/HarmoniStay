import React from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import "./StatusDialog.css";

const dialogIcon = {
  success: FaCheckCircle,
  error: FaExclamationCircle,
  info: FaInfoCircle,
};

const StatusDialog = ({
  open,
  type = "info",
  title,
  message,
  buttonText = "OK",
  onClose,
}) => {
  if (!open) return null;

  const Icon = dialogIcon[type] || FaInfoCircle;
  const heading =
    title || (type === "success" ? "Success" : type === "error" ? "Something went wrong" : "Notice");

  return (
    <div className="status-dialog" role="dialog" aria-modal="true" aria-labelledby="status-dialog-title">
      <div className={`status-dialog__panel status-dialog__panel--${type}`}>
        <button
          type="button"
          className="status-dialog__close"
          onClick={onClose}
          aria-label="Close message"
        >
          <IoClose aria-hidden="true" />
        </button>
        <Icon className="status-dialog__icon" aria-hidden="true" />
        <h3 id="status-dialog-title">{heading}</h3>
        <p>{message}</p>
        <button type="button" className="status-dialog__button" onClick={onClose}>
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default StatusDialog;
