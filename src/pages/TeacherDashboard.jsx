function TeacherDashboard() {
  const classes = [
    { id: 1, name: "Grade 5 Math", students: 25, homeworkDue: 3 },
    { id: 2, name: "Grade 6 Science", students: 22, homeworkDue: 1 },
    { id: 3, name: "Grade 7 English", students: 28, homeworkDue: 5 },
  ]

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Total Classes</h2>
          <p className="text-4xl font-bold text-blue-600">{classes.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Students Enrolled</h2>
          <p className="text-4xl font-bold text-green-600">{classes.reduce((sum, c) => sum + c.students, 0)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Homework to Review</h2>
          <p className="text-4xl font-bold text-yellow-600">{classes.reduce((sum, c) => sum + c.homeworkDue, 0)}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">My Classes</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead>
            <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Class Name</th>
              <th className="py-3 px-6 text-left">Students</th>
              <th className="py-3 px-6 text-left">Homework Due</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {classes.map((cls) => (
              <tr key={cls.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left whitespace-nowrap">{cls.name}</td>
                <td className="py-3 px-6 text-left">{cls.students}</td>
                <td className="py-3 px-6 text-left">{cls.homeworkDue}</td>
                <td className="py-3 px-6 text-center">
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs">
                    View Class
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TeacherDashboard
