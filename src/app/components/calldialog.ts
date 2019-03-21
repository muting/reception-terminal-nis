import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { UA } from 'sip.js';

@Component({
  selector: 'calldialog',
  templateUrl: './calldialog.html',
})
export class CallDialog implements OnInit{
  userAgent;
  session;
  processing = false;
  calling = false;
  number;
  terminatetext= 'Aufgelegt';
  constructor(public dialogRef: MatDialogRef<CallDialog>, @Inject(MAT_DIALOG_DATA) public data: any) { 
    dialogRef.disableClose = true;
    dialogRef.backdropClick().subscribe(() => {
      this.hangUp(false);
    })
    this.number = data.number;
  }

  ngOnInit(){
    this.userAgent = new UA( {
      uri: '2708118e0@sipgate.de',
      authorizationUser: '2708118e0',
      password: '7VMduU6yNtJJ',
      displayName: 'Terminal',
      transportOptions: {
        wsServers: ['wss://tls01.sipgate.de:443']
      },
      hackWssInTransport: true
    });
    this.call();
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
    var currentsession = this.userAgent.invite(this.number, options); 
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
      this.terminatetext = 'Anruf gescheitert.';
    });
    currentsession.on('terminated', () => {
      console.log('call terminated');
      this.hangUp(true);
    });
    currentsession.on('accepted', () => {
      this.processing = false;
      this.calling = true;
      console.log('call accepted');
    });
    currentsession.on('progress', () =>{
      console.log('call in progress');
    });
    currentsession.on('cancel', () =>{
      console.log('call canceled');
      this.terminatetext = 'Anruf abgebrochen.';
      this.dialogRef.close(this.terminatetext);
    });
  }

  hangUp(terminated: boolean){
    if (!terminated) this.session.terminate();
    this.dialogRef.close(this.terminatetext);
    this.userAgent.stop();
    this.userAgent.unregister();
  }
}