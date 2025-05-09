import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddStudentModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    rollno: '',
    year: '',
    department: '',
    section: '',
    leetcode: '',
    hackerrank: '',
    codechef: '',
    codeforces: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="scrollbar-hide bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Student</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Name', key: 'name', type: 'text', required: true },
            { label: 'Roll Number', key: 'rollno' },
            { label: 'Year', key: 'year' },
            { label: 'Department', key: 'department' },
            { label: 'Section', key: 'section' },
            { label: 'LeetCode Profile URL', key: 'leetcode', type: 'url' },
            { label: 'HackerRank Profile URL', key: 'hackerrank', type: 'url' },
            { label: 'CodeChef Profile URL', key: 'codechef', type: 'url' },
            { label: 'Codeforces Profile URL', key: 'codeforces', type: 'url' },
          ].map(({ label, key, type = 'text', required }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input
                type={type}
                value={formData[key]}
                required={required}
                placeholder={`Enter ${label.toLowerCase()}`}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                className="text-sm w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          ))}

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="text-sm px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-sm px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;