var canvas=document.createElement("canvas");
canvas.width=window.innerWidth-20;
canvas.height=window.innerHeight-20;
document.body.appendChild(canvas);

var context=canvas.getContext("2d");
context.font="24px Arial";
context.lineWidth=10;
context.strokeStyle="#FFFFFF"

var frameCount=0;
var projectiles=[];
var enemies=[];
var difficulty=2;
var score=0;

var screenSize=Math.pow(Math.pow(window.innerWidth,2)+Math.pow(window.innerHeight,2),.5)/2+50;

//fireRate*velocity*rotVelocity*bulletSpeed=difficulty

function createObject(size) {
	var object={};
	object.position=[0,0];
	object.velocity=[0,0];
	object.size=size;
	return object;
}

var player=createObject(30);

function recordMousePosition(event) {
	player.position[0]=event.clientX-8;
	player.position[1]=event.clientY-8;
}

function isTouching(object1,object2) {
	var distance=Math.pow(Math.pow(object1.position[0]-object2.position[0],2)+Math.pow(object1.position[1]-object2.position[1],2),.5);
	if (distance<object1.size/2+object2.size/2) {
		return true;
	}
	return false;
}

function createEnemy() {
	var enemy=createObject(50);
	enemy.fireRate=Math.random()*10/difficulty+.5;
	enemy.fireAngle=Math.random()*2*Math.PI;
	enemy.bulletSpeed=.5+Math.random()*Math.pow(difficulty,.1)/2;
	enemy.speed=.3+Math.random()/2*Math.pow(difficulty,.5);
	enemy.velocity[0]=Math.cos(enemy.fireAngle)*enemy.speed;
	enemy.velocity[1]=Math.sin(enemy.fireAngle)*enemy.speed;
	enemy.position[0]=canvas.width/2-Math.cos(enemy.fireAngle)*screenSize;
	enemy.position[1]=canvas.height/2-Math.sin(enemy.fireAngle)*screenSize;
	if (enemy.position[0]<-enemy.size/2) {
		enemy.position[0]=-enemy.size/2;
	} else if (enemy.position[0]>canvas.width+enemy.size/2) {
		enemy.position[0]=canvas.width+enemy.size/2;
	}
	if (enemy.position[1]<-enemy.size/2) {
		enemy.position[1]=-enemy.size/2;
	} else if (enemy.position[1]>canvas.height+enemy.size/2) {
		enemy.position[1]=canvas.height+enemy.size/2;
	}
	enemy.fireDebounce=0;
	enemy.hasSurfaced=false;
	enemy.rotVelocity=(Math.random()-.5)*(difficulty-1)/50;
	enemies.push(enemy);

	return enemy;
}

function fire(source) {
	var bullet=createObject(10);
	bullet.position=[source.position[0]+(source.size/2+10)*Math.cos(source.fireAngle),source.position[1]+(source.size/2+10)*Math.sin(source.fireAngle)];
	bullet.velocity=[source.velocity[0]+source.bulletSpeed*Math.cos(source.fireAngle),source.velocity[1]+source.bulletSpeed*Math.sin(source.fireAngle)];
	bullet.source=source;
	projectiles.push(bullet);
}

function lose() {
	alert("Score: "+Math.floor(score));
	score=0;
	difficulty=2;
	projectiles.splice(0,projectiles.length);
	enemies.splice(0,enemies.length);
}

function loop() {
	context.clearRect(0,0,canvas.width,canvas.height);
	context.fillStyle="#000000";
	context.fillRect(0,0,canvas.width,canvas.height);
	context.fillStyle="#FF0000";
	context.moveTo(player.position[0],player.position[1]);
	context.arc(player.position[0],player.position[1],player.size/2,0,2*Math.PI,false);
	context.fill();
	context.fillStyle="#FFFFFF";
	if (enemies.length<difficulty) {
		createEnemy();
	}
	for (var index=0;index<projectiles.length;index++) {
		var exists=true;
		if (isTouching(player,projectiles[index])) {
			lose();
		}
		projectiles[index].position[0]+=projectiles[index].velocity[0];
		projectiles[index].position[1]+=projectiles[index].velocity[1];
		if (projectiles[index].position[0]<-projectiles[index].size/2 || projectiles[index].position[0]>canvas.width+projectiles[index].size/2 || projectiles[index].position[1]<-projectiles[index].size/2 || projectiles[index].position[1]>canvas.height+projectiles[index].size/2) {
			projectiles.splice(index,1);
			exists=false;
			index--;
		} else {
			context.beginPath();
			context.arc(projectiles[index].position[0],projectiles[index].position[1],projectiles[index].size/2,0,2*Math.PI,false);
			context.fill();
		}
		if (exists) {
			for (var x=0;x<projectiles.length;x++) {
				if (projectiles[x].source!=projectiles[index].source) {
					if (isTouching(projectiles[index],projectiles[x])) {
						projectiles.splice(index,1);
						index--;
						if (index<x) {
							x--;
						}
						projectiles.splice(x,1);
						x=projectiles.length;
						exists=false;
					}
				}
			}
		}
		if (exists) {
			for (var x=0;x<enemies.length;x++) {
				if (enemies[x]!=projectiles[index].source) {
					if (isTouching(projectiles[index],enemies[x])) {
						projectiles.splice(index,1);
						index--;
					}
				}
			}
		}
	}
	for (var index=0;index<enemies.length;index++) {
		if (isTouching(player,enemies[index])) {
			lose();
		}
		enemies[index].position[0]+=enemies[index].velocity[0];
		enemies[index].position[1]+=enemies[index].velocity[1];
		enemies[index].fireAngle+=enemies[index].rotVelocity;
		if (enemies[index].position[0]<-enemies[index].size/2 || enemies[index].position[0]>canvas.width+enemies[index].size/2 || enemies[index].position[1]<-enemies[index].size/2 || enemies[index].position[1]>canvas.height+enemies[index].size/2) {
			if (enemies[index].hasSurfaced) {
				enemies.splice(index,1);
				index--;
			}
		} else {
			if (frameCount-enemies[index].fireDebounce>enemies[index].fireRate*30) {
				enemies[index].fireDebounce=frameCount;
				fire(enemies[index]);
			}
			enemies[index].hasSurfaced=true;
			context.beginPath();
			context.arc(enemies[index].position[0],enemies[index].position[1],enemies[index].size/2,0,2*Math.PI,false);
			context.fill();
			context.moveTo(enemies[index].position[0],enemies[index].position[1]);
			context.lineTo(enemies[index].position[0]+40*Math.cos(enemies[index].fireAngle),enemies[index].position[1]+40*Math.sin(enemies[index].fireAngle));
			context.stroke();
		}
	}

	score+=(projectiles.length+enemies.length)/1000;
	context.fillText("Score: "+Math.floor(score),10,25);

	frameCount++;
	difficulty*=1.0001;
}

window.onload=function() {
	setInterval(loop,4);
}

canvas.addEventListener("mousemove",recordMousePosition);