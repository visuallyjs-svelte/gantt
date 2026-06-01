<script lang="ts">
import { onMount, setContext } from 'svelte'
import { SurfaceComponent, useVisuallyJsModel, useSurface } from '@visuallyjs/browser-ui-svelte'
import type { BrowserUISvelteModel } from '@visuallyjs/browser-ui-svelte'
import {
    registerParser, registerExporter, registerDecorator,
    RandomColorGenerator, type Node,
    EVENT_NODE_REMOVED, EVENT_NODE_UPDATED,
    APPEND_TO_CURRENT, VERTEX_UPDATE_REASON_MOVED,
    type NodeRemovedParams, type VertexUpdatedParams, type Surface
} from "@visuallyjs/browser-ui"
import { GanttParser } from './parser'
import { GanttExporter } from './exporter'
import { GanttDecorator } from './decorator'
import { subtaskDataset } from './data-generator'
import { createRenderOptions } from './render-options'
import { generateView } from './view-options'
import modelOptions from './model-options'
import {
    BAR_HEIGHT, GANTT, ONE_DAY_IN_MILLISECONDS,
    ROW_HEIGHT, STEP_WIDTH, TYPE_TASK_GROUP
} from './constants'
import { millisecondsToDays, pixelsToMilliseconds, today } from './util'
import type { Gantt, ParsedTask, TaskEntry, ValueRef } from './defs'

let _model: BrowserUISvelteModel
let _surface: Surface

const colorGenerator = new RandomColorGenerator()
const entries: Array<TaskEntry> = []
const entryMap = new Map<string, TaskEntry>()
const minValue: ValueRef<number> = { current: today() }
const maxValue: ValueRef<number> = { current: today() }

function _addTask(data: ParsedTask) {
    if (data.parent != null && entryMap.get(data.parent) == null) {
        throw `Cannot add subtask ${data.name} to parent ${data.parent}; parent does not exist`
    }
    const dayRange = Math.floor((data.end - data.start) / ONE_DAY_IN_MILLISECONDS)
    const t = Object.assign(data as any, {
        dayRange,
        left: ((data.start - minValue.current) / ONE_DAY_IN_MILLISECONDS) * STEP_WIDTH,
        size: dayRange * STEP_WIDTH
    })
    const vertex = _model.addNode(t)
    const newEntry: TaskEntry = { node: vertex, subtasks: [], id: vertex.id }
    entryMap.set(vertex.id, newEntry)
    if (vertex.data['parent'] != null) {
        entryMap.get(vertex.data['parent'])!.subtasks.push(newEntry)
    } else {
        entries.push(newEntry)
    }
}

function _removeTask(taskId: string, noNeedToConfirm?: boolean) {
    const entry = entryMap.get(taskId)
    if (entry != null) {
        const confirmationMessage = entry.node.type === 'task' ?
            `Delete task ${entry.node.data['name']} ?` :
            entry.node.type === 'taskGroup' ?
                `Delete task group ${entry.node.data['name']} ? Group and all subtasks will be deleted!` :
                `Delete milestone ${entry.node.data['name']} ?`

        if (noNeedToConfirm || confirm(confirmationMessage)) {
            const tasks: Array<Node> = [], groups: Array<Node> = []
            const _one = (e: TaskEntry) => {
                if (e.node.type === 'task') tasks.unshift(e.node)
                else groups.unshift(e.node)
                e.subtasks.forEach(st => _one(st))
            }
            _one(entry)
            _model.transaction(() => {
                tasks.forEach(t => _model.removeNode(t))
                groups.forEach(t => _model.removeNode(t))
            })
            _relayoutTasks()
        }
    }
}

function _recalculateTaskDuration(taskGroupId: string): { start: number, end: number } {
    const entry = entryMap.get(taskGroupId)!
    let start = entry.node.data['type'] === TYPE_TASK_GROUP ? Infinity : entry.node.data['start']
    let end = entry.node.data['type'] === TYPE_TASK_GROUP ? -Infinity : entry.node.data['end']
    if (entry.subtasks && entry.subtasks.length > 0) {
        entry.subtasks.forEach(st => {
            const std = _recalculateTaskDuration(st.id)
            start = Math.min(start, std.start)
            end = Math.max(end, std.end)
        })
    }
    return { start, end }
}

