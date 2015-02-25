$(document).ready(function(){

    $('#main').hide();
    $('#create-house-info').hide();

    // START SOCKET WORK


    var socket = io.connect(':50000/');
    $("#create-house").click(function() {
      // alert("Handler for .click() called.");
      
      $('#create-house-info').show();
      
    });

    $('#setHousename').submit(function(e) {
        e.preventDefault();
        socket.emit('new house', $('#nickname').val(), function(data) {
            if (data) {
                // console.log(data);
                // alert(JSON.stringify(nickBox));
                console.log(data);

            }
            else {
                alert("That username has already been chosen! Please enter another.")
            }
        });
        $('#nickname').val('');
        
    });

});
