import { useState } from "react";
import { XCircle, ChevronDown } from "lucide-react";

const USERS = [
  "Pratik Prakash",
  "Tejas",
  "Sachin Mohite",
  "Rohit Veer",
  "Swarupa Shinde",
];

const PRIORITIES = [
  {
    value: "Critical",
    idle: "border-red-500 text-red-500",
    active: "border-red-500 bg-red-500 text-white",
  },
  {
    value: "High",
    idle: "border-orange-500 text-orange-500",
    active: "border-orange-500 bg-orange-500 text-white",
  },
  {
    value: "Medium",
    idle: "border-yellow-400 text-yellow-500",
    active: "border-yellow-400 bg-yellow-400 text-white",
  },
  {
    value: "Low",
    idle: "border-green-500 text-green-600",
    active: "border-green-500 bg-green-500 text-white",
  },
];

const emptyForm = {
  title: "",
  assignTo: USERS[0],
  dueAt: "",
  description: "",
  priority: "Low",
};

const inputClass =
  "w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-black focus:bg-white";

function Label({ children }) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
      {children}
      <span className="text-red-500">*</span>
    </label>
  );
}

function AddTaskForm({ open, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);

  if (!open) return null;

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleClose = () => {
    setForm(emptyForm);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, id: Date.now(), completed: false });
    setForm(emptyForm);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
    
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

   
      <div className="relative flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
      
        <div className="flex items-center justify-between bg-black px-5 py-4 text-white">
          <h2 className="text-base font-semibold">Add Task</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="transition hover:opacity-80"
          >
            <XCircle size={22} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-5 overflow-y-auto px-5 py-5"
        >
          <div>
            <Label>Title</Label>
            <input
              type="text"
              required
              value={form.title}
              onChange={update("title")}
              placeholder="ex. Need to call"
              className={inputClass}
            />
          </div>

          <div>
            <Label>Assign to</Label>
            <div className="relative">
              <select
                required
                value={form.assignTo}
                onChange={update("assignTo")}
                className={`${inputClass} appearance-none bg-gray-100 pr-9 font-semibold`}
              >
                {USERS.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
              />
            </div>
          </div>

          <div>
            <Label>Date &amp; Time</Label>
            <input
              type="datetime-local"
              required
              value={form.dueAt}
              onChange={update("dueAt")}
              className={inputClass}
            />
          </div>

          <div>
            <Label>Task Description</Label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={update("description")}
              placeholder="ex. I want to say..."
              className={`${inputClass} resize-y`}
            />
          </div>

          <div>
            <Label>Priority</Label>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, priority: p.value }))}
                  className={`rounded-full border px-4 py-1 text-xs font-medium transition ${
                    form.priority === p.value ? p.active : p.idle
                  }`}
                >
                  {p.value}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              className="rounded-md bg-black px-12 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-95"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTaskForm;