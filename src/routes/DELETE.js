function DELETE(req, res) {

    res.filename = req.params[0];

   let files = JSON.parse(req.body.files);
   if (!files || !files.map) {
     req.flash("error", "No files selected.");
     res.redirect("back");
     return;  //res.status(400).end();
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
       let promises = files.map((f) => {
         return new Promise((resolve, reject) => {
           let op = null;
           if (f.isdirectory) {
             op = (dir, cb) =>
               rimraf(
                 dir,
                 {
                   glob: false,
                 },
                 cb
               );
           } else if (f.isfile) {
             op = fs.unlink;
           }
           if (op) {
             op(relative(req.session.directoryPath, res.filename, f.name), (err) => {
               if (err) {
                 return reject(err);
               }
               resolve();
             });
           }
         });
       });
       Promise.all(promises)
         .then(() => {
           req.flash("success", "Files deleted. ");
           res.redirect("back");
         })
         .catch((err) => {
           console.warn(err);
           req.flash("error", "Unable to delete some files: " + err);
           res.redirect("back");
         });
     })
     .catch((err) => {
       console.warn(err);
       req.flash("error", err.toString());
       res.redirect("back");
     });
}

module.exports = { DELETE };