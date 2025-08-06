import { Edit, Eye, LogOutIcon, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { changePassword } from "../services/authOperations";
import toast from "react-hot-toast";
import { updateClass } from "../services/studentOperations";

export default function Profile({ onClose }) {
  const classUser = useSelector((state) => state.auth.class);
  const [editing, setEditing] = useState(false);
  const token = localStorage.getItem("token");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    department: "",
    section: "",
  });
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isChangePassword, setIsChangePassword] = useState();

  useEffect(() => {
    if (classUser && classUser.department?.name) {
      setFormData({
        username: classUser.username,
        email: classUser.email,
        department: classUser.department.name,
        section: classUser.section,
      });
    }
  }, [classUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await updateClass(classUser._id, formData, token);
      if (response.status == 200 || response.status == 201) {
        toast.success("Profile Updated Successfully!");
        setEditing(false);
      }
    } catch (err) {
      console.error(err);
      setEditing(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setIsChangePassword(true);
      if (newPassword != confirmPassword) {
        return 0;
      }
      const response = await changePassword(
        classUser._id,
        oldPassword,
        newPassword,
        token
      );
      if (response.status == 200 || response.status == 201) {
        setIsChangePassword(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Password Updated Successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: classUser.username,
      email: classUser.email,
      department: classUser.department.name || "N/A",
      section: classUser.section,
    });
    setEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-[35rem]">
        <div className="w-full flex justify-between items-center mb-4">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            Profile
          </div>
          <X
            className="text-gray-500 dark:text-gray-400 cursor-pointer"
            onClick={() => onClose()}
          />
        </div>
        <div className="space-y-4">
          {[
            { label: "Username", name: "username", editable: true },
            { label: "Email", name: "email", editable: true },
            { label: "Department", name: "department", editable: true },
            { label: "Section", name: "section", editable: true },
            {
              label: "No. of Students",
              value: classUser.students?.length || 0,
              editable: false,
            },
          ].map((item) => (
            <div key={item.label}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {item.label}
              </label>
              <input
                type="text"
                name={item.name}
                readOnly={!editing || !item.editable}
                value={item.name ? formData[item.name] : item.value}
                onChange={item.editable && editing ? handleChange : undefined}
                className={`w-full px-3 py-2 rounded-md ${
                  item.editable && editing
                    ? "bg-white dark:bg-gray-600"
                    : "bg-gray-100 dark:bg-gray-700"
                } text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none`}
              />
            </div>
          ))}
          <div className="flex transition-colors ease-in-out flex-col gap-2 pt-4">
            <div className="flex-row flex gap-4 w-full">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="w-full text-sm flex gap-2 items-center justify-center font-medium px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Edit size={18} />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="w-full text-sm flex gap-2 items-center justify-center font-medium px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="w-full text-sm flex gap-2 items-center justify-center font-medium px-4 py-3 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </>
              )}
              {!editing && (
                <button
                  onClick={handleChangePassword}
                  className="w-full text-sm flex gap-2  items-center justify-center font-medium px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  <Eye className="" size={18} />
                  Change Password
                </button>
              )}
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.reload();
              }}
              className="w-full mt-4 flex gap-2  items-center justify-center text-sm font-medium px-4 py-3 bg-red-500 text-white rounded-md hover:bg-red-700"
            >
              <LogOutIcon size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
      {isChangePassword && (
        <div className=" mt-6 p-4 z-1 absolute bg-gray-100 dark:bg-gray-700 rounded-md">
          <h3 className="text-md font-semibold mb-4 text-gray-800 dark:text-white">
            Change Password
          </h3>
          <div className="space-y-3">
            <input
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-600 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-600 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-600 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setIsChangePassword(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleChangePassword}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
