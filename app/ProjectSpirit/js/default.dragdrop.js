J(function($,p,pub){
	pub.id="folderDragdrop";

	p.C = {
		_init:function(){
			// prevent default behavior from changing page on dropped file
			window.ondragover = function(e) { e.preventDefault(); return false };
			window.ondrop = function(e) { e.preventDefault(); return false };

			var holder = document.getElementById('bodyHome');
			holder.ondragover = function () { this.className = 'dragover'; return false; };
			holder.ondragend = function () { this.className = ''; return false; };
			holder.ondrop = function (e) {
				e.preventDefault();
				this.className = '';
				if (e.dataTransfer.files.length===0) {
					return false;
				};
				var filePath = e.dataTransfer.files[0].path;

				J.base.fs.lstat(filePath,function(err,stat){
					if (err) {
						J.alert.show('Error on reading path:'+filePath+'!'+err);
						return;
					};
					if (stat.isDirectory()) {
						J.home.addProject(filePath);
					}else{
						J.home.addProject(J.base.getFileRootPath(filePath));
					};
				});

				return false;
			};
		}
	};
});