// ==UserScript==
// @name        C&C-TA_xTr1m_Base_Overlay
// @description While in own base view, press CTRL or AltGr key on your keyboard to show ROI on the needed buildings.
// @match       https://*.alliances.commandandconquer.com/*/index.aspx*
// @version     2025.04.25
// @author      xTr1m ( https://github.com/xTr1m/ )
// @contributor DLwarez, NetquiK, c4l10s, ffi82
// @downloadURL https://github.com/ffi82/CnC-TA/raw/refs/heads/master/CnC-TA_xTr1m_Base_Overlay.user.js
// @updateURL   https://github.com/ffi82/CnC-TA/raw/refs/heads/master/CnC-TA_xTr1m_Base_Overlay.meta.js
// @icon        data:image/png;base64,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
// ==/UserScript==
/* global qx, ClientLib, xTr1m_Base_Overlay */
'use strict';
(() => {
    const injectFunction = () => {
        const scriptName = 'C&C:TA xTr1m Base Overlay';
        const createClass = () => {
            qx.Class.define("xTr1m_Base_Overlay", {
                extend: qx.core.Object,
                type: "singleton",
                construct() {
                    try {
                        this.__window = new xTr1m_Base_Overlay.Window();
                        const onKeyDown = (e) => {
                            const xt = xTr1m_Base_Overlay.getInstance();
                            e.ctrlKey && !xt.__windowOpened && ClientLib.Vis.VisMain.GetInstance().get_Mode() === ClientLib.Vis.Mode.City ? xt.__openWindow() : null
                        }
                        const onKeyUp = (e) => {
                            const xt = xTr1m_Base_Overlay.getInstance();
                            !e.ctrlKey && xt.__windowOpened && ClientLib.Vis.VisMain.GetInstance().get_Mode() === ClientLib.Vis.Mode.City ? xt.__closeWindow() : null
                        }
                        document.addEventListener('keydown', onKeyDown, true);
                        document.addEventListener('keyup', onKeyUp, true);
                        document.addEventListener('blur', onKeyUp, true)
                    } catch (e) {
                        console.error("xTr1m_Base_Overlay.construct:", e)
                    }
                },
                destruct() {},
                members: {
                    __windowOpened: false,
                    __window: null,
                    __openWindow() {
                        this.__windowOpened = true;
                        this.__window.open()
                    },
                    __closeWindow() {
                        this.__windowOpened = false;
                        this.__window.close()
                    }
                }
            });
            qx.Class.define("xTr1m_Base_Overlay.Window", {
                extend: qx.ui.container.Composite,
                construct() {
                    this.base(arguments);
                    this._setLayout(new qx.ui.layout.Canvas());
                    this.__background = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
                    this._add(this.__background)
                },
                destruct() {},
                members: {
                    mainOverlay: qx.core.Init.getApplication().getMainOverlay(),
                    __background: null,
                    configPanel: {
                        configTitle: null,
                        rafineryPriority: null,
                        rafineryPriorityCheckbox: null,
                        rafineryPrioritySpinner: null,
                        markerSize: null,
                        markerSizeCheckbox: null,
                        markerSizeSpinner: null,
                    },
                    __buildings: [],
                    options() {
                        this.configPanel = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                            backgroundColor: "rgba(0,0,0,0.5)",
                            padding: 5,
                            decorator: "pane-frame-clear",
                            opacity: 0.8,
                            visibility: "visible",
                            zIndex: this.mainOverlay.getZIndex() + 1
                        });
                        this.configPanel.configTitle = new qx.ui.basic.Label("xTr1m Base Overlay options").set({
                            font: "bold",
                            textColor: "white",
                            alignX: "center",
                            paddingBottom: 5
                        });
                        this.configPanel.rafineryPriority = new qx.ui.container.Composite(new qx.ui.layout.HBox());
                        const storedRafinery = localStorage.getItem('ROI.rafinery') === 'true';
                        this.configPanel.rafineryPriorityCheckbox = new qx.ui.form.CheckBox("Set higher priority for rafineries:").set({
                            value: storedRafinery,
                            textColor: "white",
                            toolTipText: `Multiplies the default <b style="color:red;">ROI value</b> by the selected value.<br><i>If checked, the default multiplier is initially set to 1.2.<br><u>(20% increase)</u></i><br>*1.2 results in about <b>6 levels</b>... carefull here... pro mode :P`
                        });
                        const storedRafineryMultiplier = parseFloat(localStorage.getItem('ROI.rafineryMultiplier')) || 1.2;
                        this.configPanel.rafineryPrioritySpinner = new qx.ui.form.Spinner(1, storedRafineryMultiplier.toFixed(1), 2).set({
                            width: 50,
                            singleStep: 0.1,
                            visibility: storedRafinery ? "visible" : "excluded"
                        });
                        this.configPanel.markerSize = new qx.ui.container.Composite(new qx.ui.layout.HBox());
                        const storedMarkerSize = localStorage.getItem('ROI.MarkerSize') === 'true';
                        this.configPanel.markerSizeCheckbox = new qx.ui.form.CheckBox("Set marker size:").set({
                            value: storedMarkerSize,
                            textColor: "white",
                            toolTipText: "Sets marker size on buildinds.<br>Default value is 0.3 (30% of the building size). "
                        });
                        const storedMarkerSizeMultiplier = parseFloat(localStorage.getItem('ROI.MarkerSizeMultiplier')) || 0.3;
                        this.configPanel.markerSizeSpinner = new qx.ui.form.Spinner(0.1, storedMarkerSizeMultiplier.toFixed(1), 1).set({
                            width: 50,
                            singleStep: 0.1,
                            visibility: storedMarkerSize ? "visible" : "excluded"
                        });
                        this.configPanel.rafineryPrioritySpinner.addListener("changeValue", (e) => {
                            this.close();
                            const multiplier = e.getData();
                            localStorage.setItem('ROI.rafineryMultiplier', multiplier);
                            this.open()
                        }, this);
                        this.configPanel.rafineryPriorityCheckbox.addListener("changeValue", (e) => {
                            this.close();
                            const isChecked = e.getData();
                            localStorage.setItem('ROI.rafinery', isChecked ? 'true' : 'false');
                            this.configPanel.rafineryPrioritySpinner.setVisibility(isChecked ? "visible" : "excluded");
                            this.open()
                        }, this);
                        this.configPanel.markerSizeSpinner.addListener("changeValue", (e) => {
                            this.close();
                            const multiplier = e.getData();
                            localStorage.setItem('ROI.MarkerSizeMultiplier', multiplier);
                            this.open()
                        }, this);
                        this.configPanel.markerSizeCheckbox.addListener("changeValue", (e) => {
                            this.close();
                            const isChecked = e.getData();
                            localStorage.setItem('ROI.MarkerSize', isChecked ? 'true' : 'false');
                            this.configPanel.markerSizeSpinner.setVisibility(isChecked ? "visible" : "excluded");
                            this.open()
                        }, this);
                        this.configPanel.rafineryPriority.add(this.configPanel.rafineryPriorityCheckbox);
                        this.configPanel.rafineryPriority.add(this.configPanel.rafineryPrioritySpinner);
                        this.configPanel.markerSize.add(this.configPanel.markerSizeCheckbox);
                        this.configPanel.markerSize.add(this.configPanel.markerSizeSpinner);
                        this.configPanel.add(this.configPanel.configTitle);
                        this.configPanel.add(this.configPanel.rafineryPriority);
                        this.configPanel.add(this.configPanel.markerSize);
                        this.mainOverlay.add(this.configPanel, {
                            left: 8,
                            top: 42
                        });
                    },
                    open() {
                        this.setWidth(this.mainOverlay.getWidth());
                        this.setMaxWidth(this.mainOverlay.getMaxWidth());
                        this.setHeight(this.mainOverlay.getHeight());
                        this.setMaxHeight(this.mainOverlay.getMaxHeight());
                        this.__background.removeAll(); // Clear previous background elements
                        const ownCity = ClientLib.Data.MainData.GetInstance()?.get_Cities()?.get_CurrentOwnCity();
                        const visCity = ClientLib.Vis.VisMain.GetInstance()?.get_City();
                        const zoomFactor = visCity.get_ZoomFactor();
                        let hudEntities = [];
                        let maxRes = 0;
                        let minRes = Number.MAX_VALUE;
                        this.collectData(ownCity); // Collect building data
                        for (const building of Object.values(this.__buildings)) { // Process each building to determine max and min ROI ratios
                            maxRes = Math.max(maxRes, building.Ratio);
                            minRes = Math.min(minRes, building.Ratio);
                            hudEntities.push({
                                "Ratio": building.Ratio,
                                "X": (building.PosX * visCity.get_GridWidth() - visCity.get_MinXPosition()) * zoomFactor,
                                "Y": (building.PosY * visCity.get_GridHeight() - visCity.get_MinYPosition()) * zoomFactor
                            })
                        }
                        const deltaRes = maxRes - minRes || 1; // Prevent division by zero
                        for (const entity of hudEntities) { // Create overlays for each building based on ROI ratio
                            const relRes = (entity.Ratio - minRes) / deltaRes;
                            const relHex = Math.round(relRes * 15);
                            const red = (15 - relHex).toString(16).padStart(1, '0');
                            const green = relHex.toString(16).padStart(1, '0');
                            const box = new qx.ui.layout.HBox().set({
                                alignX: "center",
                                alignY: "middle"
                            });
                            const markerSizeMultiplier = localStorage.getItem('ROI.MarkerSize') === 'true' ? parseFloat(localStorage.getItem('ROI.MarkerSizeMultiplier')) : 0.25;
                            const overlay = new qx.ui.container.Composite(box).set({
                                decorator: new qx.ui.decoration.Decorator().set({
                                    width: 1,
                                    style: "solid",
                                    color: "black",
                                    backgroundColor: `#${red}${green}0`,
                                    shadowColor: `#${red}${green}0`,
                                    radius: 4,
                                    shadowLength: 2,
                                    shadowBlurRadius: 1,
                                }),
                                opacity: 0.8,
                                width: visCity.get_GridWidth() * zoomFactor * markerSizeMultiplier,
                                height: visCity.get_GridHeight() * zoomFactor * markerSizeMultiplier,
                                padding: 1,
                            });
                            const label = new qx.ui.basic.Label(`<b style="font-size:8px; color:black;">${entity.Ratio.toFixed(6)}</b>`).set({
                                rich: true
                            });
                            overlay._add(label);
                            this.__background._add(overlay, {
                                left: entity.X + zoomFactor + 10,
                                top: entity.Y + zoomFactor + 10
                            })
                        }
                        this.options();
                        this.mainOverlay.add(this)
                    },
                    close() {
                        this.configPanel.setVisibility("excluded");
                        this.mainOverlay.remove(this)
                    },
                    collectData(city) {
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
                                    !(index in this.__buildings) ? this.__buildings[index] = building: this.__buildings[index].Gain += building.Gain
                                }
                            }
                            const rafineryMultiplier = localStorage.getItem('ROI.rafinery') === 'true' ? parseFloat(localStorage.getItem('ROI.rafineryMultiplier')) : 1;
                            for (const upgrade of Object.values(this.__buildings)) upgrade.Type === ClientLib.Base.ETechType.Refinery ? upgrade.Ratio = upgrade.Gain / upgrade.Cost * rafineryMultiplier : upgrade.Ratio = upgrade.Gain / upgrade.Cost // Calculate ROI
                            //console.log(this.__buildings)
                        } catch (e) {
                            console.error("xTr1m_Base_Overlay.Window.collectData:", e)
                        }
                    },
                    getResList(city, arTechtypes, eModPackageSize, eModProduction) {
                        try {
                            const maxLevel = ClientLib.Data.MainData.GetInstance().get_Server().get_PlayerUpgradeCap();
                            const buildings = city.get_Buildings().d;
                            let resAll = [];
                            let objbuildings = [];
                            for (const o of Object.values(buildings)) objbuildings.push(o);
                            for (let i = 0; i < objbuildings.length; i++) {
                                let Cost = 0;
                                let resbuilding = [];
                                const city_building = objbuildings[i];
                                const city_buildingdetailview = city.GetBuildingDetailViewInfo(city_building);
                                const TechLevelData = ClientLib.Base.Util.GetTechLevelResourceRequirements_Obj(city_building.get_CurrentLevel() + 1, city_building.get_TechGameData_Obj());
                                let bSkip = true;
                                for (const iTypeKey of arTechtypes) {
                                    if (iTypeKey == city_building.get_TechName() && city_building.get_CurrentLevel() < maxLevel) {
                                        bSkip = false;
                                        break
                                    }
                                } // Skip non resource and max level buildings
                                if (bSkip || !city_buildingdetailview) continue;
                                resbuilding.PosX = city_building.get_CoordX();
                                resbuilding.PosY = city_building.get_CoordY();
                                resbuilding.Type = city_building.get_Type();
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
                                for (const costtype of TechLevelData) typeof costtype == "function" || costtype.Type == "0" || parseInt(costtype.Count) <= 0 ? null : Cost += costtype.Count;
                                resbuilding.Cost = Cost;
                                resAll.push(resbuilding)
                            }
                            return resAll
                        } catch (e) {
                            console.error("xTr1m_Base_Overlay.Window.getResList:", e)
                        }
                    }
                }
            });
            xTr1m_Base_Overlay.getInstance()
        }
        const checkForInit = () => {
            try {
                if (typeof qx === 'undefined' || typeof qx.core.Init.getApplication !== 'function' || !qx?.core?.Init?.getApplication()?.initDone) return setTimeout(checkForInit, 1000);
                createClass();
                console.log(`%c${scriptName} loaded`, "background: #c4e2a0; color: darkred; font-weight: bold; padding: 3px; border-radius: 5px;")
            } catch (e) {
                console.error(`%c${scriptName} error:`, 'background: black; color: pink; font-weight:bold; padding: 3px; border-radius: 5px;', e)
            }
        }
        checkForInit()
    }
    try {
        const script = document.createElement("script");
        script.textContent = `(${injectFunction})();`;
        script.type = "text/javascript";
        document.head.appendChild(script)
    } catch (e) {
        console.error(`%cC&C:TA xTr1m Base Overlay init error:`, 'background: black; color: pink; font-weight:bold; padding: 3px; border-radius: 5px;', e)
    }
})();
