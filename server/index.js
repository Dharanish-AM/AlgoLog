const StudentCard = ({ student }) => {
  const { name, avatar, leetcode, hackerrank, codechef, codeforces } = student;

  const handleEdit = () => {
    console.log("Edit student:", student);
  };

  const handleDelete = () => {
    console.log("Delete student:", student);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center space-x-4">
        <img src={avatar} alt={name} className="w-16 h-16 rounded-full" />
        <h2 className="text-xl font-semibold">{name}</h2>
      </div>
      <div className="mt-4 space-y-2">
        <div>LeetCode: {leetcode}</div>
        <div>HackerRank: {hackerrank}</div>
        <div>CodeChef: {codechef}</div>
        <div>Codeforces: {codeforces}</div>
      </div>
      <div className="flex justify-end gap-4 px-8 pb-6">
        <button
          onClick={handleEdit}
          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none"
        >
          Edit Student
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
        >
          Delete Student
        </button>
      </div>
    </div>
  );
};
