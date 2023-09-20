
const fs            = require("fs");
const flashify      = require("../modules/Flashfy").Flashify;

function LOGIN_GET ( req, res ) {
    res.render("login", flashify(req, {}));
}

function LOGIN_POST ( req, res ) {
    let pass =false;

    req.session.email = req.body.email;
    req.session.senha = req.body.senha;
  
    const foldersPath = "./control/users.json";
  
    fs.readFile(foldersPath, 'utf-8', (err, data) => {
      if(err) {
        console.log(err);
        return;
      }
  
      const folders = JSON.parse(data);
  
      folders.map( (element) => {
  
        if(req.session.email === element.email && req.session.senha === element.senha){
          pass = true;
    
          if (pass) {
            
            req.session.login = true;
            res.redirect("/@config");
            return;
          }
          req.flash("error", "Login Inválido");
          res.redirect("/@login");
          
        } else {
          console.log('invalido');
          
          
          
        }
      })
  
    })

}

module.exports = { LOGIN_GET, LOGIN_POST };