/*
 *  ------------------ Cash on delivery payment ----------------
 */

// translations
var lang = ffuShop.translation.lang,
    cashOnDelivery = {            
        ua : {
            title : 'Наложений платіж',
        },
        en : {
            title : 'Cash On Delivery',
        }
    }

// register provider    
ffuShop.store.commit('createPaymentProvider', ['cash-on-delivery', {    
    title : cashOnDelivery[lang].title,                   
    cost : 34,
    options : {
        redirect : '/thank-you.html'
    }
}]);