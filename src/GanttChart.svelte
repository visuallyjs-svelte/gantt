<script lang="ts">
import {SurfaceComponent, useSurface, newInstance} from '@visuallyjs/browser-ui-svelte'
import type { BrowserUISvelteModel, RefObject } from '@visuallyjs/browser-ui-svelte'
import {
    registerParser, registerExporter,
    RandomColorGenerator, type Node,
    EVENT_NODE_UPDATED,
    VERTEX_UPDATE_REASON_MOVED, EVENT_UNDO, EVENT_REDO,
    type VertexUpdatedParams
} from "@visuallyjs/browser-ui"
import {
    GANTT,
    ONE_DAY_IN_MILLISECONDS,
    STEP_WIDTH
} from "./gantt/constants"
import { GanttParser } from './gantt/parser'
import { GanttExporter } from './gantt/exporter'
import { subtaskDataset } from './gantt/data-generator'
import modelOptions from './gantt/model-options'
import {
    millisecondsToDays,
    pixelsToMilliseconds,
    today,
    _recalculateTaskDuration,
    removeTask,
    _computeExtents
} from './gantt/util'
import type {GanttOptions} from './gantt/defs'
import { getGanttContext } from "./gantt-context.svelte";
import {createGantt} from "./gantt/gantt";
import {generateView} from "./view-options";
import {createRenderOptions} from "./gantt/render-options";

const props = $props()
const options:GanttOptions = Object.assign({}, props || {})

registerParser(GANTT, GanttParser)
registerExporter(GANTT, GanttExporter)

let _model: RefObject<BrowserUISvelteModel> = {current:newInstance(modelOptions)}
const _surface = useSurface()

const colorGenerator = options.colorGenerator || new RandomColorGenerator()
const minValue: RefObject<number> = { current: today() }
const maxValue: RefObject<number> = { current: -today() }
const rangeInDays :RefObject<number> = { current: 0 }
const initialized :RefObject<boolean> = { current: false }

const undoSub = () => {
    _updateExtents()
    _surface.current.relayout()
}

const redoSub = () => {
    _updateExtents()
    _surface.current.relayout()
}

_model.current.bind(EVENT_UNDO, undoSub)
_model.current.bind(EVENT_REDO, redoSub)

_model.current.bind<VertexUpdatedParams>(EVENT_NODE_UPDATED, (p) => {
    if(p.reason === VERTEX_UPDATE_REASON_MOVED) {
        _taskMoved(p)
    }
})

function _taskMoved(p:VertexUpdatedParams) {
    const startMillis = minValue.current + pixelsToMilliseconds(p.vertex.data['left'])
    const endMillis = startMillis + pixelsToMilliseconds(p.vertex.data['size'])
    const dayRange = millisecondsToDays(endMillis - startMillis)

    minValue.current = Math.min(startMillis, minValue.current)
    maxValue.current = Math.max(endMillis, maxValue.current)

    _model.current.updateNode(p.vertex, {
        start:startMillis,
        end:endMillis,
        dayRange
    })
    _recalc(p.vertex)
    _surface.current!.relayout()
}



function _recalc(vertex:Node) {
    let taskGroupId = vertex.data['parent']
    while (taskGroupId != null) {
        const {start, end} = _recalculateTaskDuration(gantt, taskGroupId)
        const dayRange = Math.floor((end - start) / ONE_DAY_IN_MILLISECONDS)
        _model.current.updateNode(taskGroupId, {
            start,
            end,
            dayRange,
            left:((start - minValue.current) / ONE_DAY_IN_MILLISECONDS) * STEP_WIDTH,
            size:dayRange * STEP_WIDTH
        })

        const taskGroup = _model.current.getNode(taskGroupId)
        taskGroupId = taskGroup.data['parent']
    }

    _updateExtents()

}

function _updateExtents() {
    _computeExtents(gantt, minValue, maxValue)
}

const gantt = createGantt(options, _model.current, () => _surface.current, colorGenerator)
getGanttContext().set(gantt)

function load(data:any) {

    if (_surface.current) {

        minValue.current = today()
        maxValue.current = today()
        rangeInDays.current = 0

        _surface.current.model.load({
            data,
            type: GANTT,
            onload: () => {
                _updateExtents()
            },
            parameters: {
                gantt
            }
        })
    }
}

$effect(() => {
    if(!initialized.current && _surface.current) {
        initialized.current = true
        load(subtaskDataset())
    }
})

const viewOptions = generateView((id) => removeTask(gantt, _surface.current!, id))
const renderOptions = createRenderOptions(() => minValue.current, _recalc)

</script>

<SurfaceComponent {renderOptions} {viewOptions} model={_model.current} className="vjs-gantt-canvas" />
