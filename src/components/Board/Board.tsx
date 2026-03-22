import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import type { Task, Status } from '@/lib/types'
import { COLUMNS } from '@/lib/types'
import { Column } from './Column'
import { TaskCardOverlay } from './TaskCard'

interface Props {
  tasks: Task[]
  searchQuery: string
  priorityFilter: string
  onTaskClick: (task: Task) => void
  onCreateTask: (title: string, status?: Status) => void
  onUpdateTask: (id: string, patch: Partial<Task>) => void
}

export function Board({
  tasks,
  searchQuery,
  priorityFilter,
  onTaskClick,
  onCreateTask,
  onUpdateTask,
}: Props) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Filter tasks by search + priority
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = !priorityFilter || t.priority === priorityFilter
    return matchesSearch && matchesPriority
  })

  const getColumnTasks = (status: Status) =>
    filteredTasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.position - b.position)

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task
    setActiveTask(task ?? null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const activeTask = tasks.find((t) => t.id === active.id)
    if (!activeTask) return

    // Determine the target column
    const overTask = tasks.find((t) => t.id === over.id)
    const targetStatus = (overTask?.status ?? over.id) as Status

    const columnTasks = tasks
      .filter((t) => t.status === targetStatus)
      .sort((a, b) => a.position - b.position)

    if (activeTask.status === targetStatus) {
      // Reorder within same column
      const oldIndex = columnTasks.findIndex((t) => t.id === active.id)
      let newIndex = columnTasks.findIndex((t) => t.id === over.id)
      // Dropped on column droppable (not a card) → move to end
      if (newIndex === -1) newIndex = columnTasks.length - 1
      if (oldIndex === newIndex) return
      const reordered = arrayMove(columnTasks, oldIndex, newIndex)
      reordered.forEach((t, i) => {
        if (t.position !== i) onUpdateTask(t.id, { position: i })
      })
    } else {
      // Move to new column
      const overIndex = columnTasks.findIndex((t) => t.id === over.id)
      const newPosition = overIndex >= 0 ? overIndex : columnTasks.length
      // Shift existing tasks
      columnTasks.forEach((t, i) => {
        if (i >= newPosition) onUpdateTask(t.id, { position: i + 1 })
      })
      onUpdateTask(activeTask.id, { status: targetStatus, position: newPosition })
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 flex-1">
        {COLUMNS.map((col) => (
          <Column
            key={col.id}
            id={col.id}
            label={col.label}
            color={col.color}
            accent={col.accent}
            tasks={getColumnTasks(col.id)}
            onTaskClick={onTaskClick}
            onAddTask={(title) => onCreateTask(title, col.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && <TaskCardOverlay task={activeTask} />}
      </DragOverlay>
    </DndContext>
  )
}
