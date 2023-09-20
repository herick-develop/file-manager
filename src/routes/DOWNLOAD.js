const archiver = require("archiver");

const fs = require("fs");

const relative = require('../modules/relative').relative;


function DOWNLOAD ( req, res ) {
    res.filename = req.params[0];

    let files = null;
    try {
      files = JSON.parse(req.query.files);
    } catch (e) {}
    if (!files || !files.map) {
      req.flash("error", "No files selected.");
      res.redirect("back");
      return; // res.status(400).end();
    }
  
    let promises = files.map((f) => {
      return new Promise((resolve, reject) => {
        fs.stat(relative(req.session.directoryPath, res.filename, f), (err, stats) => {
          if (err) {
            return reject(err);
          }
          resolve({
            name: f,
            isdirectory: stats.isDirectory(),
            isfile: stats.isFile(),
          });
        });
      });
    });
    Promise.all(promises)
      .then((files) => {
        let zip = archiver("zip", {});
        zip.on("error", function (err) {
          console.warn(err);
          res.status(500).send({
            error: err.message,
          });
        });
  
        files
          .filter((f) => f.isfile)
          .forEach((f) => {
            zip.file(relative(req.session.directoryPath, res.filename, f.name), { name: f.name });
          });
        files
          .filter((f) => f.isdirectory)
          .forEach((f) => {
            zip.directory(relative(req.session.directoryPath, res.filename, f.name), f.name);
          });
  
        res.attachment("Archive.zip");
        zip.pipe(res);
  
        zip.finalize();
      })
      .catch((err) => {
        console.warn(err);
        req.flash("error", err.toString());
        res.redirect("back");
      });
};

module.exports = { DOWNLOAD };