// ==UserScript==
// @name        BaseMove Highlighter
// @namespace   pouet
// @include     http*://*.alliances.commandandconquer.com/*
// @version     1.2
// @grant       none
// @author      Bloofi
// ==/UserScript==
(function() {
    var wavy_main = function() {
        console.log('wavy loaded');

        function Createwavy() {
            qx.Class.define("wavy", {
                type: "singleton",
                extend: qx.core.Object,
                construct: function() {},
                members: {
                    _App: null,
                    _MainData: null,
                    _VisMain: null,
                    wavyPanel: {
                        grid: null,
                        labelNb: null,
                        labelNbVal: null,
                        labelDetail: null,
                        labelDetailVal: null
                    },
                    regionCityMoveInfoAddonExists: null,
                    gridWidth: null,
                    gridHeight: null,
                    baseMarkerWidth: null,
                    baseMarkerHeight: null,
                    regionZoomFactor: null,
                    baseMarkerList: null,
                    buttonActivated: false,

                    initialize: function() {
                        try {
                            this._App = qx.core.Init.getApplication();
                            this._MainData = ClientLib.Data.MainData.GetInstance();
                            this._VisMain = ClientLib.Vis.VisMain.GetInstance();

                            this.baseMarkerList = [];

                            phe.cnc.Util.attachNetEvent(this._VisMain.GetMouseTool(ClientLib.Vis.MouseTool.EMouseTool.SelectSupport), "OnCellChange", ClientLib.Vis.MouseTool.OnCellChange, this, this.baseMoveToolCellChange);
                            phe.cnc.Util.attachNetEvent(this._VisMain.GetMouseTool(ClientLib.Vis.MouseTool.EMouseTool.SelectSupport), "OnActivate", ClientLib.Vis.MouseTool.OnActivate, this, this.baseMoveToolActivate);
                            phe.cnc.Util.attachNetEvent(this._VisMain.GetMouseTool(ClientLib.Vis.MouseTool.EMouseTool.SelectSupport), "OnDeactivate", ClientLib.Vis.MouseTool.OnDeactivate, this, this.baseMoveToolDeactivate);

                            phe.cnc.Util.attachNetEvent(this._VisMain.GetMouseTool(ClientLib.Vis.MouseTool.EMouseTool.MoveBase), "OnCellChange", ClientLib.Vis.MouseTool.OnCellChange, this, this.baseMoveToolCellChange);
                            phe.cnc.Util.attachNetEvent(this._VisMain.GetMouseTool(ClientLib.Vis.MouseTool.EMouseTool.MoveBase), "OnActivate", ClientLib.Vis.MouseTool.OnActivate, this, this.baseMoveToolActivate);
                            phe.cnc.Util.attachNetEvent(this._VisMain.GetMouseTool(ClientLib.Vis.MouseTool.EMouseTool.MoveBase), "OnDeactivate", ClientLib.Vis.MouseTool.OnDeactivate, this, this.baseMoveToolDeactivate);

                            this.wavyPanel.grid = new qx.ui.container.Composite();
                            var layout = new qx.ui.layout.Grid(2, 2);
                            this.wavyPanel.grid.setLayout(layout);

                            this.wavyPanel.labelNb = new qx.ui.basic.Label("Nb bases : ");
                            this.wavyPanel.labelNb.setFont("bold");
                            this.wavyPanel.labelNb.setTextColor("#DDDDFF");
                            this.wavyPanel.labelNb.setAlignY("top");
                            this.wavyPanel.labelNb.setAlignX("right");

                            this.wavyPanel.labelNbVal = new qx.ui.basic.Label("");
                            this.wavyPanel.labelNbVal.setTextColor("#FFF");
                            this.wavyPanel.labelNbVal.setAlignY("top");
                            this.wavyPanel.labelNbVal.setAlignX("left");

                            this.wavyPanel.labelDetail = new qx.ui.basic.Label("Détail : ");
                            this.wavyPanel.labelDetail.setFont("bold");
                            this.wavyPanel.labelDetail.setTextColor("#DDDDFF");
                            this.wavyPanel.labelDetail.setAlignY("top");
                            this.wavyPanel.labelDetail.setAlignX("right");

                            this.wavyPanel.labelDetailVal = new qx.ui.basic.Label("");
                            this.wavyPanel.labelDetailVal.setTextColor("#FFF");
                            this.wavyPanel.labelDetailVal.setAlignY("top");
                            this.wavyPanel.labelDetailVal.setAlignX("left");

                            this.wavyPanel.grid.add(this.wavyPanel.labelNb, {
                                row: 0,
                                column: 0
                            });
                            this.wavyPanel.grid.add(this.wavyPanel.labelNbVal, {
                                row: 0,
                                column: 1
                            });
                            this.wavyPanel.grid.add(this.wavyPanel.labelDetail, {
                                row: 1,
                                column: 0
                            });
                            this.wavyPanel.grid.add(this.wavyPanel.labelDetailVal, {
                                row: 1,
                                column: 1
                            });

                            /*
							var me = this ;
							var button = new qx.ui.form.Button("()").set({
							    toolTipText: "Basemove Highlight",
							    width: 32,
								  height: 32,
								  maxWidth: 32,
								  maxHeight: 32,
								  appearance: ("button-playarea-mode-frame"),
								  center: true
							});
							button.addListener("click", function (e) {

								var fn = function(x,y){alert(x+","+y);} ;
								if(me.buttonActivated==true) {
									  me.baseMoveToolDeactivate() ;
								  	phe.cnc.Util.detachNetEvent(me._VisMain.GetMouseTool(ClientLib.Vis.MouseTool.EMouseTool.SelectSupport), "OnMouseDown", ClientLib.Vis.MouseTool.OnMouseDown, me, fn);
								} else {
									 try {
									 phe.cnc.Util.attachNetEvent(me._VisMain.GetMouseTool(ClientLib.Vis.MouseTool.EMouseTool.SelectSupport), "OnMouseDown", ClientLib.Vis.MouseTool.OnMouseDown, me, fn);
									 } catch(e){alert(e);}
							     me.buttonActivated = true ;
                   me.baseMoveToolActivate();
								}

							}, this);
							this._App.getDesktop().add(button,{right: 150,top: 65});
							*/


                        } catch (e) {
                            alert(e);
                            console.log(e);
                        }
                    },

                    baseMoveToolActivate: function() {
                        try {
                            this.getRegionZoomFactorAndSetMarkerSize();
                            phe.cnc.Util.attachNetEvent(this._VisMain.get_Region(), "PositionChange", ClientLib.Vis.PositionChange, this, this.repositionMarkers);
                            phe.cnc.Util.attachNetEvent(this._VisMain.get_Region(), "ZoomFactorChange", ClientLib.Vis.ZoomFactorChange, this, this.resizeMarkers);
                        } catch (e) {
                            console.log(e);
                        }
                    },

                    baseMoveToolDeactivate: function() {
                        try {
                            this.buttonActivated = false;
                            phe.cnc.Util.detachNetEvent(this._VisMain.get_Region(), "PositionChange", ClientLib.Vis.PositionChange, this, this.repositionMarkers);
                            phe.cnc.Util.detachNetEvent(this._VisMain.get_Region(), "ZoomFactorChange", ClientLib.Vis.ZoomFactorChange, this, this.resizeMarkers);
                            this.removeMarkers();
                        } catch (e) {
                            console.log(e);
                        }
                    },

                    baseMoveToolCellChange: function(startX, startY) {
                        try {
                            if (this.regionCityMoveInfoAddonExists == true) {
                                webfrontend.gui.region.RegionCityMoveInfo.getInstance().remove(this.wavyPanel.grid);
                                //this.regionCityMoveInfoAddonExists = false;
                            }

                            this.removeMarkers();
                            this.findBases(startX, startY);
                        } catch (e) {
                            console.log(e);
                        }
                    },


                    findBases: function(startX, startY) {
                        try {
                            var result = [];
                            var total = 0;
                            var region = this._VisMain.get_Region();
                            var ownAlliance = ClientLib.Data.MainData.GetInstance().get_Alliance();
                            var scanDistance = 11;
                            var attackDistance = 10.5;
                            var found = false;
                            var ss = "";

                            if (this.buttonActivated) {
                                this.addMarker(startX * region.get_GridWidth(), startY * region.get_GridHeight(), "#ffffff", 0, "#000000"); //blanc
                            }

                            for (var x = startX - (scanDistance); x < (startX + scanDistance); x++) {
                                for (var y = startY - scanDistance; y < (startY + scanDistance); y++) {
                                    var visObject = region.GetObjectFromPosition(x * region.get_GridWidth(), y * region.get_GridHeight());

                                    if (visObject != null) {
                                        var baseX = visObject.get_RawX();
                                        var baseY = visObject.get_RawY();
                                        var a = startX - baseX;
                                        var b = startY - baseY;
                                        var distance = Math.sqrt(a * a + b * b);

                                        //var CPNeeded = visObject.CalculateAttackCommandPointCostToCoord(startX,startY);

                                        if (distance <= attackDistance) {

                                            //var needcp = visObject.CalculateAttackCommandPointCostToCoord(startX, startY);


                                            if (visObject.get_VisObjectType() == ClientLib.Vis.VisObject.EObjectType.RegionNPCBase) {
                                                total++;
                                                var baseLevel = 0;
                                                try {
                                                    baseLevel = parseInt(visObject.get_BaseLevel());
                                                } catch (ee) {}
                                                if (baseLevel > 0) {
                                                    if (!result[baseLevel]) result[baseLevel] = 0;
                                                    result[baseLevel]++;
                                                    found = true;
                                                    var needcp = Math.floor(10 + distance * 3);
                                                    this.addMarker(baseX, baseY, "#ffde17", needcp, "#000000"); // jaune
                                                }
                                            } else if (visObject.get_VisObjectType() == ClientLib.Vis.VisObject.EObjectType.RegionCityType) {
                                                var needcp = Math.floor(3 + distance);
                                                if (visObject.get_AllianceId && visObject.get_AllianceId() == ownAlliance.get_Id()) {
                                                    this.addMarker(baseX, baseY, "#0036ff", needcp, "#ffffff"); //rouge
                                                } else {
                                                    this.addMarker(baseX, baseY, "#ff3600", needcp, "#000000"); //bleu
                                                }


                                            }
                                        }
                                    }
                                }
                            }

                            if (found == true) {
                                for (var a in result) {
                                    ss += "[" + result[a] + " x " + a + "]   ";
                                }
                            } else {
                                ss = "Nothing !";
                            }

                            this.wavyPanel.labelNbVal.setValue("" + total);
                            this.wavyPanel.labelDetailVal.setValue(ss);
                            this.regionCityMoveInfoAddonExists = true;
                            webfrontend.gui.region.RegionCityMoveInfo.getInstance().add(this.wavyPanel.grid);

                        } catch (e) {
                            console.log(e);
                        }
                    },


                    screenPosFromWorldPosX: function(x) {
                        try {
                            return this._VisMain.ScreenPosFromWorldPosX(x * this.gridWidth);
                        } catch (e) {
                            console.log(e);
                        }
                    },

                    screenPosFromWorldPosY: function(y) {
                        try {
                            return this._VisMain.ScreenPosFromWorldPosY(y * this.gridHeight);
                        } catch (e) {
                            console.log(e);
                        }
                    },

                    addMarker: function(bx, by, color, cpNeeded, textColor) {
                        try {
                            var marker = new qx.ui.container.Composite(new qx.ui.layout.HBox(1)).set({
                                decorator: new qx.ui.decoration.Decorator(1, "solid", "#000000").set({
                                    backgroundColor: color
                                }),
                                width: this.baseMarkerWidth,
                                height: this.baseMarkerHeight,
                            });
                            marker.add(new qx.ui.basic.Label("" + cpNeeded).set({
                                textColor: textColor,
                                font: "bold",
                                width: this.baseMarkerWidth,
                                rich: true,
                                textAlign: "middle",
                                paddingLeft: 1
                            }));

                            this._App.getDesktop().addAfter(marker, this._App.getBackgroundArea(), {
                                left: this.screenPosFromWorldPosX(bx),
                                top: this.screenPosFromWorldPosY(by)
                            });
                            this.baseMarkerList.push({
                                element: marker,
                                x: bx,
                                y: by
                            });
                        } catch (e) {
                            console.log(e);
                        }
                    },

                    removeMarkers: function() {
                        try {
                            if (this.baseMarkerList.length > 0) {
                                for (var i = 0; i < this.baseMarkerList.length; i++) {
                                    this._App.getDesktop().remove(this.baseMarkerList[i].element);
                                }
                                this.baseMarkerList = [];
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    },

                    getRegionZoomFactorAndSetMarkerSize: function() {
                        try {
                            this.gridWidth = this._VisMain.get_Region().get_GridWidth();
                            this.gridHeight = this._VisMain.get_Region().get_GridHeight();
                            this.regionZoomFactor = this._VisMain.get_Region().get_ZoomFactor();
                            this.baseMarkerWidth = (this.gridWidth) * 0.12; //this.regionZoomFactor *
                            this.baseMarkerHeight = this.baseMarkerWidth;
                        } catch (e) {
                            console.log(e);
                        }
                    },

                    repositionMarkers: function() {
                        try {
                            for (var i = 0; i < this.baseMarkerList.length; i++) {
                                this.baseMarkerList[i].element.setDomLeft(this.screenPosFromWorldPosX(this.baseMarkerList[i].x));
                                this.baseMarkerList[i].element.setDomTop(this.screenPosFromWorldPosY(this.baseMarkerList[i].y));
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    },

                    resizeMarkers: function() {
                        try {
                            this.getRegionZoomFactorAndSetMarkerSize();
                            for (var i = 0; i < this.baseMarkerList.length; i++) {
                                this.baseMarkerList[i].element.setWidth(this.baseMarkerWidth);
                                this.baseMarkerList[i].element.setHeight(this.baseMarkerHeight);
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }

                }
            });
        };

        function wavy_checkIfLoaded() {
            try {
                if (typeof qx !== 'undefined' && typeof qx.locale !== 'undefined' && typeof qx.locale.Manager !== 'undefined' && qx.core.Init.getApplication() && ClientLib.Data.MainData.GetInstance().get_Player().get_Faction() !== null) {
                    Createwavy();
                    window.wavy.getInstance().initialize();
                } else {
                    window.setTimeout(wavy_checkIfLoaded, 1000);
                }
            } catch (e) {
                console.log("wavy_checkIfLoaded: ", e);
            }
        }

        if (/commandandconquer\.com/i.test(document.domain)) {
            window.setTimeout(wavy_checkIfLoaded, 1000);
        }
    }

    try {
        var wavy = document.createElement("script");
        wavy.innerHTML = "(" + wavy_main.toString() + ")();";
        wavy.type = "text/javascript";
        if (/commandandconquer\.com/i.test(document.domain)) {
            document.getElementsByTagName("head")[0].appendChild(wavy);
        }
    } catch (e) {
        console.log("wavy: init error: ", e);
    }
})();
