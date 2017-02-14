document.getElementById("B").addEventListener("mouseover", function(){
	var elem = document.getElementById("B");
	var pos = 6;
	var id = setInterval(frame, 10);
	function frame(){
		if(pos == 10){clearInterval(id);}
		else{
			pos++;
			elem.style.top = pos + "px";
		}
	}
});

document.getElementById("B").addEventListener("mouseout", function(){
	var elem = document.getElementById("B");
	var pos = 10;
	var id2 = setInterval(frame, 10);
	function frame(){
		if(pos == 6){clearInterval(id2);}
		else{
			pos--;
			elem.style.top = pos + "px";
		}
	}
});

