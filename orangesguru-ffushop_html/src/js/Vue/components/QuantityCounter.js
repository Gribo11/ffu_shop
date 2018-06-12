Vue.component('quantity-counter', {
    props : {
        count : {
            type : Number
        },
        rowId : null,
        max : {
            type : Number,
            default : 10,
        },
        active : Boolean,
    },
    data : function() {
        return {
            min : 1
        }
    },
    methods : {

        quantityAdd : function(e) {
            e.target.blur();
            if ( ! this.active ) return;
            var count = +this.count + ( this.count < this.max );
            this.$emit('change', this.count, count, this.rowId);
        },
        quantityRemove : function(e) {
            e.target.blur();
            if ( ! this.active ) return;
            var count = this.count - ( this.count > this.min );
            this.$emit('change', this.count, count, this.rowId);
        }
    },
    template : '<div class="fs-product-quantity" :class="{\'uk-disabled\':!active}">\
                    <a href="" @click.prevent="quantityRemove">-</a>\
                    <span>{{ count }}</span>\
                    <a href="" @click.prevent="quantityAdd">+</a>\
                </div>'
});