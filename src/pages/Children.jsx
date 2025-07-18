function Children() {
  const childrenList = [
    { id: 1, name: "Alice Smith", grade: "Grade 5", status: "Active" },
    { id: 2, name: "Bob Johnson", grade: "Grade 7", status: "Active" },
    { id: 3, name: "Charlie Brown", grade: "Grade 3", status: "Inactive" },
  ]

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Children</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead>
            <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Grade</th>
              <th className="py-3 px-6 text-left">Status</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {childrenList.map((child) => (
              <tr key={child.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left whitespace-nowrap">{child.name}</td>
                <td className="py-3 px-6 text-left">{child.grade}</td>
                <td className="py-3 px-6 text-left">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      child.status === "Active" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                    }`}
                  >
                    {child.status}
                  </span>
                </td>
                <td className="py-3 px-6 text-center">
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs">
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-center">
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md">
          Add New Child
        </button>
      </div>
    </div>
  )
}

export default Children
