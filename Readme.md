## XScroll2.js，图片切换

与XScroll类似，从任意序号跳转到任意序号，都只有一次滚动,不过会切换方向。如，从1到3，只需向左滚动一步；从4到1，向右滚动1步。

代码更少（因为效果更少）

[在线示例页](http://jo2.org/htmls/XScroll2/XScroll2.htm)

### 使用方法：

**html结构**

	<div class="container" id="idContainer2">

		<ul id="idSlider2">
			<li><a href="http://jo2.org/"><img src="images/s1.jpg"/></a></li>
			<li><a href="http://jo2.org/"><img src="images/s2.jpg"/></a></li>
			<li><a href="http://jo2.org/"><img src="images/s3.jpg"/></a></li>
			<li><a href="http://jo2.org/"><img src="images/s4.jpg"/></a></li>
		</ul>
		<ul id="slider2p" class="num">
			<li class="on">1</li>
			<li>2</li>
			<li>3</li>
			<li>4</li>
		</ul>
	</div>
**JS代码**：

	var xscroll = XScroll('idSlider2',{auto:3000,how:4, direct:1,Tween:Tween.CircOut,pager:'slider2p'});

第一个参数是id，第二个参数是选项设置

### 参数说明：

**how**:切换效果

0淡入淡出（默认）

1滚动

**direct**:方向，

值为0或1，分别表示左上，默认为0.在**how参数不为0时**有效

**delay**:自动滚动间隔时间。默认为4000


**pager**:

值应该是一个元素的id,指定slider的页码翻页元素。指定后XScroll会为此标签的第一层子元素添加跳转函数

**Tween**:

缓动公式，如easeIn,easeInOut之类的，具体参考Tween.js里的写法