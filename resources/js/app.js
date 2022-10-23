import axios from 'axios';
import { Notyf } from 'notyf';
import moment from 'moment';
import { initAdmin } from './admin';
// import order from '../../app/models/order';


let addToCart = document.querySelectorAll('.add-to-cart')

let cartcounter = document.querySelector('#cartcounter')


function updatecart(book) {
    axios.post('/update-cart', book).then(res => {
        cartcounter.innerText = res.data.totalQty
        const notyf = new Notyf();
        notyf.success({
            type: 'success',
            duration: 500,
            message: 'item added to cart',
            position: { x: 'right', y: 'top', },
        }).show();
    }).catch(err => {
        notyf.error({
            type: 'warning',
            duration: 500,
            message: 'someting went wrong',
            position: { x: 'right', y: 'top', },
        }).show();
    })
}
addToCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        let book = JSON.parse(btn.dataset.book);
        updatecart(book);
    })
})

// Remove alert message after X seconds
const alertMsg = document.querySelector('#success-alert')
if (alertMsg) {
    setTimeout(() => {
        alertMsg.remove()
    }, 2000)
}




// change order status
let statuses = document.querySelectorAll('.status_line')
let hiddenInput = document.querySelector('#hiddenInput')

let order = hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)
// console.log(order)
let time = document.createElement('small')

function updateStatus(order) {
    statuses.forEach((status) => {
        status.classList.remove('step-completed')
        status.classList.remove('current')
    })
    let stepCompleted = true;
    statuses.forEach((status) => {
       let dataProp = status.dataset.status
       if(stepCompleted) {
            status.classList.add('step-completed')
       }
       if(dataProp === order.status) {
            stepCompleted = false
            time.innerText = moment(order.updatedAt).format('hh:mm A')
            status.appendChild(time)
           if(status.nextElementSibling) {
            status.nextElementSibling.classList.add('current')
           }
       }
    })

}
updateStatus(order);

// socket

let socket = io()


if(order) {
    socket.emit('join', `order_${order._id}`)
}
let adminAreaPath = window.location.pathname
if(adminAreaPath.includes('admin')) {
    initAdmin(socket)
    socket.emit('join', 'adminRoom')
}


socket.on('orderUpdated', (data) => {
    const updatedOrder = { ...order }
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status 
    updateStatus(updatedOrder)
    const notyf = new Notyf();
    notyf.success({
        type: 'success',
        duration: 1000,
        message: 'Order updated',
        position: { x: 'right', y: 'top', },
    }).show();
})