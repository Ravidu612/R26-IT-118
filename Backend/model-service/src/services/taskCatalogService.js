import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import AppError from '../utils/AppError.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SERVICE_ROOT = path.resolve(__dirname, '../..')
const REPO_ROOT = path.resolve(SERVICE_ROOT, '../..')
const DEFAULT_TASK_DATA_PATH = path.resolve(__dirname, '../data/teaEstateTasks.json')

const getUniquePaths = (paths) => [...new Set(paths)]

const resolveTaskDataPath = () => {
  const configuredPath = process.env.TASK_DATASET_PATH?.trim()
  if (!configuredPath) return DEFAULT_TASK_DATA_PATH

  const candidates = path.isAbsolute(configuredPath)
    ? [configuredPath, DEFAULT_TASK_DATA_PATH]
    : [
        path.resolve(process.cwd(), configuredPath),
        path.resolve(SERVICE_ROOT, configuredPath),
        path.resolve(REPO_ROOT, configuredPath),
        DEFAULT_TASK_DATA_PATH,
      ]

  return getUniquePaths(candidates).find((candidate) => fs.existsSync(candidate)) || candidates[0]
}

const TASK_DATA_PATH = resolveTaskDataPath()

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
