/*
 * Single product
 */

if ( $('#fsProductSingle').length ) {

    ffuShop.singleProduct = new Vue({
        el: '#fsProductSingle',
        data: {
            id: null,
            name: '',
            sku: null,
            price: null,
            discount: null,
            attributes: {
                color: {
                    current: null
                },
                size: {
                    current: null
                }
            },
            slideshow : {
                obj: null,
                pictures : {}
            },
            productVariants : null,
            quantity: 1,
            max: 10
        },
        store : ffuShop.store,
        computed : {
            maxQuantity : function() {                
                return ( this.max > 10 ? 10 : this.max );
            },
            discountPrice : function() {
                if ( ! this.discount ) return this.price;
                return Math.round( this.price * (1 + parseInt(this.discount) / 100 ) );
            }
        },
        methods: {
            getProductVariants : function() {
                var that = this;
                
                $.ajax({
                    url : ffuShop.routes.singleProduct.getProductVariants.url + that.id,
                    type : ffuShop.routes.singleProduct.getProductVariants.req,
                    dataType: 'json',
                }).then(function(res){
                    
                    // multi variant product
                    if ( Object.keys(res).length > 1 ) {
                        
                        that.productVariants = res;

                        // create attributes
                        for ( name in that.attributes ) {

                            var checkAtts = [];

                            for ( sku in that.productVariants ) {

                                var newAttr = {},
                                    attr = that.productVariants[sku][name];

                                if ( ! attr ) continue;

                                if ( ~$.inArray( attr.id, checkAtts ) ) continue;

                                checkAtts.push( attr.id );
                                $.extend( newAttr, attr );
                                newAttr.active = (name == 'color' ? true : that.productVariants[sku].in_stock );

                                // duplicate color 2 if not exist
                                if ( name == 'color' && ! newAttr.value_2 ) newAttr.value_2 = newAttr.value;

                                if ( ! that.attributes[name].all ) that.attributes[name].all = [];

                                that.attributes[name].all.push( newAttr );
                            }
                        };

                        // create slides
                        var slideIndex = 0,                            
                            checkPicks = [];

                        for ( sku in that.productVariants ) {

                            // if no color image is dropped
                            if ( ! that.productVariants[sku].color ) {

                                if ( ! that.productVariants[sku].sku_image ) continue;

                                var picId = 'pic_' + slideIndex; 

                                var picObj = {
                                    slideIndex : slideIndex,
                                    name: picId,
                                    image: that.productVariants[sku].sku_image
                                };
                                that.slideshow.pictures[picId] = picObj;
                                slideIndex++;

                                continue;
                            }

                            var colorId = 'color_' + that.productVariants[sku].color.id;

                            if ( ! that.productVariants[sku].sku_image || ~$.inArray(colorId,  checkPicks) ) continue;

                            checkPicks.push( colorId );
                            var picObj = {
                                slideIndex : slideIndex++,
                                name: that.productVariants[sku].color.name,
                                image: that.productVariants[sku].sku_image
                            };
                            that.slideshow.pictures[colorId] = picObj;
                        }
                        
                    } else {
                        
                        // single product  
                        var productSku = Object.keys(res)[0],
                            productOpts = res[productSku];
                        
                        that.sku = productSku;
                        that.price = productOpts.in_stock ? productOpts.price : null;
                        that.discount = productOpts.discount;
                        that.productVariants = res;
                        
                        // set size
                        if ( productOpts.size ) {                             
                            Vue.set(that.attributes, 'size', {
                                current : productOpts.size.value,
                                all : [productOpts.size]
                            })
                        }
                        
                        // set color
                        if ( productOpts.color ) {
                            productOpts.color.active = true;
                            productOpts.color.value_2 = (productOpts.color.value_2 || productOpts.color.value);
                            Vue.set(that.attributes, 'color', {
                                current : productOpts.color.id,
                                all : [productOpts.color]
                            })
                        }
                        
                        // set main image
                        if ( productOpts.sku_image ) {
                            
                            var picId = ( productOpts.color ? 'color_' + productOpts.color.id : 'pic_0' ); 
                            
                            Vue.set(that.slideshow.pictures, picId, {
                                slideIndex : 0,
                                name: productOpts.sku_image.color ? productOpts.sku_image.color.name : '',
                                image: productOpts.sku_image
                            });
                        }
                    }
                    
                }).then(function(){
                    that.$forceUpdate();
                    if ( that.attributes.color.all ) {
                        that.setAttribute( that.attributes.color.all[0], 'color');
                    }
                    that.slideshow.obj.show(0);
                });

            },
            quantityChange : function(old, q) {
                 this.quantity = q;
            },
            getAttrClass : function( attr, attrName ) {
                if ( ! attr.active ) return 'uk-disabled';
                if ( this.attributes[attrName].current == attr.id ) return 'uk-active';
            },
            updateData : function() {

                this.sku = null;
                this.price = null;
                
                // set first availible attribute if not exist
                for ( name in this.attributes ) {

                    if ( this.attributes[name].current ) continue;

                    for ( index in this.attributes[name].all ) {

                        if ( this.attributes[name].all[index].active ) {

                            this.attributes[name].current = this.attributes[name].all[index].id;
                            break;
                        }
                    }
                }

                // find product
                for ( sku in this.productVariants ) {

                    var fits = true;

                    for ( name in this.attributes ) {
                        
                        // skip attributes, not availible in product
                        if ( ! this.productVariants[sku][name] ) continue;
                        
                        if ( this.attributes[name].current != this.productVariants[sku][name].id ) fits = false;
                    }

                    if ( fits ) {

                        this.sku = sku;
                        this.price = this.productVariants[sku].price;
                        this.discount = this.productVariants[sku].discount;
                        this.max = this.productVariants[sku].stock_level;
                    }
                }
            },
            setAttribute : function( attr, attrName ) {

                // set image
                if ( attrName == 'color' && this.slideshow.obj ) {

                    var picId = 'color_' + attr.id;
                    if ( this.slideshow.pictures.hasOwnProperty(picId) ) this.slideshow.obj.show( this.slideshow.pictures[picId].slideIndex );
                }

                if ( ! attr.active ) return false;

                this.attributes[attrName].current = attr.id;

                // check if dependency attributes active
                for ( name in this.attributes ) {

                    if ( name == attrName || name == 'color' ) continue;

                    var activeAtts = [];

                    for ( sku in this.productVariants ) {
                        
                        // check only attributes that exist
                        if ( ! this.productVariants[sku][name] ) continue;
                        
                        if ( this.productVariants[sku][attrName].id == attr.id &&
                             this.productVariants[sku].in_stock ) {
                                                        
                            activeAtts.push( this.productVariants[sku][name].id );
                        }
                    }                                               

                    for ( index in this.attributes[name].all ) {

                        var att = this.attributes[name].all[index]; 

                        att.active = false;

                        for ( i=0; i<activeAtts.length; i++) {
                            if ( att.id == activeAtts[i] ) att.active = true;
                        }

                        // reset active attribute if disabled
                        if ( this.attributes[name].current == att.id && ! att.active ) {

                            this.attributes[name].current = activeAtts[0] || null;
                        }
                    }
                }

                // reset data
                this.updateData();
            },
            addToCart : function() {
                
                if ( ! this.price ) {
                    
                    UIkit.notification({
                        status : 'warning',
                        message : ffuShop.translation[ffuShop.translation.lang].addToCart.notSelected
                    });
                    return;
                }
                
                var that = this,
                    product = {},
                    variant = this.productVariants[this.sku],
                    notify;

                if ( variant ) {

                    product = {
                        id: variant.sku_id,
                        name : that.name,
                        qty: that.quantity,
                        price: variant.price,                        
                        options: {
                            product_id: that.id,
                            discount: variant.discount,
                            sku: that.sku ? that.sku : null,
                            size: variant.size ? variant.size : null,
                            color_name: variant.color ? variant.color.name : null,
                            color_value: variant.color ? variant.color.value : null,
                            color_value_2: variant.color ? variant.color.value_2 : null,
                            image: variant.sku_image ? variant.sku_image : null
                        }
                    };

                    this.$store.dispatch('addProduct', product);

                } else {

                    UIkit.notification({
                        status: 'danger',
                        message: '<span uk-icon="icon: ban"></span> ' + ffuShop.translation[ ffuShop.translation.lang ].addToCart.notSelected
                    });
                }
            }
        },
        created : function() {  
            this.id = $('#fsProductSingle').data('product-id');
            this.name = $('#fsProductSingleName').text();
            this.getProductVariants();
        },
        mounted : function() {            
            this.slideshow.obj = UIkit.slideshow( '#fsProductSingle .fs-product-gallery > .uk-slideshow', {ratio: '1:1'});
        }
    })
};