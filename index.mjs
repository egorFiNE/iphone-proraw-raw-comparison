import fs from 'fs';
import sharp from 'sharp';
import { loadImage, createCanvas } from 'canvas';

const PREVIEW_SIZE_PIXELS = 712;
const GAP_X = 60;
const GAP_Y = 60;
const TEXT_HEIGHT = 30;
const TEXT_OFFSET = 20;

const structure = [
  // [
  //   [ 'landscape-light-raw.png', 'RAW 1/2000 ISO 32' ],
  //   [ 'landscape-light-raw-denoise.png', 'RAW + denoise 1/2000 ISO 32' ],
  //   [ 'landscape-light-proraw.png', 'ProRAW 1/2000 ISO 32' ],
  // ],
  // [
  //   [ 'landscape-dark-raw.png', 'RAW 1/2000 ISO 32' ],
  //   [ 'landscape-dark-raw-denoise.png', 'RAW + denoise 1/2000 ISO 32' ],
  //   [ 'landscape-dark-proraw.png', 'ProRAW 1/2000 ISO 32' ],
  // ],
  // [
  //   [ 'square-luggage-raw.png', 'RAW 1/42k ISO 40' ],
  //   [ 'square-luggage-raw-denoise.png', 'RAW + denoise 1/42k ISO 40' ],
  //   [ 'square-luggage-proraw.png', 'ProRAW 1/42k ISO 32' ],
  // ],
  // [
  //   [ 'square-house-raw.png', 'RAW 1/42k ISO 40' ],
  //   [ 'square-house-raw-denoise.png', 'RAW + denoise 1/42k ISO 40' ],
  //   [ 'square-house-proraw.png', 'ProRAW 1/42k ISO 32' ],
  // ],
  // [
  //   [ 'table-watch-raw.png', 'RAW 1/1000 ISO 3200' ],
  //   [ 'table-watch-raw-denoise.png', 'RAW + denoise 1/1000 ISO 3200' ],
  //   [ 'table-watch-proraw.png', 'ProRAW 1/1000 ISO 3200' ],
  // ],
  // [
  //   [ 'table-keys-raw.png', 'RAW 1/1000 ISO 3200' ],
  //   [ 'table-keys-raw-denoise.png', 'RAW + denoise 1/1000 ISO 3200' ],
  //   [ 'table-keys-proraw.png', 'ProRAW 1/1000 ISO 3200' ],
  // ],
  [
    [ 'carousel-light-raw.png', 'RAW 1/250 ISO 4000' ],
    [ 'carousel-light-raw-denoise.png', 'RAW + denoise 1/250 ISO 4000' ],
    [ 'carousel-light-proraw.png', 'ProRAW 1/250 ISO 4000' ],
  ],
  [
    [ 'carousel-dark-raw.png', 'RAW 1/250 ISO 4000' ],
    [ 'carousel-dark-raw-denoise.png', 'RAW + denoise 1/250 ISO 4000' ],
    [ 'carousel-dark-proraw.png', 'ProRAW 1/250 ISO 4000' ],
  ],
];

const IMAGE_WIDTH = GAP_X + (PREVIEW_SIZE_PIXELS + GAP_X) * structure[0].length;
const IMAGE_HEIGHT = GAP_Y + (PREVIEW_SIZE_PIXELS + GAP_Y + GAP_Y + TEXT_HEIGHT) * structure.length * 2 - GAP_Y;

const OUTPUT_FILENAME = 'result.png';
const TMP_FILENAME = 'tmp.png';

const canvas = createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT);

const context = canvas.getContext('2d');
context.fillStyle = '#666';
context.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);

context.textBaseline = 'top';
context.textAlign = 'left';
context.fillStyle = '#aaaaaa';
context.font = 'bold 30pt Ubuntu Mono';

let x = GAP_X;
let y = GAP_Y;

for (const row of structure) {
  for (const column of row) {
    const [ filename, title ] = column;

    const image = await loadImage(filename);

    context.drawImage(image, 0, 0, PREVIEW_SIZE_PIXELS, PREVIEW_SIZE_PIXELS, x, y, PREVIEW_SIZE_PIXELS, PREVIEW_SIZE_PIXELS);
    context.textAlign = 'left';
    context.fillText(title, x, y + PREVIEW_SIZE_PIXELS + TEXT_OFFSET);
    context.textAlign = 'right';
    context.fillText('1x', x + PREVIEW_SIZE_PIXELS, y + PREVIEW_SIZE_PIXELS + TEXT_OFFSET);

    x += GAP_X + PREVIEW_SIZE_PIXELS;
  }

  y += GAP_Y + PREVIEW_SIZE_PIXELS + TEXT_HEIGHT + GAP_Y;
  x = GAP_X;

  for (const column of row) {
    const [ filename, title ] = column;

    await sharp(filename)
      .extract({
        width: PREVIEW_SIZE_PIXELS / 2,
        height: PREVIEW_SIZE_PIXELS / 2,
        left: PREVIEW_SIZE_PIXELS / 4,
        top: PREVIEW_SIZE_PIXELS / 4
      })
      .resize({
        width: PREVIEW_SIZE_PIXELS,
        height: PREVIEW_SIZE_PIXELS,
        kernel: 'nearest'
      })
      .toFormat('png')
      .toFile(TMP_FILENAME);

    const extractedImage = await loadImage(TMP_FILENAME);

    context.drawImage(extractedImage, 0, 0, PREVIEW_SIZE_PIXELS, PREVIEW_SIZE_PIXELS, x, y, PREVIEW_SIZE_PIXELS, PREVIEW_SIZE_PIXELS);
    context.textAlign = 'left';
    context.fillText(title, x, y + PREVIEW_SIZE_PIXELS + TEXT_OFFSET);
    context.textAlign = 'right';
    context.fillText('2x', x + PREVIEW_SIZE_PIXELS, y + PREVIEW_SIZE_PIXELS + TEXT_OFFSET);

    x += GAP_X + PREVIEW_SIZE_PIXELS;
  }

  y += GAP_Y + PREVIEW_SIZE_PIXELS + TEXT_HEIGHT + GAP_Y;
  x = GAP_X;
}

fs.writeFileSync(OUTPUT_FILENAME, canvas.toBuffer('image/png'));

fs.unlinkSync(TMP_FILENAME);
