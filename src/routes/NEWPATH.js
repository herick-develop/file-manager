function NEWPATH (req, res) {
    res.filename = req.params[0];

    let folder = req.body.folder;
    if (!folder || folder.length < 1) {
      return res.status(400).end();
    }

    let fileExists = new Promise((resolve, reject) => {
      // Check if file exists
      fs.stat(relative(req.session.directoryPath, res.filename, folder), (err, stats) => {
        if (err) {
          return reject(err);
        }
        return resolve(stats);
      });
    });
  
    fileExists
      .then((stats) => {
        req.flash("error", "Folder exists, cannot overwrite. ");
        res.redirect("back");
      })
      .catch((err) => {
        fs.mkdir(relative(req.session.directoryPath, res.filename, folder), (err) => {
          if (err) {
            console.warn(err);
            req.flash("error", err.toString());
            res.redirect("back");
            return;
          }
          req.flash("success", "Folder created. ");
          res.redirect("back");
        });
      });
};

module.exports = { NEWPATH };