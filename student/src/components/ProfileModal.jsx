import axios from "axios";
import { X, User, Mail, Phone, Hash, BookOpen, Users, Home, Heart, Globe, Github, Code, Save, Lock } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { GridLoader } from "react-spinners";
import { STUDENT_YEARS, ACCOMMODATION_TYPES, GENDERS, INTERESTS, DEPARTMENTS, SECTIONS } from "../utils/constants";

const API_URL = import.meta.env.VITE_API_URL;

export default function ProfileModal({
  student,
  isOpen,
  onClose,
  handleUpdate,
  handleChangePassword,
  setLoading,
}) {
  const [data, setData] = useState(student);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  useEffect(() => {
    if (student) {
      setData({
        ...student,
        department: typeof student.department === 'string' ? student.department : '',
      });
    }
  }, [student]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (["leetcode", "hackerrank", "codechef", "codeforces", "github"].includes(name)) {
      try {
        const url = new URL(value.trim());
        // Simple extraction logic, similar to previous implementation
        if (name === "leetcode" && url.pathname.startsWith("/u/")) newValue = url.pathname.split("/u/")[1].replace(/\/$/, "");
        else if (name === "hackerrank" && url.pathname.startsWith("/profile/")) newValue = url.pathname.split("/profile/")[1].replace(/\/$/, "");
        else if (name === "codechef" && url.pathname.startsWith("/users/")) newValue = url.pathname.split("/users/")[1].replace(/\/$/, "");
        else if (name === "codeforces" && url.pathname.startsWith("/profile/")) newValue = url.pathname.split("/profile/")[1].replace(/\/$/, "");
        else if (name === "github") newValue = url.pathname.split("/")[1].replace(/\/$/, "") || newValue;
      } catch { } // Keep value if not a URL
    }

    if (name === "department") {
      setData((prev) => ({ ...prev, [name]: newValue, section: "" }));
    } else {
      setData((prev) => ({ ...prev, [name]: newValue }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    const invalidPlatforms = ["leetcode", "hackerrank", "codechef", "codeforces", "github"];
    for (let field of invalidPlatforms) {
      if (data[field]?.includes("http") || data[field]?.includes("https")) {
        toast.error(`${field} should only contain a username, not a URL.`);
        setLoading(false);
        return;
      }
    }
    if (!data.email.endsWith("@sece.ac.in")) {
      toast.error("Email must end with @sece.ac.in.");
      setLoading(false);
      return;
    }
    if (!data.skillrack?.startsWith("http://") && !data.skillrack?.startsWith("https://")) {
      toast.error("Skillrack must be a valid URL.");
      setLoading(false);
      return;
    }

    await handleUpdate(data);
    setLoading(false);
    onClose();
  };

  const InputWrapper = ({ label, icon: Icon, children }) => (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-400 ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl glass-card rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5 backdrop-blur-xl">
          <div>
            <h2 className="text-2xl font-bold text-primary-400">
              Profile Settings
            </h2>
            <p className="text-sm text-gray-400">Update your personal and academic details</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-6 scrollbar-custom">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Personal Info */}
            <div>
              <h3 className="text-sm font-semibold text-primary-300 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputWrapper label="Name" icon={User}>
                  <input type="text" name="name" value={data.name} onChange={handleChange} disabled={!isEditing} required
                    className={`w-full pl-9 pr-4 py-2.5 rounded-lg bg-dark-200/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                  />
                </InputWrapper>
                <InputWrapper label="Email" icon={Mail}>
                  <input type="email" name="email" value={data.email} onChange={handleChange} disabled={!isEditing} required
                    className={`w-full pl-9 pr-4 py-2.5 rounded-lg bg-dark-200/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                  />
                </InputWrapper>
                <InputWrapper label="Mobile Number" icon={Phone}>
                  <input type="tel" name="mobileNumber" value={data.mobileNumber} onChange={handleChange} disabled={!isEditing} required
                    className={`w-full pl-9 pr-4 py-2.5 rounded-lg bg-dark-200/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                  />
                </InputWrapper>
                <InputWrapper label="Gender" icon={User}>
                  <select name="gender" value={data.gender || ""} onChange={handleChange} disabled={!isEditing} required
                    className={`w-full pl-9 pr-8 py-2.5 rounded-lg bg-dark-200/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all appearance-none text-sm ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <option value="" disabled>Select gender</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </InputWrapper>
              </div>
            </div>

            {/* Academic Info */}
            <div>
              <h3 className="text-sm font-semibold text-primary-300 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Academic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputWrapper label="Roll Number" icon={Hash}>
                  <input type="text" name="rollNo" value={data.rollNo} onChange={handleChange} disabled={!isEditing} required
                    className={`w-full pl-9 pr-4 py-2.5 rounded-lg bg-dark-200/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                  />
                </InputWrapper>
                <InputWrapper label="Department" icon={BookOpen}>
                  <select name="department" value={data.department || ""} onChange={handleChange} disabled={!isEditing} required
                    className={`w-full pl-9 pr-8 py-2.5 rounded-lg bg-dark-200/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all appearance-none text-sm ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <option value="" disabled>Select department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </InputWrapper>
                <InputWrapper label="Section" icon={Users}>
                  <select name="section" value={data.section || ""} onChange={handleChange} disabled={!isEditing} required
                    className={`w-full pl-9 pr-8 py-2.5 rounded-lg bg-dark-200/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all appearance-none text-sm ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <option value="" disabled>Select section</option>
                    {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </InputWrapper>
                <InputWrapper label="Year" icon={BookOpen}>
                  <select name="year" value={data.year || ""} onChange={handleChange} disabled={!isEditing} required
                    className={`w-full pl-9 pr-8 py-2.5 rounded-lg bg-dark-200/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all appearance-none text-sm ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <option value="" disabled>Select year</option>
                    {STUDENT_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </InputWrapper>
                <InputWrapper label="Accommodation" icon={Home}>
                  <select name="accommodation" value={data.accommodation || ""} onChange={handleChange} disabled={!isEditing} required
                    className={`w-full pl-9 pr-8 py-2.5 rounded-lg bg-dark-200/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all appearance-none text-sm ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <option value="" disabled>Select accommodation</option>
                    {ACCOMMODATION_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </InputWrapper>
                <InputWrapper label="Interest" icon={Heart}>
                  <select name="interest" value={data.interest || ""} onChange={handleChange} disabled={!isEditing} required
                    className={`w-full pl-9 pr-8 py-2.5 rounded-lg bg-dark-200/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all appearance-none text-sm ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <option value="" disabled>Select interest</option>
                    {INTERESTS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </InputWrapper>
              </div>
            </div>

            {/* Platform Profiles */}
            <div>
              <h3 className="text-sm font-semibold text-primary-300 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Coding Profiles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { name: 'leetcode', label: 'LeetCode', icon: Code },
                  { name: 'hackerrank', label: 'HackerRank', icon: Code },
                  { name: 'codechef', label: 'CodeChef', icon: Code },
                  { name: 'codeforces', label: 'Codeforces', icon: Code },
                  { name: 'skillrack', label: 'SkillRack URL', icon: Globe },
                  { name: 'github', label: 'GitHub', icon: Github },
                ].map(item => (
                  <InputWrapper key={item.name} label={item.label} icon={item.icon}>
                    <input type="text" name={item.name} value={data[item.name]} onChange={handleChange} disabled={!isEditing} required
                      className={`w-full pl-9 pr-4 py-2.5 rounded-lg bg-dark-200/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                    />
                  </InputWrapper>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleChangePassword}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <Lock size={16} /> Change Password
              </button>

              <button
                type={isEditing ? "submit" : "button"}
                onClick={() => !isEditing && setIsEditing(true)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white shadow-lg transform active:scale-95 transition-all ${isEditing ? 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 hover:shadow-primary-500/40' : 'bg-white/10 hover:bg-white/20'}`}
              >
                {isEditing ? <><Save size={18} /> Save Changes</> : <><User size={18} /> Edit Profile</>}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
