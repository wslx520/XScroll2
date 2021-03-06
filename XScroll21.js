﻿/*
	Javascript图片切换类：XScroll2
	版本：0.2
	作者：脚儿网/jo2.org
	使用说明：
	从任意序号跳转到任意序号，都只有一次滚动,不过会切换方向
	欢迎使用，欢迎转载，但请勿据为己有
	更新记录：
	2013/1/9:减少变量
*/
var _ = {
	id:function (id) {
		//this.id=id;
		return "string" == typeof id ? document.getElementById(id) : id;
	},
	Extend:function(defaults, news) {
		for (var property in news) {
			defaults[property] = news[property];
		}
		return defaults;
	},
	Bind:function(object, fn) {
		var args = Array.prototype.slice.call(arguments).slice(2);
		return function() {
			return fn.apply(object, args.concat(Array.prototype.slice.call(arguments)));
		}
	},
	On:(function(){
		return (window.addEventListener) ? function(eType,eFunc,eObj) {
			eObj.addEventListener(eType,eFunc,false);
		} : function(eType,eFunc,eObj) {
			eObj.attachEvent("on"+eType,eFunc);
		};
	})(),
	getCss:function(elm){
		return elm.currentStyle || document.defaultView.getComputedStyle(elm, null);
	},
	cutover:function(arr,cur,cls){
		for(var i=0,l=arr.length;i<l;i++){
			if(arr[i].className.indexOf(cls) != -1) {
				arr[i].className = arr[i].className.replace(cls,'');
			}
		}
		arr[cur].className = arr[cur].className.replace(/\s$/g,'') + ' ' + cls;
	},
	setCss:function(elm,css){	
		for(var c in css) { 
			elm.style[c] = css[c];
			c ==='float' && (elm.style.cssFloat = css[c]);
		}
	},
	setAlpha:(function(){ 		
		return (-[1,]) ? function (obj,alpha) {
				obj.style.opacity = alpha * 0.01;
			} : function(obj,alpha){
				obj.style.filter = "alpha(opacity=" + alpha + ")";
			};
	})()
}


