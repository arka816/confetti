const PI = Math.PI;
const DEG_TO_RAD = PI / 180;
var canvas, g;
var confettiArray = new Array();
var updateInterval = 17;
const colorArray = [
    ["#4287f5", "#cad4e3"],
    ["#59b319", "#a9db86"],
    ["#f20a0a", "#e07272"],
    ["#121ea1", "#6970bf"],
    ["#01031c", "#33384f"],
    ["#f0d41d", "#d6cd94"],
    ["#ab0e5c", "#c997b0"]
]
const confettiCount = 200;
const gammaCorrection = 0.6;
var canvasBoundX, canvasBoundY;

function Vector(x, y){
    this.x = x;
    this.y = y;
    this.Length = function(){
        return sqrt(this.squareLength());
    }
    this.squareLength = function(){
        return this.x * this.x + this.y * this.y;
    }
    this.add = function(vec){
        this.x += vec.x;
        this.y += vec.y;
    }
    this.subtract = function(vec){
        this.x -= vec.x;
        this.y -= vec.y;
    }
    this.multiply = function(scalar){
        this.x *= scalar;
        this.y *= scalar;
    }
    this.divide = function(scalar){
        this.x /= scalar;
        this.y /= scalar;
    }
}

Vector.dot = function(vec1, vec2){
    return vec1.x * vec2.x + vec1.y * vec2.y;
}
Vector.cross = function(vec1, vec2){
    return vec1.x * vec2.y - vec1.y * vec2.x;
}
Vector.sqrDistance = function(vec1, vec2){
    var x = vec1.x - vec2.x;
    var y = vec1.y - vec2.y;
    return (x * x + y * y);
}
Vector.distance = function(vec1, vec2){
    return sqrt(Vector.sqrDistance(vec1, vec2));
}


function Confetti(x, y, size, alpha){
    this.pos = new Vector(x, y);
    this.corners = new Array();
    this.size = size + Math.random() * 4;
    this.time = Math.random() * 4;

    var r = Math.round(Math.random() * (colorArray.length - 1));
    this.frontColor = colorArray[r][0];
    this.backColor = colorArray[r][1];
    this.alpha = alpha;

    this.omega = Math.PI / 2;
    this.yspeed = 20 + Math.random() * 30;
    this.xspeed = 12 + Math.random() * 14;
    this.angle = DEG_TO_RAD * Math.round(Math.random() * 360);
    this.skew = Math.random() * 20 - 10;
    this.rotation = DEG_TO_RAD * Math.random() * 360;
    this.rotationSpeed = 200 + 400 * Math.random();
    this.cosA = 1.0;

    for(let i = 0; i < 4; i++){
        var theta = this.angle + DEG_TO_RAD * (i * 90 + this.skew * Math.pow(-1, i));
        this.corners[i] = new Vector(Math.cos(theta), Math.sin(theta));
    }

    this.update = function(dt){
        this.time += dt;
        this.pos.x += Math.cos(this.time * this.omega) * this.xspeed * dt;
        this.pos.y += this.yspeed * dt;
        this.rotation += this.rotationSpeed * dt;
        this.cosA = Math.cos(DEG_TO_RAD * this.rotation);
        if(this.pos.y > canvasBoundY + this.size){
            // OBJECT RENEWAL
            this.pos.y = 0;
            this.pos.x = Math.round(Math.random() * canvasBoundX);
        }
    }
    this.draw = function(){
        g.globalAlpha = this.alpha;
        if(this.cosA > 0)g.fillStyle = this.frontColor;
        else g.fillStyle = this.backColor;
        
        g.beginPath();
        g.moveTo((this.pos.x + this.corners[0].x * this.size), (this.pos.y + this.corners[0].y * this.size * this.cosA));
        for(let i = 1; i < 4; i++){
            g.lineTo((this.pos.x + this.corners[i].x * this.size), (this.pos.y + this.corners[i].y * this.size * this.cosA));
        }
        g.closePath();
        g.fill();
    }
}

var confettiCanvas = {
    animationState : false,
    globalID : '',
    transformAlphaGamma : function(x){
        return Math.pow(x+1, gammaCorrection) / Math.pow(confettiCount, gammaCorrection);
    },
    animate : function(){
        g.clearRect(0, 0, canvas.width, canvas.height);
        confettiArray.forEach((confetti) => {
            confetti.update(updateInterval/1000);
            confetti.draw();
        });
        confettiCanvas.globalID = requestAnimationFrame(confettiCanvas.animate);
    },
    initiate : function(){
        canvas = document.getElementById('confetticanvas');
        g = canvas.getContext('2d');
        canvasBoundX = canvas.width;
        canvasBoundY = canvas.height;

        for(let i of Array(confettiCount).keys()){
            var posX = Math.round(Math.random() * canvasBoundX);
            var posY = -canvas.height * Math.random();
            var alpha = 0.5 + 0.5 * this.transformAlphaGamma(i);
            confettiArray.push(new Confetti(posX, posY, 2 + 4 * i / confettiCount, alpha));
        }
    },
    start : function(){
        if(!confettiCanvas.animationState){
            confettiCanvas.globalID = requestAnimationFrame(this.animate);
            confettiCanvas.animationState = true;
        }
    },
    stop : function(){
        if(confettiCanvas.animationState){
            cancelAnimationFrame(confettiCanvas.globalID);
            confettiCanvas.animationState = false;
        }
    }
}
