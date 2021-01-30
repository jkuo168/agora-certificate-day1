let handlefail = function (err) {
  console.log(err);
};

let appId = "ab3f0e9065074402be67c1e1504af2b4";
let globalStream;
let isAudioMuted = false;
let isVideoMuted = false;

let client = AgoraRTC.createClient({
  mode: "live",
  codec: "h264",
});

client.init(appId, () => {
  console.log("AgoraRTC Client Connected"), handlefail;
});

let addVideoStream = function (streamId) {
  let remoteContainer = document.getElementById("remoteStream");
  let streamDiv = document.createElement("div");
  streamDiv.id = streamId;
  streamDiv.style.transform = "rotateY(180deg)";
  streamDiv.style.height = "250px";
  remoteContainer.appendChild(streamDiv);
};

let removeMyVideoStream = function () {
  globalStream.stop();
};

let removeVideoStream = function (event) {
  let stream = event.stream;
  stream.stop();
  let remDiv = document.getElementById(stream.getId());
  remDiv.parentNode.removeChild(remDiv);
};

document.getElementById("leave").onclick = function () {
  client.leave(function () {
    console.log("Sucessfully left!");
  }, handlefail);
  removeVideoStream();
};

document.getElementById("join").onclick = function () {
  let channelName = document.getElementById("channelName").value;
  let Username = document.getElementById("username").value;

  client.join(null, channelName, Username, () => {
    var localStream = AgoraRTC.createStream({
      video: true,
      audio: true,
    });

    localStream.init(function () {
      localStream.play("SelfStream");
      console.log(`App id: ${appId}\nChannel id: ${channelName}`);
      client.publish(localStream);
    });

    globalStream = localStream;
  });

  client.on("stream-added", function (event) {
    client.subscribe(event.stream, handlefail);
  });

  client.on("stream-subscribed", function (event) {
    console.log("Subscribed Stream");
    let stream = event.stream;
    addVideoStream(stream.getId());
    stream.play(stream.getId());
  });

  client.on("peer-leave", function (event) {
    removeVideoStream(event);
  });
};

document.getElementById("video-mute").onclick = function () {
  if (!isVideoMuted) {
    globalStream.muteVideo();
    isVideoMuted = true;
  } else {
    globalStream.unmuteVideo();
    isVideoMuted = false;
  }
};

document.getElementById("audio-mute").onclick = function () {
  if (!isAudioMuted) {
    globalStream.muteAudio();
    isAudioMuted = true;
  } else {
    globalStream.unmuteAudio();
    isAudioMuted = false;
  }
};
