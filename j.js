

$(document).ready(function() {

    var MINE = -1;
    var CLICKED = -2;
    var GOODFLAG = 1;
    var BADFLAG = 2;
    var DEFAULT = 0;
    var game = null;
    var buttons = null;
    $('#generate').click(function() {

        var width = parseInt($('#width').val());
        var height = parseInt($('#height').val());
        var mines = parseInt($('#mines').val());
        game = Create2DArray(height, width);
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
    });
    $('#generate').click();

    $('main button').on('click', function() {
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

            if (minecount == goodflagcount && badflagcount == 0) {
                alert('propergate');
            } else {
                gameDie();
            }

        } else {
            button.html(getAdjecentMineCount(game, i, j));
            button.data('clicked', true);
            game[i][j] = CLICKED;

            if (getAdjecentMineCount(game, i, j) == 0) {
                alert('propergate');
            }
        }

        format(game, button);
    });

    $('main button').on('contextmenu', function() {
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

        return false;
    });

    


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
        var maxwidth = game[0].length;
        var maxheight = game.length;
        for (var i = -1; i < 2; i++) {
            for (var j = -1; j< 2; j ++){
                if (i==0 && j == 0) {
                    continue;
                }
                var r = row + i;
                var c = column + j;
                if (r >= 0 && c >= 0 && r < maxheight && c < maxwidth) {
                    if (counter(game, r, c)){
                        count ++;
                    }
                }

            }
        }
        return count;
    }

    function format(game, button) {
        var i = button.data('row');
        var j = button.data('column');

        var width = $(window).width();
        var height = $(window).height();
        
        var buttonWidth = (width - 100) / game[0].length - 5;
        var buttonHeight = (height - 100) / game.length - 5;
        var dim = Math.min(buttonWidth, buttonHeight);
        button.css("width", dim);
        button.css("height", dim);        

        button.removeClass();
        button.addClass('gamebutton');

        //For testings
        if (isMine(game, i, j)) {
            button.addClass('mine');
        }

        if (isFlagged(game, i, j)) {
            button.addClass('flagged');
        } else if (isClicked(game, i , j)) {
            button.addClass('clicked');             
            button.addClass('clicked-' + getAdjecentMineCount(game, i , j));
        }

    }
    
    function isMine(game, row, column) {
        return game[row][column] === MINE || game[row][column] == GOODFLAG;
    }

    function isClicked(game, row, column) {
        return game[row][column] == CLICKED;
    }

    function gameDie() {
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
