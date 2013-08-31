/**
* 简单的html模板解析方法
* @public
* @function
* @name J#evalTpl
* @example
*	var str="<a href=/u/@{uid}>@{username}</a>",
*		data={uid:1,username:'levin'};
*	alert(J.evalTpl(str,data));
*	//提示信息为："<a href=/u/1>levin</a>"
* @param {string} str html模板，字段用%包含
* @param {Object} data json数据
* @param {Boolean} alternative old-fashion template style like %xxx%
*/
J.evalTpl = function (str, data,alternative) {
	var result;
	var patt = new RegExp(alternative?"%([a-zA-z0-9]+)%":"@{([a-zA-z0-9]+)}");
	while ((result = patt.exec(str)) != null) {
		var v = data[result[1]] || '';
		str = str.replace(new RegExp(result[0], "g"), v);
	};
	return str;
};