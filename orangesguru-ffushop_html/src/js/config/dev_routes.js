ffuShop.routes = {
    
    user : {
        getUser : {
            req : 'get',
            url : '/test/user.json',
            //url : '/test/null.json'
            //url : '/server/user/get'
        },
        saveUser : {
            req : 'get',
            url : '/test/user.json',
            //url : '/test/error.json'
        },
        changePass : {
            req : 'get',
            url : '/test/error.json',
            //url : '/test/success.json'
        },
        resetPass : {
            req : 'get',
            url : '/test/error.json',
            //url : '/test/success.json'
        },
        auth : {
            req : 'get',
            //url : '/test/error.json',
            //url : '/server/user/auth/'
            url : '/test/success.json'
        },
        register : {
            req : 'get',
            //url : '/test/error.json',
            url : '/test/user-register-success.json'
        }
    },
    cart : {
        getNPDeliveryPrice: {
            req : 'get',
            url : '/test/getNPDeliveryPrice.json'
        },
        getProducts : {
            req : 'get',
            url : '/test/cart.json',
            //url : '/test/null.json'
        },
        addProduct : {
            req : 'get',
            url : '/test/cart-add.json'
        },
        removeProduct : {
            req : 'get',
            url : '/test/cart-remove.json'
        },
        setProductQuantity : {
            req : 'get',
            url : '/test/success.json',
            //url : '/test/error-quantity.json',
        },
        registerUser : {
            req : 'get',
            url : '/test/user-reg.json',
            //url : '/test/error.json'
        }
    },
    checkout : {
        confirm : {
            req : 'get',
            //url : '/test/checkout-pay.json',
            url : '/test/checkout-quantity.json',
            //url : '/test/checkout-redirect.json'
        }
    },
    singleProduct : {        
        getProductVariants : {
            req : 'get',
            url : '/test/product.json',
            //url : '/test/product-no-atts.json'
            //url : '/server/product/json/sku/1'
        },
        getCustomImage : {
            req : 'get',
            url : 'test/petrova.txt'
        }
    },
    orders : {
        all : {
            req : 'get',
            //url : '/test/null.json',
            url : '/test/orders-all.json'
        },
        details : {
            req : 'get',
            url : '/test/order-details.json'
        }
    }
}