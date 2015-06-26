function AddMsg() {
    var box = document.getElementById('msgbox');
    if (box.value.length <= 0) //Ignore empty messages.
        return;
    var messages = document.getElementById('messages');
    var nodes = messages.childNodes;
    if (nodes.length > 50) //Limit of 50 messages.
        nodes[0].remove();
    var msg = document.createElement('div');
    msg.className = 'msg';
    msg.innerHTML = '<p id="user">Ancientgods: </p><p id="body">' + box.value + '</p>';
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
    box.value = '';
}