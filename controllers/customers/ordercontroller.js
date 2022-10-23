const Order = require('../../../models/order')
const moment = require('moment')
function ordercontroller () {
    return {
        store(req, res) {
            // Validate request
            const {phone,address } = req.body

            // if(!(phone) || !(address))
            // {
            //     req.flash('error','all fields are required ')
            //     return res.redirect('/cart')
            // }

            const order =new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone,
                address,
            })
            order.save().then(result => {
                Order.populate(result,{path:'customerId'},(err,placedOrder)=>{
                    req.flash('success', 'Order placed successfully')
                    delete req.session.cart
    
                    const eventEmitter = req.app.get('eventEmitter')
                    eventEmitter.emit('orderPlaced', placedOrder) 
                    return  res.redirect('customers/orders')
                })
                
            }).catch(err => {
                req.flash('error', 'something went wrong')
                return  res.redirect('/cart')
            })
        },
        async index(req,res){
            const orders=await Order.find({customerId: req.user._id },null,{sort:{'createdAt':-1} } )
            res.header('Cache-Control', 'no-store')
            res.render('customers/orders',{orders:orders,moment:moment})

            // console.log(orders) 
        },
        async show(req,res){
            const order=await Order.findById(req.params.id)

            // aurthorize user
            if(req.user._id.toString() === order.customerId.toString())
            {
                res.render('customers/singleorder', {order})
            }
            else{
                res.redirect('/');
            }
        }
        
    }
}

module.exports = ordercontroller