// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

var formatResp = function(data, cont){
  cont.empty();
  for (var key in data) {
    var row = $('<div class = resp_row></div>');
    $('<span class=resp_key></span>').text(key + ':').appendTo(row);
    $('<span class=resp_val></span>').text(data[key]).appendTo(row);
    cont.append(row);
  };
}

$(function() {

  $('form').submit(function(event) {
    event.preventDefault();
    var href = $('input').val();
    $.post('?' + $.param({href: href}), function(data) {
      formatResp(data, $('#response_cont'));
      $('input').val('');
      $('input').focus();
    });
  });

});
