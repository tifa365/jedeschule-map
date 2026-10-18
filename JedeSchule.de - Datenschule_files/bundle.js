/*! jqlite 2015-11-10 */
!function(a,b){var c=b(a);"object"==typeof module&&"object"==typeof exports?module.exports=c:("function"==typeof define?define("jqlite",function(){return c}):"function"==typeof angular?angular.module("jqlite",[]).constant("jqlite",c):a.jqlite=c,a.$||(a.$=c))}(this,function(a,b){"use strict";function c(a){return function(b){return typeof b===a}}function d(a){return function(b){return b instanceof a}}function e(a,b,c){if(void 0!==c){if(a.$$jqListeners&&a.$$jqListeners[b]){var d=v(a.$$jqListeners[b],function(a){return a.srcListener===c});d.found&&(a.$$jqListeners[b].splice(d.index,1),D(a,b,d.found))}}else if(a.$$jqListeners&&a.$$jqListeners[b]){for(var e=0,f=a.$$jqListeners[b].length;f>e;e++)D(a,b,a.$$jqListeners[b][e]);a.$$jqListeners[b]=[]}}function f(a,b,c,d){var f=d?function(d){c.apply(a,[d].concat(d.args)),e(a,b,c)}:function(b){c.apply(a,[b].concat(b.args))};f.srcListener=c,a.$$jqListeners=a.$$jqListeners||{},a.$$jqListeners[b]=a.$$jqListeners[b]||[],a.$$jqListeners[b].push(f),C(a,b,f)}function g(a,b){for(var c=0,d=b.length;d>c;c++)a[c]=b[c];return a.length+=d,a}function h(a,b){var c=a[0];if("<"===c){z.innerHTML=a;var d=g(new l,z.children);return d}if(-1!==a.indexOf(" ")||-1!==a.indexOf(":"))return g(new l,b.querySelectorAll(a));if("#"===c){var e=b.getElementById(a.substr(1));if(e){var f=new l;return f[0]=e,f.length=1,f}return g(new l,b.querySelectorAll(a))}return"."===c?g(new l,b.getElementsByClassName(a.substr(1))):E.test(a)?g(new l,b.getElementsByTagName(a)):g(new l,b.querySelectorAll(a))}function i(a){if(a instanceof l)return a;if(t(a)||a instanceof NodeList||a instanceof HTMLCollection)return g(new l,a);if(a===window||a===document||a instanceof HTMLElement||a instanceof Element||u(a)){var b=new l;return b[0]=a,b.length=1,b}if(q(a))k(a);else if(void 0===a)return new l}function j(a,b){return r(a)?h(a,b||document):i(a)}function k(a){q(a)&&(/loaded|complete/.test(document.readyState)?a():F(a))}function l(){}function m(a){for(var b=a.filter(function(){return this.___found___?!1:(this.___found___=!0,!0)}),c=0,d=b.length;d>c;c++)delete b[c].___found___;return b}function n(a,b,c,d,e){"string"==typeof c&&(c=n.times[c]),d=d||"linear";for(var f=b?0:1,g=b?1:0,h=0,i=a.length;i>h;h++)a[h].style.opacity=f;return setTimeout(function(){for(var b=0,e=a.length;e>b;b++)a[b].$$jqliteTransition=void 0===a[b].$$jqliteTransition?a[b].style[G]||"":a[b].$$jqliteTransition,a[b].style[G]="opacity "+c+"ms "+d,a[b].style.opacity=g},20),setTimeout(function(){for(var b=0,c=a.length;c>b;b++)a[b].style.opacity="",a[b].style[G]=a[b].$$jqliteTransition;e.call(a)},c),a}function o(a,b,c,d){var e,g;if("string"==typeof b)if(/\s/.test(b))b=b.split(/\s+/g);else{if(!q(c))throw"listener needs to be a function";for(e=0,g=a.length;g>e;e++)f(a[e],b,c,d)}if(t(b))for(e=0,g=b.length;g>e;e++)o(a,b[e],c,d);else if(p(b))for(e in b)o(a,e,b[e],d);return a}var p=c("object"),q=c("function"),r=c("string"),s=c("number"),t=Array.isArray||d(Array),u=(d(Date),d(RegExp),function(a){return a&&1===a.nodeType}),v=function(a,b){if(!(b instanceof Function)){var c=b;b=function(a){return a===c}}for(var d=0,e=a.length;e>d;d++)if(b(a[d]))return{index:d,found:a[d]};return{index:-1}};Element.prototype.matchesSelector||(Element.prototype.matchesSelector=Element.prototype.webkitMatchesSelector||Element.prototype.mozMatchesSelector||Element.prototype.msMatchesSelector||Element.prototype.oMatchesSelector);var w=document.createEvent?function(a,b,c,d){var e=document.createEvent("HTMLEvents");return e.data=d,e.args=c,e.initEvent(b,!0,!0),a.dispatchEvent(e),e}:function(a,b,c,d){var e=document.createEventObject();return e.data=d,e.args=c,a.fireEvent("on"+b,e),e},x=eval,y=function(){},z=document.createElement("div"),A=document.createElement("div"),B=!!z.classList;if(!z.addEventListener&&!document.body.attachEvent)throw"Browser not compatible with element events";var C=z.addEventListener?function(a,b,c){return a.addEventListener(b,c,!1)}:function(a,b,c){return a.attachEvent("on"+b,c)},D=z.removeEventListener?function(a,b,c){return a.removeEventListener(b,c,!1)}:function(a,b,c){return a.detachEvent("on"+b,c)},E=/^[a-z-_]$/i;j.noop=y;var F=window.addEventListener?function(a){window.addEventListener("load",a,!1)}:function(a){window.attachEvent("onload",a)};l.prototype=[],l.prototype.ready=k,j.fn=l.prototype,l.prototype.get=function(a){return a?this[a]:this},l.prototype.eq=function(a){if(!s(a))throw"number required";var b=0>a?this[this.length-a]:this[a],c=new l;return b&&(c[0]=b,c.length=1),c},l.prototype.first=function(){var a=new l;return this.length&&(a[0]=this[0],a.length=1),a},l.prototype.last=function(){var a=new l;return this.length&&(a[0]=this[this.length-1],a.length=1),a},l.prototype.find=function(a){var b,c,d,e=this,f=new l;if(/^\s*>/.test(a)&&(a=a.replace(/^\s*>\s*([^\s]*)\s*/,function(a,b){return e=e.children(b),""}),!a))return e;if(1===e.length){for(b=e[0].querySelectorAll(a),c=0,d=b.length;d>c;c++)f[c]=b[c];f.length=d}else if(e.length>1){var g,h;for(c=0,d=e.length;d>c;c++)for(b=e[c].querySelectorAll(a),g=0,h=b.length;h>g;g++)b.item(g).___found___||(f[f.length]=b.item(g),f.length++,b.item(g).___found___=!0);for(c=0,d=f.length;d>c;c++)delete f[c].___found___}return f},l.prototype.$=l.prototype.find,l.prototype.add=function(a,b){var c,d,e=j(a,b),f=new l,g=this.length;for(c=0,d=this.length;d>c;c++)f[c]=this[c],f[c].___found___=!0;for(c=0,d=e.length;d>c;c++)e[c].___found___||(f[g]=e[c],g++);for(f.length=g,c=0,d=this.length;d>c;c++)delete f[c].___found___;return f},l.prototype.each=function(a){if(q(a))for(var b=0,c=this.length;c>b;b++)a.call(this[b],b,this[b]);return this},l.prototype.empty=function(){for(var a,b,c=0,d=this.length;d>c;c++)for(a=this[c],b=a.firstChild;b;)a.removeChild(b),b=a.firstChild;return this},l.prototype.filter=function(a){var b,c,d,e=new l;if(q(a))for(c=0,d=this.length,b;d>c;c++)b=this[c],a.call(b,c,b)&&e.push(b);else if(r(a))for(c=0,d=this.length,b;d>c;c++)b=this[c],Element.prototype.matchesSelector.call(b,a)&&e.push(b);return e},l.prototype.closest=function(a){var b,c,d,e=new l;if(!a)return this;if(1===this.length)for(d=this[0].parentElement;d;){if(d.matchesSelector(a)){e.push(d);break}d=d.parentElement}else if(this.length>1){for(b=0,c=this.length;c>b;b++)for(d=this[b].parentElement;d;){if(d.matchesSelector(a)){d.___found___||(d.___found___=!0,e.push(d));break}d=d.parentElement}for(b=0,c=e.length;c>b;b++)delete e[b].___found___}return e},l.prototype.children=z.children?function(a){for(var b=new l,c=0,d=this.length;d>c;c++)g(b,this[c].children);return a?b.filter(a):b}:function(a){var b=new l;return Array.prototype.forEach.call(this,function(a){for(a=a.firstElementChild||a.firstChild;a;)b[b.length]=a,a=a.nextElementSibling||a.nextSibling}),a?b.filter(a):b},l.prototype.contents=function(a){var b=new l;return Array.prototype.forEach.call(this,function(a){for(a=a.firstChild;a;)b[b.length]=a,a=a.nextSibling}),a?b.filter(a):b},l.prototype.clone=function(a,b){var c,d,e=new l;for(void 0===a&&(a=!0),c=0,d=this.length;d>c;c++)e[c]=this[c].cloneNode(a);return e.length=d,e},l.prototype.data=function(a,b){if(!this.length)return b?this:void 0;if(void 0===b){var c=this[0].$$jqliteData&&this[0].$$jqliteData[a];return void 0===c?(c=this.dataset(a),void 0===c?void 0:"{"===c.charAt(0)||"["===c.charAt(0)?JSON.parse(c):/^\d+$/.test(c)?Number(c):c):c}for(var d=0,e=this.length;e>d;d++)this[d].$$jqliteData=this[d].$$jqliteData||{},this[d].$$jqliteData[a]=b},l.prototype.removeData=function(a){for(var b=0,c=this.length;c>b;b++)this[b].$$jqliteData&&this[b].$$jqliteData[a]&&delete this[b].$$jqliteData[a];return this},l.prototype.dataset=z.dataset?function(a,b){var c,d;if(void 0===b)return void 0===a?this[0]?this[0].dataset:{}:(this[0]||{}).dataset[a];for(c=0,d=this.length;d>c;c++)this[c].dataset[a]=b;return this}:function(a,b){var c,d;if(void 0===b){var e=[];for(c=0,d=this.length;d>c;c++)e.push(this[c].getAttribute("data-"+a));return(this[0]||{getAttribute:function(){return!1}}).getAttribute(a)}for(c=0,d=this.length;d>c;c++)this[c].setAttribute("data-"+a,b)},l.prototype.removeDataset=z.dataset?function(a){var b,c;if("string"==typeof a)for(b=0,c=this.length;c>b;b++)delete this[b].dataset[a];else if(t(a))for(b=0,c=a.length;c>b;b++)this.removeData(a[b]);return this}:function(a){var b,c;if("string"==typeof a)for(b=0,c=this.length;c>b;b++)this[b].removeAttribute("data-"+a);else if(t(a))for(b=0,c=a.length;c>b;b++)this.removeData(a[b]);return this},l.prototype.attr=function(a,b){var c,d;if(q(b))for(c=0,d=this.length;d>c;c++)this[c].setAttribute(a,b(c,this[c].getAttribute(a)));else if(void 0!==b)for(c=0,d=this.length;d>c;c++)this[c].setAttribute(a,b);else if(this[0])return this[0].getAttribute(a);return this},l.prototype.removeAttr=function(a){for(var b=0,c=this.length;c>b;b++)this[b].removeAttribute(a);return this},l.prototype.prop=function(a,b){var c,d;if(q(b))for(c=0,d=this.length;d>c;c++)this[c][a]=b(c,this[c][a]);else if(void 0!==b)for(c=0,d=this.length;d>c;c++)this[c][a]=b;else if(this[0])return this[0][a];return this},l.prototype.val=function(a){var b;if(void 0===a)return b=this[0],"select"===b.nodeName?b.options[b.selectedIndex].value:this[0].value||this[0].getAttribute("value");for(var c=0,d=this.length;d>c;c++)if("select"===this[c].nodeName){b=this[c];for(var e=0,f=b.options.length;f>e;e++)if(b.options[e].value===a){b.options[e].selected=!0;break}}else void 0!==this[c].value?this[c].value=a:this[c].setAttribute("value",a);return this},l.prototype.addClass=B?function(a){if(a.indexOf(" ")>=0){var b=this;a.split(" ").forEach(function(a){b.addClass(a)})}else for(var c=0,d=this.length;d>c;c++)this[c].classList.add(a);return this}:function(a){for(var b=new RegExp("\\b"+(a||"")+"\\b",""),c=0,d=this.length;d>c;c++)this[c].className=this[c].className.replace(b,"")+" "+a;return this},l.prototype.removeClass=B?function(a){if(a.indexOf(" ")>=0){var b=$(this);a.split(" ").forEach(function(a){b.removeClass(a)})}else for(var c=0,d=this.length;d>c;c++)this[c].classList.remove(a);return this}:function(a){for(var b=new RegExp("(\\b|\\s+)"+a+"\\b","g"),c=0,d=this.length;d>c;c++)this[c].className=this[c].className.replace(b,"");return this},l.prototype.hasClass=B?function(a){for(var b=0,c=this.length;c>b;b++)if(this[b].classList.contains(a))return!0;return!1}:function(a){for(var b=new RegExp("\\b"+(a||"")+"\\b",""),c=0,d=this.length;d>c;c++)if(b.test(this[c].className))return!0;return!1},l.prototype.toggleClass=B?function(a,b){var c,d;if(void 0===b)for(c=0,d=this.length;d>c;c++)this[c].classList.item(a)?this[c].classList.remove(a):this[c].classList.add(a);else if(b)for(c=0,d=this.length;d>c;c++)this[c].classList.add(a);else for(c=0,d=this.length;d>c;c++)this[c].classList.remove(a);return this}:function(a,b){var c,d,e=new RegExp("\\b"+(a||"")+"\\b",""),f=new RegExp("\\b"+(a||"")+"\\b",""),g=new RegExp("(\\b|\\s+)"+a+"\\b","g");if(void 0===a)for(c=0,d=this.length;d>c;c++)e.test(this[c].className)?this[c].className=this[c].className.replace(g,""):this[c].className=this[c].className.replace(f,"")+" "+a;else if(b)for(c=0,d=this.length;d>c;c++)this[c].className=this[c].className.replace(f,"")+" "+a;else for(c=0,d=this.length;d>c;c++)this[c].className=this[c].className.replace(g,"");return this},l.prototype.append=function(a){var b,c,d,e,f,g,h=$(a);for(h.remove(),c=0,e=this.length;e>c;c++)for(b=c?h.clone(!0):h,g=this[c],d=0,f=b.length;f>d;d++)g.appendChild(b[d]);return this},l.prototype.appendTo=function(a){$(a).append(this)},l.prototype.prepend=function(a){var b,c,d,e,f,g,h,i=$(a);for(i.remove(),c=0,e=this.length;e>c;c++)if(b=c?i.clone(!0):i,g=this[c],h=g.firstChild)for(d=0,f=b.length;f>d;d++)g.insertBefore(b[d],h);else for(d=0,f=b.length;f>d;d++)g.appendChild(b[d]);return this},l.prototype.after=function(a){var b,c,d,e,f,g,h,i=$(a);for(i.remove(),c=0,e=this.length;e>c;c++)if(b=c?i.clone(!0):i,h=this[c].parentElement||this[c].parentNode,g=this[c].nextElementSibling||this[c].nextSibling)for(d=0,f=b.length;f>d;d++)h.insertBefore(b[d],g),g=b[d];else for(d=0,f=b.length;f>d;d++)h.appendChild(b[d]);return this},l.prototype.replaceWith=function(a){var b,c,d,e,f,g,h,i,j=$(a);for(j.remove(),c=0,e=this.length;e>c;c++)if(b=c?j.clone(!0):j,g=this[c],h=g.parentElement||parentNode,h.replaceChild(b[0],g),b[1])for(i=b[0],d=1,f=b.length;f>d;d++)h.insertBefore(b[d],i);return this},l.prototype.wrap=function(a){var b,c,d,e,f,g,h,i=$(a);for(i.remove(),c=0,e=this.length;e>c;c++){if(b=c?i.clone(!0):i,h=this[c].parentElement||this[c].parentNode,g=this[c].nextElementSibling||this[c].nextSibling)for(d=0,f=b.length;f>d;d++)h.insertBefore(b[d],g),g=b[d];else for(d=0,f=b.length;f>d;d++)h.appendChild(b[d]);if(b[0]){for(g=b[0];g.firstElementChild;)g=g.firstElementChild;g.appendChild(this[c])}}return this},l.prototype.next=function(a){for(var b,c=new l,d=0,e=this.length;e>d;d++)b=this[d].nextElementSibling,b&&c.push(b);return"string"==typeof a?c.filter(a):c},l.prototype.nextAll=function(a){for(var b,c=new l,d=0,e=this.length;e>d;d++)for(b=this[d].nextElementSibling;b;)c.push(b),b=b.nextElementSibling;return m("string"==typeof a?c.filter(a):c)},l.prototype.prev=function(a){for(var b,c=new l,d=0,e=this.length;e>d;d++)b=this[d].previousElementSibling,b&&c.push(b);return"string"==typeof a?c.filter(a):c},l.prototype.prevAll=function(a){for(var b,c=new l,d=0,e=this.length;e>d;d++)for(b=this[d].previousElementSibling;b;)c.push(b),b=b.previousElementSibling;return m("string"==typeof a?c.filter(a):c)},l.prototype.parent=function(a){for(var b,c=new l,d=0,e=this.length;e>d;d++)b=this.parentElement||this.parentNode,b&&c.push(this[d]);return"string"==typeof a?c.filter(a):c},l.prototype.remove=function(a){for(var b,c=a?this.filter(a):this,d=0,e=c.length;e>d;d++)b=c[d].parentElement||c[d].parentNode,b&&b.removeChild(c[d]);return this},l.prototype.detach=function(a){for(var b=a?this.filter(a):this,c=new l,d=0,e=b.length;e>d;d++)A.appendChild(b[d]),c.push(b[d]);return c},l.prototype.css=function(a,b){if(void 0!==b){var c,d;if(b=b instanceof Function?b():b instanceof Number?b+"px":b,"string"==typeof b&&/^\+=|\-=/.test(b))for(b="-"===b.charAt(0)?-parseFloat(b.substr(2)):parseFloat(b.substr(2)),c=0,d=this.length;d>c;c++)this[c].style[a]=parseFloat(this[c].style[a])+b+"px";else for(c=0,d=this.length;d>c;c++)this[c].style[a]=b;return this}if(a instanceof Object)for(var e in a)this.css(e,a[e]);else if(this[0])return this[0].style[a]||window.getComputedStyle(this[0])[a];return this};var G=void 0!==z.style.webkitTransition?"webkitTransition":void 0!==z.style.mozTransition?"mozTransition":void 0!==z.style.msTransition?"msTransition":void 0;n.times={slow:600,normal:400,fast:200},l.prototype.show=function(a,b,c){if(a){var d=this;return this.show(),n(d,!0,a,b,c||function(){})}for(var e=0,f=this.length;f>e;e++)this[e].style.display&&(this[e].style.display="");return this},l.prototype.hide=function(a,b,c){if(a)return n(this,!1,a,b,function(){this.hide(),c&&c.call(this)});for(var d=0,e=this.length;e>d;d++)this[d].style.display="none";return this},l.prototype.position=function(){return this.length?{top:this[0].offsetTop,left:this[0].offsetLeft}:void 0},l.prototype.offset=function(a){if(void 0===a){var b=this[0].getBoundingClientRect();return this.length&&{top:b.top+document.body.scrollTop,left:b.left}}if(a instanceof Function&&(a=a()),"object"==typeof a&&void 0!==a.top&&void 0!==a.left){for(var c=0,d=this.length;d>c;c++){this[c].style.position="relative";var e=this[c].getBoundingClientRect();this[c].style.top=a.top-e.top+parseFloat(this[c].style.top||0)-document.body.scrollTop+"px",this[c].style.left=a.left-e.left+parseFloat(this[c].style.left||0)+"px"}return a}},l.prototype.width=function(a,b){var c;if(a===!0){if(this.length)return c=this[0],c.offsetWidth}else if(void 0!==a)for(var d=0,e=this.length;e>d;d++)this[d].style.width=a;else if(this.length)return c=this[0],c.offsetWidth-parseFloat(window.getComputedStyle(c,null).getPropertyValue("border-left-width"))-parseFloat(window.getComputedStyle(c,null).getPropertyValue("padding-left"))-parseFloat(window.getComputedStyle(c,null).getPropertyValue("padding-right"))-parseFloat(window.getComputedStyle(c,null).getPropertyValue("border-right-width"))},l.prototype.height=function(a,b){var c;if(a===!0){if(this.length)return c=this[0],c.offsetHeight}else if(void 0!==a)for(var d=0,e=this.length;e>d;d++)this[d].style.height=a;else if(this.length)return c=this[0],c.offsetHeight-parseFloat(window.getComputedStyle(c,null).getPropertyValue("border-top-width"))-parseFloat(window.getComputedStyle(c,null).getPropertyValue("padding-top"))-parseFloat(window.getComputedStyle(c,null).getPropertyValue("padding-bottom"))-parseFloat(window.getComputedStyle(c,null).getPropertyValue("border-bottom-width"))},l.prototype.html=function(a){var b,c;if(void 0===a){for(a="",b=0,c=this.length;c>b;b++)a+=this[b].innerHTML;return a}if(a===!0){for(a="",b=0,c=this.length;c>b;b++)a+=this[b].outerHTML;return a}if(q(a)){for(b=0,c=this.length;c>b;b++)this[b].innerHTML=a(b,this[b].innerHTML);return this}for(b=0,c=this.length;c>b;b++)this[b].innerHTML=a;return this.find("script").each(function(){if(("text/javascript"==this.type||!this.type)&&this.textContent)try{x("(function(){ 'use strict';"+this.textContent+"})();")}catch(a){throw new Error(a.message)}}),this},l.prototype.text=function(a){var b,c;if(void 0===a){for(a="",b=0,c=this.length;c>b;b++)a+=this[b].textContent;return a}if(q(a)){for(b=0,c=this.length;c>b;b++)this[b].textContent=a(b,this[b].textContent);return this}for(b=0,c=this.length;c>b;b++)this[b].textContent=a;return this},l.prototype.on=function(a,b){return o(this,a,b)};var H={list:["click","focus","blur","submit"],define:function(a){l.prototype[a]=function(b){if(b)this.on(a,b);else for(var c=0,d=this.length;d>c;c++)this[c][a]();return this}},init:function(){for(var a=0,b=H.list.length;b>a;a++)H.define(H.list[a])}};return H.init(),l.prototype.once=function(a,b){return o(this,a,b,!0)},l.prototype.one=l.prototype.once,l.prototype.off=function(a,b){var c,d;if(/\s/.test(a)&&(a=a.split(/\s+/g)),a instanceof Array){for(c=0,d=this.length;d>c;c++)this.off(a[c],b);return this}if("string"!=typeof a||!q(b)&&void 0!==b)throw"bad arguments";for(c=0,d=this.length;d>c;c++)e(this[c],a,b);return this},l.prototype.trigger=function(a,b,c){if("string"!=typeof a)throw"bad arguments";for(var d=0,e=this.length;e>d;d++)w(this[d],a,b,c);return this},l.prototype.stopPropagation=function(){for(var a=0,b=arguments.length;b>a;a++)this.on(arguments[a],function(a){a.stopPropagation()})},["mouseenter","mouseleave"].forEach(function(a){l.prototype[a]=function(b){return this.on(a,b),this}}),l.prototype.hover=function(a,b){return this.mouseenter(a).mouseleave(b)},j.noConflict=function(){a.$===j&&delete a.$},j});
function ssc_init() {
	if (!document.body) return;
	var e = document.body;
	var t = document.documentElement;
	var n = window.innerHeight;
	var r = e.scrollHeight;

	ssc_root = document.compatMode.indexOf("CSS") >= 0 ? t : e;
	ssc_activeElement = e;
	ssc_initdone = true;

	if (top != self)
		ssc_frame = true;

	else if (r > n && (e.offsetHeight <= n || t.offsetHeight <= n)) {
		ssc_root.style.height = "auto";
		if (ssc_root.offsetHeight <= n) {
			var i = document.createElement("div");
			i.style.clear = "both";
			e.appendChild(i)
		}
	}

	if (!ssc_fixedback) {
		e.style.backgroundAttachment = "scroll";
		t.style.backgroundAttachment = "scroll"
	}

	if (ssc_keyboardsupport)
		ssc_addEvent("keydown", ssc_keydown);
}

