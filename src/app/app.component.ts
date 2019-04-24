import { Component, OnInit, Renderer2} from '@angular/core';
import { CallDialog } from './components/calldialog';
import { ContactsDialog } from './components/contactsdialog';
import { MatDialog } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar'; 
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';
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
  deliveryContacts: Array<ContactData> = new Array;
  visitorContacts: Array<ContactData> = new Array;
  contacts: Array<ContactData> = new Array;

  constructor(public dialog: MatDialog,
              private snackBar: MatSnackBar,
              private http: HttpClient,
              private renderer: Renderer2,
              private translate: TranslateService) {
              renderer.listen('document', 'contextmenu', (event) => {
                return false;
              });

              translate.setDefaultLang('de');
              translate.use('de');
              }

  ngOnInit() {
    this.getContacts();
    schedule.scheduleJob('0 0 * * *', () => { this.getContacts() });
  }

  changeLang(lang : string) {
    this.translate.use(lang);
  }
  
  openCall(contact?: ContactData, contacts?: Array<ContactData>, count?) {
    var counter = count ? count : 0;
    if (contact || counter < contacts.length) {
      const callDialog = this.dialog.open(CallDialog, {
        width: '500px',
        height: '500px',
        data: {
          contact: contact ? contact : contacts[count],
          forwardcall: contacts? true : false
        }
      });
      callDialog.afterClosed().subscribe(result => {
        console.log(result);
        if (!result.forwardcall) {
          this.snackBar.open(result.terminatetext,'',{duration: 4000});
        } else {
          this.snackBar.open(this.translate.instant('alert.forward'),'',{duration: 4000});
          this.openCall(null, contacts, ++count);
        }
      });
    } else {
      this.snackBar.open(this.translate.instant('alert.end'),'',{duration: 4000});
    }
  }

  openContacts(){
    const contactsDialog = this.dialog.open(ContactsDialog, {
      width: '600px',
      height: '700px',
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
        var name: string = res['items'][i].name;
        if (name.startsWith('Warenannahme')){
          this.deliveryContacts.push({
            name: res['items'][i].name,
            number: res['items'][i].numbers[0].number
          });
          continue;
        }
        else if (name.startsWith('Besucher')){
          this.visitorContacts.push({
            name: res['items'][i].name,
            number: res['items'][i].numbers[0].number
          });
          continue;
        } else {
          name = name.replace('_ae','ä');
          name = name.replace('_oe','ö');
          name = name.replace('_ue','ü');
          this.contacts.push({
            name: name,
            number: res['items'][i].numbers[0].number
          });
        }
      }
      console.log(this.contacts);
      console.log(this.deliveryContacts);
      console.log(this.visitorContacts);
    });
  }
}
