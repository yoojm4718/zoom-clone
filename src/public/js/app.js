const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");
const audioSelect = document.getElementById("audios");

let myStream;
let muted = false;
let cameraOff = false;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      cameraSelect.append(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getAudios() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audios = devices.filter((device) => device.kind === "audioinput");
    const currentAudio = myStream.getAudioTracks()[0];
    audios.forEach((audio) => {
      const option = document.createElement("option");
      option.value = audio.deviceId;
      option.innerText = audio.label;
      if (currentAudio.label === audio.label) {
        option.selected = true;
      }
      audioSelect.append(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(videoId, audioId) {
  const constraint = {
    audio: audioId ? { deviceId: { exact: audioId } } : true,
    video: videoId ? { deviceId: { exact: videoId } } : true,
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(constraint);
    myFace.srcObject = myStream;
    if (!videoId) {
      await getCameras();
    }
    if (!audioId) {
      await getAudios();
    }
  } catch (e) {
    console.log(e);
  }
}

getMedia();

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerText = "음소거 해제";
    muted = true;
  } else {
    muteBtn.innerText = "음소거";
    muted = false;
  }
}
function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.innerText = "카메라 끄기";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "카메라 켜기";
    cameraOff = true;
  }
}

async function handleCameraChange() {
  await getMedia(cameraSelect.value, undefined);
}

async function handleAudioChange() {
  await getMedia(undefined, audioSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
cameraSelect.addEventListener("input", handleCameraChange);
audioSelect.addEventListener("input", handleAudioChange);
