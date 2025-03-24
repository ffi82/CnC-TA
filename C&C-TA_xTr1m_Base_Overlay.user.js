// ==UserScript==
// @name        C&C-TA_xTr1m_Base_Overlay
// @description While in own base view, press CTRL or AltGr key on your keyboard to show ROI on the needed buildings.
// @match       https://*.alliances.commandandconquer.com/*/index.aspx*
// @version     2025.03.24
// @author      xTr1m ( https://github.com/xTr1m/ )
// @contributor DLwarez, NetquiK, c4l10s, ffi82
// @downloadURL https://github.com/ffi82/CnC-TA/raw/refs/heads/master/C&C-TA_xTr1m_Base_Overlay.user.js
// @updateURL   https://github.com/ffi82/CnC-TA/raw/refs/heads/master/C&C-TA_xTr1m_Base_Overlay.meta.js
// ==/UserScript==
/* global qx, ClientLib, webfrontend, xTr1m_Base_Overlay */
'use strict';
(function () {
    const injectFunction = () => {
        const scriptName = 'C&C:TA xTr1m Base Overlay';
        const createClass = () => {
            qx.Class.define("xTr1m_Base_Overlay", {
                type: "singleton",
                extend: qx.core.Object,
                construct: function () {
                    try {
                        const app = qx.core.Init.getApplication();
                        this.__window = new xTr1m_Base_Overlay.Window();
                        const onKeyDown = (e) => {
                            const xt = xTr1m_Base_Overlay.getInstance();
                            if (!!e.ctrlKey && !xt.__windowOpened) {
                                switch (ClientLib.Vis.VisMain.GetInstance().get_Mode()) {
                                case ClientLib.Vis.Mode.City:
                                    xt.__openWindow();
                                }
                            }
                        };
                        const onKeyUp = (e) => {
                            const xt = xTr1m_Base_Overlay.getInstance();
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
                    const layout = new qx.ui.layout.Canvas();
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
                        const app = qx.core.Init.getApplication();
                        const mainOverlay = app.getMainOverlay();
                        this.setWidth(mainOverlay.getWidth());
                        this.setMaxWidth(mainOverlay.getMaxWidth());
                        this.setHeight(mainOverlay.getHeight());
                        this.setMaxHeight(mainOverlay.getMaxHeight());
                        this.__background.removeAll();
                        this.__background.setThemedBackgroundColor("#00000080");
                        const data = ClientLib.Data.MainData.GetInstance();
                        const cities = data.get_Cities();
                        const ownCity = cities.get_CurrentOwnCity();
                        const buildings = ownCity.get_Buildings();
                        const visMain = ClientLib.Vis.VisMain.GetInstance();
                        const visCity = visMain.get_City();
                        const zoomFactor = visCity.get_ZoomFactor();
                        let hudEntities = [];
                        let maxRes = 0;
                        let minRes = Number.MAX_VALUE;
                        const width = (visCity.get_GridWidth() * zoomFactor);
                        const height = (visCity.get_GridHeight() * zoomFactor);
                        this.collectData(ownCity);
                        for (const building of Object.values(this.__buildings)) {
                            let x = building.PosX * width;
                            let y = building.PosY * height;
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
                        let deltaRes = maxRes - minRes;
                        for (const entity of hudEntities) {
                            const relRes = (entity.Ratio - minRes) / deltaRes;
                            const relHex = Math.round(relRes * 15);
                            const red = (15 - relHex).toString(16);
                            const green = relHex.toString(16);
                            const box = new qx.ui.layout.HBox().set({
                                alignX: "center",
                                alignY: "middle"
                            });
                            const overlay = new qx.ui.container.Composite(box).set({
                                decorator: new qx.ui.decoration.Decorator(1, "solid", "#000000").set({
                                    backgroundColor: `#${red}${green}0`
                                }),
                                opacity: 0.55,
                                width: width - 2,
                                height: height - 2
                            });
                            const label = new qx.ui.basic.Label(entity.Ratio.toFixed(6)).set({
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
                        const app = qx.core.Init.getApplication();
                        app.getDesktop().remove(this);
                    },
                    collectData: function (city) {
                        try {
                            let resList = [];
                            resList.push(this.getResList(city, [ClientLib.Base.ETechName.Harvester, ClientLib.Base.ETechName.Silo], ClientLib.Base.EModifierType.TiberiumPackageSize, ClientLib.Base.EModifierType.TiberiumProduction));
                            resList.push(this.getResList(city, [ClientLib.Base.ETechName.Harvester, ClientLib.Base.ETechName.Silo], ClientLib.Base.EModifierType.CrystalPackageSize, ClientLib.Base.EModifierType.CrystalProduction));
                            resList.push(this.getResList(city, [ClientLib.Base.ETechName.PowerPlant, ClientLib.Base.ETechName.Accumulator], ClientLib.Base.EModifierType.PowerPackageSize, ClientLib.Base.EModifierType.PowerProduction));
                            resList.push(this.getResList(city, [ClientLib.Base.ETechName.Refinery, ClientLib.Base.ETechName.PowerPlant], ClientLib.Base.EModifierType.CreditsPackageSize, ClientLib.Base.EModifierType.CreditsProduction));
                            this.__buildings = [];
                            for (const resEntry of Object.values(resList)) {
                                for (const building of Object.values(resEntry)) {
                                    const index = building.PosY * 10 + building.PosX;
                                    if (!(index in this.__buildings)) {
                                        this.__buildings[index] = building;
                                    } else {
                                        this.__buildings[index].Gain += building.Gain;
                                    }
                                }
                            }
                            for (const j of Object.values(this.__buildings)) {
                                j.Ratio = j.Gain / j.Cost;
                            }
                        } catch (e) {
                            console.error("xTr1m_Base_Overlay.Window.collectData:", e);
                        }
                    },
                    getResList: function (city, arTechtypes, eModPackageSize, eModProduction) {
                        try {
                            let i = 0;
                            const buildings = city.get_Buildings().d;
                            let resAll = [];
                            let objbuildings = [];
                            for (const o of Object.values(buildings)) {
                                objbuildings.push(o);
                            }
                            for (i = 0; i < objbuildings.length; i++) {
                                let Cost = 0;
                                let resbuilding = [];
                                const city_building = objbuildings[i];
                                const city_buildingdetailview = city.GetBuildingDetailViewInfo(city_building);
                                const iTechType = city_building.get_TechName();
                                const bindex = city_building.get_Id();
                                const TechLevelData = ClientLib.Base.Util.GetTechLevelResourceRequirements_Obj(city_building.get_CurrentLevel() + 1, city_building.get_TechGameData_Obj());
                                const buildingLevel = city_building.get_CurrentLevel();
                                const maxLevel = ClientLib.Data.MainData.GetInstance().get_Server().get_PlayerUpgradeCap();
                                let bSkip = true;
                                for (const iTypeKey of arTechtypes) {
                                    if (iTypeKey == iTechType) {
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
                                for (const ModifierType in city_buildingdetailview.OwnProdModifiers.d) {
                                    switch (parseInt(ModifierType, 10)) {
                                    case eModPackageSize: {
                                        const ModOj = city_buildingdetailview.OwnProdModifiers.d[city_building.get_MainModifierTypeId()];
                                        const CurrentDelay = (ModOj.TotalValue) / ClientLib.Data.MainData.GetInstance().get_Time().get_StepsPerHour();
                                        const NextDelay = (ModOj.TotalValue + ModOj.NewLvlDelta) / ClientLib.Data.MainData.GetInstance().get_Time().get_StepsPerHour();
                                        const mtProd = city_buildingdetailview.OwnProdModifiers.d[ModifierType];
                                        const CurrentProd = mtProd.TotalValue / CurrentDelay;
                                        const NextProd = (mtProd.TotalValue + mtProd.NewLvlDelta) / NextDelay;
                                        resbuilding.Gain += NextProd - CurrentProd;
                                        break;
                                    }
                                    case eModProduction: {
                                        resbuilding.Gain += city_buildingdetailview.OwnProdModifiers.d[ModifierType].NewLvlDelta;
                                        break;
                                    }
                                    }
                                }
                                for (const costtype of TechLevelData) {
                                    if (typeof costtype == "function" || costtype.Type == "0") {
                                        continue;
                                    }
                                    if (parseInt(costtype.Count) <= 0) {
                                        continue;
                                    }
                                    Cost += costtype.Count;
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
