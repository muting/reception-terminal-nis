import { Component, OnInit} from '@angular/core';
import { CallDialog } from './components/calldialog';
import { MatDialog } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar'; 
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  deliveryNumber = '+4961022021603';//+4961022021603
  visitorNumber;
  numberList;

  constructor(public dialog: MatDialog,
              private snackBar: MatSnackBar,
              private http: HttpClient) {}

  ngOnInit() {
    let headers = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');
    headers = headers.append('Authorization', 'Basic bXV0aW5nLnFpbkBnbWFpbC5jb206cGVraW5nNDE3');
    this.http.get('https://api.sipgate.com/v2/contacts', {headers: headers}).subscribe(res => {
      this.numberList = res['items'];
      this.deliveryNumber = this.numberList[0].numbers[0].number;
      this.visitorNumber = this.numberList[1].numbers[0].number;
    })
  }

  openCall(number) {
    const callDialog = this.dialog.open(CallDialog, {
      width: '500px',
      height: '500px',
      data: {number: number}
    });
    callDialog.afterClosed().subscribe(result => {
      this.snackBar.open(result,'',{duration: 3000});
    });
  }

  openContacts(){
    
  }
}
