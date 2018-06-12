function prettifyProducts(products) {

    if ( $.isEmptyObject(products) ) return null;

    $.each(products, function(i, product){
        // qty and price are integer
        product.qty = parseInt(product.qty);
        product.price = parseInt(product.price);
        
        if ( ! product.options ) return;
        
        // discount
        if ( ! product.options.discount ) {
            product.options.discount = null;
            product.discountPrice = product.price;
        } else {
            product.options.discount = parseInt( product.options.discount );
            product.discountPrice = Math.round( product.price * (1 + product.options.discount / 100) );
        }
        
        //colors
        if ( ! product.options.color_value ) return;
        product.options.color_value_2 = product.options.color_value_2 || product.options.color_value;
    });
    return products;
};

ffuShop.store = new Vuex.Store({
    state : {
        products : [],
        user : {
            first_name : "",
            last_name : "",
            email : "",
            phone : "",
            birthday : "",
            sex : null,
            valid : false,
            registered : false,
        },
        deliveryProviders : {},
        paymentProviders : {},
        order : {
            delivery : {
                provider : null,
                cost : 0,
            },
            payment : {
                provider : null,
                cost : 0
            }
        }
    },
    mutations : {

        addProduct : function( state, product ) {
            $.ajax({
                url : ffuShop.routes.cart.addProduct.url,
                type : ffuShop.routes.cart.addProduct.req,
                data : product,
                dataType : 'json',
                success : function(res){
                    state.products = prettifyProducts(res);

                    UIkit.notification({
                        status : 'success',
                        message : '<span uk-icon="icon: check"></span> ' + product.name + ' x ' + product.qty + ffuShop.translation[ ffuShop.translation.lang ].addToCart.success
                    });
                }
            });               
        },

        getProducts : function( state ) {
            $.ajax({
                url : ffuShop.routes.cart.getProducts.url,
                type : ffuShop.routes.cart.getProducts.req,
                dataType : 'json',
                success : function(res){
                    state.products = prettifyProducts(res);
                }
            });  
        },

        getUser : function( state ) {
            $.ajax({
                url : ffuShop.routes.user.getUser.url,
                type : ffuShop.routes.user.getUser.req,
                dataType : 'json',
                success : function(res) {

                    if ( ! res ) return; // null in response
                    
                    // formatting data
                    res.valid = true;
                    res.registered = true;
                    res.birthday = ( res.birthday ? res.birthday : '' );

                    if ( res.deliveryProviders
                         && ! $.isEmptyObject(res.deliveryProviders) ) {

                        for ( providerName in state.deliveryProviders ) {

                            if ( providerName in res.deliveryProviders ) {

                                // copy provider options
                                var providerOptions = state.deliveryProviders[providerName].options;
                                var userOptions = res.deliveryProviders[providerName].options; 

                                for ( option in userOptions ) {
                                    providerOptions[option] = userOptions[option]
                                }

                                // set provider validation
                                state.deliveryProviders[providerName].valid = res.deliveryProviders[providerName].valid;

                                // toggle provider if valid
                                var currentProvider = state.order.delivery.provider
                                if ( res.deliveryProviders[providerName].valid
                                     && ! state.deliveryProviders[currentProvider].valid ) {
                                    state.order.delivery.provider = providerName;
                                    state.order.delivery.cost = state.deliveryProviders[providerName].cost;
                                }
                            }
                        }

                        delete res.deliveryProviders; 
                    }

                    state.user = res;
                },
                complete : function(){ 
                    $(window).trigger('fs.user.loaded')
                }
            });
        },

        setUserInfo : function( state, payload ) {
            var fieldName = payload[0],
                fieldValue = payload[1];
            state.user[fieldName] = fieldValue;
        },
                
        createDeliveryProvider : function( state, payload ) {
            var providerName = payload[0],
                providerOptions = payload[1];

            // update storage
            Vue.set( state.deliveryProviders, providerName, providerOptions);

            // set default delivery provier if not exists
            if ( ! state.order.delivery.provider ) {
                state.order.delivery = {
                    provider : providerName,
                    cost : providerOptions.cost
                }
            }
        },

        setDeliveryProviderField : function( state, payload ) {
            var providerName = payload[0],
                fieldName = payload[1],
                fieldValue = payload[2];

            state.deliveryProviders[providerName].options[fieldName] = fieldValue;
        },
        setDeliveryProviderCost : function( state, payload ) {
            var providerName = payload[0],
                fieldValue = payload[1];
            state.deliveryProviders[providerName].cost = fieldValue;
        },

        setDeliveryProvider : function( state, providerName ) {
            state.order.delivery.provider = providerName;
            state.order.delivery.cost = state.deliveryProviders[providerName].cost;
        },

        setDeliveryProviderValid : function( state, payload ) { 
            var providerName = payload[0],
                providerValid = payload[1];

            state.deliveryProviders[providerName].valid = providerValid;
        },

        createPaymentProvider : function( state, payload ) {
            var providerName = payload[0],
                providerOptions = payload[1];

            // update storage
            Vue.set( state.paymentProviders, providerName, providerOptions);

            // set default delivery provier if not exists
            if ( ! state.order.payment.provider ) {
                state.order.payment = {
                    provider : providerName,
                    cost : providerOptions.cost
                }
            }
        },

        setPaymentProvider : function( state, providerName ) {
            state.order.payment.provider = providerName;
            state.order.payment.cost = state.paymentProviders[providerName].cost;
        }
    },
    getters : {
        
        user : function( state ) {
            
            return ( state.user.registered ? state.user : false );
        },
        
        products : function( state ) {

            return ( $.isEmptyObject(state.products) ? null : state.products );
        },

        delivery : function( state ) {                
            return {
                active : state.order.delivery.provider,
                providers : state.deliveryProviders,                    
            }
        },

        deliveryDetails : function( state ) {
            
            if ( $.isEmptyObject( state.deliveryProviders ) ) return false;
            
            return state.deliveryProviders[ state.order.delivery.provider ].options.details
            //return state.deliveryProviders[ state.order.delivery.provider ].options
        },
        deliveryDetailsWarehouse : function( state ) {
            if ( $.isEmptyObject( state.deliveryProviders ) ) return false;
            return state.deliveryProviders[ state.order.delivery.provider ].options.warehouse
            //return state.deliveryProviders[ state.order.delivery.provider ].options
        },

        deliveryCost : function( state ) {
            if ( ! state.order.delivery.provider ) return 0;                
            return state.deliveryProviders[ state.order.delivery.provider ].cost
        },

        deliveryValid : function( state ) {

            if ( ! state.order.delivery.provider ) return false;
            return state.deliveryProviders[ state.order.delivery.provider ].valid
        },

        payment : function( state ) {                
            return {
                active : state.order.payment.provider,
                providers : state.paymentProviders
            }
        },

        paymentCost : function( state ) {
            if ( ! state.order.payment.provider ) return 0;                
            return state.paymentProviders[ state.order.payment.provider ].cost
        }
    },
    actions : {
        getProducts : function( store ) {
            store.commit('getProducts')
        },
        addProduct : function( store, payload ) {
            store.commit('addProduct', payload)
        },
        getUser : function( store ) {
            store.commit('getUser');
        },
        saveUser : function( store, payload ) {            
            return new Promise(function(resolve, reject) {                
                var user = $.extend( {}, store.state.user, payload);
                $.ajax({
                    url : ffuShop.routes.user.saveUser.url,
                    type : ffuShop.routes.user.saveUser.req,
                    dataType : 'json',
                    data : user,
                    success : function(res) {                        
                        if ( res.errors &&
                         ! $.isEmptyObject(res.errors) ) {
                            reject(res.errors);
                        } else {
                            resolve();
                            store.dispatch('getUser');
                        }
                    },
                    error : function(err) {
                        reject(err);
                    }
                });
            })
        },
        setProductQuantity : function( store, payload ) {             
            return new Promise(function(resolve, reject) {
                $.ajax({
                    type: ffuShop.routes.cart.setProductQuantity.req,
                    url : ffuShop.routes.cart.setProductQuantity.url,
                    dataType : 'json',
                    data : {
                        rowId : payload[0],
                        qty : payload[1]
                    },
                    success : function(res) {                        
                        if ( res.errors &&
                         ! $.isEmptyObject(res.errors) ) {
                            for ( rowId in res.errors ) {
                                store.state.products[ rowId ].qty = parseInt(res.errors[rowId]);
                            }
                            reject(res.message);
                        } else {
                            resolve();
                        }
                    }
                })
            });
        },
        removeProduct : function ( store, rowId ) {
            return new Promise(function(resolve, reject){
                $.ajax({
                    type: ffuShop.routes.cart.removeProduct.req,
                    url : ffuShop.routes.cart.removeProduct.url,
                    data : {rowId : rowId},
                    dataType : 'json',
                    success : function(res){                        
                        store.state.products = prettifyProducts(res);   
                        // redirect to homepage if empty                        
                        if ( ! store.state.products ) window.location = '/'; 
                        resolve();
                    }
                });
            });
        },
    }
});