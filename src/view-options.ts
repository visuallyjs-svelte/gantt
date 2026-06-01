import { EVENT_TAP, PlainArrowOverlay, NodeEventCallbackPayload, EdgeEventCallbackPayload } from "@visuallyjs/browser-ui"
import { TYPE_TASK, TYPE_TASK_GROUP, TYPE_MILESTONE } from "./constants"
import TaskComponent from "./components/TaskComponent.svelte"
import TaskGroupComponent from "./components/TaskGroupComponent.svelte"
import MilestoneComponent from "./components/MilestoneComponent.svelte"

export function generateView() {
    return {
        nodes: {
            selectable: {
                events: {
                    [EVENT_TAP]: (p: NodeEventCallbackPayload<any>) => {
                        p.model.setSelection(p.obj)
                    }
                }
            },
            [TYPE_TASK]: {
                component: TaskComponent,
                parent: 'selectable'
            },
            [TYPE_TASK_GROUP]: {
                component: TaskGroupComponent,
                parent: 'selectable'
            },
            [TYPE_MILESTONE]: {
                component: MilestoneComponent,
                parent: 'selectable'
            }
        },
        edges: {
            default: {
                overlays: [
                    {
                        type: PlainArrowOverlay.type,
                        options: {
                            location: 1,
                            width: 8,
                            length: 8
                        }
                    }
                ],
                events: {
                    [EVENT_TAP]: (e: EdgeEventCallbackPayload) => {
                        if (confirm('Delete dependency?')) {
                            e.model.removeEdge(e.obj)
                        }
                    }
                }
            }
        }
    }
}
