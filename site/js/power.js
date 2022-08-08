$(document).ready(function(){
    $("#content").fadeIn();
    $("#this-year").text(new Date().getFullYear());
});

$("#B").hover(function(){
   $(this).stop(true, false).animate({ top: "29px" }, 200);
}, function() {
    $(this).stop(true, false).animate({ top: "25px" }, 200);
});


