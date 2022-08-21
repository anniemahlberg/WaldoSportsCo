function requireUser(req, res, next) {
    if (!req.user) {
        next({
            name: "MissingUserError",
            message: "You must be logged in to perform this action"
        });
    }

    next();
}

function requireAdmin(req, res, next) {
    if (!req.user.admin) {
      next({
        name: "UnauthorizedUserError",
        message: `You must be an administrator to perform this action, you are ${req.user.username} and your admin status is ${req.user.admin}`
      })
    } 

    next()
  }

module.exports = {
    requireUser,
    requireAdmin
};