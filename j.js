

$(document).ready(function() {

var game = null;
$('#generate').click(function() {

    var width = parseInt($('#width').val());
    var height = parseInt($('#height').val());
    game = Create2DArray(height, width);
    game = fillMines(game, width, height, 10);
    console.log(game);
   var table= $('<table />');
    for (var i = 0; i < height; i ++ ){
    
        var row = $('<tr />');
        for (var j =0; j < width; j ++) {
            var column = $('<td />');
            var button = $('<button />');
            button.html('&nbsp;');
            if (game[i][j] == "mine") {
                console.log(i, j);
                button.css('background-color', 'red');
            }
            column.data('row', i);
            column.data('column', j	);
            column.append(button);
            row.append(column);
        }
        table.append(row);
    }
    $('main').append(table);
    alert('hello');
});

function Create2DArray(rows, width) {
  var arr = [];

  for (var i=0;i<rows;i++) {
     arr[i] = Array(width);
  }

  return arr;
}

function fillMines(game, width, height, n) {

    while(n > 0){
        i = getRandomInt(0, width);
        j = getRandomInt(0, height);
        if (!game[j] || game[j][i] != "mine") {
            game[j][i] = "mine";
            n--;
        }
    }
    return game;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

});
