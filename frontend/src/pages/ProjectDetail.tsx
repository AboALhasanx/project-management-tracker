import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react'

export default function ProjectDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', due_date: '' })

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => axios.get(`/api/projects/${id}`).then(r => r.data)
  })

  const createTask = useMutation({
    mutationFn: (data: any) => axios.post('/api/tasks', { ...data, project_id: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      setShowTaskForm(false)
      setTaskForm({ title: '', description: '', priority: 'medium', due_date: '' })
    }
  })

  const updateTask = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: any }) => axios.put(`/api/tasks/${taskId}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] })
  })

  const deleteTask = useMutation({
    mutationFn: (taskId: string) => axios.delete(`/api/tasks/${taskId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] })
  })

  if (isLoading) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />

  const columns = {
    todo: project?.tasks?.filter((t: any) => t.status === 'todo') || [],
    'in-progress': project?.tasks?.filter((t: any) => t.status === 'in-progress') || [],
    done: project?.tasks?.filter((t: any) => t.status === 'done') || []
  }

  const priorityColors: Record<string, string> = {
    urgent: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  }

  return (
    <div>
      <Link to="/projects" className="flex items-center text-blue-600 mb-4 hover:underline">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Projects
      </Link>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold">{project?.name}</h1>
        <p className="text-gray-600 mt-2">{project?.description}</p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <button
          onClick={() => setShowTaskForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Task
        </button>
      </div>

      {showTaskForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form
            onSubmit={e => {
              e.preventDefault()
              createTask.mutate(taskForm)
            }}
            className="space-y-4"
          >
            <input
              type="text"
              placeholder="Task Title"
              value={taskForm.title}
              onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <textarea
              placeholder="Description"
              value={taskForm.description}
              onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg h-20"
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={taskForm.priority}
                onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <input
                type="date"
                value={taskForm.due_date}
                onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg">Create Task</button>
              <button type="button" onClick={() => setShowTaskForm(false)} className="bg-gray-300 px-4 py-2 rounded-lg">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(columns).map(([status, tasks]) => (
          <div key={status} className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold mb-4 capitalize flex items-center justify-between">
              {status.replace('-', ' ')}
              <span className="bg-gray-200 text-gray-700 text-sm px-2 py-1 rounded-full">{tasks.length}</span>
            </h3>
            <div className="space-y-3">
              {tasks.map((task: any) => (
                <div key={task.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <GripVertical className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                      </div>
                    </div>
                    <button onClick={() => deleteTask.mutate(task.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t">
                    <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[task.priority] || ''}`}>
                      {task.priority}
                    </span>
                    <select
                      value={task.status}
                      onChange={e => updateTask.mutate({ taskId: task.id, data: { ...task, status: e.target.value } })}
                      className="text-xs border rounded px-2 py-1"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
