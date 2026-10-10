// Express 4 tidak menangkap rejected promise dari route handler async. Tanpa
// wrapper ini, satu query yang gagal akan menggantungkan request sampai timeout
// dan tidak pernah sampai ke error handler.
//
// Wrapper membungkus handler yang SUDAH terdaftar di router. Versi lama hanya
// menimpa router.get/put/... sehingga tidak berefek apa pun, karena module
// route mendaftarkan handler-nya saat di-require, sebelum asyncRoutes dipanggil
// di src/index.js.
const wrap = (handler) => {
  const wrapped = function (...args) {
    const done = args[args.length - 1];
    try {
      const result = handler.apply(this, args);
      if (result && typeof result.then === 'function') result.catch(done);
    } catch (err) {
      done(err);
    }
  };
  // Express mengenali error handler dari panjang 4 argumen. Kalau panjangnya
  // berubah jadi 3, handler (err, req, res, next) tidak akan pernah dipanggil.
  Object.defineProperty(wrapped, 'length', { value: handler.length });
  return wrapped;
};

module.exports = function asyncRoutes(router) {
  for (const layer of router.stack) {
    if (layer.route) {
      for (const routeLayer of layer.route.stack) {
        routeLayer.handle = wrap(routeLayer.handle);
      }
    } else {
      layer.handle = wrap(layer.handle);
    }
  }
  return router;
};
