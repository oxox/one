J(function($,p,pub){
	pub.id="dataWorkspace";
	p.tName = 'Workspace';
    // add autoincrement by Enix
	// CREATE TABLE if not exists test (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name)
	pub.fields = [
		'id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT',
		'name',
		'rootPath',
		'remotePath',
		'ftpId',
		'ftpPort',
		'ftpUser',
		'ftpPwd',
		'userName',
		'createdAt',
		'modifiedAt'
	];

	var $win = $(window);

	p.sql={
		createTable:'',
		getAll:'',
		init:function(){
			this.createTable = J.data.getTableSQL(p.tName,pub.fields);
			this.getAll = J.data.getSelectSQL(p.tName);
		}
	};
	p.M = {
		item0:{
            // remove id (id is autoincrement) by Enix
            // modify test case
			name:'测试',
			rootPath:'E:\\icson\\',
			remotePath:'/test/ic/',
			ftpId:'1.1.1.1',
			ftpPort:'1234',
			ftpUser:'uName',
			ftpPwd:'uPwd',
			userName:J.base.userName,
			createdAt:new Date().toString('yyyy-MM-dd HH:mm:ss'),
			modifiedAt:new Date().toString('yyyy-MM-dd HH:mm:ss')
		}
	};
	p.C = {
		initTable:function(){

			J.db.transaction(function(tx){
				//init table structure
				tx.executeSql(p.sql.createTable,[],function(tx1){

					var sql = J.data.getInsertSQL(p.tName,p.M.item0),
						data = J.data.objectToArray(p.M.item0);
					//init dummy data
					tx1.executeSql(sql,data,function(tx2){
						//everything goes well
						$win.trigger(pub.id+'OnDataInited');
					},function(tx2,err){
						console.log(err);
						alert('WebSQL Error When initializing dummy data for Workspace!');
					});
				});
				
			});
		},
		init:function(){
			//init table when the ini file is a new one
			$win.on(J.dataSetting.id+'OnLoaded',function(e,d){
				if (d.isOk) {
					if (d.isNew) {
						p.C.initTable();
					}else{
						//data had beened initialized
						$win.trigger(pub.id+'OnDataInited');
					};
				};
			});
		}
	};

	/**
	 * 添加记录
	 */
	pub.insert = function(item){

		J.db.transaction(function(tx){

			//删除id，因为id是自增长的！
			delete item.id;

			item.userName = process.env['USERNAME'];
			item.createdAt = item.modifiedAt = new Date().toString('yyyy-MM-dd HH:mm:ss');

			var sql = J.data.getInsertSQL(p.tName,item);

			tx.executeSql(sql,J.data.objectToArray(item),function(tx){
				$win.trigger(pub.id+'OnInserted',[item]);
			},function(tx,err){
				$win.trigger(pub.id+'OnInsertedError',[err]);
			});
			

		});
	};

	/**
	 * 根据rootPath字段获取记录
	 */
	pub.findByRootPath = function(rootPath,cbk){
		J.db.transaction(function(tx){

			var sql = J.data.getSelectSQL(p.tName,'rootPath = ?');

			tx.executeSql(sql,[rootPath],function(tx,results){

				$win.trigger(pub.id+'OnFindByRootPath',[results]);

				cbk && cbk(results);

			});

		});
	};

	/**
	 * 根据id自段获取记录
	 */
	pub.findById = function(id,cbk){
		J.db.transaction(function(tx){

			var sql = J.data.getSelectSQL(p.tName,'id = ?');

			tx.executeSql(sql,[id],function(tx,results){

				$win.trigger(pub.id+'OnFindById',[results]);

				cbk && cbk(results);

			});

		});
	};
	/**
	 * 删除记录
	 */
	pub.deleteById = function(id){
		J.db.transaction(function(tx){

			var sql = J.data.getDeleteSQL(p.tName,{'id':id});

			tx.executeSql(sql,[id],function(tx){

				$win.trigger(pub.id+'OnDeletedById',[id]);

			},function(tx,err){
				$win.trigger(pub.id+'OnDeletedByIdError',[id]);
			});

		});
	};

	/**
	 * 更新记录
	 */
	pub.update = function(item){
		
		J.db.transaction(function(tx){

			item.modifiedAt = new Date().toString('yyyy-MM-dd HH:mm:ss');

			var item1 = J.data.objectToArray(item,['id']),
				sql = J.data.getUpdateSQL(p.tName,item,'id');

			item1.push(item.id);

			tx.executeSql(sql,item1,function(tx){
				$win.trigger(pub.id+'OnUpdated',[item]);
			},function(tx,err){
				$win.trigger(pub.id+'OnUpdatedError',[err]);
			});

		});
	};

	/**
	 * 获取所有记录
	 */
	pub.getAll = function(){
		J.db.transaction(function(tx){

			tx.executeSql(p.sql.getAll,[],function(tx,results){

				var items = [],
					len = results.rows.length;
				if (len>0) {
					for (var i = len - 1; i >= 0; i--) {
						items.push(results.rows.item(i));
					};
				};

				$win.trigger(pub.id+'OnGetAll',[{'cnt':len,'items':items}]);

			},function(tx,err){
				$win.trigger(pub.id+'OnGetAllError',[err]);
			});

		});
	};
});
