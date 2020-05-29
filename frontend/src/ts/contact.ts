import {fetchJSON} from './comms';
import {Button, CheckBox, ActionState} from './components';
import * as Strings from './strings';

interface SubmitRequest {
  Name: string;
  Email: string;
  Message: string;
  GDPRConsent: boolean;
  MarketingConsent: boolean;
}

interface SubmitResponse {
  success: boolean;
}

/** Abstract base class for Form fields */
abstract class Field {
  protected input: JQuery;
  protected label: JQuery;
  public name: string;

  /**
   * Constructs a Form Field
   * @param {JQuery} container - The parent container
   * @param {string} type - The type of input ['text', 'email', etc]
   * @param {string} name - The name to give the label, also the tooltip
   * @param {string} id - The id to give the label, and the tag
   * @param {string} tag='input' - The type of tag if not input
   */
  constructor(container: JQuery,
      type: string,
      name: string,
      id: string,
      tag = 'input') {
    this.name = name;

    this.label = $('<label>')
        .attr('for', id)
        .text(name)
        .appendTo(container);
    this.input = $('<' + tag + '>')
        .addClass('field')
        .attr('type', type)
        .attr('id', id)
        .attr('name', name)
        .appendTo(container);
  }
  /**
   * The abstract validation function
   * @abstract
   * @return boolean
   */
  abstract validate(): boolean;

  /**
   * Return the error text to display to the user for this field
   * @abstract
   * @returns {string}
   */
  abstract getErrorText(): string;

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
    this.label.after(
        $('<span>')
            .addClass('form-error')
            .text(this.getErrorText())
    );
  }

  /**
   * Adds the required class to the field
   */
  public addRequired(): void {
    this.label.addClass('required');
    this.input.addClass('required');
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
   * @param {string} id - The id for the label and input tag
   */
  constructor(container: JQuery, name: string, id: string) {
    super(container, 'text', name, id);
  }

  /**
   * The function to validate the input
   * @return {boolean}
   */
  public validate(): boolean {
    return ((this.input.val() as string).length > 0);
  }

  /**
   * Return the error text for this field
   * @return {string}
   */
  public getErrorText(): string {
    return Strings.FORM_NAME_ERROR_TEXT;
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
   * @param {string} id - The id for the label and input tag
   */
  constructor(container: JQuery, id: string) {
    super(container, 'email', 'Email', id);
  }

  /**
   * Validates email field
   * @return {boolean}
   */
  public validate(): boolean {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test((this.input.val() as string));
  }

  /**
   * Return the error text for this field
   * @return {string}
   */
  public getErrorText(): string {
    return Strings.FORM_EMAIL_ERROR_TEXT;
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
   * @param {string} id - The id for the label and textarea tag
   */
  constructor(container: JQuery, name: string, id: string) {
    super(container, 'text', name, id, 'textarea');
  }

  /**
   * Validates the Text Area
   * @return {boolean}
   */
  public validate(): boolean {
    return ((this.input.val() as string).length > 0);
  }

  /**
   * Return the error text for this field
   * @return {string}
   */
  public getErrorText(): string {
    return Strings.FORM_MESSAGE_ERROR_TEXT;
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

  private failDOM: JQuery= $('<div>')
      .addClass('form-fail')
      .append(
          $('<p>').text(Strings.FORM_FAIL)
      );

  private successDOM: JQuery = $('<div>')
      .addClass('form-success')
      .append(
          $('<p>').text(Strings.FORM_SUCCESS)
      );


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

    const nameField = new TextField(this.form, 'Name', 'name-field');
    nameField.addRequired();
    this.fieldList.push(nameField);

    const emailField = new EmailField(this.form, 'email-field');
    emailField.addRequired();
    this.fieldList.push(emailField);

    const messageField = new TextArea(this.form, 'Message', 'message-field');
    messageField.addRequired();
    this.fieldList.push(messageField);

    $('<div>')
        .append(
            $('<p>').html(Strings.FORM_PRIVACY_POLICY)
        )
        .appendTo(this.form);

    this.submitButton = new Button(['form-submit'], 'Submit', 'Submit');
    this.marketingConsent = new CheckBox(Strings.FORM_MARKETING_CONSENT,
        undefined, ['form-checkbox', 'optional'], 'Marketing Consent');
    this.gdprConsent = new CheckBox(Strings.FORM_GDPR_CONSENT, undefined,
        ['form-checkbox', 'required'], 'Privacy Policy');

    this.gdprConsent.registerEvent('change', () => {
      if (this.gdprConsent.checked()) {
        this.submitButton.enable();
      } else {
        this.submitButton.disable();
      }
    });

    this.marketingConsent.render().appendTo(this.form);
    this.gdprConsent.render().appendTo(this.form);

    this.submitButton.registerEvent('click', async () => {
      if (this.submitButton.getActionState() == ActionState.Enabled) {
        this.successDOM.remove();
        this.failDOM.remove();
        let allPass = true;

        const formData: SubmitRequest = {
          Name: '',
          Email: '',
          Message: '',
          GDPRConsent: false,
          MarketingConsent: false,
        };
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
          formData['MarketingConsent'] = this.marketingConsent.checked();
          formData['GDPRConsent'] = this.gdprConsent.checked();
          this.form.fadeOut(200, () => {
            this.loader.appendTo(this.container);
            this.loader.show();
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
    this.submitButton.disable();
    this.submitButton.render().appendTo(this.form);
  }
}
