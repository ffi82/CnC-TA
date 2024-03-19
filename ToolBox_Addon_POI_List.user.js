// ==UserScript==
// @name           ToolBox_Addon_POI_List
// @author         Lars
// @description    Zoom out to Export POI Data while in world view.
// @include        https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @version        0.3
// @contributor    ffi82
// @grant          none
// ==/UserScript==
(function()
	{
		var injectFunction = function()
		{
			function createClass()
			{
				qx.Class.define("ToolBox_POI",
					{
						type: "singleton",
						extend: qx.core.Object,
						construct: function()
						{
							try
							{
								var ToolBoxMainFenster = window.ToolBoxMain.getInstance().ToolBoxFenster;
								var POIButton = new qx.ui.form.Button("POI List").set(
									{
										toolTipText: "Exports the World POI List to a csv file. While in World View, zoom out (Tiberium Alliance Zoom userscript needed) to include all POIs.",
										width: 140,
										height: 25,
										maxWidth: 140,
										maxHeight: 25,
									});
									POIButton.addListener("click", function (e)
										{
											var range = ClientLib.Data.MainData.GetInstance().get_World().get_WorldHeight();
											var x = ClientLib.Data.MainData.GetInstance().get_World().get_WorldWidth();
											var y = ClientLib.Data.MainData.GetInstance().get_World().get_WorldHeight();
											var region = ClientLib.Vis.VisMain.GetInstance().get_Region();
											var POIScore = []; for (var i = 0; i <= ClientLib.Data.MainData.GetInstance().get_Server().get_MaxCenterLevel(); i++) {POIScore [i] = ClientLib.Base.PointOfInterestTypes.GetScoreByLevel(i);}
                                        	var Reactor  = new Array();
											var Tiberium = new Array();
											var Crystal = new Array();
											var Tungsten = new Array();
											var Uranium = new Array();
											var Aircraft = new Array();
											var Resonator = new Array();
											var AllPOIs = new Array();
											var output = "";
											output += "level,name,coord_x,coord_y,alliance,score\r\n"

											for (var i = x - (range); i < (x+range); i++)
											{
												for (var j = y - range; j < (y+range); j++)
												{
													var visObject = region.GetObjectFromPosition(i * region.get_GridWidth(),j * region.get_GridHeight());
													if(visObject != null)
													{
														try
														{
															if (visObject.get_VisObjectType() ==

															ClientLib.Vis.VisObject.EObjectType.RegionPointOfInterest)
															{
																var visObjectName = visObject.get_Name();
																if(visObjectName == 'Tunnel exit') {}
																else
																{
																	var POIlevel = visObject.get_Level();
																	var Alliance = visObject.get_OwnerAllianceName();
																	var visObjectShortName = visObjectName.split(' ')[0];
																	var POIdata = POIlevel + ',' + visObjectShortName + ',' + i + ',' + j + ',' + Alliance + ',' + POIScore[POIlevel];
																	AllPOIs.push(POIdata);
																	if(visObjectShortName == "Aircraft") { Aircraft.push(POIdata); }
																	if(visObjectShortName == "Uranium") { Uranium.push(POIdata); }
																	if(visObjectShortName == "Tungsten") { Tungsten.push(POIdata); }
																	if(visObjectShortName == "Tiberium") { Tiberium.push(POIdata); }
																	if(visObjectShortName == "Reactor") { Reactor.push(POIdata); }
																	if(visObjectShortName == "Crystal") { Crystal.push(POIdata); }
																	if(visObjectShortName == "Resonator") { Resonator.push(POIdata); }
																}
															}
														}
														catch (e) { console.log(e); }
													}
												}
											}

											Aircraft.sort();
											Uranium.sort();
											Tungsten.sort();
											Tiberium.sort();
											Reactor.sort();
											Crystal.sort();
											Resonator.sort();

											for (var key in Aircraft) { output += Aircraft[key] + "\n"}
											for (var key in Uranium) { output += Uranium[key] + "\n"}
											for (var key in Tungsten) { output += Tungsten[key] + "\n"}
											for (var key in Tiberium) { output += Tiberium[key] + "\n"}
											for (var key in Reactor) { output += Reactor[key] + "\n"}
											for (var key in Crystal) { output += Crystal[key] + "\n"}
											for (var key in Resonator) { output += Resonator[key] + "\n"}
											var elLink = document.createElement("a");
											var oBlob = new Blob([ output ], { type: "text/plain" });
											elLink.download = "/POI_list.csv";
											var oLastUrl = window.URL.createObjectURL(oBlob);
											elLink.href = oLastUrl;
											document.body.appendChild(elLink);
											elLink.click();
											document.body.removeChild(elLink);
											delete elLink;
										}, this);
										ToolBoxMainFenster.add(POIButton);
							}
							catch (e)
							{
							console.log("POI list Error: ");
							console.log(e.toString());
						}
						console.log("POI list loaded successfully");
					},
					destruct: function() {},
					members: {}
				});
		}
		function waitForGame()
		{
			try
			{
				if (typeof qx != 'undefined' && typeof qx.core != 'undefined' && typeof qx.core.Init != 'undefined' && qx.core.Init.getApplication() !== null && typeof window.ToolBoxMain != 'undefined')
				{
					var app = qx.core.Init.getApplication();
					if (app.initDone === true && typeof window.ToolBoxMain != 'undefined')
					{
						try
						{
							createClass();
							//console.log("Creating phe.cnc function wraps");
							if (typeof phe.cnc.Util.attachNetEvent == 'undefined')
							{
								ToolBox_POI.attachNetEvent = webfrontend.gui.Util.attachNetEvent;
								ToolBox_POI.detachNetEvent = webfrontend.gui.Util.detachNetEvent;
							}
							else
							{
								ToolBox_POI.attachNetEvent = phe.cnc.Util.attachNetEvent;
								ToolBox_POI.detachNetEvent = phe.cnc.Util.detachNetEvent;
							}
							if (typeof phe.cnc.gui.util == 'undefined')
							ToolBox_POI.getInstance().formatNumbersCompact = webfrontend.gui.Util.formatNumbersCompact;
							else
							ToolBox_POI.getInstance().formatNumbersCompact = phe.cnc.gui.util.Numbers.formatNumbersCompact;
							ToolBox_POI.getInstance();
						}
						catch(e)
						{
							console.log("ToolBox_Addon_POI_List waitforgame Error:");
							console.log(e);
						}
					}
					else window.setTimeout(waitForGame, 1000);
				}
				else { window.setTimeout(waitForGame, 1000); }
			}
			catch (e)
			{
				if (typeof console != 'undefined') console.log(e);
				else if (window.opera) opera.postError(e);
				else GM_log(e);
			}
		}
		window.setTimeout(waitForGame, 1000);
	};
	var script = document.createElement("script");
	var txt = injectFunction.toString();
	script.innerHTML = "(" + txt + ")();";
	script.type = "text/javascript";
	document.getElementsByTagName("head")[0].appendChild(script);
})();
