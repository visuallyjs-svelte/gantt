<script lang="ts">
import { InspectorComponent } from '@visuallyjs/browser-ui-svelte'
import type { Base, Surface } from '@visuallyjs/browser-ui'
import { TYPE_TASK, TYPE_TASK_GROUP } from './constants'

let currentType = $state('')
let currentObj = $state<Base | null>(null)
let progress = $state(0)

function renderEmptyContainer() {
    currentType = ''
    currentObj = null
}

function refresh(obj: Base) {
    currentType = obj.type
    currentObj = obj
    progress = (obj.data as any).progress || 0
}

function afterUpdate(surface: Surface) {
    surface.relayout()
}

function onProgressInput(e: Event) {
    progress = (e.target as HTMLInputElement).valueAsNumber
}
</script>

<InspectorComponent className="vjs-gantt-inspector" {refresh} {renderEmptyContainer} showCloseButton={true} {afterUpdate}>
    {#if currentType === TYPE_TASK}
        <div>Name</div>
        <input type="text" vjs-att="name" vjs-focus="true"/>
        <div>Progress</div>
        <div style="display:flex;align-items:center">
            <input type="range" vjs-att="progress" min="0" max="100" value={(currentObj?.data as any)?.progress || 0} oninput={onProgressInput}/>
            <div class="vjs-gantt-progress-value-label">{progress}</div>
        </div>
    {/if}
    {#if currentType === TYPE_TASK_GROUP}
        <div>Name</div>
        <input type="text" vjs-att="name" vjs-focus="true"/>
    {/if}
</InspectorComponent>
