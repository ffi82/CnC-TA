// ==UserScript==
// @name        C&C-TA_xTr1m_Base_Overlay
// @description While in own base view, press CTRL or AltGr key on your keyboard to show ROI on the needed buildings.
// @match       https://*.alliances.commandandconquer.com/*/index.aspx*
// @version     2025.03.02
// @author      xTr1m ( https://github.com/xTr1m/ )
// @contributor DLwarez, NetquiK, c4l10s, ffi82
// @downloadURL https://github.com/ffi82/CnC-TA/raw/refs/heads/master/C&C-TA_xTr1m_Base_Overlay.user.js
// @updateURL   https://github.com/ffi82/CnC-TA/raw/refs/heads/master/C&C-TA_xTr1m_Base_Overlay.meta.js
// ==/UserScript==
(function () {
    var injectFunction = function () {
        const scriptName = 'C&C:TA xTr1m Base Overlay';

        function createClass() {
            qx.Class.define("xTr1m_Base_Overlay", {
                type: "singleton",
                extend: qx.core.Object,
                construct: function () {
                    try {
                        var app = qx.core.Init.getApplication();
                        this.__window = new xTr1m_Base_Overlay.Window();
                        var onKeyDown = function (e) {
                            var xt = xTr1m_Base_Overlay.getInstance();
                            if (!!e.ctrlKey && !xt.__windowOpened) {
                                switch (ClientLib.Vis.VisMain.GetInstance().get_Mode()) {
                                case ClientLib.Vis.Mode.City:
                                    xt.__openWindow();
                                }
                            }
                        };
                        var onKeyUp = function (e) {
                            var xt = xTr1m_Base_Overlay.getInstance();
                            if (!e.ctrlKey && xt.__windowOpened) {
                                switch (ClientLib.Vis.VisMain.GetInstance().get_Mode()) {
                                case ClientLib.Vis.Mode.City:
                                    xt.__closeWindow();
                                }
                            }
                        };
                        document.addEventListener('keydown', onKeyDown, true);
                        document.addEventListener('keyup', onKeyUp, true);
                        document.addEventListener('blur', onKeyUp, true);
                    } catch (e) {
                        console.error(e);
                    }
                },
                destruct: function () {},
                members: {
                    __windowOpened: false,
                    __window: null,
                    __openWindow: function () {
                        this.__windowOpened = true;
                        this.__window.open();
                    },
                    __closeWindow: function () {
                        this.__windowOpened = false;
                        this.__window.close();
                    }
                }
            });
            qx.Class.define("xTr1m_Base_Overlay.Window", {
                extend: qx.ui.container.Composite,
                construct: function () {
                    this.base(arguments);
                    var layout = new qx.ui.layout.Canvas();
                    this._setLayout(layout);
                    this.__background = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
                    this._add(this.__background, {
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                        allowGrowX: true,
                        allowGrowY: true
                    });
                },
                destruct: function () {},
                members: {
                    __background: null,
                    __buildings: [],
                    open: function () {
                        var app = qx.core.Init.getApplication();
                        var mainOverlay = app.getMainOverlay();
                        this.setWidth(mainOverlay.getWidth());
                        this.setMaxWidth(mainOverlay.getMaxWidth());
                        this.setHeight(mainOverlay.getHeight());
                        this.setMaxHeight(mainOverlay.getMaxHeight());
                        this.__background.removeAll();
                        this.__background.setThemedBackgroundColor("#00000080");
                        var data = ClientLib.Data.MainData.GetInstance();
                        var cities = data.get_Cities();
                        var ownCity = cities.get_CurrentOwnCity();
                        var buildings = ownCity.get_Buildings();
                        var visMain = ClientLib.Vis.VisMain.GetInstance();
                        var visCity = visMain.get_City();
                        var zoomFactor = visCity.get_ZoomFactor();
                        var hudEntities = [];
                        var maxRes = 0;
                        var minRes = Number.MAX_VALUE;
                        var width = (visCity.get_GridWidth() * zoomFactor);
                        var height = (visCity.get_GridHeight() * zoomFactor);
                        this.collectData(ownCity);
                        for (var ri in this.__buildings) {
                            var building = this.__buildings[ri];
                            var x = building.PosX * width;
                            var y = building.PosY * height;
                            x -= visCity.get_MinXPosition() * zoomFactor;
                            y -= visCity.get_MinYPosition() * zoomFactor;
                            maxRes = Math.max(maxRes, building.Ratio);
                            minRes = Math.min(minRes, building.Ratio);
                            hudEntities.push({
                                "Ratio": building.Ratio,
                                "X": x,
                                "Y": y
                            });
                        }
                        var deltaRes = maxRes - minRes;
                        for (var i in hudEntities) {
                            var entity = hudEntities[i];
                            var relRes = (entity.Ratio - minRes) / deltaRes;
                            var relHex = Math.round(relRes * 15);
                            var red = (15 - relHex).toString(16);
                            var green = relHex.toString(16);
                            var box = new qx.ui.layout.HBox();
                            var overlay = new qx.ui.container.Composite(box).set({
                                decorator: new qx.ui.decoration.Decorator(1, "solid", "#000000").set({
                                    backgroundColor: "#" + red + green + "0"
                                }),
                                opacity: 0.55,
                                width: width - 2,
                                height: height - 2
                            });
                            box.setAlignX("center");
                            box.setAlignY("middle");
                            var label = new qx.ui.basic.Label(entity.Ratio.toFixed(6)).set({
                                allowGrowX: false,
                                allowGrowY: false,
                                textColor: "black",
                                font: "font_size_16_bold"
                            });
                            overlay._add(label);
                            this.__background._add(overlay, {
                                left: entity.X + 5 * zoomFactor,
                                top: entity.Y + 10 * zoomFactor
                            });
                        }
                        app.getDesktop().add(this, {
                            left: mainOverlay.getBounds().left,
                            top: mainOverlay.getBounds().top
                        });
                    },
                    close: function () {
                        var app = qx.core.Init.getApplication();
                        app.getDesktop().remove(this);
                    },
                    collectData: function (city) {
                        try {
                            var resList = [];
                            resList.push(this.getResList(city, [ClientLib.Base.ETechName.Harvester, ClientLib.Base.ETechName.Silo], ClientLib.Base.EModifierType.TiberiumPackageSize, ClientLib.Base.EModifierType.TiberiumProduction));
                            resList.push(this.getResList(city, [ClientLib.Base.ETechName.Harvester, ClientLib.Base.ETechName.Silo], ClientLib.Base.EModifierType.CrystalPackageSize, ClientLib.Base.EModifierType.CrystalProduction));
                            resList.push(this.getResList(city, [ClientLib.Base.ETechName.PowerPlant, ClientLib.Base.ETechName.Accumulator], ClientLib.Base.EModifierType.PowerPackageSize, ClientLib.Base.EModifierType.PowerProduction));
                            resList.push(this.getResList(city, [ClientLib.Base.ETechName.Refinery, ClientLib.Base.ETechName.PowerPlant], ClientLib.Base.EModifierType.CreditsPackageSize, ClientLib.Base.EModifierType.CreditsProduction));
                            this.__buildings = [];
                            for (var i in resList) {
                                var resEntry = resList[i];
                                for (var b in resEntry) {
                                    var building = resEntry[b];
                                    var index = building.PosY * 10 + building.PosX;
                                    if (!(index in this.__buildings)) {
                                        this.__buildings[index] = building;
                                    } else {
                                        this.__buildings[index].Gain += building.Gain;
                                    }
                                }
                            }
                            for (var j in this.__buildings) {
                                this.__buildings[j].Ratio = this.__buildings[j].Gain / this.__buildings[j].Cost;
                            }
                        } catch (e) {
                            console.error("xTr1m_Base_Overlay.Window.collectData:", e);
                        }
                    },
                    getResList: function (city, arTechtypes, eModPackageSize, eModProduction) {
                        try {
                            var i = 0;
                            var buildings = city.get_Buildings().d;
                            var resAll = [];
                            var objbuildings = [];
                            if (PerforceChangelist >= 376877) {
                                for (var o in buildings) {
                                    objbuildings.push(buildings[o]);
                                }
                            } //new
                            else {
                                for (i = 0; i < buildings.length; i++) {
                                    objbuildings.push(buildings[i]);
                                }
                            } //old
                            for (i = 0; i < objbuildings.length; i++) {
                                var Cost = 0;
                                var resbuilding = [];
                                var city_building = objbuildings[i];
                                var city_buildingdetailview = city.GetBuildingDetailViewInfo(city_building);
                                var iTechType = city_building.get_TechName();
                                var bindex = city_building.get_Id();
                                var TechLevelData = ClientLib.Base.Util.GetTechLevelResourceRequirements_Obj(city_building.get_CurrentLevel() + 1, city_building.get_TechGameData_Obj());
                                var buildingLevel = city_building.get_CurrentLevel();
                                var maxLevel = ClientLib.Data.MainData.GetInstance().get_Server().get_PlayerUpgradeCap();
                                var bSkip = true;
                                for (var iTypeKey in arTechtypes) {
                                    if (arTechtypes[iTypeKey] == iTechType) {
                                        if (buildingLevel < maxLevel) {
                                            bSkip = false;
                                            break;
                                        }
                                    }
                                } // only show where needed
                                if (bSkip) {
                                    continue;
                                }
                                if (city_buildingdetailview === null) {
                                    continue;
                                }
                                resbuilding.PosX = city_building.get_CoordX();
                                resbuilding.PosY = city_building.get_CoordY();
                                resbuilding.Gain = 0;
                                for (var ModifierType in city_buildingdetailview.OwnProdModifiers.d) {
                                    switch (parseInt(ModifierType, 10)) {
                                    case eModPackageSize: {
                                        var ModOj = city_buildingdetailview.OwnProdModifiers.d[city_building.get_MainModifierTypeId()];
                                        var CurrentDelay = (ModOj.TotalValue) / ClientLib.Data.MainData.GetInstance().get_Time().get_StepsPerHour();
                                        var NextDelay = (ModOj.TotalValue + ModOj.NewLvlDelta) / ClientLib.Data.MainData.GetInstance().get_Time().get_StepsPerHour();
                                        var mtProd = city_buildingdetailview.OwnProdModifiers.d[ModifierType];
                                        var CurrentProd = mtProd.TotalValue / CurrentDelay;
                                        var NextProd = (mtProd.TotalValue + mtProd.NewLvlDelta) / NextDelay;
                                        resbuilding.Gain += NextProd - CurrentProd;
                                        break;
                                    }
                                    case eModProduction: {
                                        resbuilding.Gain += city_buildingdetailview.OwnProdModifiers.d[ModifierType].NewLvlDelta;
                                        break;
                                    }
                                    }
                                }
                                for (var costtype in TechLevelData) {
                                    if (typeof (TechLevelData[costtype]) == "function" || TechLevelData[costtype].Type == "0") {
                                        continue;
                                    }
                                    if (parseInt(TechLevelData[costtype].Count) <= 0) {
                                        continue;
                                    }
                                    Cost += TechLevelData[costtype].Count;
                                }
                                resbuilding.Cost = Cost;
                                resAll.push(resbuilding);
                            }
                            return resAll;
                        } catch (e) {
                            console.error("xTr1m_Base_Overlay.Window.getResList:", e);
                        }
                    },
                }
            });
        }
        const checkForInit = () => {
            try {
                if (typeof qx === 'undefined' || typeof qx.core.Init.getApplication !== 'function' || !qx?.core?.Init?.getApplication()?.initDone) return setTimeout(checkForInit, 1000);
                createClass();
                xTr1m_Base_Overlay.getInstance();
                console.log(`%c${scriptName} loaded`, "background: #c4e2a0; color: darkred; font-weight: bold; padding: 3px; border-radius: 5px;");
            } catch (e) {
                console.error(`%c${scriptName} error:`, 'background: black; color: pink; font-weight:bold; padding: 3px; border-radius: 5px;', e);
            }
        };

        checkForInit();
    };
    try {
        const script = document.createElement("script");
        script.textContent = `(${injectFunction})();`;
        script.type = "text/javascript";
        document.head.appendChild(script);
    } catch (e) {
        console.error(`%cC&C:TA xTr1m Base Overlay init error:`, 'background: black; color: pink; font-weight:bold; padding: 3px; border-radius: 5px;', e);
    }
})();
