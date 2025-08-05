import { X, Eye, EyeOff } from "lucide-react";
import React from "react";
import toast, { Toaster } from "react-hot-toast";

export default function ChangePasswordModal({
  onClose,
  handleUpdatePassword,
}) {
  const [showPasswords, setShowPasswords] = React.useState({
    old: false,
    new: false,
    confirm: false,
  });

  const toggleVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="fixed bg-black/50 inset-0 flex items-center justify-center z-50">
      <Toaster position="top-right" />
      <div className="bg-white scrollbar-hide dark:bg-gray-800 p-6 rounded-lg shadow-lg sm:w-full max-w-xl sm:max-h-[90h] w-[90%] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Change Password
          </h2>
          <X
            onClick={() => onClose()}
            className="text-gray-400 cursor-pointer"
          />
        </div>
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const oldPassword = e.target.oldPassword.value.trim();
              const newPassword = e.target.newPassword.value.trim();
              const confirmPassword = e.target.confirmPassword.value.trim();

              if (!oldPassword || !newPassword || !confirmPassword) {
                toast.error("All fields are required.");
                return;
              }

              if (newPassword.length < 8) {
                toast.error("New password must be at least 8 characters long.");
                return;
              }

              if (
                !/[A-Z]/.test(newPassword) ||
                !/[a-z]/.test(newPassword) ||
                !/[0-9]/.test(newPassword)
              ) {
                toast.error(
                  "Password must contain uppercase, lowercase, and a number."
                );
                return;
              }

              if (newPassword !== confirmPassword) {
                toast.error("New passwords do not match.");
                return;
              }

              handleUpdatePassword(oldPassword, newPassword);
              toast.success("Password updated successfully!");
              onClose();
            }}
            className="space-y-4"
          >
            {/* Old Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Old Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.old ? "text" : "password"}
                  name="oldPassword"
                  placeholder="Enter your old password"
                  required
                  className="mt-1 block w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white pr-10"
                />
                <span
                  onClick={() => toggleVisibility("old")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer"
                >
                  {showPasswords.old ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </span>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  placeholder="Enter your new password"
                  required
                  className="mt-1 text-sm block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white pr-10"
                />
                <span
                  onClick={() => toggleVisibility("new")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer"
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Enter your confirm password"
                  required
                  className="mt-1 block text-sm w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white pr-10"
                />
                <span
                  onClick={() => toggleVisibility("confirm")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm cursor-pointer bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}