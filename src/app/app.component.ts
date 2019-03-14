import { Component, OnInit } from '@angular/core';
import { UA, Web } from 'sip.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'reception-terminal-nis';
  userAgent;
  session;
  calling = false;
  simple;

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
  }

  Call(){
    this.calling = true;
    // let remoteVideo = document.getElementById('remoteVideo');
    // let localVideo = document.getElementById('localVideo');
    // let remoteAudio = document.getElementById('webrtc_audio');

    let options = {
      sessionDescriptionHandlerOptions: {
        constraints: {
          audio: true,
          video: false
        }
      }
    };
    var currentsession = this.userAgent.invite('+4917680701505', options); //+4961022021639
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
      // (<HTMLMediaElement>localVideo).srcObject = localStream;
      // (<HTMLMediaElement>localVideo).play();
    });
    currentsession.on('terminated', function(){
      this.calling = false;
    });
  }

  HangUp(){
    this.session.terminate();
    this.calling = false;
  }

}
