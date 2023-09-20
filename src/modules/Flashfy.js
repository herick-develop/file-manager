const KEY = process.env.KEY;

function Flashify(req, obj) {
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

module.exports = { Flashify };