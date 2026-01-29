import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { GridLoader } from "react-spinners";
import { X, User, Mail, Phone, Hash, BookOpen, UserCheck, Home, Heart, Code, Github, Globe } from "lucide-react";
import { validateSkillrackUrl } from "../utils/skillrackValidator";
import { STUDENT_YEARS, ACCOMMODATION_TYPES, GENDERS, INTERESTS, SECTIONS, DEPARTMENTS } from "../utils/constants";

const API_URL = import.meta.env.VITE_API_URL;

const SignUpForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    rollNo: "",
    year: "",
    section: "",
    department: "",
    accommodation: "",
    gender: "",
    interest: "",
    leetcode: "",
    hackerrank: "",
    codechef: "",
    codeforces: "",
    skillrack: "",
    github: "",
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!formData.email.endsWith("@sece.ac.in")) {
      toast.error("Email must end with @sece.ac.in");
      setIsSubmitting(false);
      return;
    }

    const skillrackUrl = formData.skillrack.trim();
    const skillrackValidation = validateSkillrackUrl(skillrackUrl);
    if (!skillrackValidation.valid) {
      toast.error(skillrackValidation.message);
      setIsSubmitting(false);
      return;
    }

    try {
      const trimmedData = {
        ...formData,
        leetcode: formData.leetcode.trim(),
        hackerrank: formData.hackerrank.trim(),
        codechef: formData.codechef.trim(),
        codeforces: formData.codeforces.trim(),
        skillrack: skillrackUrl,
        github: formData.github.trim(),
      };
      const success = await onSubmit(trimmedData);
      if (success) {
        setFormData({
          name: "",
          email: "",
          mobileNumber: "",
          rollNo: "",
          year: "",
          section: "",
          department: "",
          accommodation: "",
          gender: "",
          interest: "",
          leetcode: "",
          hackerrank: "",
          codechef: "",
          codeforces: "",
          skillrack: "",
          github: "",
        });
      }
    } catch (err) {
      console.error("SignUpForm error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="absolute inset-0 z-50 flex justify-center items-center h-screen bg-dark-200/80 backdrop-blur-sm">
        <GridLoader color="#C084FC" size={20} />
      </div>
    );
  }

  const InputIcon = ({ icon: Icon }) => (
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Icon className="h-4 w-4 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-dark-100 rounded-2xl shadow-2xl border border-gray-700/50 flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-dark-200/50">
          <div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Create Account
            </h2>
            <p className="text-sm text-gray-400">Enter your details to register</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Area */}
        <div className="overflow-y-auto p-6 scrollbar-custom">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Personal Info Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 ml-1">Name</label>
                  <div className="relative group">
                    <InputIcon icon={User} />
                    <input type="text" placeholder="Full Name" required
                      value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-dark-200/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 ml-1">Email</label>
                  <div className="relative group">
                    <InputIcon icon={Mail} />
                    <input type="email" placeholder="student@sece.ac.in" required
                      value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-dark-200/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 ml-1">Mobile Number</label>
                  <div className="relative group">
                    <InputIcon icon={Phone} />
                    <input type="tel" placeholder="Phone Number" required
                      value={formData.mobileNumber} onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-dark-200/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 ml-1">Gender</label>
                  <div className="relative group">
                    <InputIcon icon={UserCheck} />
                    <select required value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full pl-9 pr-8 py-2.5 rounded-lg bg-dark-200/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all appearance-none text-sm"
                    >
                      <option value="" disabled>Select Gender</option>
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Info Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Academic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 ml-1">Roll Number</label>
                  <div className="relative group">
                    <InputIcon icon={Hash} />
                    <input type="text" placeholder="Roll Number" required
                      value={formData.rollNo} onChange={e => setFormData({ ...formData, rollNo: e.target.value.toUpperCase() })}
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-dark-200/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 ml-1">Department</label>
                  <div className="relative group">
                    <InputIcon icon={BookOpen} />
                    <select required value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}
                      className="w-full pl-9 pr-8 py-2.5 rounded-lg bg-dark-200/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all appearance-none text-sm"
                    >
                      <option value="" disabled>Select Department</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 ml-1">Year</label>
                  <div className="relative group">
                    <InputIcon icon={BookOpen} /> {/* Reusing icon */}
                    <select required value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })}
                      className="w-full pl-9 pr-8 py-2.5 rounded-lg bg-dark-200/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all appearance-none text-sm"
                    >
                      <option value="" disabled>Select Year</option>
                      {STUDENT_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 ml-1">Section</label>
                  <div className="relative group">
                    <InputIcon icon={BookOpen} /> {/* Reusing icon */}
                    <select required value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })}
                      className="w-full pl-9 pr-8 py-2.5 rounded-lg bg-dark-200/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all appearance-none text-sm"
                    >
                      <option value="" disabled>Select Section</option>
                      {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 ml-1">Accommodation</label>
                  <div className="relative group">
                    <InputIcon icon={Home} />
                    <select required value={formData.accommodation} onChange={e => setFormData({ ...formData, accommodation: e.target.value })}
                      className="w-full pl-9 pr-8 py-2.5 rounded-lg bg-dark-200/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all appearance-none text-sm"
                    >
                      <option value="" disabled>Select Accommodation</option>
                      {ACCOMMODATION_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 ml-1">Interest</label>
                  <div className="relative group">
                    <InputIcon icon={Heart} />
                    <select required value={formData.interest} onChange={e => setFormData({ ...formData, interest: e.target.value })}
                      className="w-full pl-9 pr-8 py-2.5 rounded-lg bg-dark-200/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all appearance-none text-sm"
                    >
                      <option value="" disabled>Select Interest</option>
                      {INTERESTS.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Profiles Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Coding Profiles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { key: "leetcode", label: "LeetCode ID", ph: "username", icon: Code },
                  { key: "hackerrank", label: "HackerRank ID", ph: "username", icon: Code },
                  { key: "codechef", label: "CodeChef ID", ph: "username", icon: Code },
                  { key: "codeforces", label: "Codeforces ID", ph: "username", icon: Code },
                  { key: "skillrack", label: "SkillRack URL", ph: "Profile URL", icon: Globe },
                  { key: "github", label: "GitHub ID", ph: "username", icon: Github },
                ].map(({ key, label, ph, icon }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 ml-1">{label}</label>
                    <div className="relative group">
                      <InputIcon icon={icon} />
                      <input type="text" placeholder={ph} required={key !== "github"}
                        value={formData[key]}
                        onChange={(e) => {
                          // Existing logic from previous file usually wrapped here
                          // Copying logic for simple assignment for now, can be sophisticated as before
                          // Keeping it simple for the artifact, but should consider the URL parsing logic if needed
                          // Re-implementing URL parsing logic briefly:
                          let val = e.target.value.trimStart();
                          // Simplified URL parsing reuse
                          if (val.startsWith("http")) {
                            try {
                              const url = new URL(val);
                              if (key === "leetcode" && url.pathname.startsWith("/u/")) val = url.pathname.split("/u/")[1].replace(/\/$/, "");
                              else if (key === "hackerrank" && url.pathname.startsWith("/profile/")) val = url.pathname.split("/profile/")[1].replace(/\/$/, "");
                              else if (key === "codechef" && url.pathname.startsWith("/users/")) val = url.pathname.split("/users/")[1].replace(/\/$/, "");
                              else if (key === "codeforces" && url.pathname.startsWith("/profile/")) val = url.pathname.split("/profile/")[1].replace(/\/$/, "");
                              else if (key === "github") val = url.pathname.split("/")[1].replace(/\/$/, "") || val;
                            } catch (e) { }
                          }
                          setFormData({ ...formData, [key]: val });
                        }}
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-dark-200/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating Account..." : "Complete Registration"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default SignUpForm;
