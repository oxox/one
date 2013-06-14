/**
 * websql data api for the app
 * websql reference:http://html5-demos.appspot.com/static/html5storage/index.html
 * Note:physical db file path for node-webkit in win7 :C:\Users\xxxx\AppData\Local\node-webkit\databases
 * You can open the db file using software like sqlite expert
 * UserDataDir:var userDataDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']
 */
J(function($,p,pub){

	pub.id="data";
    var fs = require('fs-extra');

    pub.packageJson = fs.readJsonSync('package.json');
	pub.version = pub.packageJson.version;
	
	J.db = openDatabase(pub.packageJson.name,'1.0','db for '+pub.packageJson.name,4*1024*1024);
	J.dbLocal = localStorage;

	/**
	 * 获取当前工作空间
	 * @param {Array} wsList 工作空间json数组
	 */
	pub.getCurrentWorkspace = function(wsList){
		var item= J.dbLocal['CurrentWorkspace'];
		if (item) {
			item = JSON.parse(item);
		};
		if (!wsList || wsList.length==0) {
			return item;
		};

		if (!item) {
			item = wsList[0];
			pub.setCurrentWorkspace(item);
			return item;
		};

		var len = wsList.length;
		for (var i = len - 1; i >= 0; i--) {
			if (item.id == wsList[i].id) {
				item = wsList[i];
				pub.setCurrentWorkspace(item);
				break;
			};
		};

		return item;

	};
	/**
	 * 设置当前工作空间
	 * @param {Object} item 工作空间json对象
	 */
	pub.setCurrentWorkspace = function(item){
		J.dbLocal['CurrentWorkspace'] = JSON.stringify(item);
	};

	/**
	 * 生成insert的sql语句
	 * @param {string} tName 表名
	 * @param {Object} item 业务实体对象
	 */
	pub.getInsertSQL=function(tName,item){
		var sql = "INSERT INTO "+tName+'(',
			fields = [],
			properties = pub.objectPropertyToArray(item),
			cntFields = properties.length;

		sql += properties.join(',');
		sql += ') VALUES ('
		for (var i = cntFields - 1; i >= 0; i--) {
			fields.push('?');
		};
		sql+=fields.join(',');
		sql+=')';

		console.log(sql);

		return sql;

	};
	/**
	 * 生成delete的sql语句
	 * @param {string} tName 表名
	 * @param {Object} item 条件对象
	 */
	pub.getDeleteSQL=function(tName,item){
		var sql = "DELETE FROM "+tName+' WHERE ',
			properties = pub.objectPropertyToArray(item);

		sql += properties.join(' =? AND');
		sql += ' =?';

		console.log(sql);

		return sql;

	};
	/**
	 * 生成update的语句
	 * @param {string} tName 表名
	 * @param {Object} item 业务实体的json对象
	 * @param {string} primaryKey 主键 
	 */
	pub.getUpdateSQL = function(tName,item,primaryKey){
		var fields = pub.objectPropertyToArray(item,[primaryKey]),
			sql = 'UPDATE '+tName +' SET '+fields.join(' = ?, ')+'= ? WHERE '+primaryKey+' = ?';
		return sql;

	};
	/**
	 * 生成createTable的语句
	 * @param {string} tName 表名
	 * @param {Array} fields 字段配置对象数组
	 */
	pub.getTableSQL = function(tName,fields){
		var sql = 'CREATE TABLE IF NOT EXISTS '+tName +'('+fields.join(',')+')';
		return sql;
	};
	/**
	 * 生成查询SQL语句
	 * @param {string} tName 表名
	 * @param {string} filterSql 条件语句
	 */
	pub.getSelectSQL = function(tName,filterSql){
		var sql = 'SELECT * FROM '+tName+(filterSql?' WHERE '+filterSql:'');
		return sql;
	};
	/**
	 * 将列举对象转换成数组
	 * @param {Object} obj json object
	 * @param {Array} ignoreProperties 忽略的属性
	 */
	pub.objectToArray = function(obj,ignoreProperties){
		var retVal = [],
			ignoreProperties = ignoreProperties ||[];
		for (var c in obj) {
			if ($.inArray(c,ignoreProperties)==-1) {
				retVal.push(obj[c]);
			}
		};
		return retVal;
	};

	/**
	 * 将列举对象的属性转换成数组
	 * @param {Object} obj json object
	 * @param {Array} ignoreProperties 忽略的属性
	 */
	pub.objectPropertyToArray = function(obj,ignoreProperties){
		var retVal = [],
			ignoreProperties = ignoreProperties ||[];
		for (var c in obj) {
			if ($.inArray(c,ignoreProperties)==-1) {
				retVal.push(c);
			};
		};
		return retVal;
	};

    /**
     * 根据单个路径生成各类文件的路径
     *
     * @param {Object} path 路径对象，可以根据需要将零散的子路径传进来
     **/
    pub.createDirs = function (path) {
        var types = ['html', 'css', 'img', 'psd'] ;
        for (var i = 0, k = null; k = types[i] ; i++ ) {
            fs.mkdir(path.rootPath + k + '\\' + path.name, 0777, function () {
                console.log('mkdir ok') ;
            }) ;
        }
    };

    /**
     * 生成模版文件(html,css)
     *
     * @param {Object} path 路径对象，包含跟路径，当前目录名称
     **/
    pub.createInitFile = function (path) {
        // 定义模版文件路径
        var template = [
            {'type': 'html', 'path': 'html\\common\\temple.html' },
            {'type': 'css', 'path': 'css\\common\\temple.css' }
        ];

        for (var i = 0, k = null; k = template[i] ; i++ ) {
            (function (k) {
                var srcPath = path.rootPath + k.path ;
                fs.exists(srcPath, function (exists) {
                    if (exists) {
                        var targetPath = path.rootPath + k.type + '\\' + path.name + '\\' + 'index.' + k.type;
                        fs.copy(srcPath, targetPath, function (err) {
                            if (err) {
                                console.log(err) ;
                            }
                        });
                    }else {
                        console.log('模板文件不存在，请尝试更新SVN') ;
                    }
                });
            })(k);
        }
    };
});
