var clientW = document.documentElement.clientWidth;
var mainDiv = document.getElementById("main");
var gameWrap = document.getElementById("gameWrap");
var scoreDiv = document.getElementById("score"); 
var score=0;  //初始分数

/**
 * 飞机类 ,其他飞机均继承此飞机类
 * @param {number} x           飞机x坐标
 * @param {number} y           飞机y坐标
 * @param {string} imgsrc      飞机图片
 * @param {string} boomImgsrc  飞机爆炸时的图片
 */
function Plane(x, y,imgsrc,boomImgsrc) {
	this.x = x;
	this.y = y;
	this.imgsrc = imgsrc;
	this.boomImgsrc=boomImgsrc;
}
Plane.prototype = {
	constructor : Plane,
	init : function() {
		this.imageNode = document.createElement('img');
		this.imageNode.src = this.imgsrc;
		this.imageNode.style.left = this.x + "px";
		this.imageNode.style.top = this.y + "px";
		mainDiv.appendChild(this.imageNode);
	},
	boom : function(){
		this.imageNode.src = this.boomImgsrc;
	}
}

/**
 * 我方飞机类
 */
function Myplane(x, y) {
	Plane.call(this, x, y, "img/hero_fly_1.png","img/本方飞机爆炸.gif");
	this.init();  //初始化飞机，创造一个飞机并设置位置等信息(通过原型链继承得到的方法)
}
Myplane.prototype = new Plane(); //原型链继承

var myPlane = new Myplane(50, 300);  //创建我的飞机对象

/**
 * 定义鼠标对飞机的控制的事件处理函数
 * 并添加鼠标移动事件
 */
function move() {
	var e=arguments[0];
	myPlane.imageNode.style.left=e.clientX-(clientW-320)/2-33+'px';
	myPlane.imageNode.style.top=e.clientY-60+'px';
}

//边界 : 当鼠标移出游戏框后移除对飞机的事件处理
function bianjie(){
	var e=arguments[0];
	//判断是否在游戏框内
	if(e.clientX>=gameWrap.offsetLeft && e.clientX<=gameWrap.offsetLeft+gameWrap.offsetWidth && e.clientY>=20 && e.clientY<=gameWrap.offsetHeight+20){
		gameWrap.addEventListener("mousemove",move,false);
	}
	else{
		gameWrap.removeEventListener("mousemove",move,false);
	}
}

gameWrap.addEventListener("mousemove",move,false);
document.addEventListener("mousemove",bianjie,false);

/**
 * 子弹类
 * @param {number} speed 子弹的速度
 */
function Bullet(speed){
	this.w=6;
	this.h=14;
	this.imgsrc="img/bullet1.png";
	this.speed=speed;
	this.init(); //初始化
}
Bullet.prototype={
	constructor : Bullet,
	//初始化
	init : function(){
		this.imageNode=document.createElement("img");
		this.imageNode.src=this.imgsrc;
		this.imageNode.style.left=parseInt(myPlane.imageNode.style.left)+31+"px";
		this.imageNode.style.top=parseInt(myPlane.imageNode.style.top)-8+"px";
		mainDiv.appendChild(this.imageNode);
	},
	//子弹的移动
	move : function(){
		this.imageNode.style.top=this.imageNode.offsetTop-this.speed+"px";
	}
}

/**
 * 敌机类(组合继承)
 * @param {string} beatImgsrc  敌方飞机挨打时的图片
 * @param {number} ph          敌机生命值
 * @param {number} dieTime     敌机死亡动画时间 
 * @param {number} speed       敌机的速度
 * @param {number} score       击败此敌机后可获得的分数
 */
function Enemy(x,y,imgsrc,boomImgsrc,beatImgsrc,ph,dieTime,speed,score){
	Plane.call(this,x,y,imgsrc,boomImgsrc);
	this.beatImgsrc=beatImgsrc;
	this.ph=ph;
	this.dieTime=dieTime;  //死亡动画时间
	this.speed=speed;
	this.score=score;
	this.dieMark=false  //死亡标记,当敌机死亡后,其对应的死亡标记变为true
	this.init();  //初始化飞机
}
Enemy.prototype=new Plane();

