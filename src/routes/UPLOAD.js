const fs = require("fs");

const relative = require('../modules/relative').relative;

function UPLOAD (req, res) {
    // Armazene a URL anterior
  const previousUrl = req.get("referer");

  res.filename = req.params[0];

  let buff = null;
  let saveas = null;
  const maxFileSize = 2147483647; // Tamanho máximo permitido em bytes (2 GB neste exemplo)
  let responseSent = false; // Variável de controle

  req.busboy.on("file", (fieldname, file, filename) => {
    if (fieldname === "file") {
      let fileSize = 0;
      let buffs = [];

      file.on("data", (data) => {
        fileSize += data.length;
        if (fileSize > maxFileSize) {
          // O arquivo excede o tamanho máximo permitido, interrompa o upload
          file.resume();
          // O arquivo excede o tamanho máximo permitido, exibe um alerta
          const alertScript = '<script>alert("O arquivo excede o tamanho máximo permitido.");</script>';
          if (!responseSent) {
            //res.send(alertScript);
            res.redirect("back");
            responseSent = true; // Marque que a resposta foi enviada
            res.render("partials/dialogue-download");
          }
        } else {
          buffs.push(data);
        }
      });

      file.on("end", () => {
        if (fileSize <= maxFileSize) {
          buff = Buffer.concat(buffs);
          buffs = null;
        }
      });
    }
  });

  req.busboy.on("field", (fieldname, value) => {
    if (fieldname === "saveas") {
      saveas = value;
    }
  });

  req.busboy.on("finish", () => {
    if (!buff || !saveas) {
      return res.status(400).end();
    }

    let fileExists = new Promise((resolve, reject) => {
      // Verifique se o arquivo existe
      fs.stat(relative(req.session.directoryPath, res.filename, saveas), (err, stats) => {
        if (err) {
          return resolve(false);
        }
        return resolve(true);
      });
    });

    fileExists
      .then((exists) => {
        if (exists) {
          console.warn("file exists, cannot overwrite");
          req.flash("error", "File exists, cannot overwrite. ");
          if (!responseSent) {
            res.status(400).end(); // Retorne um erro aqui em vez de redirecionar
            responseSent = true; // Marque que a resposta foi enviada
          }
        } else {
          const saveName = relative(req.session.directoryPath, res.filename, saveas);

          let save = fs.createWriteStream(saveName);
          save.on("close", () => {
            if (buff.length === 0) {
              req.flash("success", "File saved. Warning: empty file.");
            } else {
              buff = null;
              req.flash("success", "File saved. ");
            }
            // Redirecionar após a conclusão do salvamento
            if (!responseSent) {
              res.redirect(previousUrl); // Use a URL anterior para redirecionar
              responseSent = true; // Marque que a resposta foi enviada
            }
          });
          save.on("error", (err) => {
            console.warn(err);
            req.flash("error", err.toString());
            // Redirecionar após a conclusão do salvamento
            if (!responseSent) {
              res.redirect(previousUrl); // Use a URL anterior para redirecionar
              responseSent = true; // Marque que a resposta foi enviada
            }
          });
          save.write(buff);
          save.end();
        }
      })
      .catch((err) => {
        console.error(err);
        if (!responseSent) {
          res.status(500).end();
          responseSent = true; // Marque que a resposta foi enviada
        }
      });
  });

  req.pipe(req.busboy);
}

module.exports = { UPLOAD };