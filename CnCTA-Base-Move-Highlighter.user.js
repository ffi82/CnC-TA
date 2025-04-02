// ==UserScript==
// @name         CnCTA Base Move Highlighter
// @namespace    https://github.com/ffi82/CnC-TA/
// @version      2025.04.02
// @description  Wavy++ (advice: disable the other 'wavy' scripts before trying this)
// @author       Bloofi
// @contributor  ffi82, pouet?, petui, NetquiK
// @updateURL    https://github.com/ffi82/CnC-TA/raw/refs/heads/master/CnCTA-Base-Move-Highlighter.meta.js
// @downloadURL  https://github.com/ffi82/CnC-TA/raw/refs/heads/master/CnCTA-Base-Move-Highlighter.user.js
// @match        https://*.alliances.commandandconquer.com/*/index.aspx*
// @grant        none
// ==/UserScript==
/* global qx, ClientLib, webfrontend, wavy */
"use strict";
(() => {
    const CnCTA_Base_Move_Highlighter = () => {
        const Createwavy = () => {
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
                    initialize() {
                        this._App = qx.core.Init.getApplication();
                        this._MainData = ClientLib.Data.MainData.GetInstance();
                        this._VisMain = ClientLib.Vis.VisMain.GetInstance();
                        this.baseMarkerList = [];
                        const moveTool = this._VisMain.GetMouseTool(ClientLib.Vis.MouseTool.EMouseTool.MoveBase);
                        webfrontend.phe.cnc.Util.attachNetEvent(moveTool, "OnCellChange", ClientLib.Vis.MouseTool.OnCellChange, this, this.baseMoveToolCellChange);
                        webfrontend.phe.cnc.Util.attachNetEvent(moveTool, "OnActivate", ClientLib.Vis.MouseTool.OnActivate, this, this.baseMoveToolActivate);
                        webfrontend.phe.cnc.Util.attachNetEvent(moveTool, "OnDeactivate", ClientLib.Vis.MouseTool.OnDeactivate, this, this.baseMoveToolDeactivate);
                        this.wavyPanel.grid = new qx.ui.container.Composite(new qx.ui.layout.Grid(2, 2));
                        const createLabel = (text) => {
                            const label = new qx.ui.basic.Label(text).set({
                                font: "bold",
                                textColor: "white",
                                alignY: "top",
                                alignX: "right",
                            });
                            return label;
                        };
                        this.wavyPanel.labelNb = createLabel("NPC Bases : ");
                        this.wavyPanel.labelNbVal = new qx.ui.basic.Label("").set({ textColor: "white", alignY: "top", alignX: "left" });
                        this.wavyPanel.labelDetail = createLabel("Detail : ");
                        this.wavyPanel.labelDetailVal = new qx.ui.basic.Label("").set({ textColor: "white", alignY: "top", alignX: "left" });
                        this.wavyPanel.grid.add(this.wavyPanel.labelNb, { row: 0, column: 0 });
                        this.wavyPanel.grid.add(this.wavyPanel.labelNbVal, { row: 0, column: 1 });
                        this.wavyPanel.grid.add(this.wavyPanel.labelDetail, { row: 1, column: 0 });
                        this.wavyPanel.grid.add(this.wavyPanel.labelDetailVal, { row: 1, column: 1 });
                    },
                    baseMoveToolActivate() {
                        this.getRegionZoomFactorAndSetMarkerSize();
                        webfrontend.phe.cnc.Util.attachNetEvent(this._VisMain.get_Region(), "PositionChange", ClientLib.Vis.PositionChange, this, this.repositionMarkers);
                        webfrontend.phe.cnc.Util.attachNetEvent(this._VisMain.get_Region(), "ZoomFactorChange", ClientLib.Vis.ZoomFactorChange, this, this.resizeMarkers);
                    },
                    baseMoveToolDeactivate() {
                        webfrontend.phe.cnc.Util.detachNetEvent(this._VisMain.get_Region(), "PositionChange", ClientLib.Vis.PositionChange, this, this.repositionMarkers);
                        webfrontend.phe.cnc.Util.detachNetEvent(this._VisMain.get_Region(), "ZoomFactorChange", ClientLib.Vis.ZoomFactorChange, this, this.resizeMarkers);
                        this.removeMarkers();
                    },
                    baseMoveToolCellChange(startX, startY) {
                        this.regionCityMoveInfoAddonExists ? webfrontend.gui.region.RegionCityMoveInfo.getInstance()?.remove(this.wavyPanel.grid) : null;
                        this.removeMarkers();
                        this.findBases(startX, startY);
                    },
                    findBases(startX, startY) {
                        let result = [];
                        let total = 0;
                        const region = this._VisMain.get_Region();
                        const ownAlliance = this._MainData.get_Alliance();
                        const currentCity = this._MainData.get_Cities().get_CurrentCity();
                        const supportRange = currentCity.get_SupportWeapon() ? currentCity.get_SupportWeapon().r : 0;
                        const attackDistance = this._MainData.get_Server().get_MaxAttackDistance();;
                        const scanDistance = Math.ceil(attackDistance);
                        let found = false;
                        let detailString = "";
                        let waveCount;
                        for (let x = startX - Math.max(scanDistance,supportRange); x < (startX + Math.max(scanDistance,supportRange)); x++) {
                            for (let y = startY - Math.max(scanDistance,supportRange); y < (startY + Math.max(scanDistance,supportRange)); y++) {
                                const visObject = region.GetObjectFromPosition(x * region.get_GridWidth(), y * region.get_GridHeight());
                                if (visObject) {
                                    const baseX = visObject.get_RawX();
                                    const baseY = visObject.get_RawY();
                                    const distance = Math.hypot(startX - baseX, startY - baseY);
                                    const needcp = Math.floor(3 + distance);
                                    if (distance <= attackDistance) {
                                        switch (visObject.get_VisObjectType()) {
                                            case ClientLib.Vis.VisObject.EObjectType.RegionNPCBase:
                                                total++;
                                                if (visObject.get_BaseLevel() > 0) {
                                                    const baseLevel = parseInt(visObject.get_BaseLevel(), 10);
                                                    result[baseLevel] = (result[baseLevel] || 0) + 1;
                                                    found = true;
                                                    this.addMarker(baseX, baseY, "yellowgreen", Math.floor(10 + distance * 3), "black", "label");
                                                }
                                                break;
                                            case ClientLib.Vis.VisObject.EObjectType.RegionCityType:
                                                if (visObject.get_PlayerId() === currentCity?.get_PlayerId()) {
                                                    visObject.IsOwnBase() ? null : this.addMarker(baseX, baseY, "white", needcp, "black", "icon"); // No markers on own bases and white markers on same player bases on "Plan move base"
                                                } else {
                                                    const isOwnAlliance = visObject.get_AllianceId() === ownAlliance?.get_Id();
                                                    const color = isOwnAlliance ? "royalblue" : "salmon";// "cornflowerblue" : "crimson"; // "blue" : "red";
                                                    distance >= supportRange ? this.addMarker(baseX, baseY, color, needcp, "black", "label") : this.addMarker(baseX, baseY, color, needcp, "white", "both");
                                                }
                                                break;
                                        }
                                    } else {
                                        (distance < supportRange && visObject.get_VisObjectType() === ClientLib.Vis.VisObject.EObjectType.RegionCityType && visObject.get_PlayerId() !== currentCity?.get_PlayerId()) ? this.addMarker(baseX, baseY, "transparent", needcp, "black", "icon") : null; // On player bases out of attack range, but in range of support weapons: transparent markers with support icon only (Ion Cannon Support: vs. vehicles for GDI; Blade of Kane: vs. infantry for NOD)
                                    }
                                }
                            }
                        }
                        found ? detailString = Object.entries(result).map(([level, count]) => `[${count} x ${level}]`).join("   ") : detailString = "Nothing !";
                        waveCount = Math.max(1, Math.min(5, Math.floor(total / 10)));
                        this._MainData.get_Server().get_ForgottenAttacksEnabled() ? this.wavyPanel.labelNbVal.setValue(`${total} (${waveCount} wave${waveCount === 1 ? '' : 's'})`) : this.wavyPanel.labelNbVal.setValue(total);
                        this.wavyPanel.labelDetailVal.setValue(detailString);
                        this.regionCityMoveInfoAddonExists = true;
                        webfrontend.gui.region.RegionCityMoveInfo.getInstance()?.add(this.wavyPanel.grid);
                    },
                    addMarker(bx, by, color, cpNeeded, textColor, show) {
                        const marker = new qx.ui.container.Composite(new qx.ui.layout.HBox(1)).set({
                            decorator: new qx.ui.decoration.Decorator(1, "solid", "black").set({ backgroundColor: color }),
                            width: this.baseMarkerWidth,
                            height: this.baseMarkerHeight,
                            opacity: 0.7
                        });
                        const currentCitySW = this._MainData.get_Cities().get_CurrentCity().get_SupportWeapon();
                        const iconSupport = currentCitySW ? `webfrontend/${currentCitySW.i.green}.png` : null;
                        marker.add(new qx.ui.basic.Atom(String(cpNeeded), iconSupport).set({
                            textColor: textColor,
                            font: "bold",
                            iconPosition: "top",
                            width: this.baseMarkerWidth,
                            rich: true,
                            center: true,
                            show : show
                        }));

                        this._App.getDesktop().addAfter(marker, this._App.getBackgroundArea(), {
                            left: this._VisMain.ScreenPosFromWorldPosX(bx * this.gridWidth),
                            top: this._VisMain.ScreenPosFromWorldPosY(by * this.gridHeight)
                        });
                        this.baseMarkerList.push({ element: marker, x: bx, y: by });
                    },
                    removeMarkers() {
                        this.baseMarkerList.forEach(markerData => this._App.getDesktop().remove(markerData.element));
                        this.baseMarkerList = [];
                    },
                    getRegionZoomFactorAndSetMarkerSize() {
                        const region = this._VisMain.get_Region();
                        this.gridWidth = region.get_GridWidth();
                        this.gridHeight = region.get_GridHeight();
                        this.regionZoomFactor = region.get_ZoomFactor();
                        this.baseMarkerWidth = this.gridWidth * this.regionZoomFactor;
                        this.baseMarkerHeight = this.gridHeight * this.regionZoomFactor;
                    },
                    repositionMarkers() {
                        this.baseMarkerList.forEach(markerData => {
                            markerData.element.setDomLeft(this._VisMain.ScreenPosFromWorldPosX(markerData.x * this.gridWidth));
                            markerData.element.setDomTop(this._VisMain.ScreenPosFromWorldPosY(markerData.y * this.gridHeight));
                        });
                    },
                    resizeMarkers() {
                        this.getRegionZoomFactorAndSetMarkerSize();
                        this.baseMarkerList.forEach(markerData => {
                            markerData.element.setWidth(this.baseMarkerWidth);
                            markerData.element.setHeight(this.baseMarkerHeight);
                        });
                    }
                }
            });
            wavy.getInstance().initialize();
        }
        const checkForInit = () => {
            const scriptName = 'CnCTA Base Move Highlighter';
            try {
                if (typeof qx === 'undefined' || !qx?.core?.Init?.getApplication()?.initDone) return setTimeout(checkForInit, 1000);
                Createwavy();
                console.log(`%c${scriptName} loaded`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
            } catch (e) {
                console.error(`%c${scriptName} error`, 'background: black; color: pink; font-weight:bold; padding: 3px; border-radius: 5px;', e);
            }
        };
        checkForInit();
    }
    CnCTA_Base_Move_Highlighter();
})();
