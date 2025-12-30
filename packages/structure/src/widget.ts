/**
 * @example
 * const onClick: WidgetEvent = {
    params: ["event"],
    handler: "console.log('Widget clicked');",
    compiledHandler: "console.log('Widget clicked');",
    description: "Handles the click event on the widget."
}
 */
export interface WidgetEvent {
    params: string[];
    handler: string;
    compiledHandler?: string;
    description?: string;
}


/**
 * @example
 * const button: Widget = {
    id: 'button_1',
    type: 'button',
    name: 'SubmitButton',
    classNames: ['btn', 'btn-primary'],
    style: 'width: 100px; height: 40px;',
    properties: {
        text: 'Submit',
        disabled: false,
    },
    events: {
        onClick: {
            params: [],
            handler: 'console.log("Button clicked");',
            compiledHandler: 'console.log("Button clicked");',
            description: 'Handles the submit action when the button is clicked.'
        }
    }
}
 */
export interface Widget {
    id: string;
    type: string;
    name?: string;
    classNames?:string[];
    style?:string;
    properties?: Record<string, any>;
    events?:Record<string,WidgetEvent>;
    renderFunction?: string;
    // v-if/v-show
    directives?: Record<string, WidgetEvent>;
}

export interface WidgetTreeNode {
    id: string;
    type: string;
    widget: Widget;
    children?: WidgetTreeNode[];
}

/**
 * @property {string} pid - The ID of the parent widget. Undefined for the root widget.
 * @property {WidgetTreeNode} node - The widget tree node associated with this index.
 */
export interface WidgetTreeIndex {
    pid?: string;
    node: WidgetTreeNode;
}