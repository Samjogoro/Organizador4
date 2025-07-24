"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Search, Home, DollarSign, User, Filter, Trash2, Clock, CalendarDays } from "lucide-react"

interface Task {
  id: string
  category: string
  task: string
  responsible: "Pollita" | "Pollito" | "Ambos"
  completed: boolean
  createdAt: Date
  assignedDay?: string
}

interface FinanceData {
  income: number
  fixedExpenses: number
  variableExpenses: number
}

interface PendingPayment {
  id: string
  description: string
  amount: number
  dueDate: string
  category: "fixedExpenses" | "variableExpenses"
  paid: boolean
}

interface WeeklyActivity {
  id: string
  title: string
  description: string
  day: string
  time: string
  responsible: "Pollita" | "Pollito" | "Ambos"
  completed: boolean
}

const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

export default function FamilyOrganizer() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [finances, setFinances] = useState<FinanceData>({
    income: 0,
    fixedExpenses: 0,
    variableExpenses: 0,
  })
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([])
  const [weeklyActivities, setWeeklyActivities] = useState<WeeklyActivity[]>([])
  const [taskFilter, setTaskFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  // New task form state
  const [newTask, setNewTask] = useState({
    category: "",
    task: "",
    responsible: "Pollita" as const,
    assignedDay: "",
  })

  // New payment form state
  const [newPayment, setNewPayment] = useState({
    description: "",
    amount: 0,
    dueDate: "",
    category: "fixedExpenses" as "fixedExpenses" | "variableExpenses",
  })

  // New weekly activity form state
  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    day: "",
    time: "",
    responsible: "Pollita" as const,
  })

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("familyTasks")
    const savedFinances = localStorage.getItem("familyFinances")
    const savedPayments = localStorage.getItem("pendingPayments")
    const savedActivities = localStorage.getItem("weeklyActivities")

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
    if (savedFinances) {
      setFinances(JSON.parse(savedFinances))
    }
    if (savedPayments) {
      setPendingPayments(JSON.parse(savedPayments))
    }
    if (savedActivities) {
      setWeeklyActivities(JSON.parse(savedActivities))
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("familyTasks", JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem("familyFinances", JSON.stringify(finances))
  }, [finances])

  useEffect(() => {
    localStorage.setItem("pendingPayments", JSON.stringify(pendingPayments))
  }, [pendingPayments])

  useEffect(() => {
    localStorage.setItem("weeklyActivities", JSON.stringify(weeklyActivities))
  }, [weeklyActivities])

  const addTask = () => {
    if (newTask.category && newTask.task) {
      const task: Task = {
        id: Date.now().toString(),
        ...newTask,
        completed: false,
        createdAt: new Date(),
        assignedDay: newTask.assignedDay || undefined,
      }
      setTasks([...tasks, task])
      setNewTask({
        category: "",
        task: "",
        responsible: "Pollita",
        assignedDay: "",
      })
    }
  }

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  const addWeeklyActivity = () => {
    if (newActivity.title && newActivity.day && newActivity.time) {
      const activity: WeeklyActivity = {
        id: Date.now().toString(),
        ...newActivity,
        completed: false,
      }
      setWeeklyActivities([...weeklyActivities, activity])
      setNewActivity({
        title: "",
        description: "",
        day: "",
        time: "",
        responsible: "Pollita",
      })
    }
  }

  const toggleActivityCompletion = (activityId: string) => {
    setWeeklyActivities(
      weeklyActivities.map((activity) =>
        activity.id === activityId ? { ...activity, completed: !activity.completed } : activity,
      ),
    )
  }

  const deleteActivity = (activityId: string) => {
    setWeeklyActivities(weeklyActivities.filter((activity) => activity.id !== activityId))
  }

  const addPendingPayment = () => {
    if (newPayment.description && newPayment.amount && newPayment.dueDate) {
      const payment: PendingPayment = {
        id: Date.now().toString(),
        ...newPayment,
        paid: false,
      }

      // Immediately add the amount to the corresponding expense category
      setFinances({
        ...finances,
        [newPayment.category]: finances[newPayment.category] + newPayment.amount,
      })

      setPendingPayments([...pendingPayments, payment])
      setNewPayment({
        description: "",
        amount: 0,
        dueDate: "",
        category: "fixedExpenses" as "fixedExpenses" | "variableExpenses",
      })
    }
  }

  const deletePayment = (paymentId: string) => {
    const payment = pendingPayments.find((p) => p.id === paymentId)
    if (payment) {
      // Remove the amount from the corresponding expense category
      setFinances({
        ...finances,
        [payment.category]: finances[payment.category] - payment.amount,
      })

      // Remove the payment from the list
      setPendingPayments(pendingPayments.filter((p) => p.id !== paymentId))
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = taskFilter === "all" || task.responsible === taskFilter
    const matchesSearch =
      task.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Group tasks by assigned day
  const tasksByDay = daysOfWeek.reduce(
    (acc, day) => {
      acc[day] = filteredTasks.filter((task) => task.assignedDay === day)
      return acc
    },
    {} as Record<string, Task[]>,
  )

  // Group activities by day
  const activitiesByDay = daysOfWeek.reduce(
    (acc, day) => {
      acc[day] = weeklyActivities.filter((activity) => activity.day === day)
      return acc
    },
    {} as Record<string, WeeklyActivity[]>,
  )

  // Tasks without assigned day
  const unassignedTasks = filteredTasks.filter((task) => !task.assignedDay)

  const availableBalance = finances.income - finances.fixedExpenses - finances.variableExpenses

  const togglePaymentStatus = (paymentId: string) => {
    setPendingPayments(
      pendingPayments.map((payment) => (payment.id === paymentId ? { ...payment, paid: !payment.paid } : payment)),
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Home className="h-8 w-8 text-blue-600" />
            Organizador Familiar
          </h1>
          <p className="text-gray-600 mt-1">Gestiona tus tareas del hogar y finanzas familiares</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              Hogar
            </TabsTrigger>
            <TabsTrigger value="planner" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Planner
            </TabsTrigger>
            <TabsTrigger value="finances" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Finanzas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            {/* Add New Task Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Agregar Nueva Tarea
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Input
                      id="category"
                      placeholder="Ej: Cocina, Baño..."
                      value={newTask.category}
                      onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="task">Tarea</Label>
                    <Input
                      id="task"
                      placeholder="Descripción de la tarea"
                      value={newTask.task}
                      onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="responsible">Responsable</Label>
                    <Select
                      value={newTask.responsible}
                      onValueChange={(value: any) => setNewTask({ ...newTask, responsible: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pollita">Pollita</SelectItem>
                        <SelectItem value="Pollito">Pollito</SelectItem>
                        <SelectItem value="Ambos">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="assignedDay">Día Asignado</Label>
                    <Select
                      value={newTask.assignedDay}
                      onValueChange={(value) => setNewTask({ ...newTask, assignedDay: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar día" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lunes">Lunes</SelectItem>
                        <SelectItem value="Martes">Martes</SelectItem>
                        <SelectItem value="Miércoles">Miércoles</SelectItem>
                        <SelectItem value="Jueves">Jueves</SelectItem>
                        <SelectItem value="Viernes">Viernes</SelectItem>
                        <SelectItem value="Sábado">Sábado</SelectItem>
                        <SelectItem value="Domingo">Domingo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addTask} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filters and Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar tareas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <Select value={taskFilter} onValueChange={setTaskFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="Pollita">Pollita</SelectItem>
                        <SelectItem value="Pollito">Pollito</SelectItem>
                        <SelectItem value="Ambos">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tasks List Organized by Days */}
            <Card>
              <CardHeader>
                <CardTitle>Organizador Semanal de Tareas</CardTitle>
                <CardDescription>
                  {filteredTasks.length} tarea{filteredTasks.length !== 1 ? "s" : ""} encontrada
                  {filteredTasks.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tasks without assigned day */}
                {unassignedTasks.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-lg font-semibold text-gray-700">Sin Día Asignado</h3>
                      <Badge variant="outline">{unassignedTasks.length}</Badge>
                    </div>
                    <div className="space-y-3">
                      {unassignedTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`flex items-center justify-between p-4 border rounded-lg ${task.completed ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}
                        >
                          <div className="flex items-center space-x-4">
                            <Checkbox checked={task.completed} onCheckedChange={() => toggleTaskCompletion(task.id)} />
                            <div className={task.completed ? "line-through text-gray-500" : ""}>
                              <div className="font-medium">{task.task}</div>
                              <div className="text-sm text-gray-500">{task.category}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={task.responsible === "Ambos" ? "default" : "secondary"}>
                              <User className="h-3 w-3 mr-1" />
                              {task.responsible}
                            </Badge>
                            {task.completed && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Completado
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-6" />
                  </div>
                )}

                {/* Tasks organized by days of the week */}
                {daysOfWeek.map((day) => (
                  <div key={day}>
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-lg font-semibold text-gray-700">{day}</h3>
                      <Badge variant="outline">{tasksByDay[day].length}</Badge>
                    </div>
                    {tasksByDay[day].length === 0 ? (
                      <p className="text-gray-500 text-sm mb-4">No hay tareas asignadas para este día</p>
                    ) : (
                      <div className="space-y-3 mb-4">
                        {tasksByDay[day].map((task) => (
                          <div
                            key={task.id}
                            className={`flex items-center justify-between p-4 border rounded-lg ${task.completed ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}
                          >
                            <div className="flex items-center space-x-4">
                              <Checkbox
                                checked={task.completed}
                                onCheckedChange={() => toggleTaskCompletion(task.id)}
                              />
                              <div className={task.completed ? "line-through text-gray-500" : ""}>
                                <div className="font-medium">{task.task}</div>
                                <div className="text-sm text-gray-500">{task.category}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={task.responsible === "Ambos" ? "default" : "secondary"}>
                                <User className="h-3 w-3 mr-1" />
                                {task.responsible}
                              </Badge>
                              {task.completed && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  Completado
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {day !== "Domingo" && <Separator className="my-6" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planner" className="space-y-6">
            {/* Add New Activity Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Agregar Nueva Actividad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div>
                    <Label htmlFor="activityTitle">Título</Label>
                    <Input
                      id="activityTitle"
                      placeholder="Nombre de la actividad"
                      value={newActivity.title}
                      onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="activityDescription">Descripción</Label>
                    <Input
                      id="activityDescription"
                      placeholder="Detalles de la actividad"
                      value={newActivity.description}
                      onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="activityDay">Día</Label>
                    <Select
                      value={newActivity.day}
                      onValueChange={(value) => setNewActivity({ ...newActivity, day: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar día" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lunes">Lunes</SelectItem>
                        <SelectItem value="Martes">Martes</SelectItem>
                        <SelectItem value="Miércoles">Miércoles</SelectItem>
                        <SelectItem value="Jueves">Jueves</SelectItem>
                        <SelectItem value="Viernes">Viernes</SelectItem>
                        <SelectItem value="Sábado">Sábado</SelectItem>
                        <SelectItem value="Domingo">Domingo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="activityTime">Hora</Label>
                    <Input
                      id="activityTime"
                      type="time"
                      value={newActivity.time}
                      onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="activityResponsible">Asignado a</Label>
                    <Select
                      value={newActivity.responsible}
                      onValueChange={(value: any) => setNewActivity({ ...newActivity, responsible: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pollita">Pollita</SelectItem>
                        <SelectItem value="Pollito">Pollito</SelectItem>
                        <SelectItem value="Ambos">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addWeeklyActivity} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Planner */}
            <Card>
              <CardHeader>
                <CardTitle>Planificador Semanal de Actividades</CardTitle>
                <CardDescription>Organiza tus actividades y eventos de la semana</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {daysOfWeek.map((day) => (
                  <div key={day}>
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-lg font-semibold text-gray-700">{day}</h3>
                      <Badge variant="outline">{activitiesByDay[day].length}</Badge>
                    </div>
                    {activitiesByDay[day].length === 0 ? (
                      <p className="text-gray-500 text-sm mb-4">No hay actividades programadas para este día</p>
                    ) : (
                      <div className="space-y-3 mb-4">
                        {activitiesByDay[day]
                          .sort((a, b) => a.time.localeCompare(b.time))
                          .map((activity) => (
                            <div
                              key={activity.id}
                              className={`flex items-center justify-between p-4 border rounded-lg ${activity.completed ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}
                            >
                              <div className="flex items-center space-x-4">
                                <Checkbox
                                  checked={activity.completed}
                                  onCheckedChange={() => toggleActivityCompletion(activity.id)}
                                />
                                <div className={activity.completed ? "line-through text-gray-500" : ""}>
                                  <div className="font-medium flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-blue-500" />
                                    {activity.time} - {activity.title}
                                  </div>
                                  {activity.description && (
                                    <div className="text-sm text-gray-500 mt-1">{activity.description}</div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={activity.responsible === "Ambos" ? "default" : "secondary"}>
                                  <User className="h-3 w-3 mr-1" />
                                  {activity.responsible}
                                </Badge>
                                {activity.completed && (
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    Completado
                                  </Badge>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteActivity(activity.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                    {day !== "Domingo" && <Separator className="my-6" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finances" className="space-y-6">
            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Ingresos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">${finances.income.toLocaleString()}</div>
                  <Input
                    type="number"
                    placeholder="0"
                    value={finances.income || ""}
                    onChange={(e) => setFinances({ ...finances, income: Number(e.target.value) })}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Gastos Fijos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">${finances.fixedExpenses.toLocaleString()}</div>
                  <Input
                    type="number"
                    placeholder="0"
                    value={finances.fixedExpenses || ""}
                    onChange={(e) => setFinances({ ...finances, fixedExpenses: Number(e.target.value) })}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Gastos Variables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    ${finances.variableExpenses.toLocaleString()}
                  </div>
                  <Input
                    type="number"
                    placeholder="0"
                    value={finances.variableExpenses || ""}
                    onChange={(e) => setFinances({ ...finances, variableExpenses: Number(e.target.value) })}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Saldo Disponible</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${availableBalance >= 0 ? "text-blue-600" : "text-red-600"}`}>
                    ${availableBalance.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">Calculado automáticamente</div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Payments */}
            <Card>
              <CardHeader>
                <CardTitle>Pagos Pendientes</CardTitle>
                <CardDescription>Gestiona tus próximos pagos y fechas límite</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Payment Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      placeholder="Descripción del pago"
                      value={newPayment.description}
                      onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Monto</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Monto"
                      value={newPayment.amount || ""}
                      onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentDate">Fecha de Pago</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={newPayment.dueDate}
                      onChange={(e) => setNewPayment({ ...newPayment, dueDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select
                      value={newPayment.category}
                      onValueChange={(value: "fixedExpenses" | "variableExpenses") =>
                        setNewPayment({ ...newPayment, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixedExpenses">Gasto Fijo</SelectItem>
                        <SelectItem value="variableExpenses">Gasto Variable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addPendingPayment}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Payments List */}
                <div className="space-y-3">
                  {pendingPayments.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No hay pagos pendientes</p>
                  ) : (
                    pendingPayments.map((payment) => {
                      const dueDate = new Date(payment.dueDate)
                      const today = new Date()
                      const isOverdue = dueDate < today && !payment.paid
                      const isDueSoon = dueDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) && !payment.paid

                      return (
                        <div
                          key={payment.id}
                          className={`flex items-center justify-between p-3 border rounded-lg ${
                            payment.paid
                              ? "bg-green-50 border-green-200"
                              : isOverdue
                                ? "bg-red-50 border-red-200"
                                : isDueSoon
                                  ? "bg-yellow-50 border-yellow-200"
                                  : "bg-white border-gray-200"
                          }`}
                        >
                          <div>
                            <div className={`font-medium ${payment.paid ? "line-through text-gray-500" : ""}`}>
                              {payment.description}
                            </div>
                            <div className="text-sm text-gray-500">
                              Fecha de pago: {dueDate.toLocaleDateString("es-ES")}
                              {!payment.paid && isOverdue && <span className="text-red-600 ml-2">(Vencido)</span>}
                              {!payment.paid && !isOverdue && isDueSoon && (
                                <span className="text-yellow-600 ml-2">(Próximo a vencer)</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={payment.category === "fixedExpenses" ? "secondary" : "outline"}>
                              {payment.category === "fixedExpenses" ? "Fijo" : "Variable"}
                            </Badge>
                            <div className={`font-bold text-lg ${payment.paid ? "text-gray-500" : ""}`}>
                              ${payment.amount.toLocaleString()}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant={payment.paid ? "default" : "outline"}
                                size="sm"
                                onClick={() => togglePaymentStatus(payment.id)}
                                className={payment.paid ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                              >
                                Pagado
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deletePayment(payment.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500">
            © 2024 Organizador Familiar. Mantén tu hogar y finanzas organizados.
          </p>
        </div>
      </footer>
    </div>
  )
}