var XScroll2 = function (elm,option) {
	return new XScroll2.main(elm,option);
}
XScroll2.main = function(elm,option) {
	this.slider = _.id(elm);
	this.items = this.slider.children;
	this.count = this.items.length;
	/* 初始化选项 */
	_.Extend(this.defaults,option);
	var drt = this.defaults.direct;
	this.direct = ['left','top'][drt % 2];
	//console.log(this.direct)
	this.step = this.defaults.step || (drt % 2 ? this.slider.offsetHeight : this.slider.offsetWidth);
	this.speed = Math.ceil(1000/this.defaults.fps);
	this.ing = this.defaults.ing;
	this.auto = this.defaults.auto;
	this.atBefore = this.defaults.atBefore;
	this.atEnd = this.defaults.atEnd;
	/* 页码翻页功能 */
	this.pager = _.id(this.defaults.pager);
	this.next = this.now = this._time = 0;
	/* 移动变量 */
	/* 初始化完毕 */
	
	this.init();	
}
XScroll2.prototype = {
	init:function(){
		var root = this,
			len = this.count,
			how = root.defaults.how,
			css = (how==0) ? {'position' : 'absolute'} : ((root.direct =='left') ? {'float' :"left"} : ''),
			sliderCss = (root.direct =='left') ? { 'position' : 'absolute','width' : (2*root.step+'px')} : {'position' : 'absolute','height' :(2*root.step+'px')};
		// console.log(css);	
		while (css && len-- > 0){
			_.setCss(this.items[len], css)
		}
		_.setCss(this.items[0],{zIndex:10,display:'block'});
		_.setCss(this.slider,sliderCss);
		this.auto && (this.timer = setTimeout(_.Bind(this,this.Next),this.defaults.auto)) ;
		_.On('mouseout',function(){
			root.Continue();
		},this.slider);
		_.On('mouseover',function(){
			root.Pause();
		},this.slider);
		// console.log(this.defaults.how);
		if(how == 0) this.Run = this.run();
		if(this.pager) {
			this.pages = this.pager.children;
			var	pl = this.pages.length,
				root = this,
				to;
			while(pl--){
				(function(i){
					_.On(root.defaults.event,
						function(){
							root.Pause(); 
							// if(i !== root.now) {
							to = setTimeout(function(){root.go(i)},root.defaults.past);
							// }
						},
						root.pages[i]);
					_.On('mouseout',
						function(){
							if(root.defaults.auto) root.Continue();
							clearTimeout(to);
						},
						root.pages[i]);	
				})(pl);
			}
		}
	},
	//默认参数
	defaults: {
		how: 0,
		direct: 0,
		auto: 0,
		event: 'mouseover',
		past: 0,
		fps: 50,
		ing: 500,
		atBefore: [],
		atEnd : [],
		Tween: easeInStrong
	},
	fix:function(){
		var i = this.count;
		while(i--) {
			if(i == this.now || i == this.next) {
				this.items[i].style.display = 'block';
			} else {
				this.items[i].style.display = 'none';
			}
		}
	},
	go:function (num) {
		(num != undefined) ? this.next = num : this.next=this.now+1;		
		(this.next>= this.count ) && (this.next = 0) || (this.next < 0) && (this.next = (this.count-1));
				
		if(this.now != this.next) {
			// console.log('goooooo');
			clearTimeout(this.timer);
			this._time = +new Date();
			this.moving = 1;
			//当前项为curS,下一项为nextS,谨记
			this.curS = this.items[this.now];
			this.nextS = this.items[this.next];
			this.fix();
			if(this.atBefore) {var l = this.atBefore.length; while(l--) {this.atBefore[l].call(this);}}
			this.Run.apply(this);
			if(this.pager)  { _.cutover(this.pages,this.next,'on')};
			this.now = this.next;
		}
		//this.defaults.how = Math.round(0+Math.random()*3);
	},
	run:function(elm,callback) {
		var op0=0,step = Math.round(100/this.speed), root = this;
		var fading = function  () {
			clearTimeout(this.timer);
			if((op0+=step) < 100){
				// console.log(root.curS);
				_.setAlpha(this.nextS,op0);
				_.setAlpha(this.curS,100-op0);
				this.timer = setTimeout(_.Bind(this,arguments.callee),root.speed);
			} else {
				_.setAlpha(this.nextS,100);
				this.curS.style.display = 'none';
				op0=0;
				if(this.atEnd) {var l = this.atEnd.length; while(l--) {this.atEnd[l].call(this);}}
				this.moving = 0;
				// console.log(this.auto);
				this.auto && (this.timer = setTimeout(_.Bind(this,this.Next),this.defaults.auto));
			}
		}
		return function(){
			this.curS.style.zIndex = '5';
			this.nextS.style.zIndex = '10';
			_.Bind(this,fading)();
		};		
	},
	Run : function  () {
		if(this.next > this.now) {
			this._begin = 0;
			this._end = -this.step;
		} else {
			this._end = 0;
			this._begin = -this.step;
		}
		this._c = this._end - this._begin;		
		this.Moving();
	},
	Moving :function(){
		clearTimeout(this.timer);
		var delta = +new Date() - this._time;
		if(this._c && (delta <= this.ing)){
			// this.Move(Math.floor(this.tween(this._time,this._begin,this._c,this.ing)));
			this.Move(Math.ceil(this._begin + this.defaults.Tween(delta/this.ing)*this._c));
			this.timer = setTimeout(_.Bind(this,this.Moving),this.speed);
		} else {
			this.Move(this._end);
			this._time = 0;
			this.moving = 0;
			if(this.atEnd) {var l = this.atEnd.length; while(l--) {this.atEnd[l].call(this);}}
			this.auto && (this.timer = setTimeout(_.Bind(this,this.Next),this.defaults.auto));
		}
	},
	Move :function(p){
		this.slider.style[this.direct] = p +'px';
	},
	Prev :function(){
		this.go(--this.next);
	},
	Next :function(){
		this.go(++this.next);
	},
	Pause :function(){
		this.auto = false;
		if(!this.moving) clearTimeout(this.timer);
	},
	Continue :function(){
		this.auto = this.defaults.auto;
		this.auto && (this.timer = setTimeout(_.Bind(this,this.Next),this.defaults.auto));
	}
}

XScroll2.main.prototype = XScroll2.prototype;

function QuadOut(t,b,c,d){
	return -c *(t/=d)*(t-2) + b;
}
function easeOutStrong(p) {
	return 1 - --p * p * p * p
}
function easeInStrong(p) {
	return (Math.pow((p-1), 3) +1);
}
