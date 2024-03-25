// ==UserScript==
// @name           ToolBox_Addon_Bases_List
// @author         Lars
// @description    Zoom out to Export Bases Data while in World View.
// @include        https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @version        0.5
// @contributor    ffi82
// @grant          none
// ==/UserScript==
(function()
	{
		var injectFunction = function()
		{
			function createClass()
			{
				qx.Class.define("ToolBox_Bases",
					{
						type: "singleton",
						extend: qx.core.Object,
						construct: function()
						{
							try
							{
								var ToolBoxMainFenster = window.ToolBoxMain.getInstance().ToolBoxFenster;
								var POIButton = new qx.ui.form.Button("Player Bases List").set(
									{
										toolTipText: "Exports the World Player Bases List to a csv file. While in World View, zoom out (Tiberium Alliance Zoom userscript needed) to include all Player Bases.",
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
											var AllBases = new Array();
											var output = "";
											output += "Player,Alliance,Faction,Base Id,Base Name,Base Coords,Base Level\r\n"
											for (var i = x - (range); i < (x+range); i++)
											{
												for (var j = y - range; j < (y+range); j++)
												{
													var visObject = region.GetObjectFromPosition(i * region.get_GridWidth(),j * region.get_GridHeight());
													if(visObject != null)
													{
														try
														{
															if (visObject.get_VisObjectType() == ClientLib.Vis.VisObject.EObjectType.RegionCityType)
															{
																var Type = visObject.get_Type();
																if (Type > 2) {} // Type: 0 = OwnBase; 1 = AllianceBase; 2 = OtherPlayerBase;
																else
																{
																	var AllianceName = visObject.get_AllianceName();
																	var PlayerName = visObject.get_PlayerName();
																	var PlayerFaction = visObject.get_PlayerFaction();
																	var Id = visObject.get_Id();
																	var Name = visObject.get_Name();
																	var BaseLevel = visObject.get_BaseLevel();
																	/*
																		----------------
																		not used
																		----------------
																		var AllianceId = visObject.get_AllianceId();
																		var PlayerId = visObject.get_PlayerId();
																		var UIType = visObject.get_UIType();
																		var RawX = visObject.get_RawX(); //=i
																		var RawY = visObject.get_RawY(); //=j
																		var IsEndgameRevengeTarget = visObject.get_IsEndgameRevengeTarget();
																		var IsTerminalBase = visObject.get_IsTerminalBase();
																		var VisObjectType = visObject.get_VisObjectType();
																		================
																		----------------
																		works only if Type=0 (own base)
																		----------------
																		var CommandCenterLevel = visObject.get_CommandCenterLevel();
																		var LvlBase = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[ID].get_LvlBase();
																		var LvlOffense = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[Id].get_LvlOffense();
																		var LvlDefense = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[Id].get_LvlDefense();
																		var Tiberium = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[Id].GetResourceGrowPerHour(ClientLib.Base.EResourceType.Tiberium, true, true);
																		var Crystal = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[Id].GetResourceGrowPerHour(ClientLib.Base.EResourceType.Crystal, true, true);
																		var Power = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[Id].GetResourceGrowPerHour(ClientLib.Base.EResourceType.Power, true, true);
																		var Credits = ClientLib.Base.Resource.GetResourceGrowPerHour(ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[Id].get_CityCreditsProduction(), false) + ClientLib.Base.Resource.GetResourceBonusGrowPerHour(ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[Id].get_CityCreditsProduction(), false);
																		var BaseDataOwn = AllianceId + ',' + AllianceName + ',' + PlayerId + ',' + PlayerName + ',' + PlayerFaction + ',' + Id + ',' + Name + ',' + Type + ',' + UIType + ',' + RawX + ':' + RawY + ',' + BaseLevel + ',' + CommandCenterLevel + ',' + IsEndgameRevengeTarget + ',' + IsTerminalBase + ',' + VisObjectType + ',' + LvlBase + ',' + LvlOffense + ',' + LvlDefense + ',' + Tiberium + ',' + Crystal + ',' + Power + ',' + Credits;
																		================
																	*/
                                                                    var BaseData = PlayerName + ',' + AllianceName + ',' + PlayerFaction + ',' + Id + ',' + Name + ',[coords]' + i + ':' + j + '[/coords],' + BaseLevel;
																	AllBases.push(BaseData);
																}
															}
														}
														catch (e) { console.log(e); }
													}
												}
											}
											AllBases.sort();
											for (var key in AllBases) { output += AllBases[key] + "\n"}
											var elLink = document.createElement("a");
											var oBlob = new Blob([ output ], { type: "text/plain" });
											elLink.download = "/Bases_List.csv";
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
								console.log("Bases List Error: ");
								console.log(e.toString());
							}
							console.log("Bases List loaded successfully");
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
									ToolBox_Bases.attachNetEvent = webfrontend.gui.Util.attachNetEvent;
									ToolBox_Bases.detachNetEvent = webfrontend.gui.Util.detachNetEvent;
								}
								else
								{
									ToolBox_Bases.attachNetEvent = phe.cnc.Util.attachNetEvent;
									ToolBox_Bases.detachNetEvent = phe.cnc.Util.detachNetEvent;
								}
								if (typeof phe.cnc.gui.util == 'undefined')
								ToolBox_Bases.getInstance().formatNumbersCompact = webfrontend.gui.Util.formatNumbersCompact;
								else
								ToolBox_Bases.getInstance().formatNumbersCompact = phe.cnc.gui.util.Numbers.formatNumbersCompact;
								ToolBox_Bases.getInstance();
							}
							catch(e)
							{
								console.log("ToolBox_Addon_Bases_List waitforgame Error:");
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
