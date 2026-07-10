import { getContext, setContext } from "svelte";
import {Gantt} from "./gantt/gantt.ts";

// We use a class or a simple object with a $state property
// to ensure the reference update is tracked across the context.
export class GanttContextSvelte {
    instance = $state<Gantt | null>(null);

    set(g: Gantt) {
        this.instance = g;
    }
}

const KEY = Symbol("GanttContext");

export function setGanttContext() {
    return setContext(KEY, new GanttContextSvelte());
}

export function getGanttContext() {
    return getContext<GanttContextSvelte>(KEY);
}
