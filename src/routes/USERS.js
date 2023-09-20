console.log("aaaaaaaaaaaaaaaaaaaaaaaaa");

const fs            = require("fs");

function USERS ( req, res ) {
  
    const usersPath = "./control/users.json";
  
    fs.readFile(usersPath, 'utf-8', (err, data) => {

      if(err) {
        console.log(err);
        return;
      }
  
      const users = JSON.parse(data);
      console.log( "users: ", users );

      res.send( users );
  
      
  
    })

}

module.exports = { USERS };