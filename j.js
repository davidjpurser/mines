

$(document).ready(function() {

    var MINE = -1;
    var CLICKED = -2;
    var GOODFLAG = 1;
    var BADFLAG = 2;
    var DEFAULT = 0;
    var game = null;
    var buttons = null;
    var oked = 0;
    var mines = 0;
    var time = 0;
    var interval = null;
    var gamerunning  = false;
    $('#generate').click(function() {
        $('.configure').hide();
        var width = parseInt($('#width').val());
        var height = parseInt($('#height').val());
        mines = parseInt($('#mines').val());
        oked = 0;
        game = Create2DArray(height, width);
        gamerunning = true;
        buttons = Create2DArray(height, width);
        game = fillMines(game, width, height, mines);
        var table= $('<table />');
        for (var i = 0; i < height; i ++ ){

            var row = $('<tr />');
            for (var j =0; j < width; j ++) {
                var column = $('<td />');
                var button = $('<button />');
                button.html('&nbsp;');
                button.data('row', i);
                button.data('column', j	);
                buttons[i][j] = button;
                format(game,button);
                column.append(button);
                row.append(column);
            }
            table.append(row);
        }
        $('main').html('').append(table);
        checkWin(game);

        var d = new Date();
        time = d.getTime(); 
        maintainTime();
        interval = setInterval(maintainTime, 1000);
        
    });

    $('#generate').click();

    $('input[name=game]').on('change',function() {

        if ($(this).val() == "c") {
            $('.custom').show();
        } else {
            $('.custom').hide();
            var width = 0;
            var height = 0;
            var mines = 0;
            switch($(this).val()) {
                case "s":
                    width = height = 8;
                    mines = 10;
                break;
                case "m":
                    width = height = 16;
                    mines = 40;
                break;
                case "l":
                    width = 31;
                    height = 16;
                    mines = 99;
                break;
            }
            $('#width').val(width);
            $('#height').val(height);
            $('#mines').val(mines);
        }
    });

    $('#toggle').click(function(){
        $('.configure').toggle();
    }) ;

    $('main').on('click','button', function() {
        if (!gamerunning)
            return false;
        var button = $(this);
        var i = button.data('row');
        var j = button.data('column');

        if (isFlagged(game, i , j)) {
            console.log('cannot click a flagged button');
        } else if (isMine(game, i, j)) {
            gameDie();
        } else if (isClicked(game, i, j)) {

            var minecount = getAdjecentMineCount(game, i, j);
            var goodflagcount = getAdjecentGoodFlagCount(game, i, j);
            var badflagcount = getAdjecentBadFlagCount(game, i, j);
            console.log(minecount,goodflagcount,badflagcount);

            if (minecount == goodflagcount + badflagcount) {
                if (minecount == goodflagcount && badflagcount == 0) {

                    var propergationlist = [];
                    getAdjecentCount(game, i , j, function(game, r, c) {
                        if (!isClicked(game, r, c) && !isFlagged(game, r, c)) {
                            propergationlist.push([r, c]);
                        }
                        return true;
                    });
                    propergate(game, buttons, propergationlist);
                } else {
                    gameDie();
                }
            } else {
                console.log('cant count');
            }

        } else {
            propergate(game, buttons, [[i,j]]);
        }

        format(game, button);
        checkWin(game);
    });

    $('main').on('contextmenu','button', function() {
        if (!gamerunning)
            return false;
        var button = $(this);
        var i = button.data('row');
        var j = button.data('column');
        
        if(game[i][j] == GOODFLAG) {
            game[i][j] = MINE;
        } else if (game[i][j] == BADFLAG){
            game[i][j] = DEFAULT;
        } else {
            if (isMine(game, i, j)) {
                 game[i][j] = GOODFLAG;
             } else {
                 game[i][j] = BADFLAG;
             }
        }
        format(game, button);
        checkWin(game);
        return false;
    });

    $(window).on('resize', reformater);

    function reformater() {
        for (var i = 0; i < game.length; i++ ){ 
            for(var j = 0; j < game[i].length; j++) {
                format(game, buttons[i][j]);
            }
        }
    }

    function maintainTime() {
        var d = new Date();
       var newtime = d.getTime();
       var diff = newtime - time;
       $('#timer').html(Math.round(diff / 1000) + "s");

    }

    function setClicked(game, r, c) {
        if (game[r][c] !== CLICKED) {
            game[r][c] = CLICKED;
            oked++;
        }
    }

    function checkWin(game) {
        if (game.length * game[0].length - oked === mines) {
            clearInterval(interval);
            maintainTime();
            gamerunning = false;
            alert('win');
        }
        $('#safe').html(oked + "/" + (game.length * game[0].length - mines));
    }

    function propergate(game, buttons, propergationlist) {
        console.log('propergate', propergationlist);

        propergationlist.forEach(function(item) {

            if (getAdjecentMineCount(game, item[0], item[1]) == 0) {

                var queue = [item];
                while (queue.length > 0) {

                    var top = queue.pop();
                    var i = top[0];
                    var j = top[1];
                     
                    if (isClicked(game,i , j)) {

                    } else if (getAdjecentMineCount(game, i, j) != 0) {
                        setClicked(game, i, j);
                        format(game, buttons[i][j]);
             
                    } else {
                        var trackLeft = j;
                        var trackRight = j;
                        setClicked(game, i, j);
                        format(game, buttons[i][j]);
                        [-1, 1].forEach(function(direction){
                            trackLeft += direction;
                            while(inBounds(game, i, trackLeft) && getAdjecentMineCount(game, i, trackLeft) == 0) {

                                setClicked(game, i, trackLeft);
                                format(game, buttons[i][trackLeft]);
                                if (inBounds(game, i+1, trackLeft)) {
                                    queue.push([i+1, trackLeft])
                                }
                                if (inBounds(game, i-1, trackLeft)) {
                                    queue.push([i-1, trackLeft])
                                }
                                trackLeft += direction;
                            }

                            if (inBounds(game, i+1, trackLeft)) {
                                queue.push([i+1, trackLeft])
                            }
                            if (inBounds(game, i-1, trackLeft)) {
                                queue.push([i-1, trackLeft])
                            }
                            if (inBounds(game, i, trackLeft)) {
                                queue.push([i, trackLeft])
                            }
                        });
                    }
                }

            }

            setClicked(game, item[0], item[1]);
            format(game, buttons[item[0]][item[1]]);
        });
    }
    
    function isFlagged(game, row, column) {
        return game[row][column] == GOODFLAG || game[row][column] == BADFLAG;
    }

    function getAdjecentMineCount(game, row, column) {
       return getAdjecentCount(game, row, column, isMine);
    }

    function getAdjecentGoodFlagCount(game, row, column) {
        return getAdjecentCount(game, row, column, function(game, r, c) {
            return game[r][c] == GOODFLAG;
        });
    }

     function getAdjecentBadFlagCount(game, row, column) {
        return getAdjecentCount(game, row, column, function(game, r, c) {
            return game[r][c] == BADFLAG;
        });
    }

    function getAdjecentCount(game, row, column, counter) {
         var count = 0;
        for (var i = -1; i < 2; i++) {
            for (var j = -1; j< 2; j ++){
                if (i==0 && j == 0) {
                    continue;
                }
                var r = row + i;
                var c = column + j;
                if (inBounds(game, r, c) && counter(game, r, c)){
                    count ++;
                }

            }
        }
        return count;
    }

    function inBounds(game, r, c) {
        var maxwidth = game[0].length;
        var maxheight = game.length;
       
        if (r >= 0 && c >= 0 && r < maxheight && c < maxwidth) {
          return true;
        } 
        return false;
    }

    function format(game, button) {
        var i = button.data('row');
        var j = button.data('column');

        var width = $(window).width();
        var height = $(window).height();
        
        var headerHeight = $('header').height() + 25;

        var buttonWidth = (width - 50) / game[0].length - 5;
        var buttonHeight = (height - headerHeight) / game.length - 5;
        var dim = Math.min(buttonWidth, buttonHeight);
        button.css("width", dim);
        button.css("height", dim);        

        button.removeClass();
        button.addClass('gamebutton');

        //For testings
        if (isMine(game, i, j) && !gamerunning) {
            button.addClass('mine');
        }

        if (isFlagged(game, i, j)) {
            button.addClass('flagged');
        } else if (isClicked(game, i , j)) {
            var count = getAdjecentMineCount(game, i , j);
            button.addClass('clicked');             
            button.addClass('clicked-' + count);
            button.html(count);

        }

    }
    
    function isMine(game, row, column) {
        return game[row][column] === MINE || game[row][column] == GOODFLAG;
    }

    function isClicked(game, row, column) {
        return game[row][column] == CLICKED;
    }

    function gameDie() {
        clearInterval(interval);
        maintainTime();
        gamerunning = false;
        reformater();
        alert('You failed');
    }


    function Create2DArray(height, width) {
      var arr = [];

      for (var i=0;i<height;i++) {
       arr[i] = Array(width);
       }

       return arr;
    }

    function fillMines(game, width, height, n) {

        while(n > 0){
            i = getRandomInt(0, width -1);
            j = getRandomInt(0, height -1);
            if ( game[j][i] != MINE) {
                game[j][i] = MINE;
                n--;
            }
        }
        return game;
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

});