function _recalc(vertex: Node) {
    let taskGroupId = vertex.data['parent']
    while (taskGroupId != null) {
        const { start, end } = _recalculateTaskDuration(taskGroupId)
        const dayRange = Math.floor((end - start) / ONE_DAY_IN_MILLISECONDS)
        _model.updateNode(taskGroupId, {
            start, end, dayRange,
            left: ((start - minValue.current) / ONE_DAY_IN_MILLISECONDS) * STEP_WIDTH,
            size: dayRange * STEP_WIDTH
        })
        const taskGroup = _model.getNode(taskGroupId)
        taskGroupId = taskGroup.data['parent']
    }
    _computeExtents()
}

function _computeExtents() {
    let _min = minValue.current, _max = maxValue.current
    const _one = (entry: TaskEntry) => {
        _min = Math.min(_min, entry.node.data['start'])
        _max = Math.max(_max, entry.node.data['end'])
        entry.subtasks.forEach(_one)
    }
    entries.forEach(_one)
    minValue.current = _min
    maxValue.current = _max
}

function _relayoutTasks() {
    let y = 0
    _model.transaction(() => {
        const _one = (entry: TaskEntry) => {
            _model.updateNode(entry.id, { top: y + ((ROW_HEIGHT - BAR_HEIGHT) / 2) })
            y += ROW_HEIGHT
            entry.subtasks.forEach(_one)
        }
        entries.forEach(_one)
    }, APPEND_TO_CURRENT)
    _surface.relayout()
}

function _nodeRemoved(n: Node) {
    const entry = entryMap.get(n.id)
    if (entry != null) {
        if (entry.node.data['parent'] != null) {
            const parentEntry = entryMap.get(entry.node.data['parent'])
            if (parentEntry) {
                parentEntry.subtasks = parentEntry.subtasks.filter(st => st.id !== n.id)
            }
        }
        const idx = entries.findIndex(e => e.id === n.id)
        if (idx !== -1) entries.splice(idx, 1)
        entryMap.delete(n.id)
    }
}

function _taskMoved(p: VertexUpdatedParams) {
    const startMillis = minValue.current + pixelsToMilliseconds(p.vertex.data['left'])
    const endMillis = startMillis + pixelsToMilliseconds(p.vertex.data['size'])
    const dayRange = millisecondsToDays(endMillis - startMillis)
    minValue.current = Math.min(startMillis, minValue.current)
    maxValue.current = Math.max(endMillis, maxValue.current)
    _model.updateNode(p.vertex, { start: startMillis, end: endMillis, dayRange })
    _recalc(p.vertex as Node)
    _surface.relayout()
}

const gantt: Gantt = {
    assignColor: () => colorGenerator.generate(),
    barHeight: BAR_HEIGHT,
    minValue,
    maxValue,
    rowHeight: ROW_HEIGHT,
    addTask: _addTask,
    removeTask: _removeTask,
    entries,
    entryMap,
    showDays: true,
    showWeekOfYear: true,
    showMonthNames: true,
    showQuarter: true,
    showDayName: true,
    showDayNumber: true,
    dayNameFormat: 'short',
    exportToConsole: () => console.log(JSON.stringify(_model?.exportData({ type: GANTT, parameters: { gantt } }), null, 2)),
    relayoutTasks: _relayoutTasks,
    get model() { return _model }
}

setContext('gantt', gantt)

registerParser(GANTT, GanttParser)
registerExporter(GANTT, GanttExporter)
registerDecorator(GANTT, GanttDecorator)

const renderOptions = createRenderOptions(gantt, true, false, minValue, _recalc)
const viewOptions = generateView()

onMount(async () => {
    _surface = await useSurface()
    _model = await useVisuallyJsModel()

    _model.bind<NodeRemovedParams>(EVENT_NODE_REMOVED, (p: NodeRemovedParams) => {
        _nodeRemoved(p.node)
    })

    _model.bind<VertexUpdatedParams>(EVENT_NODE_UPDATED, (p: VertexUpdatedParams) => {
        if (p.reason === VERTEX_UPDATE_REASON_MOVED) {
            _taskMoved(p)
        }
    })

    entries.length = 0
    entryMap.clear()
    minValue.current = today()
    maxValue.current = today()

    _surface.model.load({
        data: subtaskDataset(),
        type: GANTT,
        onload: () => { _computeExtents() },
        parameters: { gantt }
    })
})
</script>

<SurfaceComponent {renderOptions} {viewOptions} {modelOptions} className="vjs-gantt-canvas" />
