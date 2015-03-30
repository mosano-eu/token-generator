var TokenGenerator = require( '../' ),
    chai = require( 'chai' ),
    expect = chai.expect;

describe( 'TokenGenerator', function () {
    var tg = new TokenGenerator({
            salt: 'alto e grande decote', // portuguese joke
            timestampMap: 'qQrc0isaxD',
        }),

        validToken = tg.generate(),
        invalidToken = tg.generate(
            parseInt( new Date().valueOf() / 1000 ) +
            tg.options.expiresOn +
            30
        );

    it( "should verify flawless", function () {
        expect(function () {
            return tg.validate( validToken );
        }).to.not.throw( Error );
    });

    it( "should not validate an expired token", function () {
        expect(function () {
            return tg.validate( invalidToken );
        }).to.throw( Error );
    });

    describe( "valid checks", function () {

        it( "isValid throught validToken", function () {
            expect(
                tg.isValid( validToken )
            ).to.be.ok;
        });

        it( "isValid throught invalidToken", function () {
            expect(
                tg.isValid( invalidToken )
            ).to.not.be.ok;
        });

        it( "isntInvalid throught validToken", function () {
            expect(
                tg.isntInvalid( validToken )
            ).to.be.ok;
        });

        it( "isntInvalid throught invalidToken", function () {
            expect(
                tg.isntInvalid( invalidToken )
            ).to.not.be.ok;
        });

    });

    describe( "invalid checks", function () {

        it( "isntValid throught validToken", function () {
            expect(
                tg.isntValid( validToken )
            ).to.not.be.ok;
        });

        it( "isntValid throught invalidToken", function () {
            expect(
                tg.isntValid( invalidToken )
            ).to.be.ok;
        });

        it( "isInvalid throught validToken", function () {
            expect(
                tg.isInvalid( validToken )
            ).to.not.be.ok;
        });

        it( "isInvalid throught invalidToken", function () {
            expect(
                tg.isInvalid( invalidToken )
            ).to.be.ok;
        });

    });


});
