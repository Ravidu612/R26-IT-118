import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import AppError from '../utils/AppError.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const TASK_DATA_PATH = process.env.TASK_DATASET_PATH
  ? path.resolve(process.env.TASK_DATASET_PATH)
  : path.resolve(__dirname, '../data/teaEstateTasks.json')

let cachedTasks = null

const pickField = (item, camelKey, snakeKey) => item[camelKey] ?? item[snakeKey] ?? ''

export const readTaskCatalog = () => {
  if (cachedTasks) return cachedTasks
  if (!fs.existsSync(TASK_DATA_PATH)) throw new AppError(`Task dataset not found at ${TASK_DATA_PATH}`, 500)

  const parsed = JSON.parse(fs.readFileSync(TASK_DATA_PATH, 'utf8'))
  if (!Array.isArray(parsed) || !parsed.length) throw new AppError('Task dataset is empty', 500)

  cachedTasks = parsed.map((item) => ({
    taskId: String(pickField(item, 'taskId', 'task_id')).trim(),
    taskName: String(pickField(item, 'taskName', 'task_name')).trim(),
    difficulty: String(item.difficulty || '').trim(),
    requiredSkill: String(pickField(item, 'requiredSkill', 'required_skill')).trim(),
  }))

  return cachedTasks
}

export const findTaskById = (tasks, taskId) => tasks.find((task) => task.taskId === taskId) || null
