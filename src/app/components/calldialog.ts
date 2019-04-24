import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { UA } from 'sip.js';
import { ContactData } from '../app.component';
import { environment } from '../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'calldialog',
  templateUrl: './calldialog.html',
})
export class CallDialog implements OnInit{
  userAgent;
  session;
  processing = false;
  calling = false;
  forwardcall = false;
  contact: ContactData;
  displayname;
  terminatetext= this.translate.instant('alert.hungup');

  constructor(public dialogRef: MatDialogRef<CallDialog>, @Inject(MAT_DIALOG_DATA) public data: any, private translate: TranslateService) { 
    dialogRef.disableClose = true;
    dialogRef.backdropClick().subscribe(() => {
      this.forwardcall = false;
      this.hangUp();
    })
    this.contact = data.contact;
    this.forwardcall = data.forwardcall;
    if (this.contact.name.startsWith('Warenannahme') || this.contact.name.startsWith('Besucher')) {
      this.displayname = {name: this.contact.name.substring(this.contact.name.indexOf(' '))};
    } else {
      this.displayname = {name: this.contact.name};
    }
  }

  ngOnInit(){
    if (this.contact){
      this.userAgent = new UA( {
        uri: environment.sipuser+'@sipgate.de',
        authorizationUser: environment.sipuser,
        password: environment.sipPw,
        displayName: 'Terminal',
        transportOptions: {
          wsServers: ['wss://tls01.sipgate.de:443']
        },
        hackWssInTransport: true
      });
      this.call();
    }
  }

  call(){
    this.processing = true;

    let options = {
        sessionDescriptionHandlerOptions: {
        constraints: {
            audio: true,
            video: false
        }
        }
    };
    var currentsession = this.userAgent.invite(this.contact.number, options); 
    this.session = currentsession;
    currentsession.on('trackAdded', function() {
      console.log("Track added.");
      // We need to check the peer connection to determine which track was added
  
      var pc = currentsession.sessionDescriptionHandler.peerConnection;
  
      // Gets remote tracks
      var remoteStream = new MediaStream();
      pc.getReceivers().forEach(function(receiver) {
      remoteStream.addTrack(receiver.track);
      });
      const remoteAudio = document.createElement('audio');
      remoteAudio.srcObject = remoteStream;
      remoteAudio.play();
  
      // Gets local tracks
      var localStream = new MediaStream();
      pc.getSenders().forEach(function(sender) {
      localStream.addTrack(sender.track);
      });
    });
    currentsession.on('failed', () => {
      console.log('call failed');
      this.terminatetext = this.translate.instant('alert.failed');
    });
    currentsession.on('terminated', () => {
      console.log('call terminated');
      this.hangUp();
    });
    currentsession.on('accepted', () => {
      this.processing = false;
      this.calling = true;
      this.forwardcall = false;
      console.log('call accepted');
    });
    currentsession.on('progress', () =>{
      console.log('call in progress');
    });
    currentsession.on('cancel', () =>{
      console.log('call canceled');
      this.dialogRef.close(this.terminatetext);
    });
  }

  hangUp(){
    if (this.session) this.session.terminate();
    this.dialogRef.close({ 
      terminatetext: this.terminatetext,
      forwardcall: this.forwardcall
    });
    this.userAgent.stop();
  }
}