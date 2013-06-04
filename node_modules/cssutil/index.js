module.exports=(function(){

    var pub ={},
        less = require('less'),
        cleanCSS = require('clean-css').process,
        async = require('async'),
        fs = require('fs'),
        path = require('path'),
        regexTpl1 = /@import url\(([^)]*)\);?/gi,
        regexTpl2 = /^(https?:|\/).*/i;

    /**
     * Convert a relative path to the absolute one referring to another absolute file path
     * @param {String} relativePath e.g ../../xx.css
     * @param {String} refAbsPath e.g e:\foo\bar\yy.css 
     */
    var convertToAbsFilePath = function(relativePath,refAbsPath){

        if (!relativePath||relativePath.length===0) {
            return null;
        };

        var flags1 = refAbsPath.substr(0,refAbsPath.lastIndexOf('\\')).split('\\'),
            flags2 = relativePath.split('/');

        flags1 = flags1[0]===""?[]:flags1;

        // having the same parent path!
        if (flags2.length===1||flags2[0]!=='..') {
            return flags1.concat(flags2).join('\\');
        };

        while(flags2[0]==='..'){
            flags2.shift();
            flags1.pop();
        };
        return flags1.concat(flags2).join('\\');
    };

    /**
     * merge imported css files
     * @param {String} file css file path
     * @param {Function} cbk callback
     */
    pub.merge = function(file,cbk){

        //ignore those imported url with absolute path!
        if ( regexTpl2.test(file) ) {
            return cbk(null,file);
        };

        fs.readFile(file, 'utf8', function(err,txt){
            if (err) {
                return cbk(null,'/*%,$*/'.replace('%',file).replace('$',err.toString()));
            };
            var importedFiles = [],
                importedFilePathes = [],
                importedTxtes = [],
                match;
            while( (match=regexTpl1.exec(txt)) ){
                importedFiles.push(match[1].replace(/'/g,'').replace(/"/g,''));
                importedTxtes.push(match[0]);
            };
            var len = importedFiles.length;
            //No imported url!
            if (len===0) {
                return cbk(null,txt);
            };
            // Get the full file pathes
            var url = null;
            for (var i = 0; i < len; i++) {
                url = importedFiles[i];
                //ignore those imported url with absolute path!
                if ( regexTpl2.test(url) ) {
                    importedFilePathes.push(url);
                    continue;
                };
                //get the full path
                importedFilePathes.push(convertToAbsFilePath(url,file));
            };
            async.map(
                importedFilePathes,
                function process(file1, cbk1) {
                    pub.merge(file1,cbk1);
                },
                function complete(err1, files1) {
                    if (err1) { return cbk(err1); }

                    for(var i=0;i<len;i++){
                        //ignore those imported url with absolute path!
                        if (files1[i]===importedFilePathes[i]) {
                            continue;
                        };
                        txt = txt.replace(importedTxtes[i],'/*S-%*/\r\n$\r\n/*E-%*/'.replace(/%/g,importedFilePathes[i]).replace('$',files1[i]));
                    };

                    cbk(null,txt);
                }
            );
        });
    };

    /**
     * building files
     * @param {Array} files array of files to be build!
     * @param {Object} options build configuration
     * @param {Function} cbk callback
     */
    pub.build = function(files, opts, cbk) {
        if (typeof opts === 'function') {
            cbk = opts;
            opts = {};
        }
        opts = opts || {};

        async.map(
            files,
            function process(file, cbk1) {
                if (path.extname(file).toLowerCase() === '.less') {
                    pub.buildLess(file, opts, cbk1);
                } else {
                    //fs.readFile(file, 'utf8', cbk1);
                    pub.merge(file,cbk1);
                }
            },
            function complete(err, files1) {
                if (err) { return cbk(err); }

                var src = files1.join('\n');
                if (opts.minify !== false) {
                    src = cleanCSS(src);
                }
                cbk(null,src);
            }
        );
    };
    /**
     * compress css raw text
     * @param {String} cssTxt css raw text
     */
    pub.compress = function(cssTxt){
        cssTxt = cleanCSS(cssTxt);
        return cssTxt;
    };
    /**
     * build less file
     * @param {String} file less file path
     * @param {Object} options build configuration
     * @param {Function} cbk callback
     */
    pub.buildLess = function(file, opts, cbk) {
        fs.readFile(file, 'utf8', function(err, src) {
            if (err) { return cbk(err); }

            var paths = [path.dirname(file)];
            if (opts.paths) {
                paths = paths.concat(opts.paths);
            }

            var parser = new less.Parser({
                paths: paths,
                filename: file
            });

            parser.parse(src, function(err, tree) {
                if (err) { return cbk(err); }

                var css;
                try {
                    css = tree.toCSS();
                } catch (err1) {
                    return cbk(err1);
                }

                cbk(null,css);
            });
        });
    };

    return pub;
})();