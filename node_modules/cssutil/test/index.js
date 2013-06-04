// Firstly, On test case 4, you should adapt the path 'e:\\Camp\\Documents\\GitHub\\cssutil\\test\\404.css' to your local one!!
// Then run `npm test`
var expect = require('chai').expect,
    cssutil = require('../index');

// Force current directory
process.chdir(__dirname);

describe('cssutil-tests', function() {
    //test1
    it ('should concatenate and minify CSS', function(done) {
        cssutil.build([
            'file1.css',
            'file2.css'
        ], function(e, css) {
            expect(e).to.equal(null);
            expect(css).to.equal('h1{color:#BDF17E}h2{color:#83B1FC}');
            done();
        });
    });
    //test2
    it('should just concatenate CSS', function(done) {
        var opts = { minify: false };
        cssutil.build([
            'file1.css',
            'file2.css'
        ], opts, function(e, css) {
            expect(e).to.equal(null);

            // Normalize line endings
            css = css.replace(/\r\n/gi, '\n');

            expect(css).to.equal(
                'h1 {\n' +
                '    color: #BDF17E;\n' +
                '}\n' +
                '\n' +
                'h2 {\n' +
                '    color: #83B1FC;\n' +
                '}\n');
            done();
        });
    });
    //test3
    it('should merge imported CSS files', function(done) {
        var opts = { minify: false };
        cssutil.build([
            'file3.css'
        ], opts, function(e, css) {
            expect(e).to.equal(null);

            // Normalize line endings
            css = css.replace(/\r\n/gi, '\n');

            expect(css).to.equal(
                '/*S-file1.css*/\n'+
                'h1 {\n' +
                '    color: #BDF17E;\n' +
                '}\n' +
                '\n/*E-file1.css*/'+
                '\n'+
                '.test3 {\n' +
                '    height: 1px;\n' +
                '}');
            done();
        });
    });
    //test4
    it('should merge complex imported CSS files', function(done) {
        var opts = { minify: false };
        cssutil.build([
            'file4.css'
        ], opts, function(e, css) {
            expect(e).to.equal(null);

            // Normalize line endings
            css = css.replace(/\r\n/gi, '\n');

            expect(css).to.equal(
                '@import url(http://static.gtimg.com/icson/css/common/v0/gb.css);\n'+
                '/*S-file3.css*/\n'+
                '/*S-file1.css*/\n'+
                'h1 {\n' +
                '    color: #BDF17E;\n' +
                '}\n' +
                '\n/*E-file1.css*/'+
                '\n'+
                '.test3 {\n' +
                '    height: 1px;\n' +
                '}\n'+
                '/*E-file3.css*/\n'+
                '/*S-404.css*/\n'+
                "/*404.css,Error: ENOENT, open 'e:\\Camp\\Documents\\GitHub\\cssutil\\test\\404.css'*/\n"+
                '/*E-404.css*/\n'+
                '/*S-imports\\_file1.css*/\n'+
                '.imports_file1{\n'+
                '    height:1px;\n'+
                '}\n'+
                '/*E-imports\\_file1.css*/\n'+
                '.test4 {\n'+
                '    height: 1px;\n'+
                '}'
                );
            done();
        });
    });
    //test5
    it('should compile and minify LESS files', function(done) {
        cssutil.build([
            'test.less'
        ], function(e, css) {
            expect(e).to.equal(null);
            expect(css).to.equal('h3{color:#FC92A2}');
            done();
        });
    });
    //test6
    it('should use specified LESS import paths', function(done) {
        var opts = { paths: ['imports'] };
        cssutil.build([
            'import.less'
        ], opts, function(e, css) {
            expect(e).to.equal(null);
            expect(css).to.equal('.foo{display:awesome}');
            done();
        });
    });
});
