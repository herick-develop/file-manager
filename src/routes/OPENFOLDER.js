function OPENFOLDER ( req, res ) {
    res.filename = req.params[0];

    req.session.directoryPath = req.body.dir;

    res.redirect("/");
};

module.exports = { OPENFOLDER };