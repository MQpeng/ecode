/**
 * Describes an event handler attached to a widget.
 *
 * @example
 * const onClick: WidgetEvent = {
 *   params: ["event"],
 *   handler: "console.log('Widget clicked');",
 *   compiledHandler: "console.log('Widget clicked');",
 *   description: "Handles the click event on the widget."
 * }
 *
 * @interface WidgetEvent
 * @property {string[]} params - names of parameters passed to the handler
 * @property {string} handler - handler source code as a string
 * @property {string} [compiledHandler] - optional compiled/transpiled handler code
 * @property {string} [description] - human readable description of the event
 */
export interface WidgetEvent {
    label: string;
    params: string[];
    handler: string;
    compiledHandler?: string;
    description?: string;
} 


/**
 * Represents a UI widget and its metadata.
 *
 * @example
 * const button: Widget = {
 *   id: 'button_1',
 *   type: 'button',
 *   name: 'SubmitButton',
 *   classNames: ['btn', 'btn-primary'],
 *   style: 'width: 100px; height: 40px;',
 *   properties: {
 *     text: 'Submit',
 *     disabled: false,
 *   },
 *   events: {
 *     onClick: {
 *       params: [],
 *       handler: 'console.log("Button clicked");',
 *       compiledHandler: 'console.log("Button clicked");',
 *       description: 'Handles the submit action when the button is clicked.'
 *     }
 *   }
 * }
 *
 * @interface Widget
 * @property {string} id - unique identifier for the widget
 * @property {string} type - widget type
 * @property {string} [name] - optional human-readable name
 * @property {string[]} [classNames] - optional css classes
 * @property {string} [style] - inline style string
 * @property {Record<string, any>} [properties] - widget-specific properties
 * @property {Record<string,WidgetEvent>} [events] - event handlers keyed by name
 * @property {string} [renderFunction] - optional inline render function source
 * @property {Record<string,WidgetEvent>} [directives] - optional directives (v-if/v-show)
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

/**
 * Node in a widget tree.
 *
 * @interface WidgetTreeNode
 * @property {string} id - unique node id
 * @property {string} type - node type
 * @property {Widget} widget - the widget payload for this node
 * @property {WidgetTreeNode[]} [children] - child nodes
 */
export interface WidgetTreeNode {
    id: string;
    type: string;
    widget: Widget;
    children?: WidgetTreeNode[];
}

/**
 * Index entry for a widget node.
 *
 * @interface WidgetTreeIndex
 * @property {string} [pid] - parent node id; undefined for root
 * @property {WidgetTreeNode} node - the widget tree node
 */
export interface WidgetTreeIndex {
    pid?: string;
    node: WidgetTreeNode;
}