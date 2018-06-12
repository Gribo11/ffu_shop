ffuShop.routes = {
    
    user : {
        getUser : {
            req : 'post',
            url : '/user/get',
        },
        saveUser : {
            req : 'post',
            url : '/user/save'
        },
        changePass : {
            req : 'post',
            url : '/user/changepass'
        },
        resetPass : {
            req : 'post',
            url : '/user/resetpass'
        },
        auth : {
            req : 'post',
            url : '/user/auth'
        },
        register : {
            req : 'post',
            url : '/user/register'
        }
    },
    cart : {
        getNPDeliveryPrice: {
            req : 'post',
            url : '/getNPDeliveryPrice'
        },

        getProducts : {
            req : 'post',
            url : '/cart/get'
        },
        addProduct : {
            req : 'post',
            url : '/cart/add'
        },
        removeProduct : {
            req : 'post',
            url : '/cart/remove'
        },
        setProductQuantity : {
            req : 'post',
            url : '/cart/row/update'
        },
        registerUser : {
            req : 'post',
            url : '/cart/user/reg'
        }
    },
    checkout : {
        confirm : {
            req : 'post',
            url : '/cart/checkout'
        }
    },
    singleProduct : {
        getProductVariants : {
            req : 'post',
            url : '/product/json/sku/'
        },
        getCustomImage : {
            req : 'post',
            url : '/product/custom/'
        }
    },
    orders : {
        all : {
            req : 'post',
            url : '/order/list'
        },
        details : {
            req : 'post',
            url : '/order/details'
        }
    }
}