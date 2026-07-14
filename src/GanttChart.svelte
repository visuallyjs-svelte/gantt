<script lang="ts">
import {SurfaceComponent, useSurface, newInstance} from '@visuallyjs/browser-ui-svelte'
import type { RefObject } from '@visuallyjs/browser-ui-svelte'
import {
    registerParser, registerExporter
} from "@visuallyjs/browser-ui"
import {
    GANTT
} from "./gantt/constants"
import { GanttParser } from './gantt/parser'
import { GanttExporter } from './gantt/exporter'
import { subtaskDataset } from './gantt/data-generator'
import modelOptions from './gantt/model-options'
import type {GanttOptions} from './gantt/defs'
import { getGanttContext } from "./gantt-context.svelte";
import {generateView} from "./view-options";
import {createRenderOptions} from "./gantt/render-options";
import {Gantt} from "./gantt/gantt.ts";

const props = $props()
const options:GanttOptions = Object.assign({}, props || {})

registerParser(GANTT, GanttParser)
registerExporter(GANTT, GanttExporter)

let _model = newInstance(modelOptions)
const _surface = useSurface()

const initialized :RefObject<boolean> = { current: false }

const gantt = new Gantt(options, _model, () => _surface.current!)
getGanttContext().set(gantt)

const viewOptions = generateView(gantt)
const renderOptions = createRenderOptions(gantt)

$effect(() => {
    if(!initialized.current && _surface.current) {
        initialized.current = true
        gantt.load(subtaskDataset(), () => getGanttContext().set(gantt))
    }
})

</script>

<SurfaceComponent {renderOptions} {viewOptions} model={_model} className="vjs-gantt-canvas" />
