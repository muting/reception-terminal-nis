import { Component, OnInit, Renderer2} from '@angular/core';
import { CallDialog } from './components/calldialog';
import { ContactsDialog } from './components/contactsdialog';
import { MatDialog } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar'; 
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import schedule from 'node-schedule'

export interface ContactData {
  name: string;
  number: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  deliveryContact: ContactData;
  visitorContact: ContactData;
  contacts: Array<ContactData> = new Array;

  constructor(public dialog: MatDialog,
              private snackBar: MatSnackBar,
              private http: HttpClient,
              private renderer: Renderer2) {
              // renderer.listen('document', 'contextmenu', (event) => {
              //   return false;
              // })
              }

  ngOnInit() {
    this.getContacts();
    schedule.scheduleJob('0 0 * * *', () => { this.getContacts() });
  }

  openCall(contact: ContactData) {
    const callDialog = this.dialog.open(CallDialog, {
      width: '500px',
      height: '500px',
      data: {contact: contact}
    });
    callDialog.afterClosed().subscribe(result => {
      this.snackBar.open(result,'',{duration: 3000});
    });
  }

  openContacts(){
    const contactsDialog = this.dialog.open(ContactsDialog, {
      width: '800px',
      height: '600px',
      data: {contacts: this.contacts},
    });
    contactsDialog.afterClosed().subscribe(result => {
      if(result)this.openCall(result);
    });
  }

  getContacts(){
    let headers = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');
    headers = headers.append('Authorization', 'Basic '+ environment.apiAuth);
    this.http.get('https://api.sipgate.com/v2/contacts', {headers: headers}).subscribe(res => {
      for(var i = 0; i < res['items'].length; i++) {
        if (res['items'][i].name == 'Warenannahme ' && !this.deliveryContact){
          this.deliveryContact = {
            name: res['items'][i].name,
            number: res['items'][i].numbers[0].number
          }
          continue;
        }
        else if (res['items'][i].name == 'Besucher ' && !this.visitorContact){
          this.visitorContact = {
            name: res['items'][i].name,
            number: res['items'][i].numbers[0].number
          }
          continue;
        } else {
          this.contacts.push({
            name: res['items'][i].name,
            number: res['items'][i].numbers[0].number
          });
        }
      }
      console.log(this.contacts);
    });
  }
}
