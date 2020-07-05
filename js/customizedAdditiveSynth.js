
customizedAdditiveSynth = {
	setExample: function(obj) {
		// Set all sliders value to 0 first
		for (var i = 0; i < $(".additive-slider").length; ++i) {
			$($(".additive-slider")[i]).val(0);
		}
		switch ($(obj).val()) {
			case "sine": 
				// Set the fundamental frequency to be 1
				$("#additive-f1").val(1);
			break;
			
			case "clarinet": 
				var harmonics = [1.0, 0.45, 0.60, 0.28, 0.25, 0.15, 0.15, 0.10, 0.10, 0.10];
				for (var h = 1; h <= harmonics.length; ++h) {
					$("#additive-f" + h).val(harmonics[h-1]);
				}
			break;
			
			case "organ": 
				var harmonics = [1.0, 0.5, 0, 0.25, 0, 0, 0, 0.12, 0, 0];
				for (var h = 1; h <= harmonics.length; ++h) {
					$("#additive-f" + h).val(harmonics[h-1]);
				}
			break;
		}
		// Trigger the on change 
		
		for (var i = 0; i < $(".additive-slider").length; ++i) {
			$(".additive-slider")[i].onchange();
		}
	}
}