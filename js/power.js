$(document).ready(function(){$("#content").fadeIn()});

$("#B").hover(function(){
   $(this).stop(true, false).animate({ top: "18px" }, 200);
}, function() {
    $(this).stop(true, false).animate({ top: "14px" }, 200);
});
