import {Gantt, InternalTask, ValueRef} from "./defs"
import {GANTT, ROW_HEIGHT, STEP_WIDTH} from "./constants"

import { AnchorLocations,
    CONNECTOR_TYPE_ORTHOGONAL,
    ResizingToolsPlugin,
    EVENT_CANVAS_CLICK,
    Surface,
    PointXY, Size, Node } from "@visuallyjs/browser-ui"
import {millisecondsToDays, pixelsToMilliseconds} from "./util"

export function createRenderOptions(gantt:Gantt, enableZoom:boolean, wheelPan:boolean, minValue:ValueRef<number>, recalcTask:(task:Node) => void) {
    return {
        activeFiltering:true,
        edges:{
            anchors:[
                AnchorLocations.ContinuousRight, AnchorLocations.ContinuousLeft
            ],
            connector:{
                type:CONNECTOR_TYPE_ORTHOGONAL,
                options:{
                    stub:15,
                    alwaysRespectStubs:true,
                    cornerRadius:5
                }
            }
        },
        dragOptions:{
            constrainFunction:(desiredLoc: PointXY, dragEl: HTMLElement, constrainRect: Size, size: Size, currentLoc: PointXY) => {
                return {x:Math.max(0, desiredLoc.x), y:currentLoc.y}
            },
            cssFilter:".vjs-gantt-day-stripe, .vjs-gantt-day-stripe-alt, .vjs-gantt-day-stripes"
        },
        consumeRightClick:false,
        plugins:[
            {
                type:ResizingToolsPlugin.type,
                options:{
                    widthAttribute:"size",
                    payloadGenerator:(node:Node, payload:InternalTask) => {
                        const newStart = minValue.current + pixelsToMilliseconds(payload.left)
                        const newEnd = newStart + pixelsToMilliseconds(payload.size)
                        return {
                            start:newStart,
                            end:newEnd,
                            dayRange:Math.floor(millisecondsToDays(newEnd - newStart))
                        }
                    },
                    onEdit:(task:Node, surface:Surface) => {
                        recalcTask(task)
                        surface.relayout()
                    }
                }
            }
        ],
        enablePan:false,
        zoom:{
            wheel:false,
            fixedTransformOrigin:{x:0, y:0},
        },
        pan:{
           wheel:true
        },
        decorators:[
            {
                type:GANTT,
                id:GANTT,
                options:{
                    gantt
                }
            }
        ],
        grid:{
            size:{width:STEP_WIDTH, height:ROW_HEIGHT}
        },
        events:{
            [EVENT_CANVAS_CLICK]:(surface:Surface) => {
                surface.model.clearSelection()
            }
        }
    }
}
