import {fetchJSON} from './comms';
import {Button, CheckBox, ActionState} from './components';
import * as Strings from './strings';
import {generateUniqueId} from './utilities';

interface SubmitRequest {
  Name: string;
  Email: string;
  Message: string;
  Consent: boolean;
}

interface SubmitResponse {
  success: boolean;
}

/** Abstract base class for Form fields */
abstract class Field {
  protected input: JQuery;
  public name: string;

  /**
   * Constructs a Form Field
   * @param {JQuery} container - The parent container
   * @param {string} type - The type of input ['text', 'email', etc]
   * @param {string} name - The name to give the label, also the tooltip
   * @param {string} tag='input' - The type of tag if not input
   */
  constructor(container: JQuery, type: string, name: string, tag = 'input') {
    this.name = name;
    const id = generateUniqueId();
    $('<label>')
        .attr('for', id)
        .text(name)
        .appendTo(container);
    this.input = $(tag)
        .attr('type', type)
        .attr('id', id)
        .attr('name', name)
        .appendTo(container);
  }
  /**
   * The abstract validation function
   * @return boolean
   */
  abstract validate(): boolean;

  /**
   * Returns the value in the field as a string
   * @return {string}
   */
  public getVal(): string {
    return this.input.val() as string;
  }

  /**
   * Resets the field
   */
  public reset(): void {
    this.input.removeClass('form-error');
  }

  /**
   * Adds error classes to the field
   */
  public addError(): void {
    this.input.addClass('form-error');
  }
}

/** A Form text field
 * @extends Field
 */
class TextField extends Field {
  /**
   * Constructs a form text field
   * @param {JQuery} container - The parent container
   * @param {string} name - The name for the label and tooltip
   */
  constructor(container: JQuery, name: string) {
    super(container, 'text', name);
  }

  /**
   * The function to validate the input
   * @return {boolean}
   */
  public validate(): boolean {
    return ((this.input.val() as string).length > 0);
  }
}

/**
 * A Form Email field
 * @extends Field
 */
class EmailField extends Field {
  /**
   * Constructs a Form Email Field
   * @param {JQuery} container
   */
  constructor(container: JQuery) {
    super(container, 'email', 'Email');
  }

  /**
   * Validates email field
   * @return {boolean}
   */
  public validate(): boolean {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test((this.input.val() as string));
  }
}

/**
 * A Form Text area
 * @extends Field
 */
class TextArea extends Field {
  /**
   * Creates an instance of text area.
   * @param {JQuery} container - The parent object
   * @param {string} name - The label value and tooltip
   */
  constructor(container: JQuery, name: string) {
    super(container, 'text', name, 'textarea');
  }

  /**
   * Validates the Text Area
   * @return {boolean}
   */
  public validate(): boolean {
    return ((this.input.val() as string).length > 0);
  }
}

/** The Contact Form class */
export class ContactForm {
  private container: JQuery;
  private form: JQuery;
  private readonly loader: JQuery;
  private readonly server: string;
  private marketingConsent: CheckBox;
  private gdprConsent: CheckBox;
  private submitButton: Button;

  private failDOM: JQuery= $('<span>')
      .addClass('form-fail')
      .text(Strings.FORM_FAIL);
  private successDOM: JQuery = $('<span>')
      .addClass('form-success')
      .text(Strings.FORM_SUCCESS);

  private fieldList: Array<Field> = [];

  /**
   * Constructs the ContactForm
   * @param {JQuery} container - the container for the contact form
   * @param {string} server - the server address:port
   */
  constructor(container: JQuery, server: string) {
    this.container = container;
    this.server = server;

    this.form = this.container.find('form');

    this.loader = $('<div>')
        .addClass('lds-ring');
    for (let i = 0; i < 4; i++) {
      this.loader.append(
          $('<div>')
      );
    }

    // Fill form with fields
    this.fieldList = [
      new TextField(this.form, 'Name'),
      new EmailField(this.form),
      new TextArea(this.form, 'Message'),
    ];

    this.submitButton = new Button(['form-submit'], 'Submit', 'Submit');
    this.marketingConsent = new CheckBox(Strings.FORM_MARKETING_CONSENT,
        this.form, ['marketing-consent'], 'Marketing Consent');
    this.gdprConsent = new CheckBox(Strings.FORM_GDPR_CONSENT,
        this.form, ['gdpr-consent'], 'Privacy Policy');

    this.gdprConsent.registerEvent('change', () => {
      if (this.gdprConsent.checked()) {
        this.submitButton.enable();
      } else {
        this.submitButton.disable();
      }
    });

    this.submitButton.registerEvent('click', async () => {
      if (this.submitButton.getActionState() == ActionState.Enabled) {
        this.successDOM.remove();
        this.failDOM.remove();
        let allPass = true;

        let formData: SubmitRequest;
        for (const field of this.fieldList) {
          field.reset();
          const val = field.getVal();
          if (!field.validate()) {
            allPass = false;
            field.addError();
          } else {
            formData[field.name] = val;
          }
        }
        if (allPass) {
          formData['Consent'] = this.marketingConsent.checked();
          this.form.fadeOut(200, () => {
            this.loader.appendTo(this.container);
          });

          try {
            const ret =
              await fetchJSON<SubmitRequest,
                SubmitResponse>(formData, this.server + '/contact_form/');
            if (ret.success) {
              this.loader.fadeOut(200, () => {
                this.successDOM.appendTo(this.container);
              });
            } else {
              throw new Error('Failed to submit form.');
            }
          } catch (error) {
            this.form.fadeIn(200, () => {
              this.loader.fadeOut(200);
              this.failDOM.appendTo(this.container);
            });
          } finally {
            for (const field of this.fieldList) {
              field.reset();
            }
            this.loader.remove();
          }
        }
      }
    });

    this.submitButton.render().appendTo(this.form);
  }
}
