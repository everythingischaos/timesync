const audio = document.querySelector("#audio");
const startButton = document.querySelector("#start");
const timer = document.querySelector("#time");
const lapButton = document.querySelector("#lap");
const exportButton = document.querySelector("#export");
const importButton = document.querySelector("#import");
const lapList = document.querySelector("#laps");

let isRunning = true;
let startTime = new Date().getTime();
let laps = [];
let labels = {};

const lap = () => {
  laps.push(getAudioMs());
  labels[getAudioMs()] = '';
  updateLaps();
};

const getAudioMs = () => Math.floor(wavesurfer.getCurrentTime()*1000);

const exportThing = () => {
  navigator.clipboard.writeText(JSON.stringify(labels));
}

const importThing = async() => {
  labels = JSON.parse(await navigator.clipboard.readText());
  laps = Object.keys(labels).map(str => parseInt(str));
  updateLaps();
}

//Handlers for laps
const handleLabelChange = (e) => {
  const lapNumber = e.getAttribute('for');
  labels[laps[lapNumber]] = e.value;
}
const goTo = (e) => {
  const lapNumber = e.getAttribute('for');
  wavesurfer.seekAndCenter((laps[lapNumber]/1000) / wavesurfer.getDuration())
}
const deleteLap = (e) => {
  const lapNumber = e.getAttribute('for');
  delete laps[lapNumber];
  updateLaps();
}

const updateTimer = () => {
    // const msTime = new Date().getTime() - startTime;
    const sTime = getAudioMs();
    timer.innerHTML = msToString(sTime);
    wavesurfer.clearMarkers();
    for(label in labels) {
      wavesurfer.addMarker({
        time: label/1000,
        label: labels[label],
        position: laps.findIndex(value => value==label) % 2 ? "top" : "bottom"
      })
    }
};
const updateLaps = () => {
  laps = laps.sort((a, b) => a-b);
    const lapElements = laps.reduce((prev, lap, i, arr) => {
        return prev + `<tr>
        <td>${i}</td>
        <td>${msToString(lap)}</td>
        <td>${arr[i-1] ? msToString(lap - arr[i-1]) : ''}</td>
        <td><input for="${i}" value="${labels?.[lap]}" onchange="handleLabelChange(this)"></input></td>
        <td><button onclick="goTo(this)" for="${i}">Go to</button></td>
        <td><button onclick="deleteLap(this)" for="${i}">Delete</button></td>
        </tr>`;
    }, '')
    lapList.innerHTML = lapElements;
}


/**
 * 
 * @param {number} msTime 
 * @returns {string}
 */
const msToString = (msTime) => {
    const ms = msTime % 1000;
    const s = Math.floor(msTime / 1000) % 60;
    const m = Math.floor(msTime / 60000) % 60;
    return `<span class="red">${"0".repeat(2 - m.toString().length) + m}</span>:<span class="green">${
      "0".repeat(2 - s.toString().length) + s
    }</span>.<span class="blue">${ms + "0".repeat(3 - ms.toString().length)}</span>`;
}

lapButton.addEventListener("click", lap);
exportButton.addEventListener("click", exportThing);
importButton.addEventListener("click", importThing);
// startButton.addEventListener("click", () => {wavesurfer.playPause()})
setInterval(updateTimer, 10);

var wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: 'violet',
  progressColor: 'purple',
  fillParent: false,
  scrollParent: true,
  minPxPerSec: 50,
  plugins: [
    WaveSurfer.markers.create(),
    WaveSurfer.minimap.create({
      container: '#minimap',
      waveColor: '#777',
      progressColor: '#222',
      height: 50
    })
  ]
});

document.querySelector('#upload').addEventListener('change', e => {
  const files = e.target.files;
  wavesurfer.load(URL.createObjectURL(files[0]));
  e.target.style = 'display: none;'
})


document.addEventListener('keydown', (e) => {
  console.log('key', e.key);
  switch (e.key) {
    case ' ':
      wavesurfer.playPause();
      break;
    
    case 'ArrowRight':
      wavesurfer.skip(5);
      break;

    case 'ArrowLeft':
      wavesurfer.skip(-5);
      break;

    case 'm':
      lap();
      break;
  
    default:
      break;
  }
})