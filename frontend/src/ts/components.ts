import {generateUniqueId} from './utilities';

/** Class represents Tab component */
export class Tabs {
  private headers: Array<JQuery> = [];
  private contents: Array<JQuery> = [];

  /**
   * Add a Tab
   * @param {string} name - The name to put at the tab button
   * @param {JQuery} content - The content to put inside the tab
   * @return {JQuery} The button or header for the new tab
   */
  public addTab(name: string, content: JQuery): JQuery {
    const tabContent = $('<div>')
        .addClass('tab-content')
        .append(content);

    const header = $('<button>')
        .addClass('tab-links')
        .text(name)
        .on('click', () => {
          for (const c of this.contents) {
            c.hide();
            c.removeClass('active');
          }
          for (const h of this.headers) {
            h.removeClass('active');
          }

          tabContent.addClass('active');
          tabContent.show();
          header.addClass('active');
        });
    this.headers.push(header);
    this.contents.push(tabContent);
    return header;
  }

  /**
   * Render the tab into the parent
   * @param {JQuery} parent - The parent to put the tab into
   */
  public render(parent: JQuery): void {
    const headerContainer = $('<div>').addClass('tab').appendTo(parent);
    for (const h of this.headers) {
      h.appendTo(headerContainer);
    }
    for (const c of this.contents) {
      c.appendTo(parent);
    }
    if (this.headers.length > 0) {
      this.headers[0].trigger('click');
    }
  }

  /**
   * Enable or disable the tabs
   * @param {boolean} show - True for show, false for hide
   */
  public show(show: boolean): void {
    if (show) {
      for (const h of this.headers) {
        h.show();
      }
      for (const c of this.contents) {
        if (c.hasClass('active')) {
          c.show();
        } else {
          c.hide();
        }
      }
    } else {
      for (const h of this.headers) {
        h.hide();
      }
      for (const c of this.contents) {
        c.show();
      }
    }
  }
}

export enum ActionState {
  Disabled,
  Enabled
}

/** Base class for Actionable Items like Buttons and Checkboxes */
class ActionItem {
  protected obj: JQuery;
  private state: ActionState;

  /**
   * The event callback signature for buttons
   *
   * @callback eventCallback
   * @param {JQuery.Event} event - The event that triggered the call
   */

  /**
   * Registers an event on the button
   * @param {string} type - The event type to register ["click", "focus", etc]
   * @param {eventCallback} fn - The callback to trigger
   */
  public registerEvent(type: string, fn: (event: JQuery.Event) => void): void {
    this.obj.on(type, fn);
  }

  /**
   * Render the button
   * @return {JQuery} The button
   */
  public render(): JQuery {
    return this.obj;
  }

  /**
   * Returns the current state of the ActionItem
   * @return {ActionState}
   */
  public getActionState(): ActionState {
    return this.state;
  }

  /**
   * Enables the ActionItem
   */
  public enable(): void {
    this.state = ActionState.Enabled;
    this.obj.disabled = false;
  }

  /**
   * Disables the ActionItem
   */
  public disable(): void {
    this.state = ActionState.Disabled;
    this.obj.disabled = true;
  }
}

/** Class represents a Button */
export class Button extends ActionItem {
  /**
   * Constructs a button
   * @param {string[]} classList - The list of classes to apply to the button
   * @param {string} title - The title to put on the button for tooltip
   * @param {string} text - The text to display on the button
   */
  constructor(classList: string[], title: string, text: string) {
    super();
    this.obj = $('<button>')
        .attr('type', 'button')
        .addClass('btn')
        .addClass('btn-primary')
        .attr('title', title)
        .text(text);
    for (const c of classList) {
      this.obj.addClass(c);
    }
  }
}

/** Class represents a checkbox */
export class CheckBox extends ActionItem {
  private readonly input: JQuery;
  private label: JQuery;

  /**
   * Construct a checkbox
   * @param {string} label - The label text
   * @param {JQuery} [parent] - The parent to insert the checkbox into
   * @param {string[]} [classes] - The classes to apply to the checkbox
   * @param {string} [title] - The title for the checkbox, tooltip
   */
  constructor(label: string,
      parent? : JQuery,
      classes? : string[],
      title? : string) {
    super();
    if (parent == undefined) {
      this.obj = $('<div>');
    } else {
      this.obj = parent;
    }

    if (classes != undefined) {
      for (const c of classes) {
        this.obj.addClass(c);
      }
    }

    const qId = generateUniqueId();
    this.input = $('<input>')
        .attr('type', 'checkbox')
        .attr('id', qId)
        .addClass('checkbox')
        .appendTo(this.obj);
    if (title != undefined) {
      this.input.attr('title', title);
    }

    this.label = $('<label>')
        .attr('for', qId)
        .text(label)
        .appendTo(this.obj);
  }

  /**
   * Gets whether the checkbox is checked
   * @return {boolean} True for checked
   */
  public checked(): boolean {
    return this.input.is(':checked');
  }

  /**
   * Returns the actual checkbox JQuery object
   * @return {JQuery} The checkbox
   */
  public getCheckBox(): JQuery {
    return this.input;
  }
}
