/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('core.logger');
 * mod.thing == 'a thing'; // true
 */
 
 var logger = {
     DEBUG: "all",
     WARN: "warn",
     ERROR: "error",
     
     debugLevel: this.WARN,
     
    log: function(text) {
        if(this.debugLevel == this.DEBUG)
            console.log("DEBUG: "+text);
    },
    
    warn: function(text) {
        if(this.debugLevel == this.WARN || this.debugLevel == this.DEBUG)
            console.log("WARNING: "+text);
    },
    
    error: function(text) {
        if(this.debugLevel == this.ERROR || this.debugLevel == this.WARN || this.debugLevel == this.DEBUG)
            console.log("ERROR: "+text);
    }
 };

module.exports = logger;