function ssc_scrollArray(e, t, n, r) {
	r || (r = 1e3);
	ssc_directionCheck(t, n);
	ssc_que.push({
		x: t,
		y: n,
		lastX: t < 0 ? .99 : -.99,
		lastY: n < 0 ? .99 : -.99,
		start: +(new Date)
	});

	if (ssc_pending)
		return;

	var i = function () {
		var s = +(new Date);
		var o = 0;
		var u = 0;
		for (var a = 0; a < ssc_que.length; a++) {
			var f = ssc_que[a];
			var l = s - f.start;
			var c = l >= ssc_animtime;
			var h = c ? 1 : l / ssc_animtime;
			if (ssc_pulseAlgorithm) {
				h = ssc_pulse(h)
			}
			var p = f.x * h - f.lastX >> 0;
			var d = f.y * h - f.lastY >> 0;
			o += p;
			u += d;
			f.lastX += p;
			f.lastY += d;
			if (c) {
				ssc_que.splice(a, 1);
				a--
			}
		}
		if (t) {
			var v = e.scrollLeft;
			e.scrollLeft += o;
			if (o && e.scrollLeft === v) {
				t = 0
			}
		}
		if (n) {
			var m = e.scrollTop;
			e.scrollTop += u;
			if (u && e.scrollTop === m) {
				n = 0
			}
		}
		if (!t && !n)
			ssc_que = [];

		if (ssc_que.length)
			setTimeout(i, r / ssc_framerate + 1);
		else
			ssc_pending = false;
	};
	setTimeout(i, 0);
	ssc_pending = true
}

