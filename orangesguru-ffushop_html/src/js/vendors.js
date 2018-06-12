// polyfills
@@include('./src/js/polyfills/promise.js')

// uikit
@@include('./node_modules/uikit/dist/js/uikit.min.js')
@@include('./node_modules/uikit/dist/js/uikit-icons.min.js')

// vue
@@if ( process.env.NODE_ENV == 'development' ) { 
    @@include('./node_modules/vue/dist/vue.js');
    @@include('./node_modules/vuex/dist/vuex.js');
}
@@if ( process.env.NODE_ENV != 'development' ) { 
    @@include('./node_modules/vue/dist/vue.min.js');
    @@include('./node_modules/vuex/dist/vuex.min.js');
}

// jquery
@@include('./node_modules/jquery/dist/jquery.min.js');
@@include('./bower_components/jquery.maskedinput/dist/jquery.maskedinput.min.js');