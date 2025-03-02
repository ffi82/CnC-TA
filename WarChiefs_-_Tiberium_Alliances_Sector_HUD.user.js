// ==UserScript==
// @name        WarChiefs - Tiberium Alliances Sector HUD
// @namespace   https://github.com/Eistee82
// @description Displays a tiny HUD with the Sector you are viewing.
// @version     2025.03.02
// @author      Eistee
// @contributor NetquiK (https://github.com/netquik), ffi82
// @icon        https://eaassets-a.akamaihd.net/cncalliancesgame/cdn/data/8c7ceb6b9b7e935f707a1bc1d5c228b8.png
// @downloadURL https://github.com/ffi82/CnC-TA/raw/refs/heads/master/WarChiefs_-_Tiberium_Alliances_Sector_HUD.user.js
// @updateURL   https://github.com/ffi82/CnC-TA/raw/refs/heads/master/WarChiefs_-_Tiberium_Alliances_Sector_HUD.meta.js
// @match       https://*.alliances.commandandconquer.com/*/*
// @grant       none
// ==/UserScript==
(() => {
    const injectFunction = () => {
        function createClasses() {
            qx.Class.define("SectorHUD", {
                type: "singleton",
                extend: qx.core.Object,
                construct() {
                    this.SectorText = new qx.ui.basic.Label("").set({
                        textColor: "white",
                        font: "font_size_11"
                    });

                    const HUD = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
                        decorator: "uied-backround-header",
                        padding: 2,
                        opacity: 0.8
                    });

                    HUD.add(this.SectorText);

                    HUD.addListener("mousedown", (e) => {
                        const button = e.getButton();
                        button === "left" && this.paste_Coords();
                        button === "right" && this.jump_Coords();
                    }, this);

                    this.__refresh = false;
                    qx.core.Init.getApplication().getBackgroundArea().add(HUD, {
                        left: 128,
                        top: 0
                    });
                    webfrontend.phe.cnc.Util.attachNetEvent(ClientLib.Vis.VisMain.GetInstance().get_Region(), "PositionChange", ClientLib.Vis.PositionChange, this, this._update);
                },
                members: {
                    __refresh: false,
                    SectorText: null,

                    get_SectorText(i) {
                        const qxApp = qx.core.Init.getApplication();
                        return [
                            qxApp.tr("tnf:south abbr"),
                            qxApp.tr("tnf:southwest abbr"),
                            qxApp.tr("tnf:west abbr"),
                            qxApp.tr("tnf:northwest abbr"),
                            qxApp.tr("tnf:north abbr"),
                            qxApp.tr("tnf:northeast abbr"),
                            qxApp.tr("tnf:east abbr"),
                            qxApp.tr("tnf:southeast abbr")
                        ][i] ?? "Unknown";
                    },

                    get_SectorNo(x, y) {
                        const server = ClientLib.Data.MainData.GetInstance().get_Server();
                        const [WorldX2, WorldY2] = [
                            Math.floor(server.get_WorldWidth() / 2),
                            Math.floor(server.get_WorldHeight() / 2)
                        ];
                        const SectorCount = server.get_SectorCount();
                        const [WorldCX, WorldCY] = [WorldX2 - x, y - WorldY2];
                        const WorldCa = ((Math.atan2(WorldCX, WorldCY) * SectorCount) / (2 * Math.PI)) + (SectorCount + 0.5);
                        return Math.floor(WorldCa) % SectorCount;
                    },

                    get_Coords() {
                        const Region = ClientLib.Vis.VisMain.GetInstance().get_Region();
                        const [GridWidth, GridHeight] = [Region.get_GridWidth(), Region.get_GridHeight()];
                        const [RegionPosX, RegionPosY] = [Region.get_PosX(), Region.get_PosY()];
                        const [ViewWidth, ViewHeight] = [Region.get_ViewWidth(), Region.get_ViewHeight()];
                        const ZoomFactor = Region.get_ZoomFactor();

                        const [ViewCoordX, ViewCoordY] = [
                            Math.floor((RegionPosX + (ViewWidth / 2 / ZoomFactor)) / GridWidth - 0.5),
                            Math.floor((RegionPosY + (ViewHeight / 2 / ZoomFactor)) / GridHeight - 0.5)
                        ];

                        return {
                            X: ViewCoordX,
                            Y: ViewCoordY
                        };
                    },

                    paste_Coords() {
                        const Coords = this.get_Coords();
                        const input = qx.core.Init.getApplication().getChat().getChatWidget().getEditable();
                        const inputDOM = input.getContentElement().getDomElement();

                        const [before, after] = [
                            inputDOM.value.substring(0, inputDOM.selectionStart),
                            inputDOM.value.substring(inputDOM.selectionEnd)
                        ];

                        input.setValue(`${before}[coords]${Coords.X}:${Coords.Y}[/coords]${after}`);
                    },

                    jump_Coords() {
                        const coords = prompt("Jump to Coords:");
                        if (!coords) return;
                        coords.replace(/(\[coords\])?([#])?(\d{1,4})\D(\d{1,4})(\D\w+)?(\[\/coords\])?/gi, (_, __, ___, x, y) => ClientLib.Vis.VisMain.GetInstance().get_Region().CenterGridPosition(+x, +y));
                    },

                    _update() {
                        if (!this.__refresh) {
                            this.__refresh = true;
                            setTimeout(() => this.__update(), 500);
                        }
                    },

                    __update() {
                        const Coords = this.get_Coords();
                        this.SectorText.setValue(
                            `${Coords.X}:${Coords.Y} [${this.get_SectorText(this.get_SectorNo(Coords.X, Coords.Y))}]`
                        );
                        this.__refresh = false;
                    }
                }
            })
        }

        function checkForInit() {
            try {
                if (typeof qx === 'undefined' || typeof qx.core.Init.getApplication !== 'function' || !qx?.core?.Init?.getApplication()?.initDone || typeof ClientLib === 'undefined' || !ClientLib?.Vis?.VisMain?.GetInstance()?.get_Region()) return setTimeout(checkForInit, 1000);
                createClasses();
                SectorHUD.getInstance();
                console.log(`%cWarChiefs - Sector HUD loaded`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
            } catch (e) {
                console.error(`%c${scriptName} error`, 'background: black; color: pink; font-weight:bold; padding: 3px; border-radius: 5px;', e);
            }
        }
        checkForInit();
    };
    try {
        const script = document.createElement("script");
        script.textContent = `(${injectFunction})();`;
        script.type = "text/javascript";
        document.head.appendChild(script);
    } catch (e) {
        console.log(`%cWarChiefs - Sector HUD init error:`, 'background: black; color: pink; font-weight:bold; padding: 3px; border-radius: 5px;', e);
    }
})();
