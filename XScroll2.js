/*
	Javascript图片切换类：XScroll2
	版本：0.1
	作者：脚儿网/jo2.org
	使用说明：
	从任意序号跳转到任意序号，都只有一次滚动,不过会切换方向
	欢迎使用，欢迎转载，但请勿据为己有
	更新记录：
	2013/1/9:减少变量
*/
(function(self, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    self.XScroll2 = factory();
  }
}(this, function() {
'use strict';
var id=function (id) {
		//this.id=id;
		return "string" == typeof id ? document.getElementById(id) : id;
	},
	Extend=function(defaults, news) {
		for (var property in news) {
			defaults[property] = news[property];
		}
		return defaults;
	},
	Bind=function(object, fun) {
		return function() {
			return fun.apply(object, Array.prototype.slice.call(arguments,2));
		}
	},
	On=(function(){
		return (window.addEventListener) ? function(eType,eFunc,eObj) {
			eObj.addEventListener(eType,eFunc,false);
		} : function(eType,eFunc,eObj) {
			eObj.attachEvent("on"+eType,eFunc);
		};
	})(),
	cutover=function(arr,cur,cls){
		for(var i=0,l=arr.length;i<l;i++){
			if(arr[i].className.indexOf(cls) != -1) {
				arr[i].className = arr[i].className.replace(cls,'');
			}
		}
		arr[cur].className = arr[cur].className.replace(/\s$/g,'') + ' ' + cls;
	},
	setAlpha=(function(){
		return (-[1,]) ? function (obj,alpha) {
				obj.style.opacity = alpha * 0.01;
			} : function(obj,alpha){
				obj.style.filter = "alpha(opacity=" + alpha + ")";
			};
	})(),
	setCss=function(elm,css){
		for(var c in css) {
			elm.style[c] = css[c];
		}
	},
	setPos=function(obj,pos){
		for(var p in pos) {
			obj.style[p] = pos[p] + 'px';
		}
	};

var XScroll2 = function (elm,option) {
	return new XScroll2.main(elm,option);
}
XScroll2.main = function(elm,option) {
	var self = this;
	self.slider = id(elm);
	self.items = self.slider.children;
	self.count = self.items.length;
	/* 初始化选项 */
	Extend(self.defaults,option);
	var drt = self.defaults.direct;
	self.direct = ['left','top'][drt % 2];
	//console.log(self.direct)
	self.step = self.defaults.step || (drt % 2 ? self.slider.offsetHeight : self.slider.offsetWidth);
	self.speed = Math.ceil(1000/self.defaults.fps);
	self.ing = self.defaults.ing/self.speed;
	self.auto = self.defaults.auto;
	/* 页码翻页功能 */
	self.pager = id(self.defaults.pager);
	self.next = self.now = self._time = 0;
	/* 移动变量 */
	self._timer = null;
	/* 初始化完毕 */
	
	self.init();	
}
XScroll2.prototype = {
	init:function(){
		var len = this.count,
			self = this;
		/*	*/
		var posi = (self.defaults.how==0) ? "position:absolute;" : '',
			fl = (self.direct =='left') ? "float:left;" : "",
			W = (self.direct =='left') ? (2*self.step+'px') : null,
			H = (self.direct =='top') ? (2*self.step+'px') : null,
			css = fl+"display:none; z-index:5;"+posi;
		// console.log(H);	
		while (len-- > 0){
			self.items[len].style.cssText = css;
		}
		setCss(self.slider,{position:'absolute',left:'0',top:0,width:W,height:H});
		setCss(self.slider.parentNode,{position:'relative',overflow:'hidden'});
		setCss(self.items[0],{zIndex:10,display:'block'});
		self.auto && (self.timer = setTimeout(Bind(self,self.Next),self.defaults.auto)) ;
		if(self.defaults.pause) {
			On('mouseout',function(){
				self.Continue();
			},self.slider);
			On('mouseover',function(){
				self.Pause();
			},self.slider);
		}
		self.pager && self.Pager();
		self.Run = self.run();
	},
	//默认参数
	defaults: {
		how: 0,
		direct: 0,
		auto: 0,
		pause: true,
		event: 'mouseover',
		past: 0,
		fps: 50,
		ing: 500,
		Tween: easeInStrong
	},
	fix:function(){
		var self = this;
		//console.log(this.next);
		for(var i=0,l=self.count;i<l;i++) {
			if(i != self.now && i != self.next) {
				self.items[i].style.display = 'none';
			}
		}
		self.curS.style.display = 'block';
		self.nextS.style.display = 'block';
		//console.log(self.curS);
	},
	go:function (num) {
		var self = this;
		clearTimeout(self.timer);
		clearTimeout(self._timer);
		self._time = 0;
		//console.log(self.timer);
		self.curS = self.items[self.now];
		(num != undefined) ? self.next = num : self.next=self.now+1;
		
		(self.next>= self.count ) && (self.next = 0) || (self.next < 0) && (self.next = (self.count-1));
		//console.log('num='+num +',self.next = '+ self.next);
				
		//当前项为curS,下一项为nextS,谨记
		if(self.now != self.next) {
			self.nextS = self.items[self.next];
			self.fix();
			self.Run();
			if(self.pager)  { cutover(self.pages,self.next,'on')};
			self.now = self.next;
		}
		//self.defaults.how = Math.round(0+Math.random()*3);
	},
	run:function(elm,callback) {
		var self = this;
		var effects = [
			function(){
				self.curS.style.zIndex = '5';
				self.nextS.style.zIndex = '10';
				var op0=0,self = self;
				function fading(){
					if(op0 < 100){
						setAlpha(self.nextS,(op0+=4));
						self._timer = setTimeout(fading,self.speed);
					} else {
						//console.log(op0);
						setAlpha(self.nextS,100);
						self.curS.style.display = 'none';
						op0=0;
						self.auto && (self.timer = setTimeout(Bind(self,self.Next),self.defaults.auto));
					}
				}
				fading();
			},
			function(){
				if(self.next < self.now) {
					self._end = 0;
					self._begin = -self.step;
				}else {
					self._begin = 0;
					self._end = -self.step;
				}
				self._c = self._end - self._begin;
				
				self.Move();
			}
		];
		return effects[self.defaults.how];
		
	},
	Move:function(){
		var self = this;
		clearTimeout(self.timer);
		if(self._c && (self._time++ <= self.ing)){
			// self.Moving(Math.floor(self.tween(self._time,self._begin,self._c,self.ing)));
			self.Moving(Math.floor(self._begin + self.defaults.Tween(self._time/self.ing)*self._c));
			self._timer = setTimeout(Bind(self,self.Move),self.speed);
		} else {
			self.Moving(self._end);
			self._time = 0;
			self.auto && (self.timer = setTimeout(Bind(self,self.Next),self.defaults.auto));
		}
	},
	Moving:function(p){
		this.slider.style[this.direct] = p +'px';
	},
	Prev:function(){
		this.go(--this.next);
	},
	Next:function(){
		this.go(++this.next);
	},
	Pause:function(){
		clearTimeout(this.timer);
		this.auto = false;
		//console.log('Pause!' + this.timer);
	},
	Continue:function(){
		//this.Pause();
		clearTimeout(this.timer);
		this.auto = true;
		this.timer = setTimeout(Bind(this,this.Next),this.defaults.auto);
	},
	Pager:function(){
		var self = this;
		self.pages = self.pager.children;
		var page = self.pager;
		var	evt = self.defaults.event,
			pl = self.pages.length,
			to;
		for(var i = 0; i< pl; i++){
			(function(i){
				On(evt,
					function(){
						self.Pause();
						to = setTimeout(function(){self.go(i)},self.defaults.past);
					},
					self.pages[i]);
				On('mouseout',
					function(){
						if(self.defaults.auto) self.auto = true;
						clearTimeout(to);
					},
					self.pages[i]);	
			})(i);
		}
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

return XScroll2;
}));