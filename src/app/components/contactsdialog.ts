import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSort, MatTableDataSource } from '@angular/material';
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { ContactData } from '../app.component';

@Component({
  selector: 'contactsdialog',
  templateUrl: './contactsdialog.html',
  styleUrls: ['./components.scss']
})
export class ContactsDialog implements OnInit{
  displayedColumns: string[] = ['name', 'number'];
  dataSource: MatTableDataSource<ContactData>;
  contacts;

  @ViewChild(MatSort) sort: MatSort;

  constructor(public dialogRef: MatDialogRef<ContactsDialog>, @Inject(MAT_DIALOG_DATA) public data: any) { 
    dialogRef.disableClose = true;
    dialogRef.backdropClick().subscribe(() => {
      this.dialogRef.close();
    })
    this.dataSource = new MatTableDataSource(data.contacts);
    this.contacts = data.contacts;
  }

  ngOnInit(){
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  format(number) {
    let formatedNumber = parsePhoneNumberFromString(number);
    return formatedNumber.formatInternational();
  }

  call(contact) {
    this.dialogRef.close(contact);
  }
}