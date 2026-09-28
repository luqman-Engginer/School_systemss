// Express 4 tidak menangkap rejected promise dari route handler async. Tanpa
// wrapper ini, satu query yang gagal akan menggantungkan request sampai timeout
// dan tidak pernah sampai ke error handler. Wrapper membungkus setiap handler
// sehingga error diteruskan ke next(err).
const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'all', 'use'];

module.exports = function asyncRoutes(router) {
  for (const method of METHODS) {
    const original = router[method].bind(router);
    router[method] = (...args) => {
      const lastIndex = args.length - 1;
      const handler = args[lastIndex];
      if (typeof handler === 'function') {
        args[lastIndex] = function wrapped(req, res, next) {
          try {
            const result = handler(req, res, next);
            if (result && typeof result.then === 'function') {
              result.catch(next);
            }
          } catch (err) {
            next(err);
          }
        };
      }
      return original(...args);
    };
  }
  return router;
};