function ssc_wheel(e) {
	if (!ssc_initdone) {
		ssc_init()
	}
	var t = e.target;
	var n = ssc_overflowingAncestor(t);
	if (!n || e.defaultPrevented || ssc_isNodeName(ssc_activeElement, "embed") || ssc_isNodeName(t, "embed") && /\.pdf/i.test(t.src)) {
		return true
	}
	var r = e.wheelDeltaX || 0;
	var i = e.wheelDeltaY || 0;
	if (!r && !i)
		i = e.wheelDelta || 0;

	if (Math.abs(r) > 1.2)
		r *= ssc_stepsize / 120;

	if (Math.abs(i) > 1.2)
		i *= ssc_stepsize / 120;

	ssc_scrollArray(n, -r, -i);
	e.preventDefault()
}

function ssc_keydown(e) {
	var t = e.target;
	var n = e.ctrlKey || e.altKey || e.metaKey;

	if (/input|textarea|embed/i.test(t.nodeName) || t.isContentEditable || e.defaultPrevented || n)
		return true;

	if (ssc_isNodeName(t, "button") && e.keyCode === ssc_key.spacebar)
		return true;

	var r, i = 0,
		s = 0;
	var o = ssc_overflowingAncestor(ssc_activeElement);
	var u = o.clientHeight;

	if (o == document.body)
		u = window.innerHeight;

	switch (e.keyCode) {
		case ssc_key.up:
			s = -ssc_arrowscroll;
			break;
		case ssc_key.down:
			s = ssc_arrowscroll;
			break;
		case ssc_key.spacebar:
			r = e.shiftKey ? 1 : -1;
			s = -r * u * .9;
			break;
		case ssc_key.pageup:
			s = -u * .9;
			break;
		case ssc_key.pagedown:
			s = u * .9;
			break;
		case ssc_key.home:
			s = -o.scrollTop;
			break;
		case ssc_key.end:
			var a = o.scrollHeight - o.scrollTop - u;
			s = a > 0 ? a + 10 : 0;
			break;
		case ssc_key.left:
			i = -ssc_arrowscroll;
			break;
		case ssc_key.right:
			i = ssc_arrowscroll;
			break;
		default:
			return true
	}
	ssc_scrollArray(o, i, s);
	e.preventDefault()
}

