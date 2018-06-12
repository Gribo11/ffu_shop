/*
 *  ------------------ Credit card payment ----------------
 */

// translations
var lang = ffuShop.translation.lang,
    creditCardLang = {            
        ua : {
            title : 'Сплатити онлайн (Visa, Mastercard)',
        },
        en : {
            title : 'Pay online (Visa, Mastercard)',
        }
    }

// register provider    
ffuShop.store.commit('createPaymentProvider', ['credit-card', {    
    title : creditCardLang[lang].title,                   
    cost : 0,
    options : {
        redirect : 'https://www.liqpay.ua/'
    }
}]);