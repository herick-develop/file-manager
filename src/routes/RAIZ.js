const renderList = require('../modules/renderList');
const relative = require('../modules/relative').relative;
const funcionsDirectory = require('../modules/functionsDirectory');

async function RAIZ ( req, res ) {

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
}

module.exports = { RAIZ };