//敌方飞机移动方法
Enemy.prototype.move=function(){
	this.imageNode.style.top=this.imageNode.offsetTop+this.speed+"px";
}

//敌方飞机挨打和爆炸方法
Enemy.prototype.boom=function(){
	var _this=this;  //趁this没变时先保存下来
	this.imageNode.src=this.beatImgsrc;  //敌机被摧毁的动画 (小飞机的此gif有问题，所以小飞机直接爆炸。。)
	setTimeout(
		function(){
			_this.imageNode.src=_this.boomImgsrc;  //敌机爆炸动画
		}
	,50)
	setTimeout(
		function(){
			_this.imageNode.remove();
			_this.dieMark=null;   //完全死亡,画面从游戏框彻底消失
		}
	,this.dieTime)
}

/* 产生一个指定范围的随机数
 * @start  number 随机数的开始值
 * @end    number 随机数的结束值
 * @return number start~end范围的随机数
 */
function Random(start,end){    
	return Math.random()*(end-start)+start;    
}

/**
 * 开始函数,控制主要的游戏设置,整合游戏唯一的setinterval
 */
var bullets=[];  //用于装入子弹对象
var enemys=[];  //用于装入敌机对象
var count=0;
var bgPosition=0;
function gameStart(){
	/**
	 * 移动背景,产生前进的感觉
	 */
	bgPosition++;
	gameWrap.style.backgroundPositionY=bgPosition+"px";
	if(bgPosition==568){
		bgPosition=0;
	}
	
	/**
	 * 用count间歇产生子弹，突出移动效果 
	 * 子弹速度为10
	 */
	if(count%5==0){	
		bullets.push(new Bullet(10));
	}
	for (var i=0;i<bullets.length;i++) {
		bullets[i].move();
		//若子弹超出游戏框范围，则移除此子弹节点，同时子弹数组也移除此子弹对象
		if(bullets[i].imageNode.offsetTop<=0){
			bullets[i].imageNode.remove();
			bullets.splice(i,1);  //从数组中移除
			i--;
		}
	}
	count++;
	
	/**
	 * 随机位置产生敌机,并让敌机移动 
	 * 通过count来控制三种飞机的密度
	 * 当飞机超出游戏框之后将此飞机节点移除，同时移除敌机数组中的此对象
	 */
	if(count%150==0){
		//大飞机
		enemys.push(new Enemy(Random(0,gameWrap.offsetWidth-110),-164,"img/enemy2_fly_1.png","img/大飞机爆炸.gif","img/大飞机挨打.png",10,600,2.2,12));
		count=0; //置零，从新开始计数
	}
	else if(count%60==0){
		//中飞机
		enemys.push(new Enemy(Random(0,gameWrap.offsetWidth-46),-60,"img/enemy3_fly_1.png","img/中飞机爆炸.gif","img/中飞机挨打.png",5,430,3.2,5));
	}
	else if(count%18==0){
		//小飞机
		enemys.push(new Enemy(Random(0,gameWrap.offsetWidth-34),-24,"img/enemy1_fly_1.png","img/小飞机爆炸.gif","img/enemy1_fly_1.png",1,450,5.2,1));
	}
	for (var i=0;i<enemys.length;i++) {
		if(enemys[i].dieMark==false){
			enemys[i].move();  //敌机的移动
		}
		//判断敌机是否超出游戏框
		if(enemys[i].imageNode.offsetTop>=568){
			enemys[i].imageNode.remove();
			enemys.splice(i,1);  //从数组中移除
			i--;
		}
	}
	
	/**
	 * 我方飞机死亡检测
	 * 飞机碰撞检测,我方飞机碰到敌机后立即摧毁
	 */
	for (var j=0;j<enemys.length;j++) {
		if(enemys[j].imageNode.offsetLeft+enemys[j].imageNode.offsetWidth>myPlane.imageNode.offsetLeft && enemys[j].imageNode.offsetLeft<myPlane.imageNode.offsetLeft+myPlane.imageNode.offsetWidth){
			if(enemys[j].imageNode.offsetTop+enemys[j].imageNode.offsetHeight-20>myPlane.imageNode.offsetTop && enemys[j].imageNode.offsetTop<myPlane.imageNode.offsetTop+myPlane.imageNode.offsetHeight-20){
				myPlane.boom();  //我方飞机爆炸
				clearInterval(timer);
				document.getElementById("gameOver").style.display="block";
				//死亡后即移除对飞机的鼠标移动控制事件
				gameWrap.removeEventListener("mousemove",move,false);
				document.removeEventListener("mousemove",bianjie,false);
			}
		}
	}
	
	/**
	 * 用两个for循环遍历所有子弹和敌机,判断是否碰撞
	 * 当敌机被子弹射中后,减少敌机生命值,同时将子弹移除
	 * 当敌机生命值减为0之后,开始死亡动画
	 */
	for (var i=0;i<bullets.length;i++) {
		for (var j=0;j<enemys.length;j++) {
			if(bullets[i].imageNode.offsetLeft>=enemys[j].imageNode.offsetLeft && bullets[i].imageNode.offsetLeft+6<=enemys[j].imageNode.offsetLeft+enemys[j].imageNode.offsetWidth && bullets[i].imageNode.offsetTop<=enemys[j].imageNode.offsetTop+enemys[j].imageNode.offsetHeight){
				enemys[j].ph-=1;  //敌机被打中后生命值减少,1可以看做是子弹的攻击力
				if(enemys[j].ph==0){
					enemys[j].dieMark=true;  //此时敌机已死亡,但是死亡动画还在继续,所以还要继续移除子弹
					enemys[j].boom();
					getScore(enemys[j].score);   //得分
				}
				//当敌机的死亡动画结束后,死亡标记为空,将此敌机对象从数组移除
				if(enemys[j].dieMark==null){
					enemys.splice(j,1);
				}
				//移除子弹
				bullets[i].imageNode.remove();
				bullets.splice(i,1);  //从数组中移除
				
				i--;  //因为子弹数组移除了一个元素
				break //当删除一个子弹后即跳出内层for循环
				
			}
		}
	}
}

