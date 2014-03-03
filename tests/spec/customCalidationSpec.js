describe("Custom validators", function() {
    var myheader = new SSENSE_webapp.views.Header();
    describe("match", function() {
        it("these 2 inputs should not match", function() {
            
            var funcResult = myheader.test();
            expect(funcResult).toEqual(5);
        });

    });
});