let GRID_CELL_WIDTH; // = width/50
let stitches = []; // will be a 2d arr
let isPreview = false; // preview crochet effect

const Tools = {
  THREAD: Symbol('thread'), // add stitches
  SEAMRIPPER: Symbol('seamripper'), // rm stitches
  COPY_TO_CLIPBOARD: Symbol('copyToClipboard'), // copy as text to clipboard
};
Object.freeze(Tools);

let currTool = Tools.THREAD;

function setup() {
  let cnv = createCanvas(1200, 840);
  cnv.parent('p5-wrapper');

  GRID_CELL_WIDTH = width / 50;

  // initiate empty stitches matrix
  stitches = Array(height / GRID_CELL_WIDTH)
    .fill()
    .map(() => Array(width / GRID_CELL_WIDTH).fill(0));

  // setup buttons
  addButtons();
}

function draw() {
  if (!isPreview) {
    // clear bg + draw grid
    background(255);
    drawGrid();

    // stitch settings
    stroke(50);
    strokeWeight(4);
    for (let y = 0; y < stitches.length; y++) {
      for (let x = 0; x < stitches[0].length; x++) {
        if (stitches[y][x] === 1) {
          const cellX = x * GRID_CELL_WIDTH;
          const cellY = y * GRID_CELL_WIDTH;

          line(cellX, cellY, cellX + GRID_CELL_WIDTH, cellY + GRID_CELL_WIDTH);
          line(cellX + GRID_CELL_WIDTH, cellY, cellX, cellY + GRID_CELL_WIDTH);
        }
      }
    }
  } else {
    // previewing crochet
    background(0);

    stroke('cornsilk');
    for (let y = 0; y < stitches.length; y++) {
      for (let x = 0; x < stitches[0].length; x++) {
        const cellX = x * GRID_CELL_WIDTH;
        const cellY = y * GRID_CELL_WIDTH;
        if (stitches[y][x] === 1) {
          strokeWeight(16);
        } else {
          strokeWeight(1);
        }

        line(cellX, cellY, cellX + GRID_CELL_WIDTH, cellY + GRID_CELL_WIDTH);
        line(cellX + GRID_CELL_WIDTH, cellY, cellX, cellY + GRID_CELL_WIDTH);
      }
    }
  }
}

function drawOrRemoveStitch() {
  // round to cell top/left corner
  const cellX = Math.floor(mouseX / GRID_CELL_WIDTH);
  const cellY = Math.floor(mouseY / GRID_CELL_WIDTH);

  // bounds check
  if (
    cellY >= 0 &&
    cellY < stitches.length &&
    cellX >= 0 &&
    cellX < stitches[0].length
  ) {
    if (currTool === Tools.THREAD && stitches[cellY][cellX] === 0) {
      stitches[cellY][cellX] = 1;
    } else if (currTool === Tools.SEAMRIPPER && stitches[cellY][cellX] === 1) {
      stitches[cellY][cellX] = 0;
    }
  }
}

function mouseDragged() {
  drawOrRemoveStitch();
}

function mousePressed() {
  drawOrRemoveStitch();
}

function keyPressed() {
  if (keyCode === 32) {
    isPreview = true;
  }

  // if (key === "s") {
  //   currTool = Tools.SEAMRIPPER;
  // } else if (key === "t") {
  //   currTool = Tools.THREAD;
  // }
}

// copy image as text to clipboard
function keyReleased() {
  if (keyCode === 32) {
    isPreview = false;
  }
}

function drawGrid() {
  // grid settings
  stroke(200);
  strokeWeight(1);

  for (let i = 0; i <= width; i += GRID_CELL_WIDTH) {
    line(i, 0, i, height);
    for (let j = 0; j <= height; j += GRID_CELL_WIDTH) {
      line(0, j, width, j);
    }
  }
}

function addButtons() {
  const threadBtn = createButton('YOU ARE THREADING');
  threadBtn.size(150, 80);
  threadBtn.style('background', 'lightgray');
  threadBtn.mousePressed(() => {
    currTool = Tools.THREAD;
    threadBtn.style('background', 'lightgray');
    seamRipperBtn.style('background', 'white');
    seamRipperBtn.html('seam ripper');

    threadBtn.html('YOU ARE THREADING');
  });
  threadBtn.position(0, height + 60);

  const seamRipperBtn = createButton('seam ripper');
  seamRipperBtn.size(150, 80);
  seamRipperBtn.style('background', 'white');
  seamRipperBtn.mousePressed(() => {
    currTool = Tools.SEAMRIPPER;
    seamRipperBtn.style('background', 'lightgray');
    threadBtn.style('background', 'white');
    threadBtn.html('threader');

    seamRipperBtn.html('YOU ARE SEAM RIPPING');
  });
  seamRipperBtn.position(175, height + 60);

  const copyToClipboard = createButton('copy to clipboard');
  copyToClipboard.size(150, 80);
  copyToClipboard.style('background', 'white');
  copyToClipboard.mousePressed(() => {
    let str = '';
    for (let i = 0; i < stitches.length; i++) {
      for (let j = 0; j < stitches[0].length; j++) {
        str += stitches[i][j] === 0 ? '…' : 'X';
      }
      str += '\n';
    }

    // copy to clipboard logic
    try {
      const el = document.createElement('textarea');
      el.value = str;
      el.setAttribute('readonly', '');
      el.style = { position: 'absolute', left: '-9999px' };
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    } catch (e) {
      console.log('eep! ', e);
    }

    // alert(`copied!\n ${str}`);
    alert('copied to clipboard!');
  });
  copyToClipboard.position(width - 600, height + 60);

  const clearBtn = createButton('clear');
  clearBtn.size(150, 80);
  clearBtn.style('background', 'white');
  clearBtn.mousePressed(() => {
    stitches = Array(height / GRID_CELL_WIDTH)
      .fill()
      .map(() => Array(width / GRID_CELL_WIDTH).fill(0));
  });
  clearBtn.position(width - 150, height + 60);
}
