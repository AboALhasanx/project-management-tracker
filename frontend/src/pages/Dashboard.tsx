import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { FolderKanban, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export default function Dashboard() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => axios.get('/api/projects').then(r => r.data)
  })

  if (isLoading) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />

  const totalTasks = projects?.reduce((sum: number, p: any) => sum + (p.task_count || 0), 0) || 0
  const completedTasks = projects?.reduce((sum: number, p: any) => sum + (p.completed_tasks || 0), 0) || 0
  const activeProjects = projects?.filter((p: any) => p.status === 'active').length || 0

  const stats = [
    { label: 'Total Projects', value: projects?.length || 0, icon: FolderKanban, color: 'blue' },
    { label: 'Active Projects', value: activeProjects, icon: Clock, color: 'yellow' },
    { label: 'Total Tasks', value: totalTasks, icon: AlertCircle, color: 'purple' },
    { label: 'Completed', value: completedTasks, icon: CheckCircle, color: 'green' },
  ]

  const chartData = projects?.map((p: any) => ({
    name: p.name.slice(0, 15),
    tasks: p.task_count || 0,
    completed: p.completed_tasks || 0
  })) || []

  const pieData = [
    { name: 'Completed', value: completedTasks },
    { name: 'Remaining', value: totalTasks - completedTasks }
  ]

  const COLORS = ['#10B981', '#E5E7EB']

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map(card => (
          <div key={card.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <card.icon className={`h-8 w-8 text-${card.color}-500`} />
              <div className="ml-4">
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Tasks by Project</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tasks" fill="#3B82F6" name="Total Tasks" />
              <Bar dataKey="completed" fill="#10B981" name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Completion Rate</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center mt-4">
            <p className="text-3xl font-bold text-green-600">
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
            </p>
            <p className="text-gray-500">Tasks Completed</p>
          </div>
        </div>
      </div>
    </div>
  )
}
