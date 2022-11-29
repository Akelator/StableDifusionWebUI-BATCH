const { modes } = require("./src/modes");
const { scaleModes } = require("./src/scale-modes");
/**
 * - `url`: Stable Difusion WebUI public URL.
 * - `maximize`: maximize browser window.
 * - `mode`: Huggin Face mode GFPGAN or REALESRGAN.
 * - `scaleMode`: if mode is REALESRGAN, the scalation can be RealESRGAN_x4plus (NORMAL) or RealESRGAN_x4plus_anime_6B (ANIME).
 * - `startIndex`: the first image of the batch.
 * - `endIndex`: the last image of the batch.
 * - `pad`: how many digits have the image names, (2) -> 01.jpg, (3) -> 001.jpg.
 * - `inputImageExtension`: The format of the image files on inputs folder.
 * - `timeout`: Maximun duration of the batch in milliseconds, 1 hour by default.
 * - `endTimeout`: Wait for close the browser after last image of the batch, if is too short the image could not be download completly.
 *      */
exports.setup = {
  url: "http://f7f1e48778aede65.gradio.app/",
  maximize: false,
  mode: modes.GFPGAN,
  scaleMode: scaleModes.ANIME,
  startIndex: 0,
  endIndex: 4,
  pad: 2,
  inputImageExtension: "jpg",
  timeout: 3600000,
  endTimeout: 3000,
};
