J(function($,p,pub){
	var n_fs = require('fs');
	
	p.host = {
		V:{
			$hostList:$("#hostList"),
			show:function(){
				var data = p.host.M.hostData,
					tempTxt = "";

				for(var i = 0 ;i <data.length;i++){
					tempTxt = $.trim(data[i]);
					if (tempTxt.length==0) {
						continue;
					};
					this.$hostList.append('<li>'+tempTxt+'</li>');
				}
			}//show
		},
		M:{
		},
		C:{
			_onLoad:function(){
				this.readFile();
			},
			readFile : function(){
				n_fs.readFile(J.data.hostFile,function(err,data){
					if(err) {
						J.alert.show(err.toString(),{
							title:'Error on Loading Host File!'
						});
						return;
					}

					data = data.toString().split('\n');

					p.host.M.hostData = data;

					p.host.V.show();
					
					

				});
			
			}//readFile

		}
	};

	pub.id="detail";

});