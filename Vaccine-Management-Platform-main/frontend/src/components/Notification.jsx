
import React from "react";

const Notification = ({ type, message }) => {
  const bgColor = type === "success" ? "bg-green-200" : "bg-red-200";
  const textColor = type === "success" ? "text-green-800" : "text-red-800";
  return (
    <div className={`${bgColor} ${textColor} p-2 rounded text-center`}>
      {message}
    </div>
  );
};

export default Notification;
