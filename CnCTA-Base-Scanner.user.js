// ==UserScript==
// @name        CnCTA Base Scanner
// @namespace   https://github.com/bloofi
// @version	    2025.03.23
// @description bloofi's layout scanner
// @author      bloofi
// @contributor ffi82
// @downloadURL https://github.com/ffi82/CnC-TA/raw/refs/heads/master/CnCTA-Base-Scanner.user.js
// @updateURL   https://github.com/ffi82/CnC-TA/raw/refs/heads/master/CnCTA-Base-Scanner.meta.js
// @match       https://*.alliances.commandandconquer.com/*/index.aspx*
// @grant       none
// ==/UserScript==
/* global qx, ClientLib, webfrontend, _ */
"use strict";
(function () {
    const BaseScannerScript = () => {
        const scriptName = 'CnCTA Base Scanner';
        const storageKey = 'cncta-base-scanner';
        const scanMaxRetries = 7;
        const biCncLVUrl = 'https://spy-cnc.fr/CNC/bi/cnclv/layout/';
        const scoreTibMap = {
            t6: 40,
            t5: 20,
            t4: 8,
            t3: 2,
        };
        const scorePowerMap = {
            t8: 9,
            t7: 3,
            t6: 1,
        };
        const defaultStorage = {
            window: {},
            cache: {},
        };
        const init = () => {
            const icons = {
                cnclv: 'https://spy-cnc.fr/CNC/bi/favicon-cnclv.ico',
                scan: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAd5JREFUSIntlLFr20AYxd87yVWXdMmQoUNK6L9QCIU2mbx091oKDV1sH4IQD6WFhi4djCWLQiEYMrQUNAXSrRDyLwQPmVriTXsH2Vj+vg6RwcSJLDdDl7zxvrv3u+/u3QF3+t/ioglRFK2qalVVN0iOAfRV9cRaO7oVIAxDD8A+SQvAm62JSEJy11r7bRHAFJgfk9wTke8kn6jq/TRNH4jIC2PMb5Jfu93uu3/qIAzDTyT3ALxqNpuHV+txHDtJkvQAvCRZbTQaP0t3EEXRKkkrIofXmQNArVabqOobAL9Udb+ogzmAqlYBeI7jfC5aaK0dqeoBgM0gCNaWAWwAgIj0iwC5zgDAGPO4NCCPIobD4b0SgGm6xqUBAPoA4Hnes0XuJJ8DyNI0PS8NUNUTEUmMMW/jOHZuWthutx8C2AFw1Gq1/pQGWGtHJHcBPE2SpJe/iTnzSqXyA8CKiHy5yRwofsnvSX7AZRQPcHmhXn4sOwBWAEBEBqq67fv+xVKAHFLNIZszwxmAo3znPWPMehFk4WcHAEEQrOVRHKdpej49806n84jkaRGkFKBIVyGu627V6/XBtH7tZ7eMfN+/UNVtERkYY9azLHs9W781YApxXXdLRD5OJpPCVN1pTn8BTmff2pUBWMIAAAAASUVORK5CYII=',
                tib: 'webfrontend/ui/common/icn_res_tiberium.png',
                power: 'webfrontend/ui/common/icn_res_power.png',
                target: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAKRSURBVDiNpVNdSBRRFD73zuxOtuuo41/hRlFq/rcm2kNbRmSmomZUZkZEkGQtlUGERKQ9SPUQ9RAhWdmSmltaoKVgYZhRKKZCElkpoYnrKu7uuD9jztwebAbXfCj63r5zvnPPOR/3oE9rg8opAvvgNwgh0xSFTsEiiIDCkUQuLYwRhExocE1wDwHStLjgb4AAZeOlEmz+odW6h08ymdgElisyRq68dXfb8qQU/6W09EJC+XMq3YP6XCZBHyu53W5E0W+xL8v4pmcZtDszDXyj+eX4+dPvvWqMfpoUQODAGMOqxpZ89froCEetqXW0MK9hbmzU43r3ZoJvrO9alpjEatN2baYDg13O9rax+R2QE2OEqwAAOOPZaCYqJtJ2v/K55eK5biIIktxldnTEM7I365mnv3eAPVCYxoRHaAAAEMFVigeazJxEcdJqtVaU9Snjaf1orFYjmVvLStuQSk37Hz4W84cH9vqaLnFywiVzn3g9G/a4+YRotUwMb0m6BwDg7uuxT165/EgY/uaQdcoEkt0mSHb7T5kTWoURhTGiKC+j56amPMQ1o+iUZMBx41bKL4Ad2hR3GwDA09ttG05Nvk54hyL2idezK67dOGKvNbW6OjumAAAwQsQAADDT8qKfDgkNCSwpjVO6jf3wiDwvyjyorGI7EedEm+nOwHwxMWCJkAIAgOmbVz8KX78MccXGnJAL5XqgacU8igtS6Woasnw2Jm9wNJhfCYOfnQAAEiEHvb4yHRrKhFWb9zBRMZES7+BHCvKqtDvSddzJM7sBUxTf9LR9vKS4U34YAcr2NshiEb5npNZxR4vWaTJy4zDGQGZnRWfH625bdeUHee+F+O9jokVMmikC++Xgv50zmH4B/JMOCtMZe/oAAAAASUVORK5CYII=',
            };
            const Main = qx.Class.define('Main', {
                type: 'singleton',
                extend: qx.core.Object,
                members: {
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    // Globals
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    scanStatus: 'READY',
                    scanResults: [],
                    storage: {},
                    //////////////////////// DATA
                    bases: {},
                    scanIds: [],
                    currentScanID: null,
                    currentWid: 0,
                    //////////////////////// UI
                    mainWindow: null,
                    mainLabel: null,
                    filterFromSelect: null,
                    filterCampCheckbox: null,
                    filterOutpostCheckbox: null,
                    filterBaseCheckbox: null,
                    filterPlayerCheckbox: null,
                    filterScoreTibSlider: null,
                    filterScoreTibLabel: null,
                    filterScorePowerSlider: null,
                    filterScorePowerLabel: null,
                    buttonScan: null,
                    buttonClear: null,
                    scanResultComponent: null,
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    // Init
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    initialize: function () {
                        this.debouncedFilterResults = this._debounce(this.filterResults, 100);
                        const baseScannerButton = new qx.ui.menu.Button("Base Scanner");
                        baseScannerButton.addListener('execute', this.onOpenMainWindow, this);
                        qx.core.Init.getApplication().getMenuBar().getScriptsButton().getMenu().add(baseScannerButton);
                    },
                    _debounce: function (func, wait) {
                        let timeout;
                        return function (...args) {
                            const context = this;
                            const later = function () {
                                timeout = null;
                                func.apply(context, args);
                            };
                            clearTimeout(timeout);
                            timeout = setTimeout(later, wait);
                        };
                    },
                    onOpenMainWindow: function () {
                        if (!this.mainWindow) {
                            this.loadStorage();
                            this.createMainWindow();
                        }
                        this.mainWindow.open();
                        this.scanStatus = 'READY';
                        this.refreshFilters();
                        this.refreshLabel();
                    },
                    createMainWindow: function () {
                        this.mainWindow = new qx.ui.window.Window('Base Scanner').set({
                            contentPadding: 0,
                            width: 1000,
                            height: 700,
                            showMaximize: false,
                            showMinimize: false,
                            allowMaximize: false,
                            allowMinimize: false,
                            allowClose: true,
                            resizable: true,
                        });
                        this.mainWindow.setLayout(new qx.ui.layout.Canvas());
                        if (this.storage && this.storage.mainWindow && this.storage.mainWindow.x && this.storage.mainWindow.y) {
                            this.mainWindow.moveTo(this.storage.mainWindow.x, this.storage.mainWindow.y);
                        } else {
                            this.mainWindow.center();
                        }
                        const container = new qx.ui.container.Composite(new qx.ui.layout.VBox());
                        const toolbar = new qx.ui.toolbar.ToolBar().set({
                            height: 90,
                            maxHeight: 90,
                        });
                        container.add(toolbar);
                        const vboxButton = new qx.ui.container.Composite(new qx.ui.layout.VBox(5)).set({
                            padding: 5,
                        });
                        this.buttonScan = new qx.ui.form.Button('Scan', icons.scan);
                        this.buttonScan.addListener('execute', this.onButtonScan, this);
                        vboxButton.add(this.buttonScan);
                        this.buttonClear = new qx.ui.form.Button('Clear cache');
                        this.buttonClear.addListener('execute', this.onButtonClear, this);
                        vboxButton.add(this.buttonClear);
                        toolbar.add(vboxButton);
                        toolbar.add(new qx.ui.toolbar.Separator(10));
                        const scanFilterWhat = new qx.ui.groupbox.GroupBox('Scan what');
                        scanFilterWhat.setLayout(new qx.ui.layout.Grid(10, 5));
                        this.filterCampCheckbox = new qx.ui.form.CheckBox('Camps');
                        this.filterCampCheckbox.setValue(true);
                        scanFilterWhat.add(this.filterCampCheckbox, {
                            row: 0,
                            column: 0
                        });
                        this.filterOutpostCheckbox = new qx.ui.form.CheckBox('Outposts');
                        this.filterOutpostCheckbox.setValue(true);
                        scanFilterWhat.add(this.filterOutpostCheckbox, {
                            row: 0,
                            column: 1
                        });
                        this.filterBaseCheckbox = new qx.ui.form.CheckBox('Bases');
                        this.filterBaseCheckbox.setValue(true);
                        scanFilterWhat.add(this.filterBaseCheckbox, {
                            row: 1,
                            column: 0
                        });
                        this.filterPlayerCheckbox = new qx.ui.form.CheckBox('Players');
                        this.filterPlayerCheckbox.set({
                            enabled: false
                        });
                        scanFilterWhat.add(this.filterPlayerCheckbox, {
                            row: 1,
                            column: 1
                        });
                        toolbar.add(scanFilterWhat);
                        toolbar.add(new qx.ui.toolbar.Separator(10));
                        const scanFilterFrom = new qx.ui.groupbox.GroupBox('Scan from');
                        scanFilterFrom.setLayout(new qx.ui.layout.VBox());
                        this.filterFromSelect = new qx.ui.form.SelectBox();
                        scanFilterFrom.add(this.filterFromSelect);
                        toolbar.add(scanFilterFrom);
                        toolbar.add(new qx.ui.toolbar.Separator(10));
                        const scanFilterScore = new qx.ui.groupbox.GroupBox('Scan Filter');
                        scanFilterScore.setLayout(new qx.ui.layout.VBox(2));
                        const rowTib = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
                            width: 200,
                        });
                        rowTib.add(this.createImage(icons.tib, 20, 20));
                        this.filterScoreTibSlider = new qx.ui.form.Slider().set({
                            minimum: 0,
                            maximum: 99,
                            value: 20,
                            singleStep: 3,
                        });
                        this.filterScoreTibSlider.addListener('changeValue', this.onSliderTibScore, this);
                        rowTib.add(this.filterScoreTibSlider, {
                            flex: 1
                        });
                        this.filterScoreTibLabel = new qx.ui.basic.Label('20').set({
                            font: new qx.bom.Font(14),
                            width: 20,
                            toolTipText: ['Score is calculated as follow :', ...Object.entries(scoreTibMap).map(s => `<b>${s[1]} points</b> for each ${s[0]}`), ].join('<br>'),
                        });
                        rowTib.add(this.filterScoreTibLabel);
                        scanFilterScore.add(rowTib);
                        const rowPower = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
                            width: 200,
                        });
                        rowPower.add(this.createImage(icons.power, 20, 20));
                        this.filterScorePowerSlider = new qx.ui.form.Slider().set({
                            minimum: 0,
                            maximum: 99,
                            value: 0,
                        });
                        this.filterScorePowerSlider.addListener('changeValue', this.onSliderPowerScore, this);
                        rowPower.add(this.filterScorePowerSlider, {
                            flex: 1
                        });
                        this.filterScorePowerLabel = new qx.ui.basic.Label('0').set({
                            font: new qx.bom.Font(14),
                            width: 20,
                            toolTipText: ['Score is calculated as follow :', ...Object.entries(scorePowerMap).map(s => `<b>${s[1]} points</b> for each ${s[0]}`), ].join('<br>'),
                        });
                        rowPower.add(this.filterScorePowerLabel);
                        scanFilterScore.add(rowPower);
                        toolbar.add(scanFilterScore);
                        toolbar.add(new qx.ui.toolbar.Separator(10));
                        this.mainLabel = new qx.ui.basic.Label().set({
                            value: '',
                            rich: true,
                            textColor: 'black',
                        });
                        toolbar.add(this.mainLabel);
                        toolbar.addSpacer();
                        this.scanResultComponent = new qx.ui.container.Composite(new qx.ui.layout.Flow(5, 5));
                        this.scanResultComponent.set({
                            paddingTop: 5,
                            paddingRight: 5,
                            paddingBottom: 5,
                            paddingLeft: 5,
                        });
                        const scanResultScroll = new qx.ui.container.Scroll();
                        scanResultScroll.add(this.scanResultComponent);
                        container.add(scanResultScroll, {
                            flex: 1
                        });
                        this.mainWindow.add(container, {
                            edge: 0
                        });
                        this.mainWindow.addListener('move', this.onWindowMove, this);
                    },
                    refreshFilters: function () {
                        if (!this.mainWindow) {
                            return;
                        }
                        this.filterFromSelect.removeAll();
                        this.filterFromSelect.add(new qx.ui.form.ListItem('All bases', null, 'all'));
                        Object.values(ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d).forEach((c) => {
                            this.filterFromSelect.add(new qx.ui.form.ListItem(c.get_Name(), null, c));
                        });
                    },
                    refreshLabel: function () {
                        const detail = [`Status : <b>${this.scanStatus}</b>`];
                        switch (this.scanStatus) {
                        case 'READY':
                            detail.push('Ready to scan', `<b>${Object.keys(this.storage.cache).length}</b> layouts in cache.`);
                            break;
                        case 'SCANNING':
                            detail.push('Retrieving all reachable items...');
                            break;
                        case 'FETCHING':
                            if (this.currentScanID) {
                                const b = this.bases[this.currentScanID];
                                const nbScanned = Object.values(this.bases).filter(r => ['FETCHED'].includes(r.status)).length;
                                const nbTotal = Object.values(this.bases).filter(r => r.status !== 'CANCELED').length;
                                const nbFiltered = Object.values(this.bases).filter(r => r.isFiltered).length;
                                const nbCanceled = Object.values(this.bases).filter(r => r.isCanceled).length;
                                detail.push(`Items : <b>${nbScanned}</b> / <b>${nbTotal}</b> (${nbTotal - nbFiltered - nbCanceled} displayed)`);
                                detail.push(`Currently scanning : <b>${b.type} ${b.x}:${b.y}</b> from <b>${b.from.get_Name()}</b> (${b.retry})`);
                            }
                            break;
                        case 'END': {
                            const nbTotal = Object.values(this.bases).filter(r => r.status !== 'CANCELED').length;
                            const nbFiltered = Object.values(this.bases).filter(r => r.isFiltered).length;
                            detail.push(`<b>${nbTotal}</b> item(s) scanned. <b>${nbTotal - nbFiltered}</b> item(s) displayed.`);
                            break;
                        }
                        default:
                            detail.push('Unknown scan status');
                            break;
                        }
                        this.mainLabel.set({
                            value: detail.join('<br>'),
                            rich: true,
                            textColor: 'black',
                        })
                    },
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    // Buttons events
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    onWindowMove: function (e) {
                        this.saveToStorage({
                            window: {
                                x: e.getData().left,
                                y: e.getData().top,
                            }
                        })
                    },
                    onButtonScan: function () {
                        if (this.scanStatus === 'READY' || this.scanStatus === 'END') {
                            qx.core.Init.getApplication().showMainOverlay(false);
                            this.startScan();
                        } else {
                            this.stopScan();
                        }
                    },
                    onButtonClear: function () {
                        this.storage.cache = {};
                        this.flushStorage();
                        this.mainLabel.set({
                            value: ['Cache has been cleared.'].join('<br>'),
                            rich: true,
                            textColor: 'black',
                        });
                        this.buttonClear.set({
                            enabled: false
                        });
                    },
                    onSliderTibScore: function () {
                        this.filterScoreTibLabel.setValue(`${this.filterScoreTibSlider.getValue()}`);
                        this.debouncedFilterResults();
                    },
                    onSliderPowerScore: function () {
                        this.filterScorePowerLabel.setValue(`${this.filterScorePowerSlider.getValue()}`);
                        this.debouncedFilterResults();
                    },
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    // Scan
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    clearScan: function () {
                        this.scanResultComponent.removeAll();
                        this.bases = {};
                        this.scanIds = [];
                        this.currentScanID = null;
                    },
                    stopScan: function () {
                        this.scanStatus = 'END';
                        this.filterCampCheckbox.set({
                            enabled: true
                        });
                        this.filterOutpostCheckbox.set({
                            enabled: true
                        });
                        this.filterBaseCheckbox.set({
                            enabled: true
                        });
                        this.filterPlayerCheckbox.set({
                            enabled: false
                        });
                        this.filterFromSelect.set({
                            enabled: true
                        });
                        this.filterScoreTibSlider.set({
                            enabled: true
                        });
                        this.filterScorePowerSlider.set({
                            enabled: true
                        });
                        this.buttonScan.set({
                            label: 'Scan',
                            enabled: true,
                        });
                        this.buttonClear.set({
                            enabled: true
                        });
                        this.refreshLabel();
                    },
                    startScan: function () {
                        this.clearScan();
                        this.filterCampCheckbox.set({
                            enabled: false
                        });
                        this.filterOutpostCheckbox.set({
                            enabled: false
                        });
                        this.filterBaseCheckbox.set({
                            enabled: false
                        });
                        this.filterPlayerCheckbox.set({
                            enabled: false
                        });
                        this.filterFromSelect.set({
                            enabled: false
                        });
                        this.filterScoreTibSlider.set({
                            enabled: false
                        });
                        this.filterScorePowerSlider.set({
                            enabled: false
                        });
                        this.buttonScan.set({
                            label: 'Stop',
                            enabled: true,
                        });
                        this.buttonClear.set({
                            enabled: false
                        });
                        this.scanStatus = 'SCANNING';
                        this.refreshLabel();
                        const filters = {
                            scanCamps: this.filterCampCheckbox.getValue(),
                            scanOutposts: this.filterOutpostCheckbox.getValue(),
                            scanBases: this.filterBaseCheckbox.getValue(),
                            scanPlayers: this.filterPlayerCheckbox.getValue(),
                        };
                        const from = this.filterFromSelect.getModelSelection().getItem(0);
                        const bases = from === 'all' ? this.getOwnCitiesAsArray() : [from];
                        bases.forEach(b => {
                            ClientLib.Vis.VisMain.GetInstance().CenterGridPosition(b.get_PosX(), b.get_PosY());
                            ClientLib.Vis.VisMain.GetInstance().Update();
                            ClientLib.Vis.VisMain.GetInstance().ViewUpdate();
                            const region = ClientLib.Vis.VisMain.GetInstance().get_Region();
                            for (let x = b.get_PosX() - 11; x < b.get_PosX() + 11; x++) {
                                for (let y = b.get_PosY() - 11; y < b.get_PosY() + 11; y++) {
                                    const obj = region.GetObjectFromPosition(x * region.get_GridWidth(), y * region.get_GridHeight());
                                    if (obj && obj.get_Id) {
                                        const distance = ClientLib.Base.Util.CalculateDistance(b.get_PosX(), b.get_PosY(), obj.get_RawX(), obj.get_RawY());
                                        if (parseInt(distance) < 11) {
                                            switch (obj.get_VisObjectType()) {
                                            case ClientLib.Vis.VisObject.EObjectType.RegionNPCBase:
                                                if (filters.scanBases && !this.scanIds.includes(obj.get_Id())) {
                                                    this.addPanel({
                                                        scanID: `${obj.get_Id()}`,
                                                        from: b,
                                                        type: 'BASE',
                                                        faction: 'F',
                                                        city: obj,
                                                        x: obj.get_RawX(),
                                                        y: obj.get_RawY(),
                                                        retry: 0,
                                                        status: 'WAITING',
                                                        isCached: false,
                                                    });
                                                    this.scanIds.push(obj.get_Id());
                                                }
                                                break;
                                            case ClientLib.Vis.VisObject.EObjectType.RegionNPCCamp:
                                                if ((filters.scanOutposts || filters.scanCamps) && !this.scanIds.includes(obj.get_Id())) {
                                                    this.addPanel({
                                                        scanID: `${obj.get_Id()}`,
                                                        from: b,
                                                        type: 'CAMP',
                                                        faction: 'F',
                                                        city: obj,
                                                        x: obj.get_RawX(),
                                                        y: obj.get_RawY(),
                                                        retry: 0,
                                                        status: 'WAITING',
                                                        isCached: false,
                                                    });
                                                    this.scanIds.push(obj.get_Id());
                                                }
                                                break;
                                            case ClientLib.Vis.VisObject.EObjectType.RegionCityType:
                                                if (filters.scanPlayers && !this.scanIds.includes(obj.get_Id())) {
                                                    this.addPanel({
                                                        scanID: `${obj.get_Id()}`,
                                                        from: b,
                                                        type: 'PLAYER',
                                                        faction: obj.get_Faction ? obj.get_Faction() : '?',
                                                        city: obj,
                                                        x: obj.get_RawX(),
                                                        y: obj.get_RawY(),
                                                        retry: 0,
                                                        status: 'WAITING',
                                                        isCached: false,
                                                    });
                                                    this.scanIds.push(obj.get_Id());
                                                }
                                                break;
                                            default:
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        });
                        this.scanStatus = 'FETCHING';
                        this.checkAndFetch();
                    },
                    addPanel: function (sr) {
                        if (!this.bases[sr.scanID]) {
                            const panel = new qx.ui.container.Composite(new qx.ui.layout.Grow());
                            panel.add(this.getGridLayout(sr));
                            this.scanResultComponent.add(panel);
                            this.bases[sr.scanID] = Object.assign(Object.assign({}, sr), {
                                panel
                            });
                        }
                    },
                    getGridLayout: function (sr) {
                        const res = new qx.ui.container.Composite(new qx.ui.layout.VBox());
                        res.set({
                            backgroundColor: sr.isCached ? 'transparent' : 'silver',
                            decorator: new qx.ui.decoration.Decorator().set({
                                color: sr.isCached ? 'black' : 'white',
                                style: 'solid',
                                width: 1,
                            }),
                        });
                        const header = new qx.ui.container.Composite(new qx.ui.layout.HBox(5)).set({
                            backgroundColor: 'silver',
                            height: 20,
                        });
                        header.add(new qx.ui.basic.Label().set({
                            value: webfrontend.gui.util.BBCode.createCoordsLinkText(`${sr.x}:${sr.y}`, sr.x, sr.y),
                            rich: true,
                            textColor: 'blue',
                        }));
                        res.add(header);
                        const grid = new qx.ui.container.Composite(new qx.ui.layout.Grid(1, 1));
                        grid.set({
                            width: 90,
                            height: 80,
                            backgroundColor: '#555555',
                        });
                        switch (sr.status) {
                        case 'FETCHED': {
                            const scores = new qx.ui.container.Composite(new qx.ui.layout.HBox());
                            scores.add(this.createImage(icons.tib));
                            scores.add(new qx.ui.basic.Label().set({
                                value: `${sr.tibScore}`,
                                font: new qx.bom.Font(10),
                                textColor: 'black',
                            }));
                            scores.add(this.createImage(icons.power));
                            scores.add(new qx.ui.basic.Label().set({
                                value: `${sr.powerScore}`,
                                font: new qx.bom.Font(10),
                                textColor: 'black',
                            }));
                            header.add(scores);
                            for (let y = 0; y < 8; y++) {
                                for (let x = 0; x < 9; x++) {
                                    const cell = new qx.ui.core.Widget();
                                    cell.set({
                                        width: 10,
                                        height: 10,
                                    });
                                    switch (sr.layout[y][x]) {
                                    case 't':
                                        cell.set({
                                            backgroundColor: 'green'
                                        });
                                        break;
                                    case 'c':
                                        cell.set({
                                            backgroundColor: 'blue'
                                        });
                                        break;
                                    default:
                                        cell.set({
                                            backgroundColor: '#ffdea3'
                                        });
                                        break;
                                    }
                                    grid.add(cell, {
                                        row: y,
                                        column: x
                                    });
                                }
                            }
                            break;
                        }
                        case 'WAITING':
                        case 'FETCHING':
                        case 'CANCELED':
                        default: {
                            const borderColor = sr.status === 'CANCELED' ? 'red' : 'gray';
                            for (let y = 0; y < 8; y++) {
                                grid.add(new qx.ui.core.Widget().set({
                                    width: 10,
                                    height: 10,
                                    backgroundColor: borderColor
                                }), {
                                    row: y,
                                    column: 0
                                });
                                grid.add(new qx.ui.core.Widget().set({
                                    width: 10,
                                    height: 10,
                                    backgroundColor: borderColor
                                }), {
                                    row: y,
                                    column: 8
                                });
                            }
                            for (let x = 1; x < 8; x++) {
                                grid.add(new qx.ui.core.Widget().set({
                                    width: 10,
                                    height: 10,
                                    backgroundColor: borderColor
                                }), {
                                    row: 0,
                                    column: x
                                });
                                grid.add(new qx.ui.core.Widget().set({
                                    width: 10,
                                    height: 10,
                                    backgroundColor: borderColor
                                }), {
                                    row: 7,
                                    column: x
                                });
                            }
                            grid.add(new qx.ui.basic.Label().set({
                                value: [`${sr.status}`, `${sr.type}`].join('<br>'),
                                rich: true,
                                textColor: sr.status === 'CANCELED' ? 'red' : 'black',
                                textAlign: 'center',
                            }), {
                                row: 1,
                                column: 1,
                                rowSpan: 6,
                                colSpan: 7
                            });
                            break;
                        }
                        }
                        res.add(grid, {
                            flex: 1
                        });
                        const footer = new qx.ui.container.Composite(new qx.ui.layout.HBox(5)).set({
                            paddingLeft: 5,
                            height: 20,
                        });
                        const bTarget = new qx.ui.form.Button('', icons.target).set({
                            decorator: null,
                            backgroundColor: 'transparent',
                            margin: 0,
                            padding: 0,
                            maxWidth: 16,
                            maxHeight: 16,
                        });
                        bTarget.addListener('execute', this.centerTo(sr.x, sr.y), this);
                        footer.add(bTarget);
                        if (sr.status === 'FETCHED') {
                            const bCnclv = new qx.ui.form.Button('', icons.cnclv).set({
                                decorator: null,
                                backgroundColor: 'transparent',
                                margin: 0,
                                padding: 0,
                                maxWidth: 16,
                                maxHeight: 16,
                            });
                            bCnclv.addListener('execute', this.openCncLV(sr), this);
                            footer.add(bCnclv);
                        }
                        res.add(footer);
                        return res;
                    },
                    filterResults: function () {
                        const minTib = this.filterScoreTibSlider.getValue();
                        const minPower = this.filterScorePowerSlider.getValue();
                        Object.values(this.bases).forEach(sr => {
                            if (sr.status === 'FETCHED') {
                                sr.isFiltered = sr.tibScore < minTib || sr.powerScore < minPower;
                                sr.panel.removeAll();
                                if (!sr.isFiltered && !sr.isCanceled) {
                                    sr.panel.add(this.getGridLayout(sr), {
                                        edge: 'center'
                                    });
                                }
                            }
                        });
                        this.refreshLabel();
                    },
                    debouncedFilterResults: null,
                    checkAndFetch: function () {
                        if (this.scanStatus === 'FETCHING') {
                            if (this.currentScanID) {
                                this.refreshLabel();
                                const currentScan = this.bases[this.currentScanID];
                                switch (currentScan.status) {
                                case 'WAITING':
                                    this.bases[this.currentScanID] = currentScan;
                                    if (this.storage.cache[`${this.currentWid}-${currentScan.x}:${currentScan.y}`]) {
                                        currentScan.layout = this.cncoptToLayout(this.storage.cache[`${this.currentWid}-${currentScan.x}:${currentScan.y}`]);
                                        currentScan.isCached = true;
                                        currentScan.status = 'FETCHED';
                                    } else {
                                        ClientLib.Data.MainData.GetInstance().get_Cities().set_CurrentCityId(currentScan.city.get_Id());
                                        ClientLib.Net.CommunicationManager.GetInstance().UserAction();
                                        currentScan.status = 'FETCHING';
                                    }
                                    this.checkAndFetch();
                                    break;
                                case 'FETCHING': {
                                    const data = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(currentScan.city.get_Id());
                                    if (data && data.get_OwnerId()) {
                                        currentScan.layout = this.getCityLayout(data);
                                        currentScan.status = 'FETCHED';
                                        this.checkAndFetch();
                                    } else {
                                        if (currentScan.retry > scanMaxRetries) {
                                            currentScan.status = 'CANCELED';
                                            currentScan.panel.removeAll();
                                            // currentScan.panel.add(this.getGridLayout(currentScan), { edge: 'center' });
                                            this.bases[this.currentScanID] = currentScan;
                                            this.findNext();
                                        } else {
                                            currentScan.retry++;
                                            this.bases[this.currentScanID] = currentScan;
                                            setTimeout(() => {
                                                this.checkAndFetch();
                                                ClientLib.Net.CommunicationManager.GetInstance().$Poll();
                                            }, 20);
                                        }
                                    }
                                    break;
                                }
                                case 'FETCHED': {
                                    const scores = this.computeScores(currentScan.layout);
                                    currentScan.tibScore = scores[0];
                                    currentScan.powerScore = scores[1];
                                    currentScan.isFiltered = currentScan.tibScore < this.filterScoreTibSlider.getValue() || currentScan.powerScore < this.filterScorePowerSlider.getValue();
                                    currentScan.panel.removeAll();
                                    if (!currentScan.isFiltered && !currentScan.isCanceled) {
                                        currentScan.panel.add(this.getGridLayout(currentScan), {
                                            edge: 'center'
                                        });
                                    }
                                    this.bases[this.currentScanID] = currentScan;
                                    this.storage.cache[`${this.currentWid}-${currentScan.x}:${currentScan.y}`] = this.layoutToCncopt(currentScan.layout);
                                    this.flushStorage();
                                    this.findNext();
                                    break;
                                }
                                case 'CANCELED':
                                    this.findNext();
                                    break;
                                default:
                                    break;
                                }
                            } else {
                                this.findNext();
                            }
                        }
                    },
                    findNext: function () {
                        const nextBase = Object.values(this.bases).find(b => b.status === 'WAITING');
                        if (nextBase) {
                            this.currentScanID = nextBase.scanID;
                            this.checkAndFetch();
                        } else {
                            this.stopScan();
                        }
                    },
                    getOwnCitiesAsArray: function () {
                        return Object.values(ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d);
                    },
                    createImage: function (icon, w = 16, h = 16) {
                        const image = new qx.ui.basic.Image(icon);
                        image.setScale(true);
                        image.setWidth(w);
                        image.setHeight(h);
                        return image;
                    },
                    getCityLayout: function (city) {
                        const res = Array.from({
                            length: 20
                        }, () => []);
                        for (let y = 0; y < 20; y++) {
                            for (let x = 0; x < 9; x++) {
                                switch (y > 16 ? 0 : city.GetResourceType(x, y)) {
                                case 1: // Crystal
                                    res[y][x] = 'c';
                                    break;
                                case 2: // Tiberium
                                    res[y][x] = 't';
                                    break;
                                case 4: // Woods
                                    res[y][x] = 'j';
                                    break;
                                case 5: // Scrub
                                    res[y][x] = 'h';
                                    break;
                                case 6: // Oil
                                    res[y][x] = 'l';
                                    break;
                                case 7: // Swamp
                                    res[y][x] = 'k';
                                    break;
                                default:
                                    res[y][x] = '.';
                                    break;
                                }
                            }
                        }
                        return res;
                    },
                    layoutToCncopt: function (layout, includeOff = false) {
                        const emptyOff = [...Array(9 * 4).keys()].map(() => '.').join('');
                        const res = layout.reduce((p, c) => `${p}${c.reduce((p2, c2) => `${p2}${c2}`, '')}`, '').substring(0, 9 * 16);
                        return `${res}${includeOff ? emptyOff : ''}`;
                    },
                    layoutToFullCncopt: function (baseFaction, offFaction, name, layout) {
                        const res = ['3',
                            baseFaction,
                            offFaction,
                            encodeURI(name),
                            this.layoutToCncopt(layout, true),
                        ];
                        return res.join('|');
                    },
                    cncoptToLayout: function (layout) {
                        return layout.split('').reduce((p, c, i) => {
                            if (i < 9 * 16) {
                                p[Math.floor(i / 9)][i % 9] = c;
                            }
                            return p;
                        }, Array.from({
                            length: 16
                        }, () => []));
                    },
                    centerTo: function (x, y) {
                        return function () {
                            ClientLib.Vis.VisMain.GetInstance().CenterGridPosition(x, y);
                            ClientLib.Vis.VisMain.GetInstance().Update();
                            ClientLib.Vis.VisMain.GetInstance().ViewUpdate();
                        };
                    },
                    openCncLV: function (sr) {
                        return function () {
                            const cncopt = this.layoutToFullCncopt('F', 'N', `${sr.type} - ${sr.x}:${sr.y}`, sr.layout);
                            window.open(`${biCncLVUrl}${cncopt}`, `${sr.type} - ${sr.x}:${sr.y}`);
                        };
                    },
                    computeScores: function (layout) {
                        const resTib = {
                            t6: 0,
                            t5: 0,
                            t4: 0,
                            t3: 0,
                        };
                        const resPower = {
                            t8: 0,
                            t7: 0,
                            t6: 0,
                        };
                        layout.forEach((row, j) => {
                            row.forEach((cell, i) => {
                                if (cell === '.') {
                                    let t = 0,
                                        p = 0;
                                    for (let y = Math.max(0, j - 1); y <= Math.min(7, j + 1); y++) {
                                        for (let x = Math.max(0, i - 1); x <= Math.min(8, i + 1); x++) {
                                            if (!(x === i && y === j) && layout[y][x] === 't') {
                                                t++;
                                            }
                                            if (!(x === i && y === j) && layout[y][x] === '.') {
                                                p++;
                                            }
                                        }
                                    }
                                    if (t > 2) {
                                        resTib[`t${t}`] = resTib[`t${t}`] + 1;
                                    }
                                    if (p > 5) {
                                        resPower[`t${p}`] = resPower[`t${p}`] + 1;
                                    }
                                }
                            });
                        });
                        return [
                            ['t6', 't5', 't4', 't3'].reduce((p, c) => p + scoreTibMap[c] * resTib[c], 0),
                            ['t8', 't7', 't6'].reduce((p, c) => p + scorePowerMap[c] * resPower[c], 0),
                        ];
                    },
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    // Storage
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    loadStorage: function () {
                        this.storage = Object.assign(Object.assign({}, defaultStorage), (JSON.parse(localStorage.getItem(storageKey) || '{}') || {}));
                    },
                    saveToStorage: function (data) {
                        this.storage = Object.assign(Object.assign({}, this.storage), (data || {}));
                        this.flushStorage();
                    },
                    flushStorage: function () {
                        localStorage.setItem(storageKey, JSON.stringify(this.storage || {}));
                    },
                },
            });
            Main.getInstance().initialize();
        };
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Game load state Checking
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        function checkForInit() {
            try {
                if (typeof qx === 'undefined' || typeof qx.core.Init.getApplication !== 'function' || !qx?.core?.Init?.getApplication()?.initDone) return setTimeout(checkForInit, 1000);
                init();
                console.log(`%c${scriptName} loaded`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
            } catch (e) {
                console.error(`%c${scriptName} error`, 'background: black; color: pink; font-weight:bold; padding: 3px; border-radius: 5px;', e);
            }
        }
        checkForInit();
    };
    BaseScannerScript();
})();
