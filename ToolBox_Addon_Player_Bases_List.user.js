// ==UserScript==
// @name        ToolBox_Addon_Player_Bases_List
// @namespace   https://github.com/ffi82/CnC-TA
// @version     2024.07.21
// @description Exports all visible player bases list to a .csv file (no ghost bases... uses ClientLib.Vis).
// @author      ffi82
// @contributor Lars (Sral214)
// @match       https://*.alliances.commandandconquer.com/*/*
// @icon        https://eaassets-a.akamaihd.net/cncalliancesgame/cdn/data/d5e540d5859558e8c5b6aafd00d8462a.png
// @downloadURL https://github.com/ffi82/CnC-TA/raw/master/ToolBox_Addon_Player_Bases_List.user.js
// @updateURL	https://github.com/ffi82/CnC-TA/raw/master/ToolBox_Addon_Player_Bases_List.user.js
// @require     https://github.com/ffi82/CnC-TA/raw/master/Tiberium_Alliances_Zoom.user.js
// @grant       none
// ==/UserScript==
(function() {
    var injectFunction = function() {
        function createClass() {
            qx.Class.define("ToolBox_Bases", {
                type: "singleton",
                extend: qx.core.Object,
                construct: function() {
                    try {
                        var ToolBoxMainFenster = window.ToolBoxMain.getInstance().ToolBoxFenster;
                        var BasesButton = new qx.ui.form.Button("Bases list", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAAXNSR0IArs4c6QAABC9JREFUSEu91m1MW1UYB/D/01Ja2kJ5mSOIyEsrAl3UyTaQwNgmIjAYQ5gbAqG8TJCGGedGN5YZx1zQsIRlJohmJmOJZIthYcxkHxY/sMwZwwj6wbdssCBoaeWlvHUt7T3HFJxBWKFg4vl2c895fve559znuYT/YdBSg4/8oIC/fzDI28cj3z7pxJDwgLTaOXfzlyNTP+eAP3zfOj2mFgTnsvuLA0m8RJD5R1oA0duk0HR6jlgH69hYt+HWV5/7TE1Z4ArkbjBOSMyooiD1q/1gQhkp1D2Pm7s8E/vIMedv7YaWc03em+LU8A1Nemw2nM2h91YnV8jFKKpuYOKNKTdhnzGQKu7eUmhFpFR3gFTaWguY7deFhdwJwA6OIHBHdFdrjez2nR6kJMdTTnnjDOSaNtinGkmlHV8MrYyUl5BK+84siBnnFzFhFtx2GUSjYOxEV0tF+O1vvoNM6o1XduciZW+9GRL5GcgGLxLtdD3Q/Fgdiczixu8vcrFYDN9gLXxC0r6FWHoDxEu7Wio1LkQuk0Am90F2QSU27dL3Q5gzkEJzw2NEuUGDutoazgWOHRnZ2FN8vA8S/+sgvPHleZ2mt6fP9RrBBI7QkA04cNBAwdqCwyR7qnV1pLnJu7SihHw3xqLhqJ47nAJS01+j9MJjdwDZBRB7CzM/xcM2NB/LPGIUdbS3ce1L+2j7Hv1hUsSsjjR/9KH3wWod+T2dhlO1uXxujiEjv4hS8+rvQSTpAGfxINE2kMgLBPpz6Bf5tZYyHr01bx1IRCZO6bO4w8GQWaCj5MxyNm56wGw2O4gWtlSp9IOdK7zWj2j20wf6VDY5LWBfcQUSknfQYN9lWCyuU7qAhIZFAU++jvUjMVVorHmRm8ad0FW+SS9sTcLA3S8wMTEBVyJOp4CIqGiIwwr/AxKnR6shkRtNsygsq6bYLWmY6r9GttnR+Uw4Y1AFhfEZv4y1Idb+S4Yzp5ukR2rzEbD5BCbvt0OwWaAM2QbutNLdm5/y4WEjf3RE1dGxFJ5Qu0bkfpvhdMNZ6dEjZVCFp+F4VTYXccKunP2UnlsCx8jXJHLOcBKJF75oZRhG2fO4+rGOa+Jz6eX8Q6sfYesj5N1SBETtRsdndYwI9FxCDsKjNNR9vRVG0xgXixcqdESkmqKT9eg4X8qf2bJ3jcihPATGvycANLlQH5kAYcYLgk3x70pLZDabJFeaS3hcYsE6kM0GG5ht+O8qbAcXeYMQsAQRmf8YCLxyrmxtSP3Js9KdCVFcFZFKYG476z91dtIygd7uqzw1q9izTJy/dxouXfhE+nB6FBKJ+864OBtB4BB7SbA9oxgxSUWrbLx1oADOsZMTZlO4w+FYsccv7YCudqD0f8ImlQfWkfLZNvdVmP+ohN03GCSRLQ3i2bWdwcqNFOD6wXDTtDwLtLZZfwE3uTs4z03V4gAAAABJRU5ErkJggg==").set({
                            toolTipText: "Exports all visible Player Bases list to a .csv file.\r\nGhost bases are not included (uses ClientLib.Vis)",
                            width: 140,
                            height: 25,
                            maxWidth: 140,
                            maxHeight: 25,
                        });
                        BasesButton.addListener("execute", function(e) {
                            if (ClientLib.Vis.VisMain.GetInstance().get_Region().get_MinZoomFactor() != 0.01) {
                                if (confirm("Get 'Tiberium Alliances Zoom' userscript to enable true max zoom out in Region View. May reduce performance.\nAlso make sure the 'Allow max zoom out' in game Options -> Audio/Video tab is unchecked.")) {
                                    open("https://github.com/ffi82/CnC-TA/raw/master/Tiberium%20Alliances%20Zoom.user.js")
                                }
                            } else {
                                if (ClientLib.Vis.VisMain.GetInstance().get_Region().get_ZoomFactor() != 0.01) {
                                    if (confirm("Set zoom factor @ 0.01 to be able to see the entire world... zoom out max.\nYour current zoom factor: " + ClientLib.Vis.VisMain.GetInstance().get_Region().get_ZoomFactor())) {
                                        ClientLib.Vis.VisMain.GetInstance().get_Region().set_ZoomFactor(0.01)
                                    };
                                } else {
                                    if (qx.core.Init.getApplication().getPlayArea().getViewMode() != 0) {
                                        if (confirm("Switch to Region View.")) {
                                            qx.core.Init.getApplication().showMainOverlay(!1)
                                        }
                                    } else {
                                        var range = ClientLib.Data.MainData.GetInstance().get_World().get_WorldHeight();
                                        var x = ClientLib.Data.MainData.GetInstance().get_World().get_WorldWidth();
                                        var y = ClientLib.Data.MainData.GetInstance().get_World().get_WorldHeight();
                                        var region = ClientLib.Vis.VisMain.GetInstance().get_Region();
                                        var AllBases = new Array();
                                        var output = "";
                                        output += "Player,Alliance,Faction,Base Id,Base Name,Coords_X,Coords_Y,Base Level\r\n";
                                        for (var i = x - (range); i < (x + range); i++) {
                                            for (var j = y - range; j < (y + range); j++) {
                                                var visObject = region.GetObjectFromPosition(i * region.get_GridWidth(), j * region.get_GridHeight());
                                                if (visObject != null) {
                                                    try {
                                                        if (visObject.get_VisObjectType() == ClientLib.Vis.VisObject.EObjectType.RegionCityType) {
                                                            var Type = visObject.get_Type();
                                                            if (Type > 2) {} // Type: 0 = OwnBase; 1 = AllianceBase; 2 = OtherPlayerBase;
                                                            else {
                                                                var AllianceName = visObject.get_AllianceName();
                                                                var PlayerName = visObject.get_PlayerName();
                                                                var PlayerFaction = visObject.get_PlayerFaction();
                                                                var Id = visObject.get_Id();
                                                                var Name = visObject.get_Name();
                                                                var BaseLevel = visObject.get_BaseLevel();
                                                                /*
                                                                // not used
                                                                var AllianceId = visObject.get_AllianceId();
				    				        					var PlayerId = visObject.get_PlayerId();
					    					        			var UIType = visObject.get_UIType();
						    						        	var RawX = visObject.get_RawX(); //=i
        					    								var RawY = visObject.get_RawY(); //=j
		        				    							var IsEndgameRevengeTarget = visObject.get_IsEndgameRevengeTarget();
				        			    						var IsTerminalBase = visObject.get_IsTerminalBase();
						        		    					var VisObjectType = visObject.get_VisObjectType();
                                                                //works only if Type=0 (own base)
                                                                var CommandCenterLevel = visObject.get_CommandCenterLevel();
		        											    var LvlBase = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[ID].get_LvlBase();
                                                                var LvlOffense = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[Id].get_LvlOffense();
                                                                var LvlDefense = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[Id].get_LvlDefense();
                                                                var Tiberium = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[Id].GetResourceGrowPerHour(ClientLib.Base.EResourceType.Tiberium, true, true);
                                                                var Crystal = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[Id].GetResourceGrowPerHour(ClientLib.Base.EResourceType.Crystal, true, true);
                                                                var Power = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[Id].GetResourceGrowPerHour(ClientLib.Base.EResourceType.Power, true, true);
                                                                var Credits = ClientLib.Base.Resource.GetResourceGrowPerHour(ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[Id].get_CityCreditsProduction(), false) + ClientLib.Base.Resource.GetResourceBonusGrowPerHour(ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[Id].get_CityCreditsProduction(), false);
		        		    									var BaseDataOwn = AllianceId + ',' + AllianceName + ',' + PlayerId + ',' + PlayerName + ',' + PlayerFaction + ',' + Id + ',' + Name + ',' + Type + ',' + UIType + ',' + RawX + ':' + RawY + ',' + BaseLevel + ',' + CommandCenterLevel + ',' + IsEndgameRevengeTarget + ',' + IsTerminalBase + ',' + VisObjectType + ',' + LvlBase + ',' + LvlOffense + ',' + LvlDefense + ',' + Tiberium + ',' + Crystal + ',' + Power + ',' + Credits;
                                                                */
                                                                var BaseData = String([PlayerName, AllianceName, PlayerFaction, Id, Name, i, j, BaseLevel]);
                                                                AllBases.push(BaseData);
                                                            }
                                                        }
                                                    } catch (e) {
                                                        console.log(e);
                                                    }
                                                }
                                            }
                                        }
                                        AllBases.sort();
                                        for (var key in AllBases) {
                                            output += AllBases[key] + "\n"
                                        }
                                        var elLink = document.createElement("a");
                                        var oBlob = new Blob([output], {
                                            type: "text/plain"
                                        });
                                        elLink.download = new Date().toISOString().slice(0, -14) + "_" + ClientLib.Data.MainData.GetInstance().get_Server().get_WorldId() + "_Bases.csv";
                                        var oLastUrl = window.URL.createObjectURL(oBlob);
                                        elLink.href = oLastUrl;
                                        document.body.appendChild(elLink);
                                        elLink.click();
                                        document.body.removeChild(elLink);
                                        delete elLink;
                                        if (confirm("Done. (" + elLink.download + " was downloaded).\nReset zoom factor?")) {
                                            ClientLib.Vis.VisMain.GetInstance().get_Region().set_ZoomFactor(1)
                                        };
                                    }
                                }
                            }
                        }, this);
                        ToolBoxMainFenster.add(BasesButton);
                    } catch (e) {
                        console.log("Bases List Error: ");
                        console.log(e.toString());
                    }
                    console.log("Bases List loaded successfully");
                },
                destruct: function() {},
                members: {}
            });
        }

        function waitForGame() {
            try {
                if (typeof qx != 'undefined' && typeof qx.core != 'undefined' && typeof qx.core.Init != 'undefined' && qx.core.Init.getApplication() !== null && typeof window.ToolBoxMain != 'undefined') {
                    var app = qx.core.Init.getApplication();
                    if (app.initDone === true && typeof window.ToolBoxMain != 'undefined') {
                        try {
                            createClass();
                            //console.log("Creating phe.cnc function wraps");
                            if (typeof phe.cnc.Util.attachNetEvent == 'undefined') {
                                ToolBox_Bases.attachNetEvent = webfrontend.gui.Util.attachNetEvent;
                                ToolBox_Bases.detachNetEvent = webfrontend.gui.Util.detachNetEvent;
                            } else {
                                ToolBox_Bases.attachNetEvent = phe.cnc.Util.attachNetEvent;
                                ToolBox_Bases.detachNetEvent = phe.cnc.Util.detachNetEvent;
                            }
                            if (typeof phe.cnc.gui.util == 'undefined')
                                ToolBox_Bases.getInstance().formatNumbersCompact = webfrontend.gui.Util.formatNumbersCompact;
                            else
                                ToolBox_Bases.getInstance().formatNumbersCompact = phe.cnc.gui.util.Numbers.formatNumbersCompact;
                            ToolBox_Bases.getInstance();
                        } catch (e) {
                            console.log("ToolBox_Addon_Bases_List waitforgame Error:");
                            console.log(e);
                        }
                    } else window.setTimeout(waitForGame, 1000);
                } else {
                    window.setTimeout(waitForGame, 1000);
                }
            } catch (e) {
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
