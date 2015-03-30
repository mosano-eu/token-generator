var Class = require( 'findhit-class' ),
    Util = require( 'findhit-util' ),
    crypto = require( 'crypto' ),
    debug = require( 'debug' )( 'token-generator' );

var TokenGenerator = module.exports = Class.extend({

    options: {


        /**
         * @option salt
         * @required
         *
         * Salt for generate different tokens
         */
        salt: undefined,

        /**
         * @option timestampMap
         * @required
         *
         * Timestamp replacement in leters
         * should always have 10 chars!
         *
         * {String}.length 10
         */
        timestampMap: undefined,


        /**
         * @option timestampObfuscater
         * @required
         *
         * @param  {Number} timestamp
         * @param  {String} map
         * @return {String}
         */
        timestampObfuscater: function ( timestamp, map ) {
            var tokenGenerator = this;

            return Array.prototype.map.call( timestamp + '', function ( number ) {
                number = parseInt( number );
                return tokenGenerator.options.timestampMap[ number ];
            })
            .join( '' );
        },

        /**
         * @option timestampDeobfuscater
         * @required
         *
         * @param  {Number} timestamp
         * @param  {String} map
         * @return {String}
         */
        timestampDeobfuscater: function ( token ) {
            var tokenGenerator = this;

            return parseInt(
                Array.prototype.map.call( token + '', function ( letter ) {
                    return tokenGenerator.options.timestampMap.indexOf( letter );
                })
                .join( '' )
            );
        },

        /**
         * @option expiresOn
         *
         * Token Expiration in seconds
         *
         * {Integer}
         */
        expiresOn: 60 * 60, // 1 hour

        /**
         * @option hashGeneratorMethod
         * @required
         *
         * Hash generator method
         * This is an option since we use another method for generating hash.
         *
         * {Function}
         */
        hashGeneratorMethod: function ( timestamp ) {
            return crypto.createHash( 'md5' )
            .update(
                timestamp +
                this.options.salt +
                this.options.timestampMap
            )
            .digest( 'hex' );
        },


        /**
         * @option hashLength
         * @required
         *
         * Length of hash gathering to mix up with token
         * used as first argument of `.substr` method
         *
         * {Integer}
         */
        hashLength: 4,

    },

    initialize: function ( options ) {
        options = this.setOptions( options );

        // Check for salt
        if( Util.isnt.String( options.salt ) || ! options.salt ) {
            throw new TypeError( "options.salt should always be a non-empty string" );
        }

        // Check for timestampMap
        //
        if ( Util.isnt.String( options.timestampMap ) || options.timestampMap.length !== 10 ) {
            throw new TypeError( "options.timestampMap should always be a 10 lenght string" );
        }

        if ( Util.isnt.Number( options.hashLength ) ) {
            throw new TypeError( "options.hashLength should be an integer" );
        }

        if ( Util.isnt.Number( options.expiresOn ) ) {
            throw new TypeError( "options.expiresOn is invalid" );
        }

    },

    generate: function ( expireTimestamp ) {
        var expireTimestamp = (
                expireTimestamp ||
                currentTimestamp() + this.options.expiresOn
            );

        debug( 'starting token generation with timestamp "%s"', expireTimestamp );

        var hashPart = (
                this.options.hashGeneratorMethod.call( this, expireTimestamp )
                .substr( 0, this.options.hashLength )
            ),
            timestampPart = (
                this.options.timestampObfuscater.call( this,
                    expireTimestamp,
                    this.options.timestampMap
                )
            );

        debug( 'expireTimestamp "%s" has hashPart "%s"', expireTimestamp, hashPart );
        debug( 'expireTimestamp "%s" has timestampPart "%s"', expireTimestamp, timestampPart );

        return hashPart + timestampPart;
    },

    validate: function ( token ) {
        debug( 'trying to validate token "%s"', token );

        var hashPart = token.substr( 0, this.options.hashLength ),
            timestampPart = token.substr( this.options.hashLength ),
            timestamp = parseInt(
                this.options.timestampDeobfuscater.call( this, timestampPart )
            );

        debug( 'token "%s" has hashPart "%s"', token, hashPart );
        debug( 'token "%s" has timestampPart "%s"', token, timestampPart );
        debug( 'token "%s" has timestamp "%s"', token, timestamp );

        try{

            if ( Util.isnt.Number( timestamp ) ) {
                throw new Error( "token has invalid timestamp on it" );
            }

            // Check if timestamp is expired
            if ( timestamp > currentTimestamp() + this.options.expiresOn ) {
                throw new Error( "token is expired" );
            }

            if ( Util.isnt.String( hashPart ) ) {
                throw new Error( "token has invalid hashPart on it" );
            }

            if ( hashPart.length !== this.options.hashLength ) {
                throw new Error( "hashPart has invalid length" );
            }

            // Since we have timestamp, lets create hash based on that timestamp
            // and check if hashpart is equal
            var hash = this.options.hashGeneratorMethod.call( this, timestamp );

            if ( hashPart !== hash.substr( 0, this.options.hashLength ) ) {
                throw new Error( "hashPart doesn't match with expected hashPart" );
            }

        } catch ( error ) {
            debug( 'token "%s" validation has failed: %s', token, error + '' );

            // In case any error occurs, lets wrap it into an Invalid Token one.
            // You can access it via err.parent
            var err = new Error( "Invalid or expired token" );
            err.parent = error;
            throw err;
        }

    }

});

TokenGenerator.prototype.isValid =
TokenGenerator.prototype.isntInvalid =
    function ( token ) {
        try {
            this.validate( token );
        } catch ( err ) {
            return false;
        }
        return true;
    };

TokenGenerator.prototype.isntValid =
TokenGenerator.prototype.isInvalid =
    function ( token ) {
        try {
            this.validate( token );
        } catch ( err ) {
            return true;
        }
        return false;
    };


//
// Private methods
//

function currentTimestamp() {
    return parseInt( new Date().valueOf() / 1000 ) ;
}
