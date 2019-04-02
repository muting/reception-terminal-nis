import { Component, Inject, OnInit, ViewContainerRef, Host, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatTableDataSource } from '@angular/material';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { ContactData } from '../app.component';
import Keyboard from 'simple-keyboard';
import { ComponentPortal } from '@angular/cdk/portal';

@Component({
  selector: 'contactsdialog',
  templateUrl: './contactsdialog.html',
  styleUrls: ['./components.scss']
})
export class ContactsDialog {
  displayedColumns: string[] = ['name', 'number'];
  dataSource: MatTableDataSource<ContactData>;
  overlayRef;
  contacts;
  value;

  @ViewChild('input') inputField: ElementRef;

  constructor(
    private overlay: Overlay,
    public viewContainerRef: ViewContainerRef,
    public dialogRef: MatDialogRef<ContactsDialog>, 
    @Inject(MAT_DIALOG_DATA) public data: any
    ){ 
    dialogRef.disableClose = true;
    dialogRef.backdropClick().subscribe(() => {
      this.dialogRef.close();
    })
    dialogRef.beforeClosed().subscribe(() => {
      this.closeKeyboard();
    })
    this.dataSource = new MatTableDataSource(data.contacts);
    this.contacts = data.contacts;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  inputFocus() {
    this.inputField.nativeElement.focus();
  }

  format(number) {
    let formatedNumber = parsePhoneNumberFromString(number);
    return formatedNumber.formatInternational();
  }

  call(contact) {
    this.dialogRef.close(contact);
  }

  openKeyboard(){
    if (!this.overlayRef || this.overlayRef['_host'] == null) {
      let config = new OverlayConfig({
        width: '100%',
        backdropClass: ''
      });
  
      config.positionStrategy = this.overlay
        .position()
        .global()
        .centerHorizontally()
        .bottom('0');
  
      this.overlayRef = this.overlay.create(config);
      this.overlayRef.attach(new ComponentPortal(KeyboardPanel, this.viewContainerRef));
    }
  }

  closeKeyboard(){
    if (this.overlayRef) this.overlayRef.dispose();
  }
}

@Component({
  selector: 'keyboard-panel',
  template: '<div class="keyboard-container"> <div (mouseup)="this._dialog.inputFocus()" class="simple-keyboard"></div> </div>',
  styleUrls: ['./components.scss']
})
export class KeyboardPanel implements OnInit {
keyboard;
_dialog;

  constructor(
    @Host() dialog: ContactsDialog
  ){
    this._dialog = dialog;
  }

  ngOnInit() {
    this.keyboard = new Keyboard({
      onChange: input => this.onChange(input),
      onKeyPress: input => this.onKeyPress(input),
      layout: {
        'default': [
          '{close} 1 2 3 4 5 6 7 8 9 0 ß {bksp}',
          '{tabspacer} q w e r t z u i o p ü {spacer}',
          '{lock} a s d f g h j k l ö ä {spacer2}',
          '{shift} y x c v b n m {space}'
        ]
      },
      display: {
        '{bksp}': '←',
        '{enter}': ' ',
        '{shift}': ' ',
        '{space}': 'Leerzeichen',
        '{tabspacer}': ' ',
        '{lock}': ' ',
        '{spacer}': ' ',
        '{spacer2}': ' ',
        '{close}': '&#10005;',
        'q': 'Q', 'w': 'W', 'e': 'E','r': 'R','t': 'T','z': 'Z','u': 'U','i': 'I','o': 'O','p': 'P','ü': 'Ü',
        'a': 'A','s': 'S','d': 'D','f': 'F','g': 'G','h': 'H','j': 'J','k': 'K','l': 'L','ö': 'Ö','ä': 'Ä',
        'y': 'Y','x': 'X','c': 'C','v': 'V','b': 'B','n': 'N','m': 'M',
      },
      buttonTheme: [
        { class: "close", buttons: "{close}" },
        { class: "bksp", buttons: "{bksp}" },
        { class: "tab", buttons: "{tabspacer}" },
        { class: "lock", buttons: "{lock}" },
        { class: "shift", buttons: "{shift}" },
        { class: "space", buttons: "{space}" },
        { class: "spacer", buttons: "{spacer}" },
        { class: "spacer2", buttons: "{spacer2}" },
      ]
    });
    this.keyboard.setInput(this._dialog.value);
  }

  onChange(input){
    this._dialog.value = input;
    this._dialog.applyFilter(input);
  }

  onKeyPress(input){
    this._dialog.inputFocus();
    if(input == '{close}'){
      this._dialog.overlayRef.dispose();
    }
  }
}
