/* init page */
$(window).load(function(){// not document READY !!!
	$('.paint-board-wrapper').PaintBoard();
});

/* PaintBoard */
(function($){
	$.fn.PaintBoard = function(_options){
		// default options
		var options = jQuery.extend({
			/* BOXES */
			boardContainerInner:'.board-inner',
			canvasWrapper:'.paint-board',
			canvasCacheWrappers:'.paint-board-cache',
			hiddenGarbageBox:'.hidden',
			/* PROPERTIES */
			strokeWidth:1,// 1-30
			strokeOpacity:1,// 0-1
			fillTolerance:0,// 0-50
			strokeColor:"#7d7e81",
			fillColor:"#1fd6c9",
			indentForCursorBrush:$.browser.opera ? 0 : 7,// opera doesn't support cursor url
			/* TOOLS */
			tools:'.tool',
			instruments:".instruments a",
			/* BUTTONS */
			wash:'.wash',
			saveBtn:'.save',
			uploadBtn:'.upload',
			undoBtn:'.undo',
			redoBtn:'.redo',
			/* PICKERS */
			colorPicker:'.brush-color-picker',
			fillColorPicker:'.fill-picker',
			/* SLIDERS */
			widthSlider:'.width-slider',
			widthSliderValueBox:'.width-slider-value',
			opacitySlider:'.opacity-slider',
			opacitySliderValueBox:'.opacity-slider-value',
			fillToleranceSlider:'.fill-tolerance-slider',
			fillToleranceSliderValueBox:'.fill-tolerance-slider-value',
			fontSizeSlider:'.font-size-slider',
			fontSizeSliderValueBox:'.font-size-slider-value',
			fontAngleSlider:'.font-angle-slider',
			fontAngleSliderValueBox:'.font-angle-slider-value',
			pictureAngleSlider:'.picture-angle-slider',
			pictureAngleSliderValueBox:'.picture-angle-slider-value',
			pictureWidthSlider:'.picture-width-slider',
			pictureWidthSliderValueBox:'.picture-width-slider-value',
			pictureHeightSlider:'.picture-height-slider',
			pictureHeightSliderValueBox:'.picture-height-slider-value',
			zoomerSlider:'.zoomer-slider',
			zoomerSliderValueBox:'.zoomer-slider-value',
			canvasSlider:'.canvas-zoom-slider',
			canvasSliderValueBox:'.canvas-zoom-slider-value',
			/* SELECTION */
			disableSelectionElements:'*',
			enableSelectionElements:'input:text',
			/* TEXT */
			currentText:'.add-text .current-text input',
			currentFontStyle:'.add-text .current-font-style input',
			currentFontWeight:'.add-text .current-font-weight input',
			currentFontSize:'12',
			currentFontAngle:'0',
			currentFont:'.add-text .current-font select',
			filters:'.filters a',// FILTERS
			/* FILE */
			uploadFileFormWrapper:'.image-upload-wrapper',// FILE UPLOAD */
			uploadFileForm:'.image-upload',
			uploadInputFile:'.input-file',
			uploadFileCallbackInfo:'.callback-info',
			imagePreviewBox:'.upload-image-preview',
			currentPictureAngle:'0',
			currentPictureWidth:'32',
			currentPictureHeight:'32',
			setOriginalPictureSizeChecker:'.set-original-picture-size',
			pictureFitToCanvasChecker:'.picture-fit-to-canvas',
			downloadFileForm:'.image-download',// FILE DOWNLOAD
			publicFileForm:'.image-public',// FILE PUBLIC
			saveFileFormWrapper:'.image-save-wrapper',// FILE SAVE
			/* ZOOMER */
			zoomer:'.zoomer',
			zoomerCacheArray:'.zoomer-cache-array',
			/* FLIP */
			flipHorizontal:'.flip-horizontal',
			flipVertical:'.flip-vertical',
			/* DRAG AND DROP */
			dragAndDropMessage:'.drag-and-drop-message',
			dragMouseInClass:'drag',
			/* CURSOR */
			cursor:'.cursor',
			cursorCacheArray:'.cursor-cache-array',
			cursorIcon:'.cursor-icon',
			cursorStrokeStyle:'rgba(255,255,255,0)',
			cursorSmallestSizeX:5,
			cursorSmallestSizeY:5
		},_options);
		return this.each(function(){
			if(!Modernizr.canvas){
				alert("Your browser doesn't support canvas.");
				return;
			}
			// SET VARS
			var _boardContainer = $(this);
			var boardContainerInner = _boardContainer.find(options.boardContainerInner);
			var touchDevice = false;
			if (Modernizr.touch) touchDevice = true;// if browser support touch
			var _html = $('html').eq(0);
			_boardContainer.find(options.tools).show();// show tools
			var _indentForCursorBrush = options.indentForCursorBrush;// indent for tools brush
			var _strokeWidth = options.strokeWidth;// stroke width
			var _strokeOpacity = options.strokeOpacity;// stroke opacity
			var _fillTolerance = options.fillTolerance;// fill tolerance
			var _strokeColor = options.strokeColor;// stroke color
			var _fillColor = options.fillColor;// fill color
			var _canvasWrapper = _boardContainer.find(options.canvasWrapper);
			var _wash = _boardContainer.find(options.wash);
			var _pressedFlag = false;// FLAGS
			var _underFlag = false;
			var _x = 0;// COORD
			var _y = 0;
			var eX = 0;
			var eY = 0;
			var allPointsArray = [];//set pointsArray for all points on mousemove after last mousedown before mouseup
			var pointsArray = new Array(10);//set pointsArray for 10 last points
			var pointerCurrent = 0;
			var mouseMoveCounter = 0;
			var _instruments = _boardContainer.find(options.instruments);// set instruments
			var _activeInstrumentNumber = 0;
			var _currentHistoryVersion = 0;
			var zoomer = _boardContainer.find(options.zoomer);// zoomer
			var zoommerWidth = parseInt(zoomer.width());
			var zoommerHeight = parseInt(zoomer.height());
			var zoomerCacheArray = _boardContainer.find(options.zoomerCacheArray);
			var hiddenGarbageBox = _boardContainer.find(options.hiddenGarbageBox);
			var zoomFactor = 2;
			var cursor = _boardContainer.find(options.cursor);// cursor
			var cursorCacheArray = _boardContainer.find(options.cursorCacheArray);
			var ribbonBrushArray = [];// for ribbon brush
			var ribbonMouseX=0;
			var ribbonMouseY=0;
			var currentTextBoxes = _boardContainer.find(options.currentText);// TEXT
			var currentFontStyleBoxes = _boardContainer.find(options.currentFontStyle);
			var currentFontWeightBoxes = _boardContainer.find(options.currentFontWeight);
			var _fontSize = options.currentFontSize;
			var _fontAngle = options.currentFontAngle;
			var currentFontBoxes = _boardContainer.find(options.currentFont);
			var uploadFileFormWrapper = _boardContainer.find(options.uploadFileFormWrapper);// FILE UPLOAD
			var uploadFileForm = _boardContainer.find(options.uploadFileForm);
			var uploadInputFile = uploadFileForm.find(options.uploadInputFile);
			var uploadFileCallbackInfo = uploadFileForm.find(options.uploadFileCallbackInfo);
			var imagePreviewBox = _boardContainer.find(options.imagePreviewBox);
			var _pictureAngle = options.currentPictureAngle;
			var _pictureWidth = options.currentPictureWidth;
			var _pictureHeight = options.currentPictureHeight;
			var setOriginalPictureSizeChecker = _boardContainer.find(options.setOriginalPictureSizeChecker);
			var pictureFitToCanvasChecker = _boardContainer.find(options.pictureFitToCanvasChecker);
			var downloadFileForm = _boardContainer.find(options.downloadFileForm);// FILE DOWNLOAD
			var publicFileForm = _boardContainer.find(options.publicFileForm);// FILE PUBLIC
			var saveFileFormWrapper = _boardContainer.find(options.saveFileFormWrapper);// FILE SAVE
			var flipHorizontal = _boardContainer.find(options.flipHorizontal);// FLIP
			var flipVertical = _boardContainer.find(options.flipVertical);
			var filters = _boardContainer.find(options.filters);// FILTERS
			/* DRAG AND DROP */
			var dragAndDropMessage = _boardContainer.find(options.dragAndDropMessage);
			var dragMouseInClass = options.dragMouseInClass;
			/* create CANVAS */
			var _canvasWrapperW = parseInt(_canvasWrapper.width());// get size
			var _canvasWrapperH = parseInt(_canvasWrapper.height());
			_canvasWrapper.css('height',_canvasWrapperH);// set styles
			var createDynamicCanvas = function(elToAppendCanvas,dynamicCanvasWidth,dynamicCanvasHeight){// create dynamic canvas
				var dynamicCanvasW = typeof(dynamicCanvasWidth)!='undefined' ? dynamicCanvasWidth : _canvasWrapperW;
				var dynamicCanvasH = typeof(dynamicCanvasHeight)!='undefined' ? dynamicCanvasHeight : _canvasWrapperH;
				var _dynamicCanvas = $('<canvas />').get(0);
				elToAppendCanvas.append(_dynamicCanvas);
				var currentPaper = _dynamicCanvas.getContext('2d');
				$(_dynamicCanvas).attr({
					'width':dynamicCanvasW,
					'height':dynamicCanvasH
				}).css({
					'width':dynamicCanvasW,
					'height':dynamicCanvasH
				});
				var result = {
					canvas:_dynamicCanvas,
					paper:currentPaper
				};
				return result;
			}
			var _createMainCanvasResult = createDynamicCanvas(hiddenGarbageBox,options.canvasMaxSize,parseInt(options.canvasMaxSize*(_canvasWrapperH/_canvasWrapperW)));// create basic canvas
			var paperMain = _createMainCanvasResult.paper;
			var _canvasMain = _createMainCanvasResult.canvas;
			var _createCanvasResult = createDynamicCanvas(_canvasWrapper);// create basic canvas
			var paper = _createCanvasResult.paper;
			var _canvas = _createCanvasResult.canvas;
			var canvasPositionTop = $(_canvas).position().top;// canvas position
			var canvasPositionLeft = $(_canvas).position().left;
			var _paperCacheWrappersArray = [];// 0 - for save current canvas state, 1 - for paint in one layer, 2 - to flip
			var _paperCacheArray = [];
			var _canvasCacheArray = [];
			var _canvasCacheWrappes = _boardContainer.find(options.canvasCacheWrappers).hide().each(function(){
				var _createCacheCanvasResult = createDynamicCanvas($(this));
				_paperCacheWrappersArray.push($(this));
				_paperCacheArray.push(_createCacheCanvasResult.paper);
				_canvasCacheArray.push(_createCacheCanvasResult.canvas);
			});
			/* ZOOMER CANVAS */
			var _zoomerCanvasResult = createDynamicCanvas(zoomer);
			var paperZoomer = _zoomerCanvasResult.paper;
			var _canvasZoomer = _zoomerCanvasResult.canvas;
			var _zoomerCacheArrayCanvasResult = createDynamicCanvas(zoomerCacheArray);
			var paperZoomerCacheArray = _zoomerCacheArrayCanvasResult.paper;
			var _canvasZoomerCacheArray = _zoomerCacheArrayCanvasResult.canvas;
			/* CURSOR CANVAS */
			var _cursorCanvasResult = createDynamicCanvas(cursor);
			var paperCursor = _cursorCanvasResult.paper;
			var _canvasCursor = _cursorCanvasResult.canvas;
			var _cursorCacheArrayCanvasResult = createDynamicCanvas(cursorCacheArray);
			var paperCursorCacheArray = _cursorCacheArrayCanvasResult.paper;
			var _canvasCursorCacheArray = _cursorCacheArrayCanvasResult.canvas;
			var _colorPicker = _boardContainer.find(options.colorPicker);// color picker
			var _fillColorPicker = _boardContainer.find(options.fillColorPicker);
			/* CANVAS ZOOM */
			var canvasMinSize = options.canvasMinSize;
			var canvasMaxSize = options.canvasMaxSize;
			/* FUNCTIONS */
			if(touchDevice){// get native events for touch device
				var getNativeEvent = function(event){// service function for get touch event
					while (event && typeof event.originalEvent !== "undefined") {
						event = event.originalEvent;
					}
					return event;
				}
			}
			var radian2degree = function(radianValue) {
				var degreeValue = radianValue*(180/Math.PI);
				return degreeValue;
			}
			var degree2radian = function(degreeValue) {
				var radianValue = degreeValue/(180/Math.PI);
				return radianValue;
			}
			var imageDataToImage = function(imageData,width,height,toPaper,newWidth,newHeight){
				var $canvas = $('<canvas />').appendTo(hiddenGarbageBox).attr({
					'width':width,
					'height':height
				});
				var canvas = $canvas.get(0);
				var ctx = canvas.getContext('2d');
				ctx.putImageData(imageData, 0, 0);// Copy the image contents to the canvas
				toPaper.clearRect(0,0,newWidth,newHeight);
				toPaper.drawImage(canvas,0,0,newWidth,newHeight);
				$canvas.remove();
			}
			/* EVENTS */
			_canvasWrapper/* CONTENT events */
				.bind('mousedown touchstart',function(e){
					_pressedFlag=true;
					var _offset = _canvasWrapper.offset();
					var eventTarget = e;
					if (touchDevice) eventTarget = getNativeEvent(e).touches[0];
					eX = eventTarget.pageX;
					eY = eventTarget.pageY;
					_x = eX-_offset.left+_indentForCursorBrush;
					_y = eY-_offset.top+_indentForCursorBrush;
					pointsArray = new Array(10);// reset pointsArray
					pointsArray[0] = [_x, _y];
					pointerCurrent = 0;
					mouseMoveCounter = 0;
					allPointsArray = [];// reset allPointsArray
					allPointsArray[0] = [_x, _y];
					_paperCacheArray[1].clearRect(0, 0, _canvasWrapperW, _canvasWrapperH);
					_paperCacheWrappersArray[1].show();
					if(_activeInstrumentNumber==11){// ribbon
						(function(){
							for (var b = 0; b < ribbonBrushArray.length; b++) {
								ribbonBrushArray[b].dx = _x;
								ribbonBrushArray[b].dy = _y;
							}
						}());
					}
					// set context properties
					_paperCacheArray[1].strokeStyle = paper.strokeStyle = _strokeColor;
					_paperCacheArray[1].fillStyle = paper.fillStyle = _fillColor;
					_paperCacheArray[1].lineWidth = paper.lineWidth = _strokeWidth;
					_paperCacheArray[1].globalAlpha = paper.globalAlpha = _strokeOpacity;
					_paperCacheArray[1].shadowBlur = paper.shadowBlur = 0;
					_paperCacheArray[1].shadowOffsetX = paper.shadowOffsetX = 0;
					_paperCacheArray[1].shadowColor = paper.shadowColor = _strokeColor;
					_paperCacheArray[1].lineJoin = paper.lineJoin = 'round';
					_paperCacheArray[1].lineCap = paper.lineCap = 'round';
					_paperCacheArray[1].save();
					paper.save();
					if (_underFlag) {// if mouse under content
						if(_activeInstrumentNumber==5){// eyedropper
							(function(){
								if(paper.getImageData(_x, _y, 1, 1).data[3]){// if current pixel is visible
									_strokeColor = $.Color(// get eyecolor for current pixel
										paper.getImageData(_x, _y, 1, 1).data[0],
										paper.getImageData(_x, _y, 1, 1).data[1],
										paper.getImageData(_x, _y, 1, 1).data[2]
									).toHexString().toLowerCase();
									_colorPicker.ColorPickerSetColor(_strokeColor).trigger('changeColor');
								}
							}());
						}
						if (_activeInstrumentNumber==6) {// paint bucket
							(function(){
								mouseMoveCounter++;// for trigger save state on mouseup
								var _strokeColorRGB = $.Color(_strokeColor)
								fillArea({
									startX: _x,
									startY: _y,
									canvasWidth: _canvasWrapperW,
									canvasHeight: _canvasWrapperH,
									drawingBoundTop: 0,
									canvasData: paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH),
									startR: 255,
									startG: 255,
									startB: 255,
									fillColorR: _strokeColorRGB.red(),
									fillColorG: _strokeColorRGB.green(),
									fillColorB: _strokeColorRGB.blue(),
									canvasContext: paper
								});
							}());
						}
						if(_activeInstrumentNumber==13) {// add text
							(function(){
								mouseMoveCounter++;// for trigger save state on mouseup
								var currentText = currentTextBoxes.val();
								var currentFontStyle = currentFontStyleBoxes.filter(':checked').val();
								var currentFontWeight = currentFontWeightBoxes.filter(':checked').val();
								var currentFont = currentFontBoxes.val();
								paper.save();
									paper.font = currentFontStyle+' '+currentFontWeight+' '+_fontSize+'px '+currentFont;
									paper.translate(_x,_y);
									paper.rotate(-degree2radian(_fontAngle));
									paper.fillText(currentTextBoxes.val(),0,0);
									paper.strokeText(currentTextBoxes.val(),0,0);
								paper.restore();
							}());
						}
						if(_activeInstrumentNumber==15){// picture
							(function(){
								mouseMoveCounter++;// for trigger save state on mouseup
								var img = imagePreviewBox.find('img').eq(0);
								if(img.length){
									var pic = new Image();
									pic.onload = function() {
										paper.save();
											if(pictureFitToCanvasChecker.prop('checked')){
												paper.drawImage(pic,0,0,_canvasWrapperW,_canvasWrapperH);
											}else{
												paper.translate(_x,_y);
												paper.rotate(-degree2radian(_pictureAngle));
												if(setOriginalPictureSizeChecker.prop('checked')){
													paper.drawImage(pic,0,0);
												}else{
													paper.drawImage(pic,0,0,_pictureWidth,_pictureHeight);
												}
											}
										paper.restore();
										_canvasWrapper.trigger('saveCanvasState');// undo-redo
									}
									pic.src = img.attr('src');
								}
							}());
						}
					}
				}).bind('mouseenter touchstart',function(){
					_underFlag=true;
				}).bind('mouseleave touchend',function(){
					_underFlag=false;
				}).bind('touchmove',function(e){
					if (touchDevice) e.preventDefault();// no scroll
				}).bind("mousemove", function() {// to prevent _underFlag==false on mouse position under wrapper on page load and dialog hide
					_underFlag=true;
				});
			$(document)/* DOCUMENT events */
				.bind('mouseup touchend',function(){
					if(mouseMoveCounter && _pressedFlag){
						mergePapers({
							resultPaper:paper,
							resultCanvas:_canvas,
							secondPaper:_paperCacheArray[1],
							secondCanvas:_canvasCacheArray[1]
						});
						_paperCacheWrappersArray[1].hide();
						_canvasWrapper.trigger('saveCanvasState');// undo-redo
							repaintZoomer();
					}
					_pressedFlag = false;
				}).bind('mousemove touchmove',function(e){/* MOUSEMOVE events */
					var eventTarget = e;
					if (touchDevice) eventTarget = getNativeEvent(e).touches[0];
					eX = eventTarget.pageX;
					eY = eventTarget.pageY;
					allPointsArray.push([_x, _y]);
					if(_underFlag){// if mouse under content
						var _offset = _canvasWrapper.offset();
						var _oldX = _x;
						var _oldY = _y;
						_x = eventTarget.pageX-_offset.left+_indentForCursorBrush;
						_y = eventTarget.pageY-_offset.top+_indentForCursorBrush;
						/* PAINT */
						if(_pressedFlag){// and click inside
							_paperCacheArray[1].beginPath();
							paper.beginPath();
							if(_activeInstrumentNumber==0){// pencil brush
								_paperCacheArray[1].clearRect(0, 0, _canvasWrapperW, _canvasWrapperH);
								_paperCacheArray[1].moveTo(allPointsArray[0][0],allPointsArray[0][1]);
								(function(){
									for (var i = 1,_arrayLength=allPointsArray.length; i < _arrayLength; i++){
										_paperCacheArray[1].lineTo(allPointsArray[i][0],allPointsArray[i][1]);
									};
								}());
							}else if(_activeInstrumentNumber==1){// soft brush
								if(_strokeWidth<2) _paperCacheArray[1].lineWidth = paper.lineWidth = 2;// to prevent fill bug in webkit
								_paperCacheArray[1].shadowBlur = _strokeWidth*1.5;
								_paperCacheArray[1].shadowOffsetX = paper.shadowOffsetX = -9999;
								_paperCacheArray[1].clearRect(0, 0, _canvasWrapperW, _canvasWrapperH);
								_paperCacheArray[1].moveTo(allPointsArray[0][0]+9999,allPointsArray[0][1]);
								(function(){
									for (var i = 1,_arrayLength=allPointsArray.length; i < _arrayLength; i++){
										_paperCacheArray[1].lineTo(allPointsArray[i][0]+9999,allPointsArray[i][1]);
									};
								}());
							}else if(_activeInstrumentNumber==2){// pencil brush with shadow
								if(_strokeWidth<2) _paperCacheArray[1].lineWidth = paper.lineWidth = 2;// to prevent fill bug in webkit
								_paperCacheArray[1].shadowBlur = _strokeWidth*1.5;
								_paperCacheArray[1].clearRect(0, 0, _canvasWrapperW, _canvasWrapperH);
								_paperCacheArray[1].moveTo(allPointsArray[0][0],allPointsArray[0][1]);
								(function(){
									for (var i = 1,_arrayLength=allPointsArray.length; i < _arrayLength; i++){
										_paperCacheArray[1].lineTo(allPointsArray[i][0],allPointsArray[i][1]);
									};
								}());
							}else if(_activeInstrumentNumber==3){// fir-tree brush
								(function(){
									for (var i = 0; i < 7; i++){
										paper.moveTo(_oldX + Math.round(Math.random()*10-5),_oldY + Math.round(Math.random()*10-5));
										paper.lineTo(_x,_y);
									};
								}());
							}else if(_activeInstrumentNumber==4){// sketch brush
								(function(){
									var nextpoint = pointerCurrent + 1;
									if (nextpoint > 9) nextpoint = 0;
									paper.moveTo(pointsArray[pointerCurrent][0],pointsArray[pointerCurrent][1]);
									paper.lineTo(_x, _y);
									if (pointsArray[nextpoint]) {
										paper.moveTo(pointsArray[nextpoint][0] + Math.round(Math.random()*10-5),pointsArray[nextpoint][1] + Math.round(Math.random()*10-5));
										paper.lineTo(_x, _y);
									}
									paper.stroke();
									pointerCurrent = nextpoint;
									pointsArray[pointerCurrent] = [_x, _y];
								}());
							}else if(_activeInstrumentNumber==5){// eyedropper
								(function(){
									if(paper.getImageData(_x, _y, 1, 1).data[3]){// if current pixel is visible
										_strokeColor = $.Color(// get eyecolor for current pixel
											paper.getImageData(_x, _y, 1, 1).data[0],
											paper.getImageData(_x, _y, 1, 1).data[1],
											paper.getImageData(_x, _y, 1, 1).data[2]
										).toHexString().toLowerCase();
										_colorPicker.ColorPickerSetColor(_strokeColor).trigger('changeColor');
									}
								}());
							}else if(_activeInstrumentNumber==7){// squares
								(function(){
									var b, a, g, e, c;
									b = _x - _oldX;
									a = _y - _oldY;
									g = 1.57079633;
									e = Math.cos(g) * b - Math.sin(g) * a;
									c = Math.sin(g) * b + Math.cos(g) * a;
									paper.moveTo(_oldX - e, _oldY - c);
									paper.lineTo(_oldX + e, _oldY + c);
									paper.lineTo(_x + e, _y + c);
									paper.lineTo(_x - e, _y - c);
									paper.lineTo(_oldX - e, _oldY - c);
									paper.fill();
								}());
							}else if(_activeInstrumentNumber==8){// sketchy
								(function(){
									paper.moveTo(_oldX,_oldY);
									paper.lineTo(_x,_y);
									paper.stroke();
									paper.globalAlpha = 0.15*_strokeOpacity;
									for (var e = 0; e < allPointsArray.length; e++) {
										var b = allPointsArray[e][0] - allPointsArray[mouseMoveCounter][0];
										var a = allPointsArray[e][1] - allPointsArray[mouseMoveCounter][1];
										var coeff = 0.07;
										var g = b * b + a * a;
										if (g < 4000 && Math.random() > (g / 2000)) {
											paper.beginPath();
											paper.moveTo(allPointsArray[mouseMoveCounter][0] + (b * coeff), allPointsArray[mouseMoveCounter][1] + (a * coeff));
											paper.lineTo(allPointsArray[e][0] - (b * coeff), allPointsArray[e][1] - (a * coeff));
											paper.stroke()
										}
									}
									paper.globalAlpha = _strokeOpacity;
								}());
							}else if(_activeInstrumentNumber==9){// fur
								(function(){
									paper.moveTo(_oldX,_oldY);
									paper.lineTo(_x,_y);
									paper.stroke();
									paper.globalAlpha = 0.15*_strokeOpacity;
									for (var e = 0; e < allPointsArray.length; e++) {
										var b = allPointsArray[e][0] - allPointsArray[mouseMoveCounter][0];
										var a = allPointsArray[e][1] - allPointsArray[mouseMoveCounter][1];
										var coeff = 0.5;
										var g = b * b + a * a;
										if (g < 2000 && Math.random() > (g / 2000)) {
											paper.beginPath();
											paper.moveTo(_x + (b * coeff), _y + (a * coeff));
											paper.lineTo(_x - (b * coeff), _y - (a * coeff));
											paper.stroke()
										}
									}
									paper.globalAlpha = _strokeOpacity;
								}());
							}else if(_activeInstrumentNumber==10){// web
								(function(){
									paper.moveTo(_oldX,_oldY);
									paper.lineTo(_x,_y);
									paper.stroke();
									paper.globalAlpha = 0.15*_strokeOpacity;
									for (var e = 0; e < allPointsArray.length; e++) {
										var b = allPointsArray[e][0] - allPointsArray[mouseMoveCounter][0];
										var a = allPointsArray[e][1] - allPointsArray[mouseMoveCounter][1];
										var coeff = 0.5;
										var g = b * b + a * a;
										if (g < 2500 && Math.random() > 0.9) {
											paper.beginPath();
											paper.moveTo(allPointsArray[mouseMoveCounter][0], allPointsArray[mouseMoveCounter][1]);
											paper.lineTo(allPointsArray[e][0], allPointsArray[e][1]);
											paper.stroke()
										}
									}
									paper.globalAlpha = _strokeOpacity;
								}());
							}else if(_activeInstrumentNumber==11){// ribbon
								ribbonMouseX = _x;
								ribbonMouseY = _y;
								for (var e = 0,ribbonBrushArrayLength=ribbonBrushArray.length; e < ribbonBrushArrayLength; e++) {
									paper.beginPath();
									paper.moveTo(ribbonBrushArray[e].dx, ribbonBrushArray[e].dy);
									ribbonBrushArray[e].dx -= ribbonBrushArray[e].ax = (ribbonBrushArray[e].ax + (ribbonBrushArray[e].dx - ribbonMouseX) * ribbonBrushArray[e].div) * ribbonBrushArray[e].ease;
									ribbonBrushArray[e].dy -= ribbonBrushArray[e].ay = (ribbonBrushArray[e].ay + (ribbonBrushArray[e].dy - ribbonMouseY) * ribbonBrushArray[e].div) * ribbonBrushArray[e].ease;
									paper.lineTo(ribbonBrushArray[e].dx, ribbonBrushArray[e].dy);
									paper.stroke();
								}
							}else if(_activeInstrumentNumber==12){// bubbles
								(function(){
									var centerX = _oldX + parseInt((_x-_oldX)/2);
									var centerY = _oldY + parseInt((_y-_oldY)/2);
									var radius = parseInt(Math.sqrt((_oldX - centerX) * (_oldX - centerX) + (_oldY - centerY) * (_oldY - centerY)));
									paper.beginPath();
									paper.arc(centerX, centerY, radius, 0, 2 * Math.PI, true);
									paper.fill();
								}());
							}else if(_activeInstrumentNumber==14){// eraser
								(function(){
									paper.stroke();
									paper.save();
										paper.globalCompositeOperation = 'destination-out';
										paper.beginPath();
										paper.moveTo(_oldX,_oldY);
										paper.lineTo(_x,_y);
										paper.stroke();
									paper.restore();
									paper.beginPath();
								}());
							}
							_paperCacheArray[1].stroke();
							paper.stroke();
						}
						repaintZoomer();
					}
					mouseMoveCounter++;
				});
			/* CLICK functionality */
			_wash/* WASH */
				.click(function(event){//_wash events if need
					event.stopPropagation();
					event.preventDefault();
					if (confirm("Are you sure want to clear all canvas?")) {
						_canvasWrapper.trigger('clearCanvas');// undo-redo
					}
				});
			/* STROKE WIDTH SLIDER */
			(function(){
				var _slider = _boardContainer.find(options.widthSlider);
				var _sliderValueBox = _boardContainer.find(options.widthSliderValueBox);
				_slider.slider({
					range: "min",
					value: _strokeWidth,
					min: 1,
					max: 30,
					step: 1,
					slide: function( event, ui ) {
						_strokeWidth = ui.value;
						_sliderValueBox.text(ui.value);
						_canvasWrapper.trigger('repaintCursor');
					}
				});
				_sliderValueBox.text(_slider.slider("value"));
			}());
			/* OPACITY SLIDER */
			(function(){
				var _slider = _boardContainer.find(options.opacitySlider);
				var _sliderValueBox = _boardContainer.find(options.opacitySliderValueBox);
				_slider.slider({
					range: "min",
					value: _strokeOpacity,
					min: 0.1,
					max: 1,
					step: 0.1,
					slide: function( event, ui ) {
						_strokeOpacity = ui.value;
						_sliderValueBox.text(ui.value);
						_canvasWrapper.trigger('repaintCursor');
					}
				});
				_sliderValueBox.text(_slider.slider("value"));
			}());
			/* FILL TOLERANCE SLIDER */
			(function(){
				var _slider = _boardContainer.find(options.fillToleranceSlider);
				var _sliderValueBox = _boardContainer.find(options.fillToleranceSliderValueBox);
				_slider.slider({
					range: "min",
					value: _fillTolerance,
					min: 0,
					max: 100,
					step: 1,
					slide: function( event, ui ) {
						_fillTolerance = ui.value;
						_sliderValueBox.text(ui.value+'%');
					}
				});
				_sliderValueBox.text(_slider.slider("value")+'%');
			}());
			/* FONT SIZE SLIDER */
			(function(){
				var _slider = _boardContainer.find(options.fontSizeSlider);
				var _sliderValueBox = _boardContainer.find(options.fontSizeSliderValueBox);
				_slider.slider({
					range: "min",
					value: _fontSize,
					min: 10,
					max: 450,
					step: 1,
					slide: function( event, ui ) {
						_fontSize = ui.value;
						_sliderValueBox.text(ui.value+' px');
					}
				});
				_sliderValueBox.text(_slider.slider("value")+' px');
			}());
			/* FONT ANGLE SLIDER */
			(function(){
				var _slider = _boardContainer.find(options.fontAngleSlider);
				var _sliderValueBox = _boardContainer.find(options.fontAngleSliderValueBox);
				_slider.slider({
					range: "min",
					value: _fontAngle,
					min: 0,
					max: 359,
					step: 1,
					slide: function( event, ui ) {
						_fontAngle = ui.value;
						_sliderValueBox.text(ui.value+' degree');
					}
				});
				_sliderValueBox.text(_slider.slider("value")+' degree');
			}());
			/* PICTURE ANGLE SLIDER */
			(function(){
				var _slider = _boardContainer.find(options.pictureAngleSlider);
				var _sliderValueBox = _boardContainer.find(options.pictureAngleSliderValueBox);
				_slider.slider({
					range: "min",
					value: _pictureAngle,
					min: 0,
					max: 359,
					step: 1,
					slide: function( event, ui ) {
						_pictureAngle = ui.value;
						_sliderValueBox.text(ui.value+' degree');
					}
				});
				_sliderValueBox.text(_slider.slider("value")+' degree');
			}());
			/* PICTURE WIDTH SLIDER */
			(function(){
				var _slider = _boardContainer.find(options.pictureWidthSlider);
				var _sliderValueBox = _boardContainer.find(options.pictureWidthSliderValueBox);
				_slider.slider({
					range: "min",
					value: _pictureWidth,
					min: 1,
					max: _canvasWrapperW,
					step: 1,
					slide: function( event, ui ) {
						_pictureWidth = ui.value;
						_sliderValueBox.text(ui.value+' px');
					}
				});
				_sliderValueBox.text(_slider.slider("value")+' px');
			}());
			/* PICTURE HEIGHT SLIDER */
			(function(){
				var _slider = _boardContainer.find(options.pictureHeightSlider);
				var _sliderValueBox = _boardContainer.find(options.pictureHeightSliderValueBox);
				_slider.slider({
					range: "min",
					value: _pictureHeight,
					min: 1,
					max: _canvasWrapperH,
					step: 1,
					slide: function( event, ui ) {
						_pictureHeight = ui.value;
						_sliderValueBox.text(ui.value+' px');
					}
				});
				_sliderValueBox.text(_slider.slider("value")+' px');
			}());
			/* ZOOMER SLIDER */
			(function(){
				var _slider = _boardContainer.find(options.zoomerSlider);
				var _sliderValueBox = _boardContainer.find(options.zoomerSliderValueBox);
				_slider.slider({
					orientation: "vertical",
					range: "min",
					value: zoomFactor,
					min: 1,
					max: 10,
					step: 1,
					slide: function( event, ui ) {
						zoomFactor = ui.value;
						_sliderValueBox.text('x'+ui.value);
					}
				});
				_sliderValueBox.text('x'+_slider.slider("value"));
			}());
			/* COLOR PICKERS */
			function createColorPicker(objData){
				/*
					objData.box
					objData.color
					objData.onChange
				*/
					objData.box.ColorPicker({
						color: objData.color ? objData.color : '#0000ff',
						onShow: function (colpkr) {
							if(!$(colpkr).is(':visible')) $(colpkr).fadeIn(100);
							return false;
						},
						onHide: function (colpkr) {
							if($(colpkr).is(':visible')) $(colpkr).fadeOut(100);
							return false;
						},
						onChange: function (hsb, hex, rgb) {
							objData.box.trigger({
								type:'changeColor',
								hsb:hsb,
								hex:hex,
								rgb:rgb
							});
							if (typeof(objData.onChange)=='function') objData.onChange();
						}
					});
					objData.box.bind('changeColor',function(data){/* on picker change */
						objData.box.find('div').css('backgroundColor', '#' + objData.box.ColorPickerGetCurrentHexColor());
					}).trigger('changeColor');// trigger change on create
			}
				/*
				// set color
				box.ColorPickerSetColor('#000').trigger('changeColor');
				// get color
				box.ColorPickerGetCurrentHexColor();
				*/
			/* STROKE COLOR PICKER */
			createColorPicker({
				box:_colorPicker,
				color:_strokeColor,
				onChange:function(){
					_strokeColor = '#'+_colorPicker.ColorPickerGetCurrentHexColor();
					_canvasWrapper.trigger('changeStrokeColor');
				}
			});
			/* FILL PICKER */
			createColorPicker({
				box:_fillColorPicker,
				color:_fillColor,
				onChange:function(){
					_fillColor = '#'+_fillColorPicker.ColorPickerGetCurrentHexColor();
				}
			});
			/* INSTRUMENTS */
			(function(){
				var _activeInstrument = _instruments.filter('.active').length;
				if(_activeInstrument.length>1){
					_instruments.removeClass('active').eq(0).addClass('active');
				}else if(!_activeInstrument.length){
					_instruments.removeClass('active').eq(0).addClass('active');
				}
				_activeInstrument = _instruments.filter('.active');
				_activeInstrumentNumber = _instruments.index(_activeInstrument);
				_instruments.click(function(){
					if(!$(this).hasClass('active')){
						_instruments.removeClass('active');
						$(this).addClass('active');
						_activeInstrumentNumber = _instruments.index($(this));
					}
					return false;
				});
			}());
			/* DISABLE SELECTION */
			(function(){
				if(options.enableSelectionElements){
					var _enableSelectionElements = _boardContainer.find(options.enableSelectionElements);
					_boardContainer.find(options.disableSelectionElements).each(function(){
						if(!$(this).find(_enableSelectionElements).length && !$(this).closest(_enableSelectionElements).length){
							$(this).disableSelection();
						}
					});
				}else{
					_boardContainer.find(options.disableSelectionElements).disableSelection();
				}
			}());
			/* SAVE CANVAS */
			function mergePapers(currentOptions){
				currentOptions.resultPaper.save();
				currentOptions.secondPaper.save();
					currentOptions.resultPaper.shadowBlur = currentOptions.secondPaper.shadowBlur = 0;// prevent add shadows to img
					currentOptions.resultPaper.globalAlpha = currentOptions.secondPaper.globalAlpha = 1;// opacity for image fix
					currentOptions.resultPaper.drawImage(currentOptions.secondCanvas,0,0);
					if(typeof(currentOptions.loadCallback)=='function') currentOptions.loadCallback();
				currentOptions.resultPaper.restore();
				currentOptions.secondPaper.restore();
			}
			(function(){
				var saveCanvas = function(flag){
					_paperCacheArray[0].clearRect(0, 0, _canvasWrapperW, _canvasWrapperH);
					mergePapers({
						resultPaper:_paperCacheArray[0],
						resultCanvas:_canvasCacheArray[0],
						secondPaper:paper,
						secondCanvas:_canvas
					});
					/* save image */
					var canvasData = _canvasCacheArray[0].toDataURL("image/png");
					if(typeof(flag)!='undefined' && flag=='toFile'){// SAVE TO FILE
						downloadFileForm.find(':hidden').val(canvasData);
						downloadFileForm.trigger('submit');
					}else if(typeof(flag)!='undefined' && flag=='share'){// SHARE
						$.ajax({
							type:'POST',
							dataType:'xml',
							url:publicFileForm.attr('action'),
							data:{dataurl:canvasData},
							success:function(response){
								if($(response).find('original_image').length){// picture published
									window.open($(response).find('original_image').text(), "mywindow");
								}else if($(response).find('error_code').length){// server error
									alert('Sorry, shit happens. Server Error Code is: '+$(response).find('error_code').text());
								}else{// unknown error
									alert('Sorry, shit happens.');
								};
							},
							error:function(xhr, ajaxOptions, thrownError){
								alert('Sorry, shit happens. Server status is: "'+xhr.status+'". Thrown error: "'+thrownError+'"');
							}
						});
					}else{// OPEN DATA URL IN NEW WINDOW
						window.open(canvasData, "mywindow");
					}
				}
				_canvasWrapper.bind('saveCanvas',function(){
					saveCanvas();
				});
				saveFileFormWrapper.dialog({
					resizable:false,
					draggable:true,
					autoOpen:false,
					width:350,
					height:0,
					minWidth:350,
					minHeight:0,
					modal:true,
					buttons:{
						'SAVE TO FILE':function() {
							saveCanvas('toFile');
							saveFileFormWrapper.dialog( "close" );
						},
						'SHARE':function() {
							saveCanvas('share');
							saveFileFormWrapper.dialog( "close" );
						},
						'OPEN DATA URL':function() {
							saveCanvas();
							saveFileFormWrapper.dialog( "close" );
						}
					}
				});
				var saveBtn = _boardContainer.find(options.saveBtn).click(function(){
					saveFileFormWrapper.dialog( "open" );
					return false;
				});
				$.ctrl('S', function() {_canvasWrapper.trigger('saveCanvas');});//init key event
			}());
			/* FILTERS */
			$(function(){
				var grayscaleFilters = function(index){// GRAYSCALE FILTERS
					var imgd = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var pix = imgd.data;
					var setPix = function (i,value) {
						pix[i] = pix[i+1] = pix[i+2] = value;
					};
					for (var i = 0, n = pix.length; i < n; i += 4) {
						var r = pix[i  ]; // red
						var g = pix[i+1]; // green
						var b = pix[i+2]; // blue
						switch (index) {
							case 'luminance': setPix(i, 0.2126*r + 0.7152*g + 0.0722*b); break;
							case 'average'  : setPix(i, (r + g + b)/3); break;
							case 'red'      : setPix(i, r); break;
							case 'green'    : setPix(i, g); break;
							case 'blue'     : setPix(i, b); break;
							default         : setPix(i, 0.3*r + 0.59*g + 0.11*b); break;
						}
						// i+3 is alpha (the fourth element)
					}
					paper.clearRect(0, 0, _canvasWrapperW, _canvasWrapperH);
					paper.putImageData(imgd, 0, 0);
					_canvasWrapper.trigger('saveCanvasState');// undo-redo
				}
				var invertColors = function(){// INVERT COLORS
					var imgd = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var pix = imgd.data;
					for (var i = 0, n = pix.length; i < n; i += 4) {
						pix[i] = 255-pix[i]; // red
						pix[i+1] = 255-pix[i+1]; // green
						pix[i+2] = 255-pix[i+2]; // blue
						// i+3 - alpha
					}
					paper.clearRect(0, 0, _canvasWrapperW, _canvasWrapperH);
					paper.putImageData(imgd, 0, 0);
					_canvasWrapper.trigger('saveCanvasState');// undo-redo
				}
				var sepiaFilter = function(){
					var imgd = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var pix = imgd.data;
					for (var i = 0, n = pix.length; i < n; i += 4) {
						pix[i] = (pix[i] * 0.393 + pix[i+1] * 0.769 + pix[i+2] * 0.189); // red
						pix[i+1] = (pix[i] * 0.349 + pix[i+1] * 0.686 + pix[i+2] * 0.168); // green
						pix[i+2] = (pix[i] * 0.272 + pix[i+1] * 0.534 + pix[i+2] * 0.131); // blue
						// i+3 - alpha
					}
					paper.clearRect(0, 0, _canvasWrapperW, _canvasWrapperH);
					paper.putImageData(imgd, 0, 0);
					_canvasWrapper.trigger('saveCanvasState');// undo-redo
				}
				var embossFilter = function(){
					var iGrayLevel = 180;
					var fStrength = 1;
					var iDirection = 0;
					if (typeof(oOptions)!='undefined' && oOptions) {
						if (typeof oOptions.strength != "undefined")
							fStrength = parseFloat(oOptions.strength);
						if (typeof oOptions.graylevel != "undefined")
							iGrayLevel = parseInt(oOptions.graylevel, 10);
						if (typeof oOptions.direction != "undefined")
							iDirection = parseInt(oOptions.direction, 10);
					}
					iGrayLevel = Math.max(0,Math.min(255,iGrayLevel));
					var iDirY = 0;
					var iDirX = 0;
					switch (iDirection) {
						case 0:			// top left
							iDirY = -1;
							iDirX = -1;
							break;
						case 1:			// top
							iDirY = -1;
							iDirX = 0;
							break;
						case 2:			// top right
							iDirY = -1;
							iDirX = 1;
							break;
						case 3:			// right
							iDirY = 0;
							iDirX = 1;
							break;
						case 4:			// bottom right
							iDirY = 1;
							iDirX = 1;
							break;
						case 5:			// bottom
							iDirY = 1;
							iDirX = 0;
							break;
						case 6:			// bottom left
							iDirY = 1;
							iDirX = -1;
							break;
						case 7:			// left
							iDirY = 0;
							iDirX = -1;
							break;
					}
					
					var imgd = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var pix = imgd.data;
					var imgdNew = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var pixNew = imgdNew.data;
					for (var i = 0, n = pix.length; i < n; i += 4) {
						var currI = i/4;
						var iOtherY = iDirY;
						var iOtherX = iDirX;
						/* iOtherX */
						if((currI%_canvasWrapperW)==0 && iOtherX < 0) iOtherX = 0;//x=0
						if(((currI-_canvasWrapperW+1)%_canvasWrapperW)==0 && iOtherX > 0) iOtherX = 0;//x=_canvasWrapperW
						/* iOtherY */
						if(currI<_canvasWrapperW && iOtherY < 0) iOtherY = 0;//y=0
						if(currI>=(_canvasWrapperW*(_canvasWrapperH-1)) && iOtherY > 0) iOtherY = 0;//y=_canvasWrapperH
						/* Cycle */
						if (pix[i+3] > 0) {// if pixel is visible
							var otherI = i+iOtherX*4+iOtherY*_canvasWrapperW*4;
							var iDeltaR = pix[i] - pix[otherI];
							var iDeltaG = pix[i+1] - pix[otherI+1];
							var iDeltaB = pix[i+2] - pix[otherI+2];
							var iDif = iDeltaR;
							if (Math.abs(iDeltaG) > Math.abs(iDif)) {
								iDif = iDeltaG;
							}
							if (Math.abs(iDeltaB) > Math.abs(iDif)) {
								iDif = iDeltaB;
							}
							var iGray = iGrayLevel - iDif;
							pixNew[i]=iGray;
							pixNew[i+1]=iGray;
							pixNew[i+2]=iGray;
							pixNew[i+3]=pix[i+3];
						}
					}
					paper.clearRect(0, 0, _canvasWrapperW, _canvasWrapperH);
					paper.putImageData(imgdNew, 0, 0);
					_canvasWrapper.trigger('saveCanvasState');// undo-redo
				}
				var edgeFilter = function(){
					var fStrength = 1;
					var fC = -fStrength/8;
					var bMono = false;
					var bInvert = true;
					if (typeof(oOptions)!='undefined' && oOptions) {
						if (typeof oOptions.invert != "undefined")
							bInvert = Options.invert;
						if (typeof oOptions.mono != "undefined")
							bMono = Options.mono;
					}
					var aKernel = [
						[fC, 	fC, 	fC],
						[fC, 	1, 	fC],
						[fC, 	fC, 	fC]
					];
					var fWeight = 0;
					for (var i=0;i<3;i++) {
						for (var j=0;j<3;j++) {
							fWeight += aKernel[i][j];
						}
					}
					fWeight = fC;
					
					var imgd = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var pix = imgd.data;
					var imgdNew = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var pixNew = imgdNew.data;
					for (var i = 0, n = pix.length; i < n; i += 4) {
						var currI = i/4;
						var iOtherPrevY = -1;
						var iOtherNextY = 1;
						var iOtherNextX = 1;
						var iOtherPrevX = -1;
						/* iOther...X */
						if((currI%_canvasWrapperW)==0) iOtherPrevX = 0;//x=0
						if(((currI-_canvasWrapperW+1)%_canvasWrapperW)) iOtherNextX = 0;//x=_canvasWrapperW
						/* iOther...Y */
						if(currI<_canvasWrapperW) iOtherPrevY = 0;//y=0
						if(currI>=(_canvasWrapperW*(_canvasWrapperH-1))) iOtherNextY = 0;//y=_canvasWrapperH
						/* Cycle */
						if (pix[i+3] > 0) {// if pixel is visible
							var iPrevX = i + iOtherPrevX*4;
							var iNextX = i + iOtherNextX*4;
							var iPrevY = i + iOtherPrevY*_canvasWrapperW*4;
							var iNextY = i + iOtherNextY*_canvasWrapperW*4;
							var iPrevYPrevX = i + iOtherPrevX*4 + iOtherPrevY*_canvasWrapperW*4;
							var iNextYPrevX = i + iOtherPrevX*4 + iOtherNextY*_canvasWrapperW*4;
							var iPrevYNextX = i + iOtherNextX*4 + iOtherPrevY*_canvasWrapperW*4;
							var iNextYNextX = i + iOtherNextX*4 + iOtherNextY*_canvasWrapperW*4;
							var iR = (
								(pix[iPrevYPrevX]
								+ pix[iPrevY]
								+ pix[iPrevYNextX]
								+ pix[iPrevX]
								+ pix[iNextX]
								+ pix[iNextYPrevX]
								+ pix[iNextY]
								+ pix[iNextYNextX]) * fC
								+ pix[i]
							) / fWeight;
							var iG = (
								(pix[iPrevYPrevX+1]
								+ pix[iPrevY+1]
								+ pix[iPrevYNextX+1]
								+ pix[iPrevX+1]
								+ pix[iNextX+1]
								+ pix[iNextYPrevX+1]
								+ pix[iNextY+1]
								+ pix[iNextYNextX+1]) * fC
								+ pix[i+1]
							) / fWeight;
							var iB = (
								(pix[iPrevYPrevX+2]
								+ pix[iPrevY+2]
								+ pix[iPrevYNextX+2]
								+ pix[iPrevX+2]
								+ pix[iNextX+2]
								+ pix[iNextYPrevX+2]
								+ pix[iNextY+1]
								+ pix[iNextYNextX+2]) * fC
								+ pix[i+2]
							) / fWeight;
							if (bMono) {
								var iBrightness = Math.round(iR*0.3 + iG*0.59 + iB*0.11);
								if (bInvert) iBrightness = 255 - iBrightness;
								if (iBrightness < 0 ) iBrightness = 0;
								if (iBrightness > 255 ) iBrightness = 255;
								iR = iG = iB = iBrightness;
							} else {
								if (bInvert) {
									iR = 255 - iR;
									iG = 255 - iG;
									iB = 255 - iB;
								}
							}
							pixNew[i]=iR;
							pixNew[i+1]=iG;
							pixNew[i+2]=iB;
							pixNew[i+3]=pix[i+3];
						}
					}
					paper.clearRect(0, 0, _canvasWrapperW, _canvasWrapperH);
					paper.putImageData(imgdNew, 0, 0);
					_canvasWrapper.trigger('saveCanvasState');// undo-redo
				}
				var posterizeFilter = function(){
					var iLevels = 10;
					if (typeof(oOptions)!='undefined' && oOptions) {
						if (typeof oOptions.levels != "undefined")
							iLevels = parseInt(oOptions.levels,10);
					}
					iLevels = Math.max(2,Math.min(256,iLevels));
					var iAreas = 256 / iLevels;
					var iValues = 256 / (iLevels-1);
					var aLevels = [];
					for (var i=0;i<256;i++) {
						aLevels[i] = 255 * (iLevels*i / 256) / (iLevels-1);
						aLevels[i] = (iLevels / 256) * (i / 256) * 256;
					}
					
					var imgd = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var pix = imgd.data;
					var imgdNew = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var pixNew = imgdNew.data;
					for (var i = 0, n = pix.length; i < n; i += 4) {
						if (pix[i + 3] > 0) {// if pixel is visible
							var fR = iValues * Math.floor(pix[i] / iAreas);
							var fG = iValues * Math.floor(pix[i+1] / iAreas);
							var fB = iValues * Math.floor(pix[i+2] / iAreas);
							pixNew[i]=fR;
							pixNew[i+1]=fG;
							pixNew[i+2]=fB;
							pixNew[i+3]=pix[i+3];
						}
					}
					paper.clearRect(0, 0, _canvasWrapperW, _canvasWrapperH);
					paper.putImageData(imgdNew, 0, 0);
					_canvasWrapper.trigger('saveCanvasState');// undo-redo
				}
				var blurFilter= function(){
					var amount = 0.1;
					if (typeof(oOptions)!='undefined' && oOptions) {
						if (typeof oOptions.amount != "undefined")
							amount = parseInt(oOptions.amount,10);
					}
					var iSteps = Math.round(amount * 20);
					var iWidth=_canvasWrapperW;
					var iHeight=_canvasWrapperH;
					var fScale = 2;
					
					var iSmallWidth = Math.round(iWidth / fScale);
					var iSmallHeight = Math.round(iHeight / fScale);
					
					var $canvas = $('<canvas />').appendTo(hiddenGarbageBox).attr({
						'width':iSmallWidth,
						'height':iSmallHeight
					});
					var oImage = _canvas;
					var oCopy = $canvas.get(0);
					var oCopyCtx = oCopy.getContext('2d');
					for (var i=0;i<iSteps;i++) {
						var iScaledWidth = Math.max(1,Math.round(iSmallWidth - i));
						var iScaledHeight = Math.max(1,Math.round(iSmallHeight - i));
						oCopyCtx.clearRect(0,0,iSmallWidth,iSmallHeight);
						oCopyCtx.drawImage(
							_canvas,
							0,0,iWidth,iHeight,
							0,0,iScaledWidth,iScaledHeight
						);
						paper.drawImage(
							oCopy,
							0,0,iScaledWidth,iScaledHeight,
							0,0,iWidth,iHeight
						);
					}
					_canvasWrapper.trigger('saveCanvasState');// undo-redo
					$canvas.remove();
				}
				var brightContrastFilter = function(){
					var fBrightness = 2;
					var fContrast = 2;
					if (typeof(oOptions)!='undefined' && oOptions) {
						if (typeof oOptions.brightness != "undefined")
							fBrightness = parseFloat(oOptions.brightness);
						if (typeof oOptions.contrast != "undefined")
							fContrast = parseFloat(oOptions.contrast);
					}
					var imgd = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var pix = imgd.data;
					var imgdNew = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var pixNew = imgdNew.data;
					for (var i = 0, n = pix.length; i < n; i += 4) {
						if (pix[i + 3] > 0) {// if pixel is visible
							var iR = pix[i];
							var iG = pix[i+1];
							var iB = pix[i+2];
							iR = (iR * fBrightness);
							iR = ((iR - 128) * fContrast + 128);
							iG = (iG * fBrightness);
							iG = ((iG - 128) * fContrast + 128);
							iB = (iB * fBrightness);
							iB = ((iB - 128) * fContrast + 128);
							pixNew[i]=iR;
							pixNew[i+1]=iG;
							pixNew[i+2]=iB;
							pixNew[i+3]=pix[i+3];
						}
					}
					paper.clearRect(0, 0, _canvasWrapperW, _canvasWrapperH);
					paper.putImageData(imgdNew, 0, 0);
					_canvasWrapper.trigger('saveCanvasState');// undo-redo
				}
				var hueSaturationLightnessFilter = function(){
					var hue = -145;
					var saturation = 70 / 100;
					var lightness = 40 / 100;
					if (typeof(oOptions)!='undefined' && oOptions) {
						if (typeof oOptions.hue != "undefined")
							hue = Math.round(oOptions.hue);
						if (typeof oOptions.saturation != "undefined")
							saturation = oOptions.saturation / 100;
						if (typeof oOptions.lightness != "undefined")
							lightness = oOptions.lightness / 100;
					}
					if (saturation < 0) {
						var satMul = 1+saturation;
					} else {
						var satMul = 1+saturation*2;
					}
					hue = (hue%360) / 360;
					var hue6 = hue * 6;
					var rgbDiv = 1 / 255;
					var light255 = lightness * 255;
					var lightp1 = 1 + lightness;
					var lightm1 = 1 - lightness;
					
					var imgd = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var pix = imgd.data;
					var imgdNew = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var pixNew = imgdNew.data;
					for (var i = 0, n = pix.length; i < n; i += 4) {
						if (pix[i + 3] > 0) {// if pixel is visible
							var r = pix[i];
							var g = pix[i+1];
							var b = pix[i+2];
							if (hue != 0 || saturation != 0) {
								var vs = r;
								if (g > vs) vs = g;
								if (b > vs) vs = b;
								var ms = r;
								if (g < ms) ms = g;
								if (b < ms) ms = b;
								var vm = (vs-ms);
								var l = (ms+vs)/510;
								if (l > 0) {
									if (vm > 0) {
										if (l <= 0.5) {
											var s = vm / (vs+ms) * satMul;
											if (s > 1) s = 1;
											var v = (l * (1+s));
										} else {
											var s = vm / (510-vs-ms) * satMul;
											if (s > 1) s = 1;
											var v = (l+s - l*s);
										}
										if (r == vs) {
											if (g == ms)
												var h = 5 + ((vs-b)/vm) + hue6;
											else
												var h = 1 - ((vs-g)/vm) + hue6;
										} else if (g == vs) {
											if (b == ms)
												var h = 1 + ((vs-r)/vm) + hue6;
											else
												var h = 3 - ((vs-b)/vm) + hue6;
										} else {
											if (r == ms)
												var h = 3 + ((vs-g)/vm) + hue6;
											else
												var h = 5 - ((vs-r)/vm) + hue6;
										}
										if (h < 0) h+=6;
										if (h >= 6) h-=6;
										var m = (l+l-v);
										var sextant = h>>0;
										if (sextant == 0) {
											r = v*255; g = (m+((v-m)*(h-sextant)))*255; b = m*255;
										} else if (sextant == 1) {
											r = (v-((v-m)*(h-sextant)))*255; g = v*255; b = m*255;
										} else if (sextant == 2) {
											r = m*255; g = v*255; b = (m+((v-m)*(h-sextant)))*255;
										} else if (sextant == 3) {
											r = m*255; g = (v-((v-m)*(h-sextant)))*255; b = v*255;
										} else if (sextant == 4) {
											r = (m+((v-m)*(h-sextant)))*255; g = m*255; b = v*255;
										} else if (sextant == 5) {
											r = v*255; g = m*255; b = (v-((v-m)*(h-sextant)))*255;
										}
									}
								}
							}
							if (lightness < 0) {
								r *= lightp1;
								g *= lightp1;
								b *= lightp1;
							} else if (lightness > 0) {
								r = r * lightm1 + light255;
								g = g * lightm1 + light255;
								b = b * lightm1 + light255;
							}
							if (r < 0) 
								pixNew[i] = 0
							else if (r > 255)
								pixNew[i] = 255
							else
								pixNew[i] = r;
			
							if (g < 0) 
								pixNew[i+1] = 0
							else if (g > 255)
								pixNew[i+1] = 255
							else
								pixNew[i+1] = g;
			
							if (b < 0) 
								pixNew[i+2] = 0
							else if (b > 255)
								pixNew[i+2] = 255
							else
								pixNew[i+2] = b;
							pixNew[i+3]=pix[i+3];
						}
					}
					paper.clearRect(0, 0, _canvasWrapperW, _canvasWrapperH);
					paper.putImageData(imgdNew, 0, 0);
					_canvasWrapper.trigger('saveCanvasState');// undo-redo
				}
				var lightenFilter = function(){
					var amount = 0.05;
					if (typeof(oOptions)!='undefined' && oOptions) {
						if (typeof oOptions.amount != "undefined")
							amount = parseInt(oOptions.amount,10);
					}
					var mul = amount + 1;
					var imgd = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var pix = imgd.data;
					var imgdNew = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var pixNew = imgdNew.data;
					for (var i = 0, n = pix.length; i < n; i += 4) {
						if (pix[i + 3] > 0) {// if pixel is visible
							var iR = pix[i];
							var iG = pix[i+1];
							var iB = pix[i+2];
							if ((pix[i+3] = pix[i] * mul) > 255)
								pix[i] = 255;
							if ((pix[i+3] = pix[i+1] * mul) > 255)
								pix[i+1] = 255;
							if ((pix[i+3] = pix[i+2] * mul) > 255)
								pix[i+2] = 255;
							pixNew[i]=iR;
							pixNew[i+1]=iG;
							pixNew[i+2]=iB;
							pixNew[i+3]=pix[i+3];
						}
					}
					paper.clearRect(0, 0, _canvasWrapperW, _canvasWrapperH);
					paper.putImageData(imgdNew, 0, 0);
					_canvasWrapper.trigger('saveCanvasState');// undo-redo
				}
				var solarizenFilter = function(){
					var imgd = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var pix = imgd.data;
					var imgdNew = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var pixNew = imgdNew.data;
					for (var i = 0, n = pix.length; i < n; i += 4) {
						if (pix[i + 3] > 0) {// if pixel is visible
							var iR = pix[i];
							var iG = pix[i+1];
							var iB = pix[i+2];
							if (iR > 127) iR = 255 - iR;
							if (iG > 127) iG = 255 - iG;
							if (iB > 127) iB = 255 - iB;
							pixNew[i]=iR;
							pixNew[i+1]=iG;
							pixNew[i+2]=iB;
							pixNew[i+3]=pix[i+3];
						}
					}
					paper.clearRect(0, 0, _canvasWrapperW, _canvasWrapperH);
					paper.putImageData(imgdNew, 0, 0);
					_canvasWrapper.trigger('saveCanvasState');// undo-redo
				}
				var noizeFilter = function(){
					var amount = 0.9;
					var strength = 5;
					var mono = false;
					if (typeof(oOptions)!='undefined' && oOptions) {
						if (typeof oOptions.amount != "undefined")
							amount = parseInt(oOptions.amount,10);
						if (typeof oOptions.strength != "undefined")
							strength = parseInt(oOptions.strength,10);
						if (typeof oOptions.mono != "undefined")
							mono = !!(params.options.mono && params.options.mono != "false");
					}
					amount = Math.max(0,Math.min(1,amount));
					strength = Math.max(0,Math.min(1,strength));
					var noise = 128 * strength;
					var noise2 = noise / 2;
					var random = Math.random;
					var imgd = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var pix = imgd.data;
					var imgdNew = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var pixNew = imgdNew.data;
					for (var i = 0, n = pix.length; i < n; i += 4) {
						if (pix[i + 3] > 0) {// if pixel is visible
							var iR = pix[i];
							var iG = pix[i+1];
							var iB = pix[i+2];
							if (random() < amount) {
								if (mono) {
									var pixelNoise = - noise2 + random() * noise;
									var r = iR + pixelNoise;
									var g = iG + pixelNoise;
									var b = iB + pixelNoise;
								} else {
									var r = iR - noise2 + (random() * noise);
									var g = iG - noise2 + (random() * noise);
									var b = iB - noise2 + (random() * noise);
								}
								if (r < 0 ) r = 0;
								if (g < 0 ) g = 0;
								if (b < 0 ) b = 0;
								if (r > 255 ) r = 255;
								if (g > 255 ) g = 255;
								if (b > 255 ) b = 255;
								pixNew[i]=r;
								pixNew[i+1]=g;
								pixNew[i+2]=b;
								pixNew[i+3]=pix[i+3];
							}
						}
					}
					paper.clearRect(0, 0, _canvasWrapperW, _canvasWrapperH);
					paper.putImageData(imgdNew, 0, 0);
					_canvasWrapper.trigger('saveCanvasState');// undo-redo
				}
				var glowFilter = function(){
					var amount = 0.9;
					var blurAmount = 5;
					if (typeof(oOptions)!='undefined' && oOptions) {
						if (typeof oOptions.amount != "undefined")
							amount = parseInt(oOptions.amount,10);
						if (typeof oOptions.blurAmount != "undefined")
							blurAmount = parseInt(oOptions.blurAmount,10);
					}
					amount = Math.min(1,Math.max(0,amount));
					blurAmount = Math.min(5,Math.max(0,blurAmount));
					var $blurCanvas = $('<canvas />').appendTo(hiddenGarbageBox).attr({
						'width':_canvasWrapperW,
						'height':_canvasWrapperH
					});
					var blurCanvas = $blurCanvas.get(0);
					var blurCtx = blurCanvas.getContext("2d");
					blurCtx.drawImage(_canvas,0,0);
					var scale = 2;
					var smallWidth = Math.round(_canvasWrapperW / scale);
					var smallHeight = Math.round(_canvasWrapperH / scale);
					var $copy = $('<canvas />').appendTo(hiddenGarbageBox).attr({
						'width':smallWidth,
						'height':smallHeight
					});
					var copy = $copy.get(0);
					var copyCtx = copy.getContext("2d");
					var clear = true;
					var steps = Math.round(blurAmount * 20);
					for (var i=0;i<steps;i++) {
						var scaledWidth = Math.max(1,Math.round(smallWidth - i));
						var scaledHeight = Math.max(1,Math.round(smallHeight - i));
			
						copyCtx.clearRect(0,0,smallWidth,smallHeight);
			
						copyCtx.drawImage(
							blurCanvas,
							0,0,_canvasWrapperW,_canvasWrapperH,
							0,0,scaledWidth,scaledHeight
						);
			
						blurCtx.clearRect(0,0,_canvasWrapperW,_canvasWrapperH);
			
						blurCtx.drawImage(
							copy,
							0,0,scaledWidth,scaledHeight,
							0,0,_canvasWrapperW,_canvasWrapperH
						);
					}
					
					var imgd = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var data = imgd.data;
					var imgdNew = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var dataNew = imgdNew.data;
					var imgdBlur = blurCtx.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var dataBlur = imgdBlur.data;
					var p = _canvasWrapperW*_canvasWrapperH;
					var pix = p*4, pix1 = pix + 1, pix2 = pix + 2, pix3 = pix + 3;
					while (p--) {
						if ((dataNew[pix-=4] += amount * dataBlur[pix]) > 255) dataNew[pix] = 255;
						if ((dataNew[pix1-=4] += amount * dataBlur[pix1]) > 255) dataNew[pix1] = 255;
						if ((dataNew[pix2-=4] += amount * dataBlur[pix2]) > 255) dataNew[pix2] = 255;
					}
					paper.clearRect(0, 0, _canvasWrapperW, _canvasWrapperH);
					paper.putImageData(imgdNew, 0, 0);
					_canvasWrapper.trigger('saveCanvasState');// undo-redo
					$blurCanvas.remove();
					$copy.remove();
				}
				var mosaicFilter = function(){
					var blockSize = 9;
					if (typeof(oOptions)!='undefined' && oOptions) {
						if (typeof oOptions.blockSize != "undefined")
							blockSize = parseInt(oOptions.blockSize,10);
					}
					blockSize = Math.max(1,blockSize);
					var w = _canvasWrapperW;
					var h = _canvasWrapperH;
					var w4 = w*4;
					var y = h;
					var ctx = paper;
					var $pixel = $('<canvas />').appendTo(hiddenGarbageBox).attr({
						'width':1,
						'height':1
					});
					var pixel = $pixel.get(0);
					var pixelCtx = pixel.getContext("2d");
					var $copy = $('<canvas />').appendTo(hiddenGarbageBox).attr({
						'width':_canvasWrapperW,
						'height':_canvasWrapperH
					});
					var copy = $copy.get(0);
					var copyCtx = copy.getContext("2d");
					copyCtx.drawImage(_canvas,0,0,w,h, 0,0,w,h);
					for (var y=0;y<h;y+=blockSize) {
						for (var x=0;x<w;x+=blockSize) {
							var blockSizeX = blockSize;
							var blockSizeY = blockSize;
				
							if (blockSizeX + x > w)
								blockSizeX = w - x;
							if (blockSizeY + y > h)
								blockSizeY = h - y;
		
							pixelCtx.drawImage(copy, x, y, blockSizeX, blockSizeY, 0, 0, 1, 1);
							var data = pixelCtx.getImageData(0,0,1,1).data;
							if(data[3]>0){
								ctx.fillStyle = "rgb(" + data[0] + "," + data[1] + "," + data[2] + ")";
								ctx.fillRect(x, y, blockSize, blockSize);
							}
						}
					}
					
					_canvasWrapper.trigger('saveCanvasState');// undo-redo
					$pixel.remove();
					$copy.remove();
				}
				var removeNoizeFilter = function(){
					var w = _canvasWrapperW;
					var h = _canvasWrapperH;
					var w4 = w*4;
					var y = h;
					var imgd = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var data = imgd.data;
					var imgdNew = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var dataNew = imgdNew.data;
					do {
						var offsetY = (y-1)*w4;
						var nextY = (y == h) ? y - 1 : y;
						var prevY = (y == 1) ? 0 : y-2;
						var offsetYPrev = prevY*w*4;
						var offsetYNext = nextY*w*4;
						var x = w;
						do {
							var offset = offsetY + (x*4-4);
							if(data[offset+3]>0){
								var offsetPrev = offsetYPrev + ((x == 1) ? 0 : x-2) * 4;
								var offsetNext = offsetYNext + ((x == w) ? x-1 : x) * 4;
								var minR, maxR, minG, maxG, minB, maxB;
								minR = maxR = data[offsetPrev];
								var r1 = data[offset-4], r2 = data[offset+4], r3 = data[offsetNext];
								if (r1 < minR) minR = r1;
								if (r2 < minR) minR = r2;
								if (r3 < minR) minR = r3;
								if (r1 > maxR) maxR = r1;
								if (r2 > maxR) maxR = r2;
								if (r3 > maxR) maxR = r3;
								minG = maxG = data[offsetPrev+1];
								var g1 = data[offset-3], g2 = data[offset+5], g3 = data[offsetNext+1];
								if (g1 < minG) minG = g1;
								if (g2 < minG) minG = g2;
								if (g3 < minG) minG = g3;
								if (g1 > maxG) maxG = g1;
								if (g2 > maxG) maxG = g2;
								if (g3 > maxG) maxG = g3;
								minB = maxB = data[offsetPrev+2];
								var b1 = data[offset-2], b2 = data[offset+6], b3 = data[offsetNext+2];
								if (b1 < minB) minB = b1;
								if (b2 < minB) minB = b2;
								if (b3 < minB) minB = b3;
								if (b1 > maxB) maxB = b1;
								if (b2 > maxB) maxB = b2;
								if (b3 > maxB) maxB = b3;
								if (data[offset] > maxR) {
									data[offset] = maxR;
								} else if (data[offset] < minR) {
									data[offset] = minR;
								}
								if (data[offset+1] > maxG) {
									data[offset+1] = maxG;
								} else if (data[offset+1] < minG) {
									data[offset+1] = minG;
								}
								if (data[offset+2] > maxB) {
									data[offset+2] = maxB;
								} else if (data[offset+2] < minB) {
									data[offset+2] = minB;
								}
							}
						} while (--x);
					} while (--y);
					paper.clearRect(0, 0, _canvasWrapperW, _canvasWrapperH);
					paper.putImageData(imgd, 0, 0);
					_canvasWrapper.trigger('saveCanvasState');// undo-redo
				}
				var pointillizeFilter = function(){
					var radius = 5;
					var density = 2;
					var noise = 2;
					var transparent = false;
					if (typeof(oOptions)!='undefined' && oOptions) {
						if (typeof oOptions.radius != "undefined")
							blockSize = parseInt(oOptions.radius,10);
						if (typeof oOptions.density != "undefined")
							density = parseInt(oOptions.density,10);
						if (typeof oOptions.noise != "undefined")
							noise = parseInt(oOptions.noise,10);
						if (typeof oOptions.transparent != "undefined")
							transparent = oOptions.transparent;
					}
					radius = Math.max(1,radius);
					density = Math.min(5,Math.max(0,density));
					noise = Math.max(0,noise);
					transparent = !!(transparent && transparent != "false");
					var w = _canvasWrapperW;
					var h = _canvasWrapperH;
					var w4 = w*4;
					var y = h;
					var ctx = paper;
					var canvasWidth = _canvasWrapperW;
					var canvasHeight = _canvasWrapperH;
					var $pixel = $('<canvas />').appendTo(hiddenGarbageBox).attr({
						'width':1,
						'height':1
					});
					var pixel = $pixel.get(0);
					var pixelCtx = pixel.getContext("2d");
					var $copy = $('<canvas />').appendTo(hiddenGarbageBox).attr({
						'width':_canvasWrapperW,
						'height':_canvasWrapperH
					});
					var copy = $copy.get(0);
					var copyCtx = copy.getContext("2d");
					copyCtx.drawImage(_canvas,0,0,w,h, 0,0,w,h);
					var diameter = radius * 2;
					if (transparent) ctx.clearRect(0,0,_canvasWrapperW,_canvasWrapperH);
					var noiseRadius = radius * noise;
					var dist = 1 / density;
					for (var y=0;y<h+radius;y+=diameter*dist) {
						for (var x=0;x<w+radius;x+=diameter*dist) {
							rndX = noise ? (x+((Math.random()*2-1) * noiseRadius))>>0 : x;
							rndY = noise ? (y+((Math.random()*2-1) * noiseRadius))>>0 : y;
							var pixX = rndX - radius;
							var pixY = rndY - radius;
							if (pixX < 0) pixX = 0;
							if (pixY < 0) pixY = 0;
							if (pixX >= _canvasWrapperW) pixX = _canvasWrapperW-1;
							if (pixY >= _canvasWrapperH) pixY = _canvasWrapperH-1;
							var cx = rndX;
							var cy = rndY;
							if (cx < 0) cx = 0;
							if (cx > canvasWidth) cx = canvasWidth;
							if (cy < 0) cy = 0;
							if (cy > canvasHeight) cy = canvasHeight;
							var diameterX = diameter;
							var diameterY = diameter;
							if (diameterX + pixX > w)
								diameterX = w - pixX;
							if (diameterY + pixY > h)
								diameterY = h - pixY;
							if (diameterX < 1) diameterX = 1;
							if (diameterY < 1) diameterY = 1;
							pixelCtx.drawImage(copy, pixX, pixY, diameterX, diameterY, 0, 0, 1, 1);
							var data = pixelCtx.getImageData(0,0,1,1).data;
							if(data[3]>0){
								ctx.fillStyle = "rgb(" + data[0] + "," + data[1] + "," + data[2] + ")";
								ctx.beginPath();
								ctx.arc(cx, cy, radius, 0, Math.PI*2, true);
								ctx.closePath();
								ctx.fill();
							}
						}
					}
					_canvasWrapper.trigger('saveCanvasState');// undo-redo
					$pixel.remove();
					$copy.remove();
				}
				var unsharpmaskFilter = function(){
					var amount = 200;
					var blurAmount = 3;
					var threshold = 2;
					amount = Math.min(500,Math.max(0,amount)) / 2;
					blurAmount = Math.min(5,Math.max(0,blurAmount)) / 10;
					threshold = Math.min(255,Math.max(0,threshold));
					threshold--;
					var thresholdNeg = -threshold;
					amount *= 0.016;
					amount++;
					var $blurCanvas = $('<canvas />').appendTo(hiddenGarbageBox).attr({
						'width':_canvasWrapperW,
						'height':_canvasWrapperH
					});
					var blurCanvas = $blurCanvas.get(0);
					var blurCtx = blurCanvas.getContext("2d");
					blurCtx.drawImage(_canvas,0,0);
					var scale = 2;
					var smallWidth = Math.round(_canvasWrapperW / scale);
					var smallHeight = Math.round(_canvasWrapperH / scale);
					var $copy = $('<canvas />').appendTo(hiddenGarbageBox).attr({
						'width':smallWidth,
						'height':smallHeight
					});
					var copy = $copy.get(0);
					var copyCtx = copy.getContext("2d");
					var steps = Math.round(blurAmount * 20);
					var copyCtx = copy.getContext("2d");
					for (var i=0;i<steps;i++) {
						var scaledWidth = Math.max(1,Math.round(smallWidth - i));
						var scaledHeight = Math.max(1,Math.round(smallHeight - i));
						copyCtx.clearRect(0,0,smallWidth,smallHeight);
						copyCtx.drawImage(
							blurCanvas,
							0,0,_canvasWrapperW,_canvasWrapperH,
							0,0,scaledWidth,scaledHeight
						);
						blurCtx.clearRect(0,0,_canvasWrapperW,_canvasWrapperH);
						blurCtx.drawImage(
							copy,
							0,0,scaledWidth,scaledHeight,
							0,0,_canvasWrapperW,_canvasWrapperH
						);
					}
					var imgd = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var data = imgd.data;
					var imgdNew = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var dataNew = imgdNew.data;
					var imgdBlur = blurCtx.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var dataBlur = imgdBlur.data;
					var w = _canvasWrapperW;
					var h = _canvasWrapperH;
					var w4 = w*4;
					var y = h;
					do {
						var offsetY = (y-1)*w4;
						var x = w;
						do {
							var offset = offsetY + (x*4-4);
							if(data[offset+3]>0){
								var difR = data[offset] - dataBlur[offset];
								if (difR > threshold || difR < thresholdNeg) {
									var blurR = dataBlur[offset];
									blurR = amount * difR + blurR;
									data[offset] = blurR > 255 ? 255 : (blurR < 0 ? 0 : blurR);
								}
								var difG = data[offset+1] - dataBlur[offset+1];
								if (difG > threshold || difG < thresholdNeg) {
									var blurG = dataBlur[offset+1];
									blurG = amount * difG + blurG;
									data[offset+1] = blurG > 255 ? 255 : (blurG < 0 ? 0 : blurG);
								}
								var difB = data[offset+2] - dataBlur[offset+2];
								if (difB > threshold || difB < thresholdNeg) {
									var blurB = dataBlur[offset+2];
									blurB = amount * difB + blurB;
									data[offset+2] = blurB > 255 ? 255 : (blurB < 0 ? 0 : blurB);
								}
							}
						} while (--x);
					} while (--y);
					paper.clearRect(0, 0, _canvasWrapperW, _canvasWrapperH);
					paper.putImageData(imgd, 0, 0);
					_canvasWrapper.trigger('saveCanvasState');// undo-redo
					$blurCanvas.remove();
					$copy.remove();
				}
				var sharpenFilter = function(){
					var strength = 0.5;
					if (typeof(oOptions)!='undefined' && oOptions) {
						if (typeof oOptions.amount != "undefined")
							strength = oOptions.amount;
					}
					if (strength < 0) strength = 0;
					if (strength > 1) strength = 1;
					var imgd = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var data = imgd.data;
					var imgdCopy = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var dataCopy = imgdCopy.data;
					var mul = 15;
					var mulOther = 1 + 3*strength;
					var kernel = [
						[0, 	-mulOther, 	0],
						[-mulOther, 	mul, 	-mulOther],
						[0, 	-mulOther, 	0]
					];
					var weight = 0;
					for (var i=0;i<3;i++) {
						for (var j=0;j<3;j++) {
							weight += kernel[i][j];
						}
					}
					weight = 1 / weight;
					var w = _canvasWrapperW;
					var h = _canvasWrapperH;
					mul *= weight;
					mulOther *= weight;
					var w4 = w*4;
					var y = h;
					do {
						var offsetY = (y-1)*w4;
						var nextY = (y == h) ? y - 1 : y;
						var prevY = (y == 1) ? 0 : y-2;
						var offsetYPrev = prevY*w4;
						var offsetYNext = nextY*w4;
						var x = w;
						do {
							var offset = offsetY + (x*4-4);
							var offsetPrev = offsetYPrev + ((x == 1) ? 0 : x-2) * 4;
							var offsetNext = offsetYNext + ((x == w) ? x-1 : x) * 4;
							var r = ((
								- dataCopy[offsetPrev]
								- dataCopy[offset-4]
								- dataCopy[offset+4]
								- dataCopy[offsetNext])		* mulOther
								+ dataCopy[offset] 	* mul
								);
							var g = ((
								- dataCopy[offsetPrev+1]
								- dataCopy[offset-3]
								- dataCopy[offset+5]
								- dataCopy[offsetNext+1])	* mulOther
								+ dataCopy[offset+1] 	* mul
								);
							var b = ((
								- dataCopy[offsetPrev+2]
								- dataCopy[offset-2]
								- dataCopy[offset+6]
								- dataCopy[offsetNext+2])	* mulOther
								+ dataCopy[offset+2] 	* mul
								);
							if (r < 0 ) r = 0;
							if (g < 0 ) g = 0;
							if (b < 0 ) b = 0;
							if (r > 255 ) r = 255;
							if (g > 255 ) g = 255;
							if (b > 255 ) b = 255;
							data[offset] = r;
							data[offset+1] = g;
							data[offset+2] = b;
						} while (--x);
					} while (--y);
					paper.clearRect(0, 0, _canvasWrapperW, _canvasWrapperH);
					paper.putImageData(imgd, 0, 0);
					_canvasWrapper.trigger('saveCanvasState');// undo-redo
				}
				var colorLevelsFilter = function(){
					var RIndent = 100;
					var GIndent = -100;
					var BIndent = -100;
					var imgd = paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH);
					var pix = imgd.data;
					for (var i = 0, n = pix.length; i < n; i += 4) {
						if(pix[i+3]>0){
							pix[i] = pix[i]+RIndent; // red
							if(pix[i]<0) pix[i]=0;
							if(pix[i]>255) pix[i]=255;
							pix[i+1] = pix[i+1]+GIndent; // green
							if(pix[i+1]<0) pix[i+1]=0;
							if(pix[i+1]>255) pix[i+1]=255;
							pix[i+2] = pix[i+2]+BIndent; // blue
							if(pix[i+2]<0) pix[i+2]=0;
							if(pix[i+2]>255) pix[i+2]=255;
						}
					}
					paper.clearRect(0, 0, _canvasWrapperW, _canvasWrapperH);
					paper.putImageData(imgd, 0, 0);
					_canvasWrapper.trigger('saveCanvasState');// undo-redo
				}
				filters.bind('click',function(obj,i){
					var filterIndex = filters.index($(this));
					var filter = $(this).attr('rel');
					if(filterIndex==0){// invert
						invertColors();
					}else if(0<filterIndex && filterIndex<7){// grayscale
						grayscaleFilters(filter);
					}else if(filterIndex==7){// sepia
						sepiaFilter();
					}else if(filterIndex==8){// emboss
						embossFilter();
					}else if(filterIndex==9){// edge detection
						edgeFilter();
					}else if(filterIndex==10){// posterize
						posterizeFilter();
					}else if(filterIndex==11){// blur
						blurFilter();
					}else if(filterIndex==12){// bright\contrast
						brightContrastFilter();
					}else if(filterIndex==13){// hue\saturation\lightness
						hueSaturationLightnessFilter();
					}else if(filterIndex==14){// lighten
						lightenFilter();
					}else if(filterIndex==15){// solarize
						solarizenFilter();
					}else if(filterIndex==16){// noize
						noizeFilter();
					}else if(filterIndex==17){// glow
						glowFilter();
					}else if(filterIndex==18){// mosaic
						mosaicFilter();
					}else if(filterIndex==19){// remove noize
						removeNoizeFilter();
					}else if(filterIndex==20){// pointillize
						pointillizeFilter();
					}else if(filterIndex==21){// unsharpmask
						unsharpmaskFilter();
					}else if(filterIndex==22){// sharpen
						sharpenFilter();
					}else if(filterIndex==23){// color levels
						colorLevelsFilter();
					}
					return false;
				});
			}());
			/* UNDO-REDO */
			(function(){
				/* vars */
				var historyDataArray = [];
				var currentVersion = 0;
				/* local storage */
				var canvasFromStorage = function(currentPaper,localStorageName){
					if(window.localStorage.getItem('canvasLastState')){
						var canvasLocalStorageState = window.localStorage.getItem(localStorageName);
						var img = new Image();
						img.onload = function(){
							currentPaper.drawImage(img,0,0);
							if(currentVersion==0) historyDataArray.push(paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH));// set first state == clear canvas
						}
						img.src = canvasLocalStorageState;
					}else{}
				}
				var getLocalStorage = function(){// get localStorage
					if(typeof(window.localStorage)!='undefined'){
						canvasFromStorage(paper,'canvasLastState');
					}
				}
				getLocalStorage();
				var canvasToStorage = function(currentCanvas,localStorageName){
					var canvasDataURL = currentCanvas.toDataURL("image/png");
					window.localStorage.setItem(localStorageName, canvasDataURL);
				}
				var setLocalStorage = function(){// set localStorage
					if(typeof(window.localStorage)!='undefined'){
						canvasToStorage(_canvas,'canvasLastState');
					}
				}
				/* buttons events and functions */
				var activeClass = 'active'
				var notActiveClass = 'not-active'
				var undoBtn = _boardContainer.find(options.undoBtn).bind('click',function(){
					_canvasWrapper.trigger('undoCanvasState');
					return false;
				});
				var redoBtn = _boardContainer.find(options.redoBtn).bind('click',function(){
					_canvasWrapper.trigger('redoCanvasState');
					return false;
				});
				function setBtnClasses(){
					if(currentVersion==0) undoBtn.children().removeClass(activeClass).addClass(notActiveClass);//undo
					else undoBtn.children().removeClass(notActiveClass).addClass(activeClass);
					if(currentVersion==(historyDataArray.length-1)) redoBtn.children().removeClass(activeClass).addClass(notActiveClass);//redo
					else redoBtn.children().removeClass(notActiveClass).addClass(activeClass);
				}
				/* redo-undo function*/
				function saveCanvasState(){
					historyDataArray = historyDataArray.slice(0,currentVersion+1);
					historyDataArray.push(paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH));
					currentVersion++;
					historyStateChange();
				};
				function undoCanvasState(){
					if(historyDataArray.length && currentVersion>=0){
						var lastImageData = historyDataArray[currentVersion-1];
						if(typeof(lastImageData)=='object'){
							paper.putImageData(lastImageData, 0, 0);
							currentVersion--;
							historyStateChange();
						}
					}
				}
				function redoCanvasState(){
					if(currentVersion<(historyDataArray.length-1)){
						var nextImageData = historyDataArray[currentVersion+1];
						if(typeof(nextImageData)=='object'){
							paper.putImageData(nextImageData, 0, 0);
							currentVersion++;
							historyStateChange();
						}
					}
				}
				function clearCanvas(){
					paper.clearRect(0, 0, _canvasWrapperW, _canvasWrapperH);
					currentVersion=0;
					historyDataArray=[];
					historyDataArray.push(paper.getImageData(0, 0, _canvasWrapperW, _canvasWrapperH));// set first state == clear canvas
					historyStateChange();
				}
				function historyStateChange(){// triggered on all history changes
					setLocalStorage();
					_currentHistoryVersion=currentVersion;
					setBtnClasses();
				}
				/* custom redo-undo events */
				_canvasWrapper.bind('saveCanvasState',function(){// bind custom events
					saveCanvasState();
				}).bind('undoCanvasState',function(){
					undoCanvasState();
				}).bind('redoCanvasState',function(){
					redoCanvasState();
				}).bind('clearCanvas',function(){
					clearCanvas();
				});
				$.ctrl('Z', function() {_canvasWrapper.trigger('undoCanvasState');});//init key event
				$.ctrl('Y', function() {_canvasWrapper.trigger('redoCanvasState');});//init key event
			}());
			/* PAINT BUCKET */
			function fillArea(currentOptions){
				/* vars */
				var startX = currentOptions.startX;
				var startY = currentOptions.startY;
				var canvasWidth = currentOptions.canvasWidth;
				var canvasHeight = currentOptions.canvasHeight;
				var drawingBoundTop = currentOptions.drawingBoundTop;
				var colorLayer = currentOptions.canvasData;
				var startR = colorLayer.data[(startY*canvasWidth + startX) * 4];
				var startG = colorLayer.data[(startY*canvasWidth + startX) * 4+1];
				var startB = colorLayer.data[(startY*canvasWidth + startX) * 4+2];
				var startA = colorLayer.data[(startY*canvasWidth + startX) * 4+3];
				var fillColorR = currentOptions.fillColorR;
				var fillColorG = currentOptions.fillColorG;
				var fillColorB = currentOptions.fillColorB;
				var fillColorA = _strokeOpacity*255;
				var context = currentOptions.canvasContext;
				var iTolerance = _fillTolerance*2.55;
				/* functions */
				var matchStartColor = function (pixelPos){
					var r = colorLayer.data[pixelPos];
					var g = colorLayer.data[pixelPos+1];
					var b = colorLayer.data[pixelPos+2];
					var a = colorLayer.data[pixelPos+3];
					var result = false;
					if(r==fillColorR && g==fillColorG && b==fillColorB){// if current pixel color == fill color -> no match
						return result;
					}
					var iDeltaR = startR - r;
					var iDeltaG = startG - g;
					var iDeltaB = startB - b;
					if (iDeltaR < 0) iDeltaR = -iDeltaR;
					if (iDeltaG < 0) iDeltaG = -iDeltaG;
					if (iDeltaB < 0) iDeltaB = -iDeltaB;
					/*
					if (// the same color
						(r == startR) &&
						(g == startG) &&
						(b == startB) &&
						(a == startA)
					) result = true;
					*/
					if(iDeltaR <= iTolerance && iDeltaG <= iTolerance && iDeltaB <= iTolerance){// if delta<iTolerance
						result = true;
					}
					return result;
				}
				var colorPixel = function(pixelPos){
					colorLayer.data[pixelPos] = fillColorR;
					colorLayer.data[pixelPos+1] = fillColorG;
					colorLayer.data[pixelPos+2] = fillColorB;
					colorLayer.data[pixelPos+3] = fillColorA;
				}
				/* body */
				if(!(startR==fillColorR && startG==fillColorG && startB==fillColorB && startA==fillColorA)){
					var pixelStack = [[startX, startY]];
					while(pixelStack.length){
						var newPos, x, y, pixelPos, reachLeft, reachRight;
						newPos = pixelStack.pop();
						x = newPos[0];
						y = newPos[1];
						pixelPos = (y*canvasWidth + x) * 4;
						while(y-- >= drawingBoundTop && matchStartColor(pixelPos)){
							pixelPos -= canvasWidth * 4;
						}
						pixelPos += canvasWidth * 4;
						++y;
						reachLeft = false;
						reachRight = false;
						while(y++ < canvasHeight-1 && matchStartColor(pixelPos)){
							colorPixel(pixelPos);
							if(x > 0){
								if(matchStartColor(pixelPos - 4)){
									if(!reachLeft){
										pixelStack.push([x - 1, y]);
										reachLeft = true;
									}
								}
								else if(reachLeft){
									reachLeft = false;
								}
							}
							if(x < canvasWidth-1){
								if(matchStartColor(pixelPos + 4)){
									if(!reachRight){
										pixelStack.push([x + 1, y]);
										reachRight = true;
									}
								}
								else if(reachRight){
									reachRight = false;
								}
							}
							pixelPos += canvasWidth * 4;
						}
					}
					context.putImageData(colorLayer, 0, 0);
				}
			}
			/* RIBBON BRUSH */
			(function(){
				for (var a = 0; a < 50; a++) {
					ribbonBrushArray.push({
						dx: 0,
						dy: 0,
						ax: 0,
						ay: 0,
						div: 0.1,
						ease: Math.random() * 0.2 + 0.6
					})
				}
			}());
			/* FILE UPLOAD */
			(function(){
				uploadFileFormWrapper.dialog({
					resizable:true,
					draggable: true,
					autoOpen: false,
					width:350,
					height:150,
					minWidth:350,
					minHeight:150,
					modal:true
				});
				_boardContainer.find(options.uploadBtn).bind('click',function(){
					uploadFileFormWrapper.dialog( "open" );
					return false;
				});
				var errorClass='error';
				var loadingClass='loading';
				var formUrl = uploadFileForm.attr('action');
				uploadFileForm.bind('submit',function(){
					if(!uploadInputFile.val().length || uploadInputFile.val().length<4){
						uploadInputFile.addClass(errorClass);
						return false;
					}else{
						uploadFileForm.addClass(loadingClass);
						return true;
					}
				}).bind('reset',function(){
					uploadInputFile.removeClass(errorClass);
					uploadFileCallbackInfo.text('');
				});
				$('body').eq(0).bind('upload-file-callback',function(callbackData){
					uploadInputFile.addClass(errorClass);
					if(callbackData.callbackResult==0){
						uploadFileCallbackInfo.text('File size is null.');
					}else if(callbackData.callbackResult==1){
						uploadFileCallbackInfo.text('Not supported file format.');
					}else if(callbackData.callbackResult==2){
						uploadFileCallbackInfo.text('File size is more than 5MB.');
					}else if(callbackData.callbackResult==3){
						uploadFileCallbackInfo.text('Shit happens. Code is: '+callbackData.callbackErorrCode);
					}else if(callbackData.callbackResult==4){
						if(callbackData.callbackDataUrl.length){
							uploadInputFile.removeClass(errorClass);
							var uploadedImg = $('<img src="'+callbackData.callbackDataUrl+'" />').error(function(){
								uploadFileCallbackInfo.text('File was corrupt or not an image');
								uploadInputFile.addClass(errorClass);
							}).load(function(){
								uploadFileCallbackInfo.text('The file was uploaded successfully.');
								imagePreviewBox.html(uploadedImg);
								uploadFileFormWrapper.dialog( "close" );
							});
						}else{
							uploadFileCallbackInfo.text('Shit happens.');
						}
					}
					uploadFileForm.removeClass(loadingClass);
				});
			}());
			/* ZOOMER */
			function repaintZoomer(){
					var leftCoord = _x-(zoommerWidth/2)/zoomFactor;
					var topCoord = _y-(zoommerHeight/2)/zoomFactor;
					var newWidth = zoommerWidth/zoomFactor;
					var newHeight = zoommerHeight/zoomFactor;
				var paperImgd = paper.getImageData(leftCoord,topCoord,newWidth,newHeight);
				imageDataToImage(paperImgd,newWidth,newHeight,paperZoomer,zoommerWidth,zoommerHeight);
				var _paperCacheArrayImgd = _paperCacheArray[1].getImageData(leftCoord,topCoord,newWidth,newHeight);
				imageDataToImage(_paperCacheArrayImgd,newWidth,newHeight,paperZoomerCacheArray,zoommerWidth,zoommerHeight);
			}
			/* FLIP */
			flipHorizontal.bind('click',function(){
				paper.save();
					var imgd = paper.getImageData(0,0,_canvasWrapperW,_canvasWrapperH);
					paper.shadowBlur = 0;// prevent add shadows to img
					paper.globalAlpha = 1;// opacity for image fix
					paper.clearRect(0,0,_canvasWrapperW,_canvasWrapperH);
					paper.setTransform(-1,0,0,1,_canvasWrapperW,0);
					imageDataToImage(imgd,_canvasWrapperW,_canvasWrapperH,paper,_canvasWrapperW,_canvasWrapperH);
				paper.restore();
				_canvasWrapper.trigger('saveCanvasState');// undo-redo
				return false;
			});
			flipVertical.bind('click',function(){
				paper.save();
					var imgd = paper.getImageData(0,0,_canvasWrapperW,_canvasWrapperH);
					paper.shadowBlur = 0;// prevent add shadows to img
					paper.globalAlpha = 1;// opacity for image fix
					paper.clearRect(0,0,_canvasWrapperW,_canvasWrapperH);
					paper.setTransform(1,0,0,-1,0,_canvasWrapperH);
					imageDataToImage(imgd,_canvasWrapperW,_canvasWrapperH,paper,_canvasWrapperW,_canvasWrapperH);
				paper.restore();
				_canvasWrapper.trigger('saveCanvasState');// undo-redo
				return false;
			});
			/* DRAG AND DROP */
			(function(){
				if (!(Modernizr.draganddrop && typeof window.FileReader != 'undefined')) return; // if browser does'n support dragand drop or file api than stop
				dragAndDropMessage.show();
				var boxToDragIn = $('body').eq(0);
				var timer;
				var sMimeType,
				oFReader = new FileReader(),
				rFilter = /^(image\/bmp|image\/cis-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x-cmu-raster|image\/x-cmx|image\/x-icon|image\/x-portable-anymap|image\/x-portable-bitmap|image\/x-portable-graymap|image\/x-portable-pixmap|image\/x-rgb|image\/x-xbitmap|image\/x-xpixmap|image\/x-xwindowdump)$/i;
				oFReader.onload = function (oFREvent) {
					var image = $('<img src='+"data:" + sMimeType + ";base64," + btoa(oFREvent.target.result)+' />').appendTo(hiddenGarbageBox).error(function(){
						alert('File was corrupt or not an image.');
					}).load(function(){
						imagePreviewBox.html(image);
					});
				};
				boxToDragIn
					.bind("dragover", _over.bind(this))
					.bind("dragenter", function(){return false;})
					.bind('dragleave',function(e){
						clearTimeout(timer);
						timer = setTimeout(function(){
							hideHighlight();
						}, 100);
					})
					.bind("drop", _drop.bind(this))
				blockDocumentDrop();
				function blockDocumentDrop(){
					$(document)
						.bind('dragenter', function(e) {return false;})
						.bind('dragleave', function(e) {return false;})
						.bind('dragover', function(e) {
							var dt = e.originalEvent.dataTransfer;
							if (!dt) { return; }
							dt.dropEffect = 'none';
							return false;
						});
				}
				function hideHighlight(){
					boxToDragIn.removeClass(dragMouseInClass);
				}
				function addHighlight(){
					boxToDragIn.addClass(dragMouseInClass);
				}
				function _over(e){
					clearTimeout(timer);
					timer = setTimeout(function(){
						hideHighlight();
					}, 100);
					var dt = e.originalEvent.dataTransfer;
					if(!dt) return;
					if($.browser.mozilla) if(dt.types.contains&&!dt.types.contains("Files")) return;//FF
					if(navigator.userAgent.toLowerCase().indexOf('chrome') > -1) if(dt.types.indexOf&&dt.types.indexOf("Files")==-1) return;//Chrome
					if($.browser.webkit) dt.dropEffect = 'copy';//Webkit
					
					addHighlight();
					return false;
				}
				function _drop(e){
					var dt = e.originalEvent.dataTransfer;
					if(!dt&&!dt.files) return;
					
					hideHighlight();
					
					var files = dt.files;
					if(files.length>1){
						alert('Please, drop only 1 file.');
						return false;
					}
					onDropFile(e, files[0].fileName);
					upload(files[0]);
					return false;
				}
				function onDropFile(e, fileName){}
				function upload(file){
					sMimeType = file.type;
					if(!file.size){
						alert('File size is null. Please select another file.');
						return false;
					}else if(file.size>5*1024*1024){
						alert('File size is more than 5MB. Please select another file.');
						return false;
					}
					if (!rFilter.test(sMimeType)) { alert("You must select a valid image file!"); return; }
					oFReader.readAsBinaryString(file);
					if (!file || !file.type.match(/image.*/)){
						alert('The file is not a valid image file.')
						return false;
					};
					return false;
				}
			}());
			/* CURSOR */
			(function(){
				var $img = _boardContainer.find(options.cursorIcon);
				var img = $img.get(0);
				var imageLoadFunction = function(){
					var cursorBoxes = _canvasWrapper.add(_canvasWrapper.find('*'));
					var origWidth = img.width;
					var origHeight = img.height;
					var smallestSizeX = options.cursorSmallestSizeX;
					var smallestSizeY = options.cursorSmallestSizeY;
					var cursorPaperWidth = cursor.width();
					var cursorPaperHeight = cursor.height();
					var repaintCursor = function(){
						var cursorCanvasX = _strokeWidth;
						if(cursorCanvasX<smallestSizeX)cursorCanvasX=smallestSizeX;
						var cursorCanvasY = _strokeWidth;
						if(cursorCanvasY<smallestSizeY)cursorCanvasY=smallestSizeY;
						hiddenGarbageBox.children('#cursor-canvas').remove();
						var $cursorCanvas = $('<canvas id="cursor-canvas" />').appendTo(hiddenGarbageBox).attr({// draw cursor for css
							'width':cursorCanvasX,
							'height':cursorCanvasY
						});
						var cursorCanvas = $cursorCanvas.get(0);
						var cursorCanvasCtx = cursorCanvas.getContext('2d');
						if(!$.browser.msie){
							cursorCanvasCtx.drawImage(img,0,0,cursorCanvasX,cursorCanvasY);
							var cursorDataUrl=cursorCanvas.toDataURL("image/png");
							cursorBoxes.css('cursor','url("'+cursorDataUrl+'"), default');
						}
						_indentForCursorBrush = $.browser.opera ? 0 : $.browser.msie ? 5 : parseInt(cursorCanvasX/2)+1;
						paperCursor.clearRect(0,0,cursorPaperWidth,cursorPaperHeight);
						paperCursor.globalAlpha = _strokeOpacity;
						//paperCursor.drawImage(img,(cursorPaperWidth-cursorCanvasX)/2,(cursorPaperHeight-cursorCanvasY)/2,cursorCanvasX,cursorCanvasY);
						paperCursor.strokeStyle = options.cursorStrokeStyle;
						paperCursor.fillStyle = _strokeColor;
						paperCursor.lineWidth = 0;
						paperCursor.beginPath();
						paperCursor.arc(cursorPaperWidth/2,cursorPaperHeight/2, _strokeWidth/2, 0, Math.PI * 2, true);
						paperCursor.stroke();
						paperCursor.fill();
					}
					repaintCursor();
					_canvasWrapper.bind('repaintCursor',function(){repaintCursor()});
					_canvasWrapper.bind('changeStrokeColor',function(){
						_canvasWrapper.trigger('repaintCursor');
					});
				}
				if($img.width()){
					imageLoadFunction();
				}else{
					$img.load(function(){
						imageLoadFunction();
					});
				}
			}());
		});
	}
}(jQuery));
/* CTRL+KEY events handler */
(function(jQuery){
	$.ctrl = function(key, callback, args) {
		$(document).keydown(function(e) {
			if(!args) args=[]; // IE barks when args is null
			if(e.keyCode == key.charCodeAt(0) && e.ctrlKey) {
				callback.apply(this, args);
				return false;
			}
		});
	};
}(jQuery));
function uploadFileCallback(result,code,dataurl){// file upload
	$('body').eq(0).trigger({
		type:"upload-file-callback",
		callbackResult:result,
		callbackErorrCode:code,
		callbackDataUrl:dataurl
	});
}
window.onerror=function(err){// error logger
	console.log(err)
}