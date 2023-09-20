const path = require("path");

function relative(root, ...paths) {
    //const finalPath = paths.reduce((a, b) => path.join(a, b), process.cwd());
    const finalPath = paths.reduce( (a, b) => path.join(a, b), path.join(root, path.sep) );
    //if (path.relative(process.cwd(), finalPath).startsWith("..")) {
    if (path.relative(path.join(root, path.sep), finalPath).startsWith("..")) {
      throw new Error("Failed to resolve path outside of the working directory");
    }
    return finalPath;
};
module.exports = { relative };