"use strict";
// ==UserScript==
// @version	    2020.03.31
// @name        CnCTA Base Finder
// @downloadURL https://github.com/bloofi/CnC_TA/raw/master/CnCTA-Base-Finder.user.js
// @updateURL   https://github.com/bloofi/CnC_TA/raw/master/CnCTA-Base-Finder.user.js
// @include     http*://prodgame*.alliances.commandandconquer.com/*/index.aspx*
// @include     http*://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @author      bloofi (https://github.com/bloofi)
// ==/UserScript==
(function () {
    const script = () => {
        const scriptName = 'CnCTA Base Finder';
        const storageKey = 'cncta-base-finder';
        const init = () => {
            const Main = qx.Class.define('Main', {
                type: 'singleton',
                extend: qx.core.Object,
                members: {
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    // Globals
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    //////////////////////// DATA
                    favorites: [],
                    listAlliances: [],
                    selectedAlliance: null,
                    players: {},
                    bases: {},
                    //////////////////////// UI
                    mainWindow: null,
                    allianceSelect: null,
                    allianceTextfield: null,
                    allianceLabel: null,
                    fetchLabel: null,
                    favoriteCheckbox: null,
                    buttonRefresh: null,
                    buttonShowGhosts: null,
                    buttonShowMains: null,
                    buttonClear: null,
                    //////////////////////// CANVAS
                    gridWidth: null,
                    gridHeight: null,
                    baseMarkerWidth: null,
                    baseMarkerHeight: null,
                    regionZoomFactor: null,
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    // Init
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    initialize: function () {
                        const ScriptsButton = qx.core.Init.getApplication()
                            .getMenuBar()
                            .getScriptsButton();
                        ScriptsButton.Add('Bases Finder');
                        const children = ScriptsButton.getMenu().getChildren();
                        const lastChild = children[children.length - 1];
                        lastChild.addListener('execute', this.onOpenMainWindow, this);
                    },
                    onOpenMainWindow: function () {
                        if (!this.mainWindow) {
                            this.loadStorage();
                            this.createMainWindow();
                            this.refreshSelect();
                        }
                        this.mainWindow.open();
                        this.refreshWindow();
                    },
                    createMainWindow: function () {
                        this.mainWindow = new qx.ui.window.Window('Base Finder').set({
                            contentPaddingTop: 5,
                            contentPaddingBottom: 5,
                            contentPaddingRight: 2,
                            contentPaddingLeft: 2,
                            width: 300,
                            height: 300,
                            showMaximize: false,
                            showMinimize: false,
                            allowMaximize: false,
                            allowMinimize: false,
                            allowClose: true,
                            resizable: false,
                        });
                        this.mainWindow.setLayout(new qx.ui.layout.VBox(5, 'top'));
                        this.mainWindow.center();
                        this.mainWindow.add(new qx.ui.basic.Label().set({
                            textAlign: 'left',
                            width: 300,
                            rich: true,
                            textColor: 'white',
                            value: 'Select Top50 alliance :',
                        }));
                        this.allianceSelect = new qx.ui.form.SelectBox();
                        this.allianceSelect.addListener('changeSelection', this.onSelectAlliance, this);
                        this.mainWindow.add(this.allianceSelect);
                        this.mainWindow.add(new qx.ui.basic.Label().set({
                            textAlign: 'left',
                            width: 300,
                            rich: true,
                            textColor: 'white',
                            value: 'or type alliance name :',
                        }));
                        const fetchRow = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
                        this.allianceTextfield = new qx.ui.form.TextField().set({
                            width: 200,
                        });
                        fetchRow.add(this.allianceTextfield);
                        const buttonFetch = new qx.ui.form.Button('Search');
                        buttonFetch.addListener('execute', this.onButtonFetchAlliance, this);
                        fetchRow.add(buttonFetch);
                        this.mainWindow.add(fetchRow);
                        const allianceRow = new qx.ui.container.Composite(new qx.ui.layout.HBox(10)).set({
                            decorator: new qx.ui.decoration.Decorator().set({
                                color: 'white',
                                style: 'solid',
                                width: 0,
                                widthTop: 3,
                                widthBottom: 3,
                            }),
                        });
                        this.allianceLabel = new qx.ui.basic.Label().set({
                            textAlign: 'left',
                            rich: true,
                            textColor: 'silver',
                            value: '',
                            marginTop: 10,
                            marginBottom: 10,
                        });
                        allianceRow.add(this.allianceLabel);
                        this.favoriteCheckbox = new qx.ui.form.CheckBox('fav').set({
                            textColor: 'white',
                        });
                        this.favoriteCheckbox.addListener('changeValue', this.onCheckboxFavorite, this);
                        this.favoriteCheckbox.setEnabled(false);
                        allianceRow.add(this.favoriteCheckbox);
                        this.buttonRefresh = new qx.ui.form.Button('Refresh');
                        this.buttonRefresh.addListener('execute', this.onButtonRefresh, this);
                        allianceRow.add(this.buttonRefresh);
                        this.mainWindow.add(allianceRow);
                        this.fetchLabel = new qx.ui.basic.Label().set({
                            textAlign: 'left',
                            width: 300,
                            rich: true,
                            textColor: 'silver',
                            value: 'Nothing to show',
                        });
                        this.mainWindow.add(this.fetchLabel);
                        const grid = new qx.ui.container.Composite(new qx.ui.layout.Grid(5, 5)).set({
                            width: 300,
                            allowGrowX: true,
                        });
                        this.buttonShowGhosts = new qx.ui.form.Button('Show ghosts');
                        this.buttonShowGhosts.setEnabled(false);
                        this.buttonShowGhosts.addListener('execute', this.onButtonShowGhosts, this);
                        grid.add(this.buttonShowGhosts, { row: 0, column: 0 });
                        this.buttonShowMains = new qx.ui.form.Button('Show mains');
                        this.buttonShowMains.setEnabled(false);
                        this.buttonShowMains.addListener('execute', this.onButtonShowMains, this);
                        grid.add(this.buttonShowMains, { row: 0, column: 1 });
                        this.buttonClear = new qx.ui.form.Button('Clear markers');
                        this.buttonClear.setEnabled(false);
                        this.buttonClear.addListener('execute', this.onButtonClear, this);
                        grid.add(this.buttonClear, { row: 1, column: 0, colSpan: 2 });
                        this.mainWindow.add(grid);
                    },
                    refreshWindow: function () {
                        const totalPlayers = Object.keys(this.players).length;
                        const totalPlayersFetched = Object.values(this.players).filter(m => m.isFetched).length;
                        const totalBases = Object.keys(this.bases).length;
                        const totalBasesFetched = Object.values(this.bases).filter(m => m.isFetched).length;
                        const totalGhosts = Object.values(this.bases).filter(m => m.isFetched && m.g).length;
                        if (totalBases > 0) {
                            this.fetchLabel.set({
                                value: [
                                    `<b>Players</b> : ${totalPlayersFetched} / ${totalPlayers}`,
                                    `<b>Bases</b> : ${totalBasesFetched} / ${totalBases} (${totalGhosts} ghosts)`,
                                ].join('<br>'),
                                textColor: 'green',
                            });
                        }
                        else {
                            this.fetchLabel.set({ value: `Nothing to show`, textColor: 'silver' });
                        }
                        if (this.selectedAlliance) {
                            this.allianceLabel.set({ value: this.selectedAlliance.n, textColor: 'green' });
                            this.favoriteCheckbox.setValue(this.favorites.some(f => f.id === this.selectedAlliance.i));
                        }
                        else {
                            this.allianceLabel.set({ value: '', textColor: 'green' });
                            this.favoriteCheckbox.setValue(false);
                        }
                    },
                    refreshSelect: function () {
                        ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand('RankingGetData', {
                            ascending: true,
                            firstIndex: 0,
                            lastIndex: 50,
                            rankingType: 0,
                            sortColumn: 2,
                            view: 1,
                        }, phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, this, this.onRankingGetData), null);
                    },
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    // Buttons events
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    onSelectAlliance: function () {
                        const selectA = this.allianceSelect.getModelSelection().getItem(0);
                        this.resetAlliance();
                        this.allianceTextfield.setValue('');
                        if (selectA && selectA.id > 0) {
                            this.fetchLabel.set({ value: 'Fetching alliance by ID...', textColor: 'silver' });
                            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand('GetPublicAllianceInfo', {
                                id: selectA.id,
                            }, phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, this, this.onGetPublicAllianceInfo), null);
                        }
                        else {
                            this.allianceLabel.set({ value: '' });
                            this.selectedAlliance = null;
                            this.fetchLabel.set({ value: 'Please select an alliance', textColor: 'red' });
                        }
                    },
                    onButtonFetchAlliance: function () {
                        const customAlliance = this.allianceTextfield.getValue();
                        this.resetAlliance();
                        if (customAlliance && customAlliance !== '') {
                            this.fetchLabel.set({ value: 'Fetching alliance by name...', textColor: 'silver' });
                            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand('GetPublicAllianceInfoByNameOrAbbreviation', {
                                name: customAlliance,
                            }, phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, this, this.onGetPublicAllianceInfoByNameOrAbbreviation), null);
                        }
                        else {
                            this.fetchLabel.set({ value: 'Please type something to search', textColor: 'red' });
                        }
                    },
                    onButtonRefresh: function () {
                        if (this.selectedAlliance) {
                            const id = this.selectedAlliance.i;
                            this.resetAlliance();
                            this.fetchLabel.set({ value: 'Fetching alliance by ID...', textColor: 'silver' });
                            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand('GetPublicAllianceInfo', {
                                id,
                            }, phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, this, this.onGetPublicAllianceInfo), null);
                        }
                    },
                    onButtonShowGhosts: function () {
                        this.showMarkers(Object.values(this.bases).filter(b => b.g));
                    },
                    onButtonShowMains: function () {
                        this.showMarkers(Object.values(this.bases).filter(b => b.isMain));
                    },
                    onButtonClear: function () {
                        phe.cnc.Util.detachNetEvent(ClientLib.Vis.VisMain.GetInstance().get_Region(), 'ZoomFactorChange', ClientLib.Vis.ZoomFactorChange, this, this.resizeMarkers);
                        phe.cnc.Util.detachNetEvent(ClientLib.Vis.VisMain.GetInstance().get_Region(), 'PositionChange', ClientLib.Vis.PositionChange, this, this.repositionMarkers);
                        this.removeMarkers();
                    },
                    onCheckboxFavorite: function () {
                        if (this.favoriteCheckbox.getValue()) {
                            if (this.selectedAlliance && !this.favorites.some(f => f.id === this.selectedAlliance.i)) {
                                this.favorites.push({
                                    id: this.selectedAlliance.i,
                                    name: this.selectedAlliance.n,
                                });
                                this.saveStorage();
                                this.refreshSelect();
                            }
                        }
                        else {
                            if (this.selectedAlliance) {
                                this.favorites = this.favorites.filter(f => f.id !== this.selectedAlliance.i);
                                this.saveStorage();
                                this.refreshSelect();
                            }
                        }
                    },
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    // Callbacks
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    onGetPublicAllianceInfoByNameOrAbbreviation: function (context, data) {
                        if (data && data.i) {
                            this.updateAllianceInfo(data);
                        }
                        else {
                            this.fetchLabel.set({ value: 'Invalid alliance name', textColor: 'red' });
                        }
                    },
                    onGetPublicAllianceInfo: function (context, data) {
                        this.updateAllianceInfo(data);
                    },
                    onRankingGetData: function (context, data) {
                        this.allianceSelect.removeAll();
                        this.allianceSelect.add(new qx.ui.form.ListItem('', null, { id: 0, name: '' }));
                        this.favorites.forEach((a) => {
                            this.allianceSelect.add(new qx.ui.form.ListItem(`[fav] ${a.name}`, null, a));
                        });
                        data.a.forEach((a, i) => {
                            this.allianceSelect.add(new qx.ui.form.ListItem(`${i + 1} - ${a.an}`, null, { id: a.a, name: a.an }));
                        });
                    },
                    onGetPublicPlayerInfo: function (context, data) {
                        if (data && data.c) {
                            const idMain = data.c.reduce((p, c) => (c.p > p.p ? c : p), data.c[0]).i;
                            this.players[`pid-${data.i}`] = Object.assign(Object.assign({}, this.players[`pid-${data.i}`]), { c: data.c.map(cc => (Object.assign(Object.assign({}, cc), { pn: data.n, isMain: cc.i === idMain, isGhost: null }))), isFetched: true });
                            data.c.forEach(b => {
                                this.bases[`b-${b.i}`] = Object.assign(Object.assign({}, b), { isFetched: false, isMain: b.i === idMain, marker: null });
                                ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand('GetPublicCityInfoById', {
                                    id: b.i,
                                }, phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, this, this.onGetPublicCityInfoById), null);
                            });
                            this.refreshWindow();
                        }
                    },
                    onGetPublicCityInfoById: function (context, data) {
                        if (data && data.i) {
                            this.bases[`b-${data.i}`] = Object.assign(Object.assign(Object.assign({}, this.bases[`b-${data.i}`]), data), { isFetched: true });
                            this.refreshWindow();
                        }
                    },
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    //
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    resetAlliance: function () {
                        this.removeMarkers();
                        this.players = {};
                        this.bases = {};
                        this.selectedAlliance = null;
                        this.buttonShowGhosts.setEnabled(false);
                        this.buttonShowMains.setEnabled(false);
                        this.buttonClear.setEnabled(false);
                        this.favoriteCheckbox.setEnabled(false);
                        this.buttonRefresh.setEnabled(false);
                        this.refreshWindow();
                    },
                    updateAllianceInfo: function (data) {
                        this.selectedAlliance = data;
                        this.buttonShowGhosts.setEnabled(true);
                        this.buttonShowMains.setEnabled(true);
                        this.buttonClear.setEnabled(true);
                        this.favoriteCheckbox.setEnabled(true);
                        this.buttonRefresh.setEnabled(true);
                        data.m
                            .sort((a, b) => a.n.localeCompare(b.n))
                            .forEach(m => {
                            this.players[`pid-${m.i}`] = Object.assign(Object.assign({}, m), { fetched: false });
                            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand('GetPublicPlayerInfo', {
                                id: m.i,
                            }, phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, this, this.onGetPublicPlayerInfo), null);
                        });
                        this.refreshWindow();
                    },
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    // Markers
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    showMarkers: function (bases) {
                        phe.cnc.Util.attachNetEvent(ClientLib.Vis.VisMain.GetInstance().get_Region(), 'ZoomFactorChange', ClientLib.Vis.ZoomFactorChange, this, this.resizeMarkers);
                        phe.cnc.Util.attachNetEvent(ClientLib.Vis.VisMain.GetInstance().get_Region(), 'PositionChange', ClientLib.Vis.PositionChange, this, this.repositionMarkers);
                        this.removeMarkers();
                        this.updateMarkerSize();
                        bases.forEach(b => {
                            this.addMarker(b, `${b.pn}<br>${b.n}`);
                        });
                    },
                    addMarker: function (base, text) {
                        const marker = new qx.ui.container.Composite(new qx.ui.layout.Basic()).set({
                            decorator: new qx.ui.decoration.Decorator().set({
                                color: 'rgba(255, 0, 0, 1)',
                                style: 'solid',
                                width: 3,
                                radius: Math.floor(this.baseMarkerWidth / 5),
                            }),
                            backgroundColor: 'rgba(255, 0, 0, 0.6)',
                            opacity: 0.5,
                            width: this.baseMarkerWidth,
                            height: this.baseMarkerHeight * 0.8,
                        });
                        marker.add(new qx.ui.basic.Label('' + text).set({
                            textColor: '#ffffff',
                            opacity: 1,
                            font: new qx.bom.Font(12, ['Arial']),
                            rich: true,
                            wrap: false,
                        }));
                        qx.core.Init.getApplication()
                            .getDesktop()
                            .addAfter(marker, qx.core.Init.getApplication().getBackgroundArea(), {
                            left: ClientLib.Vis.VisMain.GetInstance().ScreenPosFromWorldPosX(base.x * this.gridWidth),
                            top: ClientLib.Vis.VisMain.GetInstance().ScreenPosFromWorldPosY(base.y * this.gridHeight),
                        });
                        this.bases[`b-${base.i}`].marker = marker;
                    },
                    removeMarkers: function () {
                        Object.values(this.bases).forEach(b => {
                            if (b.marker) {
                                qx.core.Init.getApplication()
                                    .getDesktop()
                                    .remove(b.marker);
                                this.bases[`b-${b.i}`].marker = null;
                            }
                        });
                    },
                    updateMarkerSize: function () {
                        this.gridWidth = ClientLib.Vis.VisMain.GetInstance()
                            .get_Region()
                            .get_GridWidth();
                        this.gridHeight = ClientLib.Vis.VisMain.GetInstance()
                            .get_Region()
                            .get_GridHeight();
                        this.regionZoomFactor = ClientLib.Vis.VisMain.GetInstance()
                            .get_Region()
                            .get_ZoomFactor();
                        this.baseMarkerWidth = this.regionZoomFactor * this.gridWidth;
                        this.baseMarkerHeight = this.regionZoomFactor * this.gridHeight;
                    },
                    repositionMarkers: function () {
                        this.updateMarkerSize();
                        Object.values(this.bases)
                            .filter(b => b.marker)
                            .forEach(b => {
                            b.marker.setDomLeft(ClientLib.Vis.VisMain.GetInstance().ScreenPosFromWorldPosX(b.x * this.gridWidth));
                            b.marker.setDomTop(ClientLib.Vis.VisMain.GetInstance().ScreenPosFromWorldPosY(b.y * this.gridHeight));
                        });
                    },
                    resizeMarkers: function () {
                        this.updateMarkerSize();
                        Object.values(this.bases)
                            .filter(b => b.marker)
                            .forEach(b => {
                            b.marker.setWidth(this.baseMarkerWidth);
                            b.marker.setHeight(this.baseMarkerHeight);
                        });
                    },
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    // Storage
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    loadStorage: function () {
                        const storage = JSON.parse(localStorage.getItem(storageKey) || '{}') || {};
                        this.favorites =
                            storage[`wid-${ClientLib.Data.MainData.GetInstance()
                                .get_Server()
                                .get_WorldId()}`] || [];
                    },
                    saveStorage: function () {
                        const storage = JSON.parse(localStorage.getItem(storageKey) || '{}') || {};
                        storage[`wid-${ClientLib.Data.MainData.GetInstance()
                            .get_Server()
                            .get_WorldId()}`] = this.favorites;
                        localStorage.setItem(storageKey, JSON.stringify(storage || {}));
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
                if (typeof qx !== 'undefined' &&
                    qx &&
                    qx.core &&
                    qx.core.Init &&
                    qx.core.Init.getApplication &&
                    qx.core.Init.getApplication() &&
                    qx.core.Init.getApplication().initDone) {
                    init();
                }
                else {
                    window.setTimeout(checkForInit, 1000);
                }
            }
            catch (e) {
                console.log(scriptName, e);
            }
        }
        checkForInit();
    };
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Script injection
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    if (/commandandconquer\.com/i.test(document.domain)) {
        try {
            const script_block = document.createElement('script');
            script_block.innerHTML = `(${script.toString()})();`;
            script_block.type = 'text/javascript';
            document.getElementsByTagName('head')[0].appendChild(script_block);
        }
        catch (e) {
            console.log('Failed to inject script', e);
        }
    }
})();
