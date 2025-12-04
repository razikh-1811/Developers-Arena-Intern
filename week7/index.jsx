import React, { useEffect, useState } from "react";

// Task Manager App — single-file React component
// Tailwind CSS classes used. Paste this component into a React + Tailwind project (Vite/Create React App with Tailwind).

export default function TaskManagerApp() {
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem("tasks_v1");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all"); // all | active | completed
  const [priority, setPriority] = useState("medium");
  const [query, setQuery] = useState("");

  useEffect(() => {
    localStorage.setItem("tasks_v1", JSON.stringify(tasks));
  }, [tasks]);

  function resetForm() {
    setTitle("");
    setPriority("medium");
    setEditingId(null);
  }

  function handleAddOrUpdate(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    if (editingId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, title: trimmed, priority } : t))
      );
    } else {
      const newTask = {
        id: Date.now().toString(),
        title: trimmed,
        completed: false,
        createdAt: new Date().toISOString(),
        priority,
      };
      setTasks((prev) => [newTask, ...prev]);
    }

    resetForm();
  }

  function toggleComplete(id) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function handleEdit(id) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    setTitle(t.title);
    setPriority(t.priority || "medium");
    setEditingId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id) {
    if (!confirm("Delete this task?")) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function clearCompleted() {
    if (!confirm("Remove all completed tasks?")) return;
    setTasks((prev) => prev.filter((t) => !t.completed));
  }

  function filteredTasks() {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      if (filter === "active" && t.completed) return false;
      if (filter === "completed" && !t.completed) return false;
      if (q && !t.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }

  const grouped = filteredTasks().sort((a, b) => {
    // sort by completed then priority then date
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const prio = { high: 0, medium: 1, low: 2 };
    if (prio[a.priority] !== prio[b.priority]) return prio[a.priority] - prio[b.priority];
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex items-start justify-center">
      <div className="w-full max-w-3xl">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-800">Task Manager</h1>
          <p className="text-sm text-slate-600">Add, edit, delete and filter tasks. LocalStorage persistence.</p>
        </header>

        <form onSubmit={handleAddOrUpdate} className="bg-white p-4 rounded-2xl shadow-sm mb-6">
          <div className="flex gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900"
            >
              {editingId ? "Update" : "Add"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-2 rounded-lg border border-slate-200 ml-1"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <section className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded ${filter === "all" ? "bg-slate-800 text-white" : "text-slate-700"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-3 py-1 rounded ${filter === "active" ? "bg-slate-800 text-white" : "text-slate-700"}`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-3 py-1 rounded ${filter === "completed" ? "bg-slate-800 text-white" : "text-slate-700"}`}
            >
              Completed
            </button>
          </div>

          <div className="flex-1 min-w-[220px]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            />
          </div>

          <div className="ml-auto flex gap-2">
            <button
              onClick={() => { setTasks([]); }}
              title="Remove all tasks"
              className="px-3 py-1 rounded border border-red-200 text-red-600"
            >
              Clear All
            </button>

            <button
              onClick={clearCompleted}
              className="px-3 py-1 rounded border border-slate-200 text-slate-700"
            >
              Clear Completed
            </button>
          </div>
        </section>

        <main>
          <div className="space-y-3">
            {grouped.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-white rounded-2xl">No tasks — add one!</div>
            ) : (
              grouped.map((task) => (
                <article key={task.id} className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task.id)}
                    className="w-5 h-5"
                    aria-label={`Mark ${task.title} as ${task.completed ? "incomplete" : "complete"}`}
                  />

                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${task.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                      {task.title}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                      <span>{new Date(task.createdAt).toLocaleString()}</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] border border-slate-200">
                        {task.priority}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(task.id)} className="px-2 py-1 rounded border border-slate-200 text-slate-700">Edit</button>
                    <button onClick={() => handleDelete(task.id)} className="px-2 py-1 rounded border border-red-200 text-red-600">Delete</button>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="mt-4 text-sm text-slate-600">Showing <strong>{grouped.length}</strong> task(s).</div>
        </main>
      </div>
    </div>
  );
}
