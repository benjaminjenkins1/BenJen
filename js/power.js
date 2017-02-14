$("#B").hover(function(){
    $(this).stop(true, false).animate({ top: "10px" }, 200);
}, function() {
    $(this).stop(true, false).animate({ top: "6px" }, 200);
});