function ssc_mousedown(e) {
	ssc_activeElement = e.target
}

function ssc_setCache(e, t) {
	for (var n = e.length; n--;) ssc_cache[ssc_uniqueID(e[n])] = t;
	return t
}

function ssc_overflowingAncestor(e) {
	var t = [];
	var n = ssc_root.scrollHeight;
	do {
		var r = ssc_cache[ssc_uniqueID(e)];
		if (r) {
			return ssc_setCache(t, r)
		}
		t.push(e);
		if (n === e.scrollHeight) {
			if (!ssc_frame || ssc_root.clientHeight + 10 < n) {
				return ssc_setCache(t, document.body)
			}
		} else if (e.clientHeight + 10 < e.scrollHeight) {
			overflow = getComputedStyle(e, "").getPropertyValue("overflow");
			if (overflow === "scroll" || overflow === "auto") {
				return ssc_setCache(t, e)
			}
		}
	}
	while (e = e.parentNode)
}

function ssc_addEvent(e, t, n) {
	window.addEventListener(e, t, n || false)
}

function ssc_removeEvent(e, t, n) {
	window.removeEventListener(e, t, n || false)
}

function ssc_isNodeName(e, t) {
	return e.nodeName.toLowerCase() === t.toLowerCase()
}

function ssc_directionCheck(e, t) {
	e = e > 0 ? 1 : -1;
	t = t > 0 ? 1 : -1;
	if (ssc_direction.x !== e || ssc_direction.y !== t) {
		ssc_direction.x = e;
		ssc_direction.y = t;
		ssc_que = []
	}
}

