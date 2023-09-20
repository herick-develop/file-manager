const funcionsDirectory = require('../modules/functionsDirectory');

async function SEARCH ( req, res ) {
    let payload = req.body.payload;

    if(payload) {
  
      res.deep = Infinity;
  
      res.query = payload;
    
      res.filename = "";
    
    
      const filenames = await funcionsDirectory.readDirectory(req, res);
    
      const files = await funcionsDirectory.processFiles(req, res, filenames);
    
      res.send(files);
    }
}

module.exports = { SEARCH };