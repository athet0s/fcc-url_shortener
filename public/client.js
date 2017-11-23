// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

$(function() {

  $('form').submit(function(event) {
    event.preventDefault();
    var href = $('input').val();
    $.post('?' + $.param({href: href}), function() {
      $('input').val('');
      $('input').focus();
    });
  });

});