function ssc_pulse_(e) {
	var t, n, r;
	e = e * ssc_pulseScale;
	if (e < 1) {
		t = e - (1 - Math.exp(-e))
	} else {
		n = Math.exp(-1);
		e -= 1;
		r = 1 - Math.exp(-e);
		t = n + r * (1 - n)
	}
	return t * ssc_pulseNormalize
}

function ssc_pulse(e) {
	if (e >= 1) return 1;
	if (e <= 0) return 0;
	if (ssc_pulseNormalize == 1) {
		ssc_pulseNormalize /= ssc_pulse_(1)
	}
	return ssc_pulse_(e)
}

var ssc_framerate = 150;
var ssc_animtime = 500;
var ssc_stepsize = 150;
var ssc_pulseAlgorithm = true;
var ssc_pulseScale = 6;
var ssc_pulseNormalize = 1;
var ssc_keyboardsupport = true;
var ssc_arrowscroll = 50;
var ssc_frame = false;
var ssc_direction = {
	x: 0,
	y: 0
};
var ssc_initdone = false;
var ssc_fixedback = true;
var ssc_root = document.documentElement;
var ssc_activeElement;
var ssc_key = {
	left: 37,
	up: 38,
	right: 39,
	down: 40,
	spacebar: 32,
	pageup: 33,
	pagedown: 34,
	end: 35,
	home: 36
};
var ssc_que = [];
var ssc_pending = false;
var ssc_cache = {};

