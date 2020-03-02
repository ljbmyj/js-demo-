let sw = 20
let sh = 20
let tr = 30
let td = 30

let snake = null;
let food = null;
let game = null;

function Square(x, y, classname) {
    //0,0 0,0
    //20,0 0,0
    //40,0 0,0
    this.x = x * sw;
    this.y = y * sh;
    this.class= classname;

    this.viewContent = document.createElement('div');
    this.viewContent.className = this.class;
    this.parent = document.querySelector('#snakeWrap');
}
Square.prototype.create = function() { //创建方块DOM
    this.viewContent.style.position = 'absolute';
    this.viewContent.style.width = sw +'px';
    this.viewContent.style.height = sh +'px';
    this.viewContent.style.left = this.x +'px';
    this.viewContent.style.top = this.y +'px';
    
    this.parent.appendChild(this.viewContent);
}
Square.prototype.remove = function() {
    this.parent.removeChild(this.viewContent);
}

/* snake */
function Snake() {
    this.head = null; //存下蛇的头部信息
    this.tail = null; //存下蛇的尾部信息
    this.pos = []; //存储蛇身上的每一个方块的位置

    this.directionNum = { //储存蛇走的位置
        left: {
            x:-1,
            y:0
        },
        right: {
            x:1,
            y:0
        },
        up: {
            x:0,
            y:-1
        },
        down: {
            x:0,
            y:1
        }

    }

}
Snake.prototype.init = function() {
    /* 创建蛇头 */
    let snakeHead = new Square(2, 0, 'snakeHead');
    snakeHead.create();
    this.head = snakeHead;
    this.pos.push([2, 0]);

    /* 创建蛇身1 */
    let snakeBody1 = new Square(1, 0, 'snakeBody');
    snakeBody1.create();
    this.pos.push([1, 0]);

    /* 创建蛇身2 */
    let snakeBody2 = new Square(0, 0, 'snakeBody');
    snakeBody2.create();
    this.tail = snakeBody2;
    this.pos.push([0, 0]);

    /* 形成蛇的链表 */
    snakeHead.last = null;
    snakeHead.next = snakeBody1;

    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;

    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    /* 蛇的默认反向 */
    this.direction = this.directionNum.right;
}

    /* 获取蛇的下一个位置 */
    Snake.prototype.getNextPos = function() {
        let nextPos = [ /* 蛇头下个位置的坐标 */
            this.head.x / sw + this.direction.x,
            this.head.y / sh + this.direction.y
        ]

    /* 下个位置是自己 游戏结束*/
    let selfCollied = false
    this.pos.forEach (function(value) {
        if (value[0] == nextPos[0] && value[1] == nextPos[1]) {
            selfCollied = true;
        }
    })
    if (selfCollied) {
        this.strategies.die.call(this);
        return;
    }
    /* 下个位置是墙 游戏结束 */
    if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > td-1 || nextPos[1] > tr-1) {
        this.strategies.die.call(this);
        return;
    }
    /* 下个位置是食物 吃 */
    if(food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]) { //如果这个条件成立 说明下个点在食物那个点
        this.strategies.eat.call(this);
        return;
    }

    /* 下个位置什么也没有 继续走 */
    this.strategies.move.call(this);
    }

    Snake.prototype.strategies = {
        move: function(format) {
            /* 掐头去尾 */
            let newBody = new Square(this.head.x / sw, this.head.y / sh, 'snakeBody'); //创建新蛇身
            //更新链表
            newBody.next = this.head.next; 
            newBody.next.last = newBody;
            newBody.last = null;
            
            this.head.remove(); //去掉旧蛇头
            newBody.create();
            
            let newHead = new Square(this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y, 'snakeHead');
            //更新链表
            newHead.next = newBody;
            newHead.last = null;
            newBody.last = newHead;

            newHead.create();

            this.pos.splice(0, 0, [this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y]); //蛇身上的坐标更新
            this.head = newHead; //蛇头更新

            if(!format) { //判断是否删蛇尾
                this.tail.remove();
                this.tail = this.tail.last;

                this.pos.pop();
            }

        },
        eat: function() {
            this.strategies.move.call(this, true);
            Food();
            game.score++;
        },
        die: function() {
            game.over();
        }
    };


snake = new Snake();



function Food() {
    let x = null;
    let y = null;

    let include = true;//循环跳出 true表示食物的坐标在蛇身上 false表示食物的坐标不在蛇身上
    while(include) {
        x = Math.round(Math.random() * (td - 1));
        y = Math.round(Math.random() * (tr - 1));

        snake.pos.forEach (function(value) {
            if(x != value[0] && y != value[1]) {
                include = false; //证明随机随机出来的坐标 不在蛇身上
            }
        });
    }

    food = new Square(x, y, 'food');
    food.pos = [x, y];

    let foodDom = document.querySelector('.food');
    if(foodDom) {
        foodDom.style.left = x * sw + 'px';
        foodDom.style.top = y * sh + 'px';
    } else {
    food.create();
    };
}


function Game() {
    this.timer = null;
    this.score = 0;
}
Game.prototype.init = function() {
    snake.init();
    Food();

    document.addEventListener('keyup', function(e) {
        if (e.which == 37 && snake.direction != snake.directionNum.right) {
            snake.direction = snake.directionNum.left;
        }else if (e.which == 38 && snake.direction != snake.directionNum.down) {
            snake.direction = snake.directionNum.up
        }else if (e.which == 39 && snake.direction != snake.directionNum.left) {
            snake.direction = snake.directionNum.right;
        }else if (e.which == 40 && snake.direction != snake.directionNum.up) {
            snake.direction = snake.directionNum.down;
        }
    })

    this.start();
}
Game.prototype.start = function() { //开始游戏
    this.timer = setInterval(function() {
        snake.getNextPos();
    },200)
}
Game.prototype.pause = function() {
    clearInterval(this.timer);
}
Game.prototype.over = function() {
    clearInterval(this.timer);
    alert('你的得分为：'+ this.score);

    let snakeWrap = document.querySelector('#snakeWrap');
    snakeWrap.innerHTML = '';

    snake = new Snake();
    game = new Game();

    let startBtnWrap = document.querySelector('.startBtn');
    startBtnWrap.style.display = 'block';
}

/* 点击开始 */
game = new Game();
let startBtn = document.querySelector('.startBtn button');
startBtn.addEventListener('click', function(){
    startBtn.parentNode.style.display = 'none';
    game.init();
})

/* 暂停 */
let  snakeWrap = document.querySelector('#snakeWrap');
let pauseBtn = document.querySelector('.pauseBtn button');
snakeWrap.addEventListener('click', function(){
    game.pause();
    pauseBtn.parentNode.style.display = 'block';

})
pauseBtn.addEventListener('click', function() {
    game.start();
    pauseBtn.parentNode.style.display = 'none';
})

