function csfMiddleware ( req, res, next ) {
    if (req.method === "GET") {
        return next();
      }
      let sourceHost = null;
      if (req.headers.origin) {
        sourceHost = new URL(req.headers.origin).host;
      } else if (req.headers.referer) {
        sourceHost = new URL(req.headers.referer).host;
      }
      if (sourceHost !== req.headers.host) {
        throw new Error(
          "Origin or Referer header does not match or is missing. Request has been blocked to prevent CSRF"
        );
    }
      next();
}

module.exports = { csfMiddleware };