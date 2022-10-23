const homecontroller = require('../app/http/controllers/homecontroller')
const authcontroller = require('../app/http/controllers/authcontroller')
const cartcontroller = require('../app/http/controllers/customers/cartcontroller')
const ordercontroller = require('../app/http/controllers/customers/ordercontroller')
const adminordercontroller = require('../app/http/controllers/admin/ordercontroller')
const statuscontroller = require('../app/http/controllers/admin/statuscontroller')
const contactcontroller = require('../app/http/controllers/customers/contactcontroller')

// Middlewares 
const guest=require('../app/http/middlewares/guest')
const auth =require('../app/http/middlewares/auth')
const admin =require('../app/http/middlewares/admin')

function initrautes(app) {
   
    app.get('/', homecontroller().index)
    app.get('/login',guest, authcontroller().login)
    app.post('/login', authcontroller().postLogin)
    app.get('/register',guest, authcontroller().register)
    app.post('/register',authcontroller().postRegister)
    // app.get('/contact-us',contactcontroller())
    // app.get('/update-cart',cartcontroller().update)

    app.get('/cart', cartcontroller().cart)
    app.post('/update-cart', cartcontroller().update)
    app.post('/order', ordercontroller().store)


    app.post('/logout', function(req, res, next){
        req.logout(function(err) {
          if (err) { return next(err); }
        });
        res.redirect('/login');
    });

    // customer routes
    app.post('/orders', auth, ordercontroller().store)
    app.get('/customers/orders', auth, ordercontroller().index)
    app.get('/customers/orders/:id', auth, ordercontroller().show)

    // admin routes
    app.get('/admin/orders',admin, adminordercontroller().index)
    app.post('/admin/order/status',admin, statuscontroller().update)

}
module.exports = initrautes; 
 

