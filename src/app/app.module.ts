import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';

import { HttpClientModule, HttpClient } from '@angular/common/http'; 
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CallDialog } from './components/calldialog';
import { ContactsDialog } from './components/contactsdialog';
import { KeyboardPanel } from './components/contactsdialog';

//Angular Material
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatGridListModule} from '@angular/material/grid-list'; 
import {MatCardModule} from '@angular/material/card'; 
import {MatButtonModule} from '@angular/material/button'; 
import {MatDialogModule} from '@angular/material/dialog';
import {MatSnackBarModule} from '@angular/material/snack-bar'; 
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner'; 
import {MatFormFieldModule} from '@angular/material/form-field'; 
import {MatTableModule} from '@angular/material';
import {MatPaginatorModule} from '@angular/material/paginator'; 
import {MatInputModule} from '@angular/material';
import {MatIconModule} from '@angular/material/icon'; 

import { NgScrollbarModule } from 'ngx-scrollbar';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

@NgModule({
  declarations: [
    AppComponent,
    CallDialog,
    ContactsDialog,
    KeyboardPanel
  ],
  imports: [
    BrowserModule,
    FlexLayoutModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    FormsModule,
    MatIconModule,
    NgScrollbarModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: (http: HttpClient) => new TranslateHttpLoader(http),
          deps: [HttpClient]
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [
    CallDialog,
    ContactsDialog,
    KeyboardPanel
  ]
})
export class AppModule { }
