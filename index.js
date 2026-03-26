// Elements
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const asciiOutput = document.getElementById('asciiOutput');

// Drag-N-Drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  uploadArea.addEventListener(eventName, e => {
    e.preventDefault();
    e.stopPropagation();
  }, false);
});

['dragenter', 'dragover'].forEach(eventName => {
  uploadArea.addEventListener(eventName, () => uploadArea.classList.add('dragover'), false);
});

['dragleave', 'drop'].forEach(eventName => {
  uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('dragover'), false);
});

uploadArea.addEventListener('drop', e => {
  const files = e.dataTransfer.files;
  handleFiles(files);
}, false);

// Click to upload
uploadArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', e => {
  handleFiles(e.target.files);
});

function handleFiles(files) {
  if (files.length > 0) {
    const file = files[0];
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => convertToASCII(img);
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}

const asciiChars = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'.';

function convertToASCII(img) {
  currentImage = img;
  const width = parseInt(widthSlider.value);
  const contrast = parseInt(contrastSlider.value);
  const aspectRatio = img.height / img.width;
  const height = Math.floor(width * aspectRatio * 0.5);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  let ascii = '';

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      let r = imageData.data[offset];
      let g = imageData.data[offset + 1];
      let b = imageData.data[offset + 2];
      
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      r = factor * (r - 128) + 128;
      g = factor * (g - 128) + 128;
      b = factor * (b - 128) + 128;

      r = Math.max(0, Math.min(255, r));
      g = Math.max(0, Math.min(255, g));
      b = Math.max(0, Math.min(255, b));

      const brightness = 0.2126 * r + 0.715 * g + 0.0722 * b;
      const charIndex = Math.floor(((255 - brightness) / 255) * (asciiChars.length - 1));
      ascii += asciiChars[charIndex];
    }
    ascii += '\n';
  }

  asciiOutput.textContent = ascii;
}

// Слайдеры
const widthSlider = document.getElementById('width');
const widthValue = document.getElementById('widthValue');

const contrastSlider = document.getElementById('contrast');
const contrastValue = document.getElementById('contrastValue');

widthValue.textContent = widthSlider.value;
contrastValue.textContent = contrastSlider.value;

let currentImage = null;

widthSlider.addEventListener('input', function() {
    widthValue.textContent = this.value;
    if (currentImage) convertToASCII(currentImage);
});

contrastSlider.addEventListener('input', function() {
    contrastValue.textContent = this.value;
    if (currentImage) convertToASCII(currentImage);
});

// Копирование
function copyText() {
  var copyText = document.getElementById('asciiOutput');

  navigator.clipboard.writeText(copyText.textContent).then(() => {
    alert("Текст скопирован.");
  }).catch(err => {
    console.error('Ошибка: ' + err);
  })
}

// Скачивание файла
function download() {
  if(!currentImage) {
    alert("Сначала загрузите изображение.");
    return;
  }
  const fileName = "asciiArt.txt";
  const blob = new Blob([asciiOutput.textContent], { type: 'text/plain' });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Скачивание картинки
function downloadImage() {
  if (!currentImage) {
    alert("Сначала загрузите изображение.");
    return;
  }

  const fileName = "asciiArt.png";
  const width = parseInt(widthSlider.value);
  const aspectRatio = currentImage.height / currentImage.width;
  const height = Math.floor(width * aspectRatio * 0.5);

  const canvas = document.createElement('canvas');
  canvas.width = width * 9.5;
  canvas.height = height * 16;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = '16px monospace';
  ctx.fillStyle = 'white';

  const asciiLines = asciiOutput.textContent.split('\n');
  asciiLines.forEach((line, i) => {
    ctx.fillText(line, 0, (i + 1) * 16);
  });

  const image = canvas.toDataURL('image/png');

  const link = document.createElement('a');
  link.download = fileName;
  link.href = image;
  link.click();
}




