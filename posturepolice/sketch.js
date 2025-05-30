const modelURL = 'https://teachablemachine.withgoogle.com/models/prOkjvoFX/';
const checkpointURL = modelURL + 'model.json';
const metadataURL = modelURL + 'metadata.json';

const flip = true;
let yaysong, boosong;
let lastClassification = null;
let hasPlayed = false;
let showStats = false;

let model;
let totalClasses;
let myCanvas;

let classification = 'None Yet';
let probability = '100';
let poser;
let video;

async function load() {
  model = await tmPose.load(checkpointURL, metadataURL);
  totalClasses = model.getTotalClasses();

  yaysong = loadSound('./assets/yay.mp3');
  boosong = loadSound('./assets/boo.mp3');
}

async function setup() {
  myCanvas = createCanvas(1400, 1400);
  videoCanvas = createCanvas(640, 480);

  await load();
  video = createCapture(VIDEO, videoReady);
  video.size(640, 480);
  video.hide();
}

function draw() {
  background(255);
  if (video) image(video, 0, 0);
  fill(255, 0, 0);
  textSize(18);
  if (showStats) {
    text('Result: ' + classification, 10, 40);
    text('Probability: ' + probability, 10, 20);
  }

  textSize(8);
  // if (poser) {
  //   for (let i = 0; i < poser.length; i++) {
  //     let x = poser[i].position.x;
  //     let y = poser[i].position.y;
  //     ellipse(x, y, 5, 5);
  //     text(poser[i].part, x + 4, y);
  //   }
  // }
}

function videoReady() {
  console.log('Video Ready');
  predict();
}

async function predict() {
  const flipHorizontal = true;
  const { pose, posenetOutput } = await model.estimatePose(
    video.elt,
    flipHorizontal
  );

  const prediction = await model.predict(
    posenetOutput,
    flipHorizontal,
    totalClasses
  );

  const sortedPrediction = prediction.sort(
    (a, b) => -a.probability + b.probability
  );
  classification = sortedPrediction[0].className;
  if (lastClassification === null) lastClassification = classification;
  probability = sortedPrediction[0].probability.toFixed(2);
  if (pose) poser = pose.keypoints;

  // Play sounds only once per classification
  if (classification !== lastClassification) {
    hasPlayed = false;
    lastClassification = classification;
  }

  if (!hasPlayed) {
    if (classification === 'good posture') {
      boosong.stop();
      if (yaysong && yaysong.isLoaded()) yaysong.play();
      hasPlayed = true;
    } else if (classification === 'bad posture') {
      yaysong.stop();
      if (boosong && boosong.isLoaded()) boosong.play();
      hasPlayed = true;
    }
  }

  predict(); // keep looping
}

function mousePressed() {
  showStats = !showStats;
}
