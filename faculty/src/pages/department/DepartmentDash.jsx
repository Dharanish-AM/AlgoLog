import React from "react";
import { useSelector } from "react-redux";

export default function DepartmentDash() {
  const students = useSelector((state) => state.students.students);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [totalCount, setTotalCount] = useState(0);
  const [addLoading, setAddLoading] = useState(false);
  const [showTopPerformer, setShowTopPerformer] = useState(false);
  const token = localStorage.getItem("token");
  const departmentUser = useSelector((state) => state.auth.class);
  return <div>DepartmentDash</div>;
}
