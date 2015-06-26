jQuery(function ($) {
    var socket = io.connect(window.location.hostname + ':3001');
    var $loginButton = $('#loginButton');
    var $username = $('#un');
    var $password = $('#pw');
    $loginButton.click(function (e) {
        e.preventDefault();
        socket.emit('login', { name: $username.val(), pass: $password.val() }, function (data, msg) {
            if (data) {
                window.location.href = '/Terraria/';
            } else if (msg) {
                alert(msg);
            }
        });
    });
});