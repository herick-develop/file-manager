function LOGOUT ( req, res, KEY ) {
    if (KEY) {
        req.session.login = false;
        req.flash("success", "Signed out.");
        res.redirect("/@login");
        return;
      }
      req.flash("error", "You were never logged in...");
      res.redirect("back");
}

module.exports = { LOGOUT };