setInterval(function () {
	ssc_cache = {}
}, 10 * 1e3);

var ssc_uniqueID = function () {
	var e = 0;
	return function (t) {
		return t.ssc_uniqueID || (t.ssc_uniqueID = e++)
	}
}();

var ischrome = /chrome/.test(navigator.userAgent.toLowerCase());
if (ischrome) {
	ssc_addEvent("mousedown", ssc_mousedown);
	ssc_addEvent("mousewheel", ssc_wheel);
	ssc_addEvent("load", ssc_init)
}

$(document).ready(function () {

	var parallaxElements = [];

	function parallax(scrollTop) {
		parallaxElements.forEach(function (pe) {
			pe.elm.css('marginTop', ((pe.initialOffsetY - scrollTop) / pe.speed) + 'px');
		});
	}

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function scrollTop() {
		var doc = document.documentElement;
		return (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
	}

	function init() {
		// touch event check stolen from Modernizr
		var touchSupported = (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
		// if touch events are supported, tie our animation to the position to these events as well
		if (touchSupported) {
			$(window).on('touchmove', function (e) {
				parallax(e.currentTarget.scrollY);
			});
		}
		$(window).on('scroll', function (e) {
			parallax(scrollTop());
		});

		$('.parallax').each(function () {
			var $elm = $(this);
			parallaxElements.push({
				speed: $elm.data('speed') || getRandomInt(3, 6),
				elm: $elm,
				initialOffsetY: $elm.offset().top
			});
		});

		parallax(scrollTop());
	}

	init();
});

(function e(t, n, r) {
	function s(o, u) {
		if (!n[o]) {
			if (!t[o]) {
				var a = typeof require == "function" && require;
				if (!u && a)return a(o, !0);
				if (i)return i(o, !0);
				throw new Error("Cannot find module '" + o + "'")
			}
			var f = n[o] = {exports: {}};
			t[o][0].call(f.exports, function (e) {
				var n = t[o][1][e];
				return s(n ? n : e)
			}, f, f.exports, e, t, n, r)
		}
		return n[o].exports
	}

	var i = typeof require == "function" && require;
	for (var o = 0; o < r.length; o++)s(r[o]);
	return s
})({
	1: [function (require, module, exports) {
		'use strict';

		function fuzzysearch(needle, haystack) {
			var tlen = haystack.length;
			var qlen = needle.length;
			if (qlen > tlen) {
				return -1;
			}
			if (qlen === tlen) {
				return needle === haystack;
			}
			var r = -1;
			outer: for (var i = 0, j = 0; i < qlen; i++) {
				var nch = needle.charCodeAt(i);
				while (j < tlen) {
					if (haystack.charCodeAt(j++) === nch) {
						r = j;
						continue outer;
					}
				}
				return -1;
			}
			return r;
		}

		module.exports = fuzzysearch;

	}, {}], 2: [function (require, module, exports) {
		'use strict'
		module.exports = {
			load: load
		}

		function load(location, callback) {
			var xhr = getXHR()
			xhr.open('GET', location, true)
			xhr.onreadystatechange = createStateChangeListener(xhr, callback)
			xhr.send()
		}

		function createStateChangeListener(xhr, callback) {
			return function () {
				if (xhr.readyState === 4 && xhr.status === 200) {
					try {
						callback(null, JSON.parse(xhr.responseText))
					} catch (err) {
						callback(err, null)
					}
				}
			}
		}

		function getXHR() {
			return (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP')
		}

	}, {}], 3: [function (require, module, exports) {
		'use strict'
		module.exports = function OptionsValidator(params) {
			if (!validateParams(params)) {
				throw new Error('-- OptionsValidator: required options missing')
			}
			if (!(this instanceof OptionsValidator)) {
				return new OptionsValidator(params)
			}

			var requiredOptions = params.required

			this.getRequiredOptions = function () {
				return requiredOptions
			}

			this.validate = function (parameters) {
				var errors = []
				requiredOptions.forEach(function (requiredOptionName) {
					if (parameters[requiredOptionName] === undefined) {
						errors.push(requiredOptionName)
					}
				})
				return errors
			}

			function validateParams(params) {
				if (!params) {
					return false
				}
				return params.required !== undefined && params.required instanceof Array
			}
		}
	}, {}], 4: [function (require, module, exports) {
		'use strict'
		module.exports = {
			put: put,
			clear: clear,
			get: get,
			search: search,
			setOptions: setOptions
		}

		var FuzzySearchStrategy = require('./SearchStrategies/FuzzySearchStrategy')
		var LiteralSearchStrategy = require('./SearchStrategies/LiteralSearchStrategy')

		var data = []
		var opt = {}
		opt.fuzzy = false
		opt.limit = 10
		opt.searchStrategy = opt.fuzzy ? FuzzySearchStrategy : LiteralSearchStrategy


		function put(data) {
			if (isObject(data)) {
				return addObject(data);
			}
			if (isArray(data)) {
				return addArray(data);
			}
			return undefined;
		}

		function clear() {
			data.length = 0;
			return data;
		}

		function get() {
			return data;
		}


		function isObject(obj) {
			return !!obj && Object.prototype.toString.call(obj) === '[object Object]';
		}

		function isArray(obj) {
			return !!obj && Object.prototype.toString.call(obj) === '[object Array]';
		}

		function addObject(_data) {
			data.push(_data)
			return data
		}

		function addArray(_data) {
			var added = []
			for (var i = 0; i < _data.length; i++) {
				if (isObject(_data[i])) {
					added.push(addObject(_data[i]))
				}
			}
			return added
		}

		function search(crit) {
			if (!crit) {
				return []
			}
			return findMatches(data, crit, opt.searchStrategy, opt)
		}

		function setOptions(_opt) {
			opt = _opt || {};
			opt.fuzzy = _opt.fuzzy || false;
			opt.limit = _opt.limit || 10;
			opt.searchStrategy = _opt.fuzzy ? FuzzySearchStrategy : LiteralSearchStrategy;
		}

		function findMatches(data, crit, strategy, opt) {
			var matches = [];
			for (var i = 0; i < data.length && matches.length < opt.limit; i++) {
				var match = findMatchesInObject(data[i], crit, strategy, opt);
				if (match) {
					matches.push(match)
				}
			}
			return matches
		}

		function findMatchesInObject(obj, crit, strategy, opt) {
			for (var key in obj) {
				if (!isExcluded(obj[key], opt.exclude)) {
					var r = strategy.matches(obj[key], crit);
					if (r >= 0) {
						var excerpt_before = obj[key].slice(r - 40, r).trim();
						if (excerpt_before.length > 0) excerpt_before = '...' + excerpt_before;
						var excerpt_after = obj[key].slice(r + crit.length, r + crit.length + 40).trim();
						if (excerpt_after.length > 0) excerpt_after = excerpt_after + '...';
						var excerpt = obj[key].slice(r, r + crit.length);
						if (excerpt.length === 0) obj.excerpt = '';
						else obj.excerpt = excerpt_before + ' <b>' + excerpt + '</b> ' + excerpt_after;
						obj.found = opt.keyNames ? opt.keyNames[key] || key : key;
						return obj;
					}
				}
			}
		}

		function isExcluded(term, excludedTerms) {
			var excluded = false
			excludedTerms = excludedTerms || [];
			for (var i = 0; i < excludedTerms.length; i++) {
				var excludedTerm = excludedTerms[i];
				if (!excluded && new RegExp(term).test(excludedTerm)) {
					excluded = true
				}
			}
			return excluded
		}

	}, {"./SearchStrategies/FuzzySearchStrategy": 5, "./SearchStrategies/LiteralSearchStrategy": 6}], 5: [function (require, module, exports) {
		'use strict'
		var fuzzysearch = require('fuzzysearch')

		module.exports = new FuzzySearchStrategy()

		function FuzzySearchStrategy() {
			this.matches = function (string, crit) {
				return fuzzysearch(crit, string)
			}
		}

	}, {"fuzzysearch": 1}], 6: [function (require, module, exports) {
		'use strict'
		module.exports = new LiteralSearchStrategy()

		function LiteralSearchStrategy() {
			this.matches = function (string, crit) {
				if (typeof string !== 'string') {
					return false
				}
				string = string.trim();
				return string.toLowerCase().indexOf(crit.toLowerCase())
			}
		}

	}, {}], 7: [function (require, module, exports) {
		'use strict'
		module.exports = {
			compile: compile,
			setOptions: setOptions
		}

		var options = {}
		options.pattern = /\{(.*?)\}/g
		options.template = ''
		options.middleware = function () {
		}

		function setOptions(_options) {
			options.pattern = _options.pattern || options.pattern
			options.template = _options.template || options.template
			if (typeof _options.middleware === 'function') {
				options.middleware = _options.middleware
			}
		}

		function compile(data) {
			return options.template.replace(options.pattern, function (match, prop) {
				var value = options.middleware(prop, data[prop], options.template)
				if (value !== undefined) {
					return value
				}
				return data[prop] || match
			})
		}

	}, {}], 8: [function (require, module, exports) {
		;
		(function (window, document, undefined) {
			'use strict'

			var options = {
				searchInput: null,
				resultsContainer: null,
				keyNames: {},
				json: [],
				searchResultTemplate: '<li><a href="{url}" title="{desc}">{title}</a></li>',
				templateMiddleware: function () {
				},
				noResultsText: 'No results found',
				LoadingSearchText: 'Loading Search',
				limit: 10,
				fuzzy: false,
				exclude: []
			};

			var requiredOptions = ['searchInput', 'resultsContainer', 'json']

			var templater = require('./Templater');
			var repository = require('./Repository');
			var jsonLoader = require('./JSONLoader');
			var inited = false;
			var optionsValidator = require('./OptionsValidator')({
				required: requiredOptions
			})
			var utils = require('./utils')

			/*
			 Public API
			 */
			window.SimpleJekyllSearch = function SimpleJekyllSearch(_options) {
				var errors = optionsValidator.validate(_options)
				if (errors.length > 0) {
					throwError('You must specify the following required options: ' + requiredOptions)
				}
				options = utils.merge(options, _options);
				templater.setOptions({
					template: options.searchResultTemplate,
					middleware: options.templateMiddleware
				});
				repository.setOptions({
					fuzzy: options.fuzzy,
					limit: options.limit
				});
				registerInput()
			};

			// for backwards compatibility
			window.SimpleJekyllSearch.init = window.SimpleJekyllSearch

			if (typeof window.SimpleJekyllSearchInit === 'function') {
				window.SimpleJekyllSearchInit.call(this, window.SimpleJekyllSearch);
			}

			function search(query) {
				if (isValidQuery(query)) {
					render(repository.search(query));
				}
			}

			function initWithJSON(json) {
				repository.put(json)
			}

			function initWithURL(url, cb) {
				jsonLoader.load(url, function (err, json) {
					if (err) {
						throwError('failed to get JSON (' + url + ')' + err)
					}
					initWithJSON(json)
					emptyResultsContainer();
					cb();
				})
			}

			function emptyResultsContainer() {
				options.resultsContainer.innerHTML = ''
			}

			function appendToResultsContainer(text) {
				options.resultsContainer.innerHTML += text
			}

			function start(cb) {
				if (!inited) {
					inited = true;
					if (utils.isJSON(options.json)) {
						initWithJSON(options.json);
					} else {
						initWithURL(options.json, cb);
						emptyResultsContainer();
						return appendToResultsContainer(options.LoadingSearchText);
					}
				}
				cb();
			}

			function registerInput() {
				if (options.searchInput.value) {
					start(function () {
						search(options.searchInput.value);
					});
				}
				options.searchInput.addEventListener('keyup', function (e) {
					start(function () {
						var key = e.which;
						var query = e.target.value;
						if (isWhitelistedKey(key)) {
							emptyResultsContainer();
							search(query);
						}
					});
				})
			}

			function render(results) {
				if (results.length === 0) {
					return appendToResultsContainer(options.noResultsText)
				}
				for (var i = 0; i < results.length; i++) {
					results[i].found = options.keyNames[results[i].found] || results[i].found;
					appendToResultsContainer(templater.compile(results[i]))
				}
			}

			function isValidQuery(query) {
				return query && query.length > 0
			}

			function isWhitelistedKey(key) {
				return [13, 16, 20, 37, 38, 39, 40, 91].indexOf(key) === -1
			}

			function throwError(message) {
				throw new Error('SimpleJekyllSearch --- ' + message)
			}
		})(window, document);

	}, {"./JSONLoader": 2, "./OptionsValidator": 3, "./Repository": 4, "./Templater": 7, "./utils": 9}], 9: [function (require, module, exports) {
		'use strict'
		module.exports = {
			merge: merge,
			isJSON: isJSON
		};

		function merge(defaultParams, mergeParams) {
			var mergedOptions = {}
			for (var option in defaultParams) {
				mergedOptions[option] = defaultParams[option]
				if (mergeParams[option] !== undefined) {
					mergedOptions[option] = mergeParams[option]
				}
			}
			return mergedOptions
		}

		function isJSON(json) {
			try {
				return json instanceof Object && JSON.parse(JSON.stringify(json));

			} catch (e) {
				return false
			}
		}

	}, {}]
}, {}, [8]);