/**
 * 得分函数,通过传入的敌机的score属性来知道应该加对少分
 * @param {number} s  需要加上的分数
 */
function getScore(s){
	score+=s;
	scoreDiv.innerHTML="得分 : "+score;
}
var timer=setInterval(gameStart,28);

/**
 * 当点击游戏框内时,暂停游戏,并移除对我方飞机的事件监听
 */
myPlane.imageNode.onclick=function(){
	document.querySelector("#pause").style.display="block";
	clearInterval(timer);
	gameWrap.removeEventListener("mousemove",move,false);
	document.removeEventListener("mousemove",bianjie,false);
}


//设置继续游戏和重新开始游戏按钮的点击事件
var btn=document.querySelectorAll("input");

//继续游戏按钮
btn[1].onclick=function(){
	document.querySelector("#pause").style.display="none";
	//重新开始定时器
	timer=setInterval(gameStart,30);
	//将对飞机的控制事件重新添加回来
	gameWrap.addEventListener("mousemove",move,false);
	document.addEventListener("mousemove",bianjie,false);
}

//重新开始游戏按钮
btn[0].onclick=function(){
	newGame();
}

//再来一局按钮
btn[2].onclick=function(){
	newGame();
	document.getElementById("gameOver").style.display="none";
	myPlane.imageNode.src="img/hero_fly_1.png";  //之前我方飞机被换成死亡图片了,现在换回来
}

/**
 * 开始新游戏,放在点击事件中
 */
function newGame(){
	document.querySelector("#pause").style.display="none";
	//将所有子弹从页面移除
	for (var i=0;i<bullets.length;i++) {
		bullets[i].imageNode.remove();
	}
	//将所有敌机从页面移除
	for (var j=0;j<enemys.length;j++) {
		enemys[j].imageNode.remove();
	}
	//将对飞机的控制事件重新添加回来
	gameWrap.addEventListener("mousemove",move,false);
	document.addEventListener("mousemove",bianjie,false);
	//一些初始化设置
	bullets=[];  //用于装入子弹对象
	enemys=[];  //用于装入敌机对象
	count=0;
	score=0;  
	getScore(0);  //将分数显示清零
	timer=setInterval(gameStart,30);
}
