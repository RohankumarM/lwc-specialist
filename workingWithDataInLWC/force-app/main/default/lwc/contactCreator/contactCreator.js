import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import FIRSTNAME_FIELD from '@salesforce/schema/Contact.FirstName';
import LASTNAME_FIELD from '@salesforce/schema/Contact.LastName';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';
export default class ContactCreator extends LightningElement {
  objectApiName = CONTACT_OBJECT;
  fields = [FIRSTNAME_FIELD, LASTNAME_FIELD, EMAIL_FIELD];
  handleSuccess(event){
    console.log(event.detail.id);
    const toastEvt = new ShowToastEvent({
      title: "ID of contact created",
      message: event.detail.id,
    });
    this.dispatchEvent(toastEvt);
  }
  
}