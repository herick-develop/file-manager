const fs = require("fs");
const relative   = require('../modules/relative').relative;

function All ( req, res, next ) {

    if(!req.session.login){
        res.redirect("/@login");
      }
    
      res.filename = req.params[0];
    
      let fileExists = new Promise((resolve, reject) => {
        // check if file exists
        fs.stat(relative(req.session.directoryPath,res.filename), (err, stats) => {
          if (err) {
            return reject(err);
          }
          return resolve(stats);
        });
      });
    
      fileExists
        .then((stats) => {
          res.stats = stats;
          next();
        })
        .catch((err) => {
          res.stats = { error: err };
          next();
        });
}

module.exports = { All };