import { X, Eye, EyeOff, Lock, KeyRound } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function ChangePasswordModal({ isOpen, onClose, handleUpdatePassword }) {
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  if (!isOpen) return null;

  const toggleVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const InputIcon = ({ icon: Icon }) => (
    <div className="absolute top-3 left-3 pointer-events-none">
      <Icon size={16} className="text-gray-500 group-focus-within:text-primary-400 transition-colors" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-md glass-card rounded-3xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-white/10 bg-white/5 backdrop-blur-xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <KeyRound size={20} className="text-primary-400" />
            Change Password
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
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
                toast.error("Password must contain uppercase, lowercase, and a number.");
                return;
              }

              if (newPassword !== confirmPassword) {
                toast.error("New passwords do not match.");
                return;
              }

              handleUpdatePassword(oldPassword, newPassword);
              onClose();
            }}
            className="space-y-4"
          >
            {/* Old Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400">Old Password</label>
              <div className="relative group">
                <InputIcon icon={Lock} />
                <input
                  type={showPasswords.old ? "text" : "password"}
                  name="oldPassword"
                  placeholder="Enter current password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2.5 bg-dark-200/50 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility("old")}
                  className="absolute p-2 right-1 top-1 text-gray-500 hover:text-white transition-colors"
                >
                  {showPasswords.old ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400">New Password</label>
              <div className="relative group">
                <InputIcon icon={KeyRound} />
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  placeholder="Enter new password"
                  required
                  autoComplete="new-password"
                  className="w-full pl-9 pr-10 py-2.5 bg-dark-200/50 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility("new")}
                  className="absolute p-2 right-1 top-1 text-gray-500 hover:text-white transition-colors"
                >
                  {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400">Confirm Password</label>
              <div className="relative group">
                <InputIcon icon={KeyRound} />
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-dark-200/50 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility("confirm")}
                  className="absolute p-2 right-1 top-1 text-gray-500 hover:text-white transition-colors"
                >
                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-sm font-medium bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 text-sm font-medium bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-lg transform active:scale-[0.98] transition-all cursor-pointer"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
