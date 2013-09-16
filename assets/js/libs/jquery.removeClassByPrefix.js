/*
 * Remove classes that have given prefix
 * Example: 
 *   You have an element with classes "apple juiceSmall juiceBig banana"
 * You run:
 * $elem.removeClassByPrefix('juice');
 * The resulting classes are "apple banana"
 * NOTE: discussion of implementation techniques for this, including why simple RegExp with word boundaries isn't correct: 
 * http://stackoverflow.com/questions/57812/jquery-remove-all-classes-that-begin-with-a-certain-string#comment14232343_58533
 * https://gist.github.com/mamboer/6191743
*/
(function ( $ ) {
 
    $.fn.removeClassByPrefix = function (prefix) {
        this.each( function ( i, it ) {
            var classes = $.map(it.className.split(" "),function (item) {
               return (item===''||item.indexOf(prefix) === 0) ? null : item;
            });
            it.className = classes.join(" ");
        });
     
        return this;
    }
 
})( jQuery );