#!/usr/bin/env node

/* jshint esversion: 6 */
/* jshint node: true */
"use strict";

const express = require("express");
const { engine: hbs } = require("express-handlebars");
const session = require("express-session");
const busboy = require("connect-busboy");
const flash = require("connect-flash");
const querystring = require("querystring");
const assets = require("./assets");
const archiver = require("archiver");

const notp = require("notp");
const base32 = require("thirty-two");

const fs = require("fs");
const rimraf = require("rimraf");
const path = require("path");

const filesize = require("filesize");
const octicons = require("@primer/octicons");
const handlebars = require("handlebars");
const e = require("express");
const fastGlob = require('fast-glob');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

// MODELS

const renderList = require('./src/modules/renderList');
const relative = require('./src/modules/relative').relative;


const funcionsDirectory = require('./src/modules/functionsDirectory');
const { config } = require("dotenv");


const port = +process.env.PORT || 3030;

handlebars.registerHelper( "when",function(operand_1, operator, options) {
  
  var operators = {
   'eq': function(l,r) { return l == r; },
  }
  // , result = operators[operator](operand_1,operand_2);
  , result = operators[operator](operand_1,"home");

  if (result) return options.fn(this);
  else  return options.inverse(this);
});



const app = express();
app.use(express.json());
const http = app.listen(port);

var directoryPath;
var userViewFolder = true;
var items;

app.set("views", path.join(__dirname, "views"));
app.engine(
  "handlebars",
  hbs({
    partialsDir: path.join(__dirname, "views", "partials"),
    layoutsDir: path.join(__dirname, "views", "layouts"),
    defaultLayout: "main",
    helpers: {
      either: function (a, b, options) {
        if (a || b) {
          return options.fn(this);
        }
      },
      filesize: filesize,
      octicon: function (i, options) {
        if (!octicons[i]) {
          return new handlebars.SafeString(octicons.question.toSVG());
        }
        return new handlebars.SafeString(octicons[i].toSVG());
      },
      eachpath: function (path, options) {
        if (typeof path != "string") {
          return "";
        }
        let out = "";
        path = path.split("/");
        path.splice(path.length - 1, 1);
        path.unshift("");
        path.forEach((folder, index) => {
          out += options.fn({
            name: folder + "/",
            path: "/" + path.slice(1, index + 1).join("/"),
            current: index === path.length - 1,
          });
        });
        return out;
      },
    },
  })
);

app.set("view engine", "handlebars");

const corsOptions ={
  origin: ['*'],
  methods: '*',
  credentials: true,
  optionsSucessStatus: 204,
}

app.use(cors(corsOptions));
app.use("/@assets", express.static(path.join(__dirname, "assets")));
// init assets
assets.forEach((asset) => {
  const { path: url, modulePath } = asset;
  app.use(
    `/@assets/${url}`,
    express.static(path.join(__dirname, `node_modules/${modulePath}`))
  );
});

