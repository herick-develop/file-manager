function RENAME ( req, res ) {
    res.filename = req.params[0];

    let files = JSON.parse(req.body.files);
    if (!files || !files.map) {
      req.flash("error", "No files selected.");
      res.redirect("back");
      return;
    }
  
    new Promise((resolve, reject) => {
      fs.access(relative(req.session.directoryPath, res.filename), fs.constants.W_OK, (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    })
      .then(() => {
        let promises = files.map((f) => {
          return new Promise((resolve, reject) => {
            fs.rename(
              relative(req.session.directoryPath, res.filename, f.original),
              relative(req.session.directoryPath, res.filename, f.new),
              (err) => {
                if (err) {
                  return reject(err);
                }
                resolve();
              }
            );
          });
        });
        Promise.all(promises)
          .then(() => {
            req.flash("success", "Files renamed. ");
            res.redirect("back");
          })
          .catch((err) => {
            console.warn(err);
            req.flash("error", "Unable to rename some files: " + err);
            res.redirect("back");
          });
      })
      .catch((err) => {
        console.warn(err);
        req.flash("error", err.toString());
        res.redirect("back");
      });
};

module.exports = { RENAME };