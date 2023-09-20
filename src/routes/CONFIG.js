const fs = require("fs");

const handlebars = require("handlebars");
const renderList = require('../modules/renderList');

async function CONFIG ( req, res ) {
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
  
        console.log('route: ', req.session.viewConfig);
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
}

module.exports = { CONFIG };