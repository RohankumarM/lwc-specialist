import { api, LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import { refreshApex } from '@salesforce/apex';
import { publish, MessageContext } from 'lightning/messageService';
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import getBoats from '@salesforce/apex/BoatDataService.getBoats';

const LOADING_EVENTS = {
  true: new CustomEvent('loading'),
  false: new CustomEvent('doneloading')
};

const TABLE_COLUMNS = [
  { label: 'Name', fieldName: 'Name', editable: true },
  { label: 'Length', fieldName: 'Length__c', type: 'number', editable: true },
  { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true },
  { label: 'Description', fieldName: 'Description__c', type: 'text', editable: true }
];

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';

export default class BoatSearchResults extends LightningElement {
  selectedBoatId;
  columns = [];
  boatTypeId = '';
  boats;
  isLoading = false;

  // wired message context
  @wire(MessageContext)
  messageContext;
  // wired getBoats method 
  @wire(getBoats, { boatTypeId: '$boatTypeId' })
  wiredBoats(result) {
    this.boats = result;
    this.notifyLoading(false);
  }

  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api
  searchBoats(boatTypeId) {
    this.boatTypeId = boatTypeId;
    this.notifyLoading(true);
  }

  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  @api
  async refresh() {
    this.notifyLoading(true);
    refreshApex(this.boats);
  }

  // this function must update selectedBoatId and call sendMessageService
  updateSelectedTile(event) {
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }

  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) {
    // explicitly pass boatId to the parameter recordId
    const message = { recordId: boatId };
    publish(this.messageContext, BOATMC, message);
  }

  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the 
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    // notify loading
    const updatedFields = event.detail.draftValues.slice().map(draft => {
      const fields = Object.assign({}, draft);
      return { fields };
    });
    // Update the records via Apex
    updateBoatList({ data: updatedFields })
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: SUCCESS_TITLE,
            message: MESSAGE_SHIP_IT,
            variant: SUCCESS_VARIANT
          })
        );
        this.refresh();
      })
      .catch(error => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: ERROR_TITLE,
            message: error.body.message,
            variant: ERROR_VARIANT
          })
        );
      })
      .finally(() => {
        const table = this.template.querySelector(DATATABLE_CMP);
        table.draftValues = null;
      });
  }
  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) {
    this.loading = isLoading;
    if (this.loading) {
      this.dispatchEvent(new CustomEvent("loading"));
    } else {
      this.dispatchEvent(new CustomEvent("doneloading"));
    }
  }
}
