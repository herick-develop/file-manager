const fs            = require("fs");
const KEY = process.env.KEY
  ? base32.decode(process.env.KEY.replace(/ /g, ""))
  : null;
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
// const foldersPath = "./control/folders.json";
  
// await fs.readFile(foldersPath, 'utf-8', (err, data) => {
//   if(err) {
//     console.log(err);
//     return;
//   }

//   try{
//     const folders = JSON.parse(data);
    
      
//     })


//   } catch (error) {
//     console.log(error);
//     return;
//   }

// })
// }

async function renderList(req, res, files, config) {
  // Crie uma função assíncrona para ler os usuários
  async function getUsers() {
    const usersPath = "./control/users.json";

    return new Promise((resolve, reject) => {
      fs.readFile(usersPath, 'utf-8', (err, data) => {
        if (err) {
          console.log(err);
          reject(err); // Rejeita a promessa em caso de erro
          return;
        }

        const users = JSON.parse(data);
        resolve(users); // Resolve a promessa com um array contendo os dados dos usuários
      });
    });
  }

  try {
    // Aguarde a obtenção dos dados dos usuários
    const usersData = await getUsers();

    // Imprima os dados dos usuários

    // Renderize o template após obter os dados
    res.render(
      "list",
      flashify(req, {
        path: res.filename,
        files: files,
        config: config,
        users: usersData, // Passe os dados dos usuários como um array de objetos para o template
      })
    );
  } catch (error) {
    console.log(error);
    // Lide com erros adequadamente, se necessário
    res.status(500).send("Erro ao carregar os dados dos usuários");
  }
}

function renderWithErrors(req, res, errors) {
    res.render(
      "list",
      flashify(req, {
        path: res.filename,
        errors: errors,
      })
   );
};


async function renderFolders(req, res, folders, config) {

  async function getUsers() {
    const usersPathA = "./control/users.json";

    return new Promise((resolve, reject) => {
      fs.readFile(usersPathA, 'utf-8', (err, data) => {
        if (err) {
          console.log(err);
          reject(err); // Rejeita a promessa em caso de erro
          return;
        }

        const usersA = JSON.parse(data);
        resolve(usersA); // Resolve a promessa com um array contendo os dados dos usuários
      });
    });
  }

  try {
    // Aguarde a obtenção dos dados dos usuários
    const usersDataA = await getUsers();

    // Imprima os dados dos usuários

    // Renderize o template após obter os dados

    res.render(
      "folders",
      flashify(req, {
        errors: [res.stats.error],
        folders: folders,
        config: config,
        users: usersDataA
      })
    )
  } catch (error) {
    console.log(error);
    // Lide com erros adequadamente, se necessário
    res.status(500).send("Erro ao carregar os dados dos usuários");
  }

}

module.exports = { renderList, renderWithErrors, renderFolders };