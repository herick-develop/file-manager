function ensureAuthenticated ( req, res, next, KEY ) {
    if (!KEY) {
        return next();
      }
      if (req.session.login === true) {
        return next();
      }
      req.flash("error", "Please sign in.");
      res.redirect("/@login");
}

module.exports = { ensureAuthenticated };