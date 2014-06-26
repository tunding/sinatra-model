/*
 * 1.0.0
 */
/*函数参数的意义如下
 topology(JSON、DIV的ID、背景颜色、圆角大小（IE无效）、边框宽度、边框颜色、图片宽度、图片高度、线的颜色、线的粗细、文本颜色、文本大小、一行最多的文本字数)
 */
function topology(json, divId, backgroundColor, borderRadius, borderWidth,
		borderColor, imageWidth, imageHeight, lineColor, lineWidth, textColor,
		textSize, maxWordPerLine) {
	var networks = json.networks; // 得到节点数据
	var networks_length = networks.length; // 得到有几个网段
	var contain_div = $("#" + divId);
	var outside_div = $("<div style='position:relative'></div>").appendTo(
			contain_div);
	var contain_div_width = contain_div.css("width");
	var contain_div_height = contain_div.css("height");
	outside_div.css({
		"width" : contain_div_width,
		"height" : contain_div_height
	});

	for ( var netNum = 0; netNum < networks_length; netNum++) { // 按网段个数遍历每个网段
		var name = networks[netNum].name;
		var parameter = networks[netNum].parameter; // 可选参数，如果JSON中没有定义，则应是undefined
		var nodes = networks[netNum].nodes; // 该网段节点
		var left;
		var top;
		var width;
		var height;
		if (parameter == undefined) { // 没有定义字段parameter，则默认为占满外围div；
			left = 0;
			top = 0;
			width = Number(contain_div_width.substring(0,
					contain_div_width.length - 2));
			height = Number(contain_div_height.substring(0,
					contain_div_height.length - 2));
		} else { // 定义有该字段则按定义的百分比
			left = Number(contain_div_width.substring(0,
					contain_div_width.length - 2))
					* Number(parameter[0]) / 100;
			top = Number(contain_div_height.substring(0,
					contain_div_height.length - 2))
					* Number(parameter[1]) / 100;
			width = Number(contain_div_width.substring(0,
					contain_div_width.length - 2))
					* Number(parameter[2]) / 100;
			height = Number(contain_div_height.substring(0,
					contain_div_height.length - 2))
					* Number(parameter[3]) / 100;
		}

		var margin = 4; // 此margin是为了在具有多个网段的情况下，设置网段div之间的间隔
		var net_div = $("<div></div>").appendTo(outside_div).attr("id",
				name + "_div").css("position", "absolute").css("left", left) // 按照parameter参数确定该div的位置和宽高
		.css("top", top).css("background-color", backgroundColor).css(
				"border-radius", borderRadius) // 圆角属性，但是在IE下无效
		.css("margin", margin).css("width", width - margin * 2).css("height",
				height - margin * 2).css("border-width", borderWidth) // 边框的宽度
		.css("border-style", "solid").css("border-color", borderColor); // 边框的颜色
		// 非IE浏览器执行下面代码，为绘制连线添加一个外围的SVG
		if (!document.all) {
			var net_text_line_svg = d3.select(net_div[0]).append("svg").attr(
					"id", name + "_text_line_svg").attr("width", "100%").attr(
					"height", "100%");
		}

		var level_depth = nodes.length;
		for ( var i = 0; i < level_depth; i++) { // 每个网段的节点数据是分层定义的，按层次来画
			var level = nodes[i].level; // level遍历在确定该层节点所在高度有用
			var levelNodes = nodes[i].levelNodes;
			var levelNodes_length = levelNodes.length;
			var level_div = $("<div></div>").appendTo(net_div).attr("id",
					name + "_level" + level + "_pngs_div");
			for ( var j = 0; j < levelNodes_length; j++) {
				// 以下是添加节点图片代码
				var node = $("<img />").appendTo(level_div);
				node.data("data", levelNodes[j]);
				node.attr("src", "/images/"
						+ node.data("data").type + ".png");
				node.attr("alt", "picture load fail").attr("id",
						node.data("data").ID).attr(
						"title",
						"type:" + node.data("data").type + "\n" + "id:"
								+ node.data("data").ID + "\n" + "name:"
								+ node.data("data").name) // title属性，鼠标放在节点图片上方时候显示相应文字
				.css("width", imageWidth) // 设置图片的宽度
				.css("height", imageHeight); // 设置图片的高度
				node
						.data(
								"cx",
								((width / levelNodes_length) * (j + 0.5) - imageWidth * 0.5)
										+ imageWidth / 2);
				node.data("cy", (height / level_depth) * (level - 0.5)
						- textSize * 1.5 - imageHeight * 0.5 + imageHeight / 2);
				node.data("level", level).data("height", imageHeight).data(
						"width", imageWidth);
				node
						.css("position", "absolute")
						.css(
								"left",
								((width / levelNodes_length) * (j + 0.5) - imageWidth * 0.5))
						.css(
								"top",
								(height / level_depth) * (level - 0.5)
										- textSize * 1.5 - imageHeight * 0.5); // 设置图片的垂直位置，0.8可改
				// 以下是添加节点的名字
				var el = document.getElementById(levelNodes[j].ID);
				var showname = levelNodes[j].name;
				if (levelNodes_length > 10) {
					if (showname.length > 4) {
						showname = showname.substring(0, 4) + "...";
					}
				}
				var textPro = text_Process(showname, maxWordPerLine);
				$(el).data("textLineNum", textPro.lineNum);
				var text_div = $("<div>" + textPro.newText + "</div>")
						.appendTo(net_div);
				var x = Number($(el).data("cx")) - textPro.maxNumPerLine
						* textSize / 2;
				var y = Number($(el).data("cy")) + Number($(el).data("height"))
						/ 2;
				text_div.css("position", "absolute").css("left", x).css("top",
						y).css("font-size", textSize).css("color", textColor)
						.css("text-align", "center").css("white-space",
								"pre-wrap").css("word-break", "break-all").css(
								"line-height", (textSize + 2) + "px");
			}
		}
		var net_links = networks[netNum].links;
		// 按IE浏览器和非IE浏览器分别用SVG和VML画线
		if (document.all) {
			// 在IE下调用IE_CreateLine函数画线，原理是VML
			var dom_net_div = net_div[0];
			for ( var p = 0; p < net_links.length; p++) {
				var endpoint1 = document
						.getElementById(net_links[p].endpoint1_ID);
				var endpoint2 = document
						.getElementById(net_links[p].endpoint2_ID);
				var start_cx = $(endpoint1).data("cx");
				var start_cy = $(endpoint1).data("cy");
				var end_cx = $(endpoint2).data("cx");
				var end_cy = $(endpoint2).data("cy");
				var x1, y1, x2, y2;
				var level1 = $(endpoint1).data("level");
				var level2 = $(endpoint2).data("level");
				if (Number(level1) == Number(level2)) {
					y1 = start_cy;
					y2 = end_cy;
					if (Number($(endpoint1).data("cx")) > Number($(endpoint2)
							.data("cx"))) {
						x1 = start_cx - $(endpoint1).data("width") / 2;
						x2 = end_cx + $(endpoint2).data("width") / 2;
					} else {
						x1 = start_cx + $(endpoint1).data("width") / 2;
						x2 = end_cx - $(endpoint2).data("width") / 2;
					}
				} else {
					x1 = start_cx;
					x2 = end_cx;
					if (Number($(endpoint1).data("cy")) > Number($(endpoint2)
							.data("cy"))) {
						y1 = start_cy - Number($(endpoint1).data("height")) / 2;
						y2 = end_cy + Number($(endpoint2).data("height")) / 2
								+ $(endpoint2).data("textLineNum") * textSize
								+ 2;
					} else {
						y1 = start_cy + Number($(endpoint1).data("height")) / 2
								+ $(endpoint1).data("textLineNum") * textSize
								+ 2;
						y2 = end_cy - Number($(endpoint2).data("height")) / 2;
					}
				}
				var line_ele = IE_CreateLine(x1, y1, x2, y2, lineColor,
						lineWidth);
				$(dom_net_div).append($(line_ele));
			}
		} else {
			// 在非IE下用d3.js画线，原理是SVG
			var text_svg = net_text_line_svg.append("svg").attr("id",
					name + "_line_svg").attr("width", "100%").attr("height",
					"100%");
			text_svg
					.selectAll("line")
					.data(net_links)
					.enter()
					.append("line")
					.attr("stroke", lineColor)
					// 连线颜色
					.attr("stroke-width", lineWidth)
					// 连线宽度
					.each(
							function(d) {
								var endpoint1 = document
										.getElementById(d.endpoint1_ID);
								var endpoint2 = document
										.getElementById(d.endpoint2_ID);
								var level1 = $(endpoint1).data("level");
								var level2 = $(endpoint2).data("level");
								if (Number(level1) == Number(level2)) {
									d3
											.select(this)
											.attr(
													"x1",
													function() {
														if ($(endpoint1).data(
																"cx") > $(
																endpoint2)
																.data("cx")) {
															return $(endpoint1)
																	.data("cx")
																	- $(
																			endpoint1)
																			.data(
																					"width")
																	/ 2;
														} else {
															return Number($(
																	endpoint1)
																	.data("cx"))
																	+ Number($(
																			endpoint1)
																			.data(
																					"width"))
																	/ 2;
														}
													})
											.attr("y1", function() {
												return $(endpoint1).data("cy");
											})
											.attr(
													"x2",
													function() {
														if ($(endpoint1).data(
																"cx") > $(
																endpoint2)
																.data("cx")) {
															return $(endpoint2)
																	.data("cx")
																	+ $(
																			endpoint2)
																			.data(
																					"width")
																	/ 2;
														} else {
															return Number($(
																	endpoint2)
																	.data("cx"))
																	- Number($(
																			endpoint2)
																			.data(
																					"width"))
																	/ 2;
														}
													}).attr("y2", function() {
												return $(endpoint2).data("cy");
											});
								} else {
									var x1 = $(endpoint1).data("cx");
									var y1 = $(endpoint1).data("cy");
									var height1 = $(endpoint1).data("height");
									var x2 = $(endpoint2).data("cx");
									var y2 = $(endpoint2).data("cy");
									var height2 = $(endpoint2).data("height");
									if (Number(y1) > Number(y2)) {
										d3.select(this).attr("x1", x1).attr(
												"x2", x2).attr("y1",
												y1 - height1 / 2).attr(
												"y2",
												Number(y2)
														+ height2
														/ 2
														+ $(endpoint2).data(
																"textLineNum")
														* textSize + 2);
									} else {
										d3.select(this).attr("x1", x1).attr(
												"x2", x2).attr(
												"y1",
												Number(y1)
														+ height1
														/ 2
														+ $(endpoint1).data(
																"textLineNum")
														* textSize + 2).attr(
												"y2", y2 - height2 / 2);
									}
								}
							});
		}
	}
}

function IE_CreateLine(startX, startY, endX, endY, lineColor, lineWidth) {
	var le = document.createElement("<v:line></v:line>");
	le.from = startX + ',' + startY;
	le.to = endX + ',' + endY;
	le.strokecolor = lineColor; // IE下连线的颜色
	le.strokeweight = lineWidth; // IE下连线的宽度
	le.style.position = "absolute";
	return le;
}

function text_Process(text, maxWordPerLine) {
	var lineNum = Math.ceil(text.length / maxWordPerLine);
	var maxNumPerLine = Math.ceil(text.length / lineNum);
	var firstLineNum = text.length % maxNumPerLine == 0 ? maxNumPerLine
			: text.length % maxNumPerLine;
	var newText = text.substr(0, firstLineNum);
	for ( var i = 0; i < lineNum - 1; i++) {
		newText += "<br>";
		newText += text.substr(firstLineNum + i * maxNumPerLine, maxNumPerLine);
	}
	return {
		"maxNumPerLine" : maxNumPerLine,
		"newText" : newText,
		"lineNum" : lineNum
	}
}