/**
 * 指定的字符串是否具有指定的后缀
 * @public
 * @function
 * @name JF#endsWidth
 * @param {String} str 指定的字符串
 * @param {String} suffix 指定的后缀
 */
J.endsWidth = function(str,suffix){
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
};