app.use(
  session({
    secret: process.env.SESSION_KEY || "meowmeow",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());
app.use(busboy());
app.use(
  express.urlencoded({
    extended: false,
  })
);
// AUTH

const KEY = process.env.KEY
  ? base32.decode(process.env.KEY.replace(/ /g, ""))
  : null;

app.get("/@logout", (req, res) => {
  if (KEY) {
    req.session.login = false;
    req.flash("success", "Signed out.");
    res.redirect("/@login");
    return;
  }
  req.session.destroy();
  res.redirect("/");
  req.flash("error", "You were never logged in...");
  res.redirect("back");
});

app.get("/@login", (req, res) => {
  
  res.render("login", flashify(req, {}));
});
app.post("/@login", (req, res) => {
  let pass = false;

  req.session.email = req.body.email;
  req.session.senha = req.body.senha;

  const foldersPath = "./control/users.json";

  fs.readFile(foldersPath, 'utf-8', (err, data) => {
    if (err) {
      console.log(err);
      return;
    }

    const folders = JSON.parse(data);

    let validLogin = false; // Variável para rastrear se o login foi validado com sucesso

    folders.forEach((element) => {
      if (req.session.email === element.email && req.session.senha === element.senha && element.ativo) {
        validLogin = true;
        return; // Encerre o loop quando um login válido for encontrado
      }
    });

    if (validLogin) {
      req.session.login = true;
      res.redirect("/@config");
    } else {
      req.flash("error", "Login Inválido");
      res.redirect("/@login");
    }
  });
});

// const foldersPath = "./control/users.json";

//   fs.readFile(foldersPath, 'utf-8', (err, data) => {
//     if(err) {
//       console.log(err);
//       return;
//     }

//     const folders = JSON.parse(data);

// app.post("/*@teste", async ( req, res ) => {
//   const usersPath = "./control/users.json";

//   try {
//     // Ler os usuários existentes do arquivo JSON
//     const usersData = await fs.promises.readFile(usersPath, 'utf-8');
//     let users = JSON.parse(usersData);

//     // Receber os dados do novo usuário do corpo da solicitação
//     const { nomeNewUser, emailNewUser, passNewUser } = req.body;

//     // Gerar um novo ID usando uuid
//     const newUserId = uuid.v4();

//     // Criar o novo usuário
//     const newUser = {
//       nome: nomeNewUser,
//       email: emailNewUser,
//       senha: passNewUser,
//       ativo: true,
//       id: newUserId,
//       delete: false
//     };

//     // Adicionar o novo usuário ao array de usuários
//     users.push(newUser);

//     // Escrever o array de usuários atualizado de volta no arquivo JSON
//     await fs.promises.writeFile(usersPath, JSON.stringify(users, null, 2));

//     console.log("Novo usuário adicionado com sucesso!");

//     // Redirecionar de volta para a página anterior ou enviar uma resposta de sucesso, dependendo do seu caso de uso.
//     res.redirect("back");

//   } catch (error) {
//     console.error("Erro ao adicionar novo usuário:", error);

//     // Enviar uma resposta de erro, se necessário
//     res.status(500).json({ message: "Erro ao processar a solicitação." });
//   }
// });

// app.post("/*@users", async (req, res) => {

//   console.log("USERNAME: ", req.body.nomeNewUser);
//   console.log("EMAIL: ", req.body.emailNewUser);
//   console.log("SENHA: ", req.body.passNewUser);

//   const usersPath = "./control/users.json";

//   await fs.readFile(usersPath, 'utf-8', (err, data) => {
//     if (err) {
//       console.log(err);
//       return res.status(500).json({ message: "Erro ao ler o arquivo de usuários." });
//     }

//     const jsonArray = req.body.inputArray;

//     const inputArray = JSON.parse(jsonArray[0]);

//     console.log("FORMATED_ARRAY", inputArray);

//     try {
//       // Parse the JSON data as an array of objects
//       let users = JSON.parse(data);

//       // Update the users array with the input data
//       inputArray.forEach(inputData => {
//         const userIndex = users.findIndex(user => user.id === inputData.id);
//         if (userIndex !== -1) {
//           users[userIndex].ativo = inputData.ativo;
//           users[userIndex].delete = inputData.delete;
//         }
//       });

//       // Write the updated users array back to the JSON file
//       fs.writeFile(usersPath, JSON.stringify(users, null, 2), (writeErr) => {
//         if (writeErr) {
//           console.log(writeErr);
//           //res.status(500).json({ message: "Erro ao gravar no arquivo de usuários." });
//           res.redirect("back");
//         }

//         // Remove users with 'delete' set to true
//         users = users.filter(user => !user.delete);

//         // Write the updated users array (with deleted users removed) back to the JSON file
//         fs.writeFile(usersPath, JSON.stringify(users, null, 2), (removeErr) => {
//           if (removeErr) {
//             console.log(removeErr);
//             return res.status(500).json({ message: "Erro ao remover usuários do arquivo de usuários." });
//           }
//           console.log("Usuários atualizados e removidos com sucesso!");

//           // Send a response to the client, if necessary
//           //res.status(200).json({ message: "Usuários atualizados e removidos com sucesso!" });
//           res.redirect("back");

//         });

//       });
//     } catch (parseErr) {
//       console.log(parseErr);

//       // Send an error response to the client, if necessary
//       //res.status(500).json({ message: "Erro ao processar a solicitação." });
//       res.redirect("back");
//     }
//   });


  // const usersPath = "./control/users.json";

  // fs.readFile(usersPath, 'utf-8', (err, data) => {
  //   if (err) {
  //     console.log(err);
  //     return;
  //   }
  
  //   try {
  //     // Analisa o JSON em um array de objetos
  //     const users = JSON.parse(data);

  
  //     // ID do usuário que você deseja ativar
  //     const userIdToActivate = req.body.id;
  
  //     // Encontre o objeto de usuário correspondente ao ID
  //     const userToActivate = users.find(user => user.id == userIdToActivate);

  //     console.log( userToActivate )
  
  //     if (userToActivate) {
  //       // Altere a propriedade 'ativo' para true
  //       userToActivate.ativo = true;
  
  //       // Escreva o array 'users' atualizado de volta no arquivo JSON
  //       fs.writeFile(usersPath, JSON.stringify(users, null, 2), (writeErr) => {
  //         if (writeErr) {
  //           console.log(writeErr);
  //           return;
  //         }
  //         console.log("Usuário ativado com sucesso!");
  
  //         // Envie uma resposta para o cliente, se necessário
  //         res.status(200).json({ message: "Usuário ativado com sucesso!" });
  //       });
  //     } else {
  //       console.log("Usuário não encontrado com o ID fornecido.");
  
  //       // Envie uma resposta de erro para o cliente, se necessário
  //       res.status(404).json({ message: "Usuário não encontrado com o ID fornecido." });
  //     }
  //   } catch (parseErr) {
  //     console.log(parseErr);
  
  //     // Envie uma resposta de erro para o cliente, se necessário
  //     res.status(500).json({ message: "Erro ao processar a solicitação." });
  //   }

  // });
//})
app.post("/*@users", async (req, res) => {
  const usersPath = "./control/users.json";

  try {
    // Ler os usuários existentes do arquivo JSON
    const usersData = await fs.promises.readFile(usersPath, 'utf-8');
    let users = JSON.parse(usersData);

    if (req.body.nomeNewUser && req.body.emailNewUser && req.body.passNewUser) {
      // Receber os dados do novo usuário do corpo da solicitação
      const { nomeNewUser, emailNewUser, passNewUser } = req.body;

      // Gerar um novo ID usando uuid

      function generateUniqueId() {
        const uuid = uuidv4(); // Gera um UUID
        // Converte o UUID para um número
        const numericId = parseInt(uuid.replace(/-/g, ''), 16);
        return numericId;
      }
      
      // Exemplo de uso:
      const newUserId = generateUniqueId();

      // Criar o novo usuário
      const newUser = {
        nome: nomeNewUser,
        email: emailNewUser,
        senha: passNewUser,
        ativo: true,
        id: newUserId,
        delete: false
      };

      // Adicionar o novo usuário ao array de usuários
      users.push(newUser);

      console.log("Novo usuário adicionado com sucesso!");
    }

    // Parse the JSON data as an array of objects
    // Parse the JSON data as an array of objects

let inputArray = [];

if (req.body.inputArray && Array.isArray(req.body.inputArray) && req.body.inputArray.length > 0) {
  try {
    inputArray = JSON.parse(req.body.inputArray[0]);
  } catch (parseError) {
    console.error("Erro ao analisar a string JSON:", parseError);
  }
}

console.log("INPUTARRAY: ", inputArray);

// Atualize o array de usuários com os dados de inputArray
inputArray.forEach(inputData => {
  // Verifique se inputData tem um id válido (não é null ou undefined)
  if (inputData.id !== null && inputData.id !== undefined) {
    // Converter o ID de inputData para uma string
    const inputDataIdString = inputData.id.toString();

    // Procurar o usuário usando a string do ID
    const userIndex = users.findIndex(user => user.id == inputDataIdString);

    console.log("USERINDEX: ", userIndex);

    if (userIndex !== -1) {
      users[userIndex].ativo = inputData.ativo;
      users[userIndex].delete = inputData.delete;
    }
  }
});


    // Escrever o array de usuários atualizado de volta no arquivo JSON
    await fs.promises.writeFile(usersPath, JSON.stringify(users, null, 2));

    // Remove users with 'delete' set to true
    users = users.filter(user => !user.delete);

    // Escrever o array de usuários (com usuários excluídos removidos) de volta no arquivo JSON
    await fs.promises.writeFile(usersPath, JSON.stringify(users, null, 2));

    // Redirecionar de volta para a página anterior ou enviar uma resposta de sucesso, dependendo do seu caso de uso.
    res.redirect("back");
  } catch (error) {
    console.error("Erro ao processar a solicitação:", error);

    // Enviar uma resposta de erro, se necessário
    res.status(500).json({ message: "Erro ao processar a solicitação." });
  }
});






app.use((req, res, next) => {
  if (!KEY) {
    return next();
  }
  if (req.session.login === true) {
    return next();
  }
  req.flash("error", "Please sign in.");
  res.redirect("/@login");
});


function flashify(req, obj) {
  let error = req.flash("error");
  if (error && error.length > 0) {
    if (!obj.errors) {
      obj.errors = [];
    }
    obj.errors.push(error);
  }
  let success = req.flash("success");
  if (success && success.length > 0) {
    if (!obj.successes) {
      obj.successes = [];
    }
    obj.successes.push(success);
  }
  obj.isloginenabled = !!KEY;
  return obj;
}

app.use((req, res, next) => {
  if (req.method === "GET") {
    return next();
  }
  let sourceHost = null;
  if (req.headers.origin) {
    sourceHost = new URL(req.headers.origin).host;
  } else if (req.headers.referer) {
    sourceHost = new URL(req.headers.referer).host;
  }
  if (sourceHost !== req.headers.host) {
    throw new Error(
      "Origin or Referer header does not match or is missing. Request has been blocked to prevent CSRF"
    );
  }
  next();
});

app.all("/*", (req, res, next) => {

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
});

app.post("/*@upload", (req, res) => {
  res.filename = req.params[0];

  let buff = null;
  let saveas = null;
  req.busboy.on("file", (key, stream, filename) => {
    if (key == "file") {
      let buffs = [];
      stream.on("data", (d) => {
        buffs.push(d);
      });
      stream.on("end", () => {
        buff = Buffer.concat(buffs);
        buffs = null;
      });
    }
  });
  req.busboy.on("field", (key, value) => {
    if (key == "saveas") {
      saveas = value;
    }
  });
  req.busboy.on("finish", () => {
    if (!buff || !saveas) {
      return res.status(400).end();
    }
    let fileExists = new Promise((resolve, reject) => {
      // check if file exists
      fs.stat(relative(req.session.directoryPath, res.filename, saveas), (err, stats) => {
        if (err) {
          return reject(err);
        }
        return resolve(stats);
      });
    });

    fileExists
      .then((stats) => {
        console.warn("file exists, cannot overwrite");
        req.flash("error", "File exists, cannot overwrite. ");
        res.redirect("back");
      })
      .catch((err) => {
        const saveName = relative(req.session.directoryPath, res.filename, saveas);
  
        let save = fs.createWriteStream(saveName);
        save.on("close", () => {
          if (res.headersSent) {
            return;
          }
          if (buff.length === 0) {
            req.flash("success", "File saved. Warning: empty file.");
          } else {
            buff = null;
            req.flash("success", "File saved. ");
          }
          res.redirect("back");
        });
        save.on("error", (err) => {
          console.warn(err);
          req.flash("error", err.toString());
          res.redirect("back");
        });
        save.write(buff);
        save.end();
      });
  });
  req.pipe(req.busboy);
});

app.post("/*@mkdir", (req, res) => {

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
});

app.post("/*@newPath", (req, res) => {
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
});

app.post("/*@getUser", async (req, res) => {
  const usersPath = "./control/users.json";

  await fs.readFile(usersPath, 'utf-8', (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Erro ao ler o arquivo de usuários." });
    }

    try {
      const users = JSON.parse(data);

      // Aqui você tem os dados do arquivo "users.json"
      // Você pode fazer qualquer processamento adicional se necessário

      // Envie os dados de volta como resposta
      res.status(200).json(users);
      res.redirect("back");
    } catch (parseErr) {
      console.log(parseErr);

      // Envie uma resposta de erro para o cliente, se necessário
      return res.status(500).json({ message: "Erro ao processar a solicitação." });
    }
  });
  res.redirect("back");
});


// app.post("/*@delete", (req, res) => {
//   res.filename = req.params[0];

//   let files = JSON.parse(req.body.files);
//   if (!files || !files.map) {
//     req.flash("error", "No files selected.");
//     res.redirect("back");
//     return; // res.status(400).end();
//   }

//   let promises = files.map((f) => {
//     return new Promise((resolve, reject) => {
//       fs.stat(relative(req.session.directoryPath, res.filename, f), (err, stats) => {
//         if (err) {
//           return reject(err);
//         }
//         resolve({
//           name: f,
//           isdirectory: stats.isDirectory(),
//           isfile: stats.isFile(),
//         });
//       });
//     });
//   });
//   Promise.all(promises)
//     .then((files) => {
//       let promises = files.map((f) => {
//         return new Promise((resolve, reject) => {
//           let op = null;
//           if (f.isdirectory) {
//             op = (dir, cb) =>
//               rimraf(
//                 dir,
//                 {
//                   glob: false,
//                 },
//                 cb
//               );
//           } else if (f.isfile) {
//             op = fs.unlink;
//           }
//           if (op) {
//             op(relative(req.session.directoryPath, res.filename, f.name), (err) => {
//               if (err) {
//                 return reject(err);
//               }
//               resolve();
//             });
//           }
//         });
//       });
//       Promise.all(promises)
//         .then(() => {
//           req.flash("success", "Files deleted. ");
//           res.redirect("back");
//         })
//         .catch((err) => {
//           console.warn(err);
//           req.flash("error", "Unable to delete some files: " + err);
//           res.redirect("back");
//         });
//     })
//     .catch((err) => {
//       console.warn(err);
//       req.flash("error", err.toString());
//       res.redirect("back");
//     });
// });

app.get("/*@download", (req, res) => {

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
});

app.post("/*@rename", (req, res) => {
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
});

// const shellable = process.env.SHELL != "false" && process.env.SHELL;
// const cmdable = process.env.CMD != "false" && process.env.CMD;
// if (shellable || cmdable) {
//   const shellArgs = process.env.SHELL.split(" ");
//   const exec = process.env.SHELL == "login" ? "/usr/bin/env" : shellArgs[0];
//   const args = process.env.SHELL == "login" ? ["login"] : shellArgs.slice(1);

//   const child_process = require("child_process");

//   app.post("/*@cmd", (req, res) => {
//     res.filename = req.params[0];

//     let cmd = req.body.cmd;
//     if (!cmd || cmd.length < 1) {
//       return res.status(400).end();
//     }
//     console.log("running command " + cmd);

//     child_process.exec(
//       cmd,
//       {
//         cwd: relative(req.session.directoryPath, res.filename),
//         timeout: 60 * 1000,
//       },
//       (err, stdout, stderr) => {
//         if (err) {
//           console.log("command run failed: " + JSON.stringify(err));
//           req.flash("error", "Command failed due to non-zero exit code");
//         }
//         res.render(
//           "cmd",
//           flashify(req, {
//             path: res.filename,
//             cmd: cmd,
//             stdout: stdout,
//             stderr: stderr,
//           })
//         );
//       }
//     );
//   });

//   const pty = require("node-pty");
//   const WebSocket = require("ws");

//   app.get("/*@shell", (req, res) => {
//     res.filename = req.params[0];

//     res.render(
//       "shell",
//       flashify(req, {
//         path: res.filename,
//       })
//     );
//   });

//   const ws = new WebSocket.Server({ server: http });
//   ws.on("connection", (socket, request) => {
//     const { path } = querystring.parse(request.url.split("?")[1]);
//     let cwd = relative(req.session.directoryPath, path);
//     let term = pty.spawn(exec, args, {
//       name: "xterm-256color",
//       cols: 80,
//       rows: 30,
//       cwd: cwd,
//     });
//     console.log(
//       "pid " + term.pid + " shell " + process.env.SHELL + " started in " + cwd
//     );

//     term.on("data", (data) => {
//       socket.send(data, { binary: true });
//     });
//     term.on("exit", (code) => {
//       console.log("pid " + term.pid + " ended");
//       socket.close();
//     });
//     socket.on("message", (data) => {
//       // special messages should decode to Buffers
//       if (data.length == 6) {
//         switch (data.readUInt16BE(0)) {
//           case 0:
//             term.resize(data.readUInt16BE(1), data.readUInt16BE(2));
//             return;
//         }
//       }
//       term.write(data);
//     });
//     socket.on("close", () => {
//       term.end();
//     });
//   });
// }

app.get("/*@config", async (req, res) => {
  
  const viewConfigPath = "./control/config.json";

  await fs.readFile(viewConfigPath, 'utf-8', (err, data) => {
    if(err) {
      console.log(err);
      return;
    }

    const viewUsers = JSON.parse(data);

    

    viewUsers.map((email) => {
      console.log('email: ', email.view);
      console.log('email_Sessioon: ', req.session.email);

      if (email.view == req.session.email) {
        req.session.viewConfig = true;
      } else {
        req.session.viewConfig = false;
      };

    })

  });

  console.log('VIEW_CONFIG: ',  req.session.viewConfig );

  const foldersPath = "./control/folders.json";

  await fs.readFile(foldersPath, 'utf-8', (err, data) => {
    if(err) {
      console.log(err);
      return;
    }

    try{
      const folders = JSON.parse(data);

      renderList.renderFolders(req, res, folders , req.session.viewConfig);
      /*
      res.render(
        "folders",
        flashify(req, {
          // shellable: shellable,
          // cmdable: cmdable,
          errors: [res.stats.error],
          teste: test,
          folders: folders
        })

      );
      */

      handlebars.registerHelper('loud', function (aString, folders) {
        

        const paragraphs = aString.map((email) => {

          if (email === req.session.email) {

            //console.log('email: ', email, 'req.session.email: ', req.session.email);

              return `
              <button name="dir" value="${folders.path}" type="submit" class="btn btn-primary btn-folder">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-folder" viewBox="0 0 16 16">
                  <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a1.99 1.99 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4H2.19zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139C1.72 3.042 1.95 3 2.19 3h5.396l-.707-.707z"/>
                </svg>
                <p>${folders.name}</p>
              </button>
              `;
          }
  
      });
  
      // Junte os elementos do array em uma única string e retorne
      return paragraphs.join("");

            
        //   } )
          
          
        // } )
  
        
        //return false;
      
        
      })


    } catch (error) {
      console.log(error);
      return;
    }

  })

});

 
// app.use(express.urlencoded({extended: true}));
// app.use(express.static('public'));;

app.post("/*@openFolder", (req, res) => {
  res.filename = req.params[0];

  req.session.directoryPath = req.body.dir;

  res.redirect("/");

});

app.post("/*@search", async (req, res) => {

  let payload = req.body.payload;

  if(payload) {

    res.deep = Infinity;

    res.query = payload;
  
    res.filename = "";
  
  
    const filenames = await funcionsDirectory.readDirectory(req, res);
  
    const files = await funcionsDirectory.processFiles(req, res, filenames);
  
    res.send(files);
  
  
  }

});

 app.get("/*", async (req, res) => { //ANCHOR - /

  console.log("START START START START START START START START START START START START START START START START START START START START START START START START START START START START START START START START START START START START START START START START START START ");

  //  try {
     //console.log('11 /: session_query: ', req.session.query);

       if (res.stats.error) {

         return renderList.renderWithErrors(req, res, [res.stats.error], req.session.viewConfig);

       } else if (res.stats.isDirectory()) {

         if (!req.url.endsWith("/")) {
           return res.redirect(req.url + "/");
         }

         //console.log('12 filenames === await readDir(req)');
         //console.log('13 files === await processFiles(req, res, filenames)');

         //const filenames = await readDirT(req);
         res.deep = false;
  
        //req.session.query = req.body.searchInput;

        res.query = "";
         const filenames = await funcionsDirectory.readDirectory(req, res);

         //console.log('14 /: VLR filenames: ', filenames);

         const files = await funcionsDirectory.processFiles(req, res, filenames);

         //console.log('15 /: VLR files: ', files);

         //console.log(`16 CALL: renderlist( req: ${req}, res: ${res}, files: ${files} ) `);

         renderList.renderList(req, res, files, req.session.viewConfig);         


       } else if (res.stats.isFile()) {

         res.sendFile(relative(req.session.directoryPath, res.filename), {

           headers: {
             "Content-Security-Policy":
               "default-src 'self'; script-src 'none'; sandbox",
           },

           dotfiles: "allow",
         });
       }
    //  } else {
    ////   console.log("No search results.");
    //  }
  //  } catch (error) {
    //  console.error(error);
    //  renderWithErrors(req, res, [error]);
   //}
   //console.log("FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL FINAL ")
 });

console.log(`Listening on port ${port}`);