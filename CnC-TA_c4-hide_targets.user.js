// ==UserScript==
// @name            c4 - hide targets
// @description     Hides all Forgotten targets smaller then level 63 in a 16 field radius.
// @author          c4
// @version         2020.01.01
// @namespace       https://*.alliances.commandandconquer.com/*
// @include         https://*.alliances.commandandconquer.com/*
// ==/UserScript==
(function () {
	var injectFunction = function () {
		function createClasses() {
			qx.Class.define("HideTargets", {
				type: "singleton",
				extend: qx.core.Object,
				construct: function () {
					this.HideText = new qx.ui.basic.Label("hide targets").set({
						textColor : "#FFFFFF",
						font : "font_size_11"
					});
					var HideTarget = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
						/*decorator : new qx.ui.decoration.Background().set({
							backgroundRepeat : "no-repeat",
							backgroundImage : "webfrontend/ui/menues/notifications/bgr_ticker_container.png",
							backgroundPositionX : "center"
						}),*/
						padding : 2,
						opacity: 0.8,
            margin: 16
					});
					HideTarget.add(this.HideText);
					HideTarget.addListener("click", function (e) {
						if (e.getButton() == "left") this.hide_Targets();
					}, this);
					this.__refresh = false;
					qx.core.Init.getApplication().getDesktop().add(HideTarget, {left: 128, top: 0});
				},
				destruct: function () {},
				members: {
					__refresh: null,
					HideText: null,
					get_HideText: function (i) {
						var qxApp = qx.core.Init.getApplication();
					},
					hide_Targets: function(){
						var currCity = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity();
                        var x = currCity.get_X();
                        var y = currCity.get_Y();
                        var region = ClientLib.Vis.VisMain.GetInstance().get_Region();
                        for (var i = x - 16; i < (x + 16); i++)
                        {
                            for (var j = y - 16; j < (y+16); j++)
                            {
                                var visObject = region.GetObjectFromPosition(i * region.get_GridWidth(),j * region.get_GridHeight());
                                if(visObject != null)
                                {
                                    if (visObject.get_VisObjectType() == ClientLib.Vis.VisObject.EObjectType.RegionNPCCamp)
                                    {
                                        var lvl = Math.round(visObject.get_BaseLevelFloat()) + 1;
						                if ( lvl < 63)
                                        {
                                            visObject.HideInfos();
                                        }
                                    }
                                }
                            }      
                        }
					}
				}
			});
		}
		function waitForGame() {
			try {
				if (typeof qx !== "undefined" && typeof qx.core !== "undefined" && typeof qx.core.Init !== "undefined" && typeof ClientLib !== "undefined" && typeof phe !== "undefined") {
					var app = qx.core.Init.getApplication();
					if (app.initDone === true) {
						try {
							createClasses();
							HideTargets.getInstance();
						} catch (e) {
							console.error("Error in waitForGame", e);
						}
					} else
						window.setTimeout(waitForGame, 1000);
				} else {
					window.setTimeout(waitForGame, 1000);
				}
			} catch (e) {
				console.error("Error in waitForGame", e);
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
