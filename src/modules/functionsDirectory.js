const fastGlob = require('fast-glob');
const fs = require('fs');

const relative = require('./relative').relative;

async function readDirectory(req, res) {

  console.log('QUERY: ', res.query);

    return new Promise((resolve, reject) => {

        resolve(
            fastGlob(`**/*${res.query}**`, {
              cwd: relative(req.session.directoryPath, res.filename),
              onlyFiles: false,
              deep: res.deep,
              suppressErrors: true,
              caseSensitiveMatch: false,
            })
        );
    });
};

const SMALL_IMAGE_MAX_SIZE = 750 * 1024; // 750 KB
const EXT_IMAGES = [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif", ".tiff"];
function isimage(f) {
  for (const ext of EXT_IMAGES) {
    if (f.endsWith(ext)) {
      return true;
    }
  }
  return false;
}

async function processFiles(req, res, filenames) {

    const promises = filenames.map(
      (f) =>
        new Promise((resolve, reject) => {

          //console.log('6 filenames_percorrido: ', f);

          fs.stat(relative(req.session.directoryPath, res.filename, f), (err, stats) => {

            if (err) {
              //console.warn(err);
              resolve({
                name: f,
                error: err,
              });

            } else {

             //console.log("7 RESOLVE: PROCESSfILES => name: ", f );
             //console.log("8 RESOLVE: PROCESSfILES => isdirectory, issmallimage, size ");

              resolve({
                name: f,
                isdirectory: stats.isDirectory(),
                issmallimage: isimage(f) && stats.size < SMALL_IMAGE_MAX_SIZE,
                size: stats.size,
              });

            }
          });
        })
    );
 
    return Promise.all(promises);
}


module.exports = { readDirectory, processFiles };