// ==UserScript==
// @name         CnC-TA Lister UI
// @namespace    https://github.com/ffi82/CnC-TA/
// @version      2024-12-16
// @description  Some data tables...
// @author       ffi82
// @contributor  leo7044 (https://github.com/leo7044), 4o (ChatGPT)
// @match        https://*.alliances.commandandconquer.com/*/index.aspx*
// @updateURL    https://github.com/ffi82/CnC-TA/raw/master/CnC-TA_Lister_UI.meta.js
// @downloadURL  https://github.com/ffi82/CnC-TA/raw/master/CnC-TA_Lister_UI.user.js
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAhlJREFUeF7tmtFtwzAMRJPBukD36RTdpwtksBb+EGAItu4okYcyYn/tSrzHI2UReT42/3turv9RAMoBmxOoEtjcANUE3Uvg+/X521z19fFzu/75vSgXjvZve7oCuBJ1F4QCwCESQXADcCfoKgCVeBmAkaCtAbxVD2hZ7kVZsx/V8GbXhT1g1Niyiz+gTQN4B/HTAEZ2Q8fOrFWj/m/KAVsBOMSy53a27FMlwAKwimehrlifiQmWQAvAs+kpxDP3EdoByAUM6XMmUwK4g2AVzzhqxfb9/6L46BK4ChwtPhKicAETnxkAyg47D0DrqJ67ArDMA1QC0T5uACzzABSU8rkLAM8jUinedAzONDSmCakF9/vRDoiYB0SeBCx8CCBqHhAp/pxlBGIawErdq8QfIEIArF6HtweA7haejXHZAZZg0Wa9sEgnsLHAHsACYDf0zK7HWhQABCGreNOH0ErX98hU1Bq0A7znAVGCrOuaAPQQMlu/gTIDQITZeUDkCdBiZBLkCsAyD1AAcPkSRBlvzy3zAJV4GQDrCbENgPp9wOBHUmxpRb8Hm2DUPCBaGLv+NABr3bMBqd+bArA6D1CLHO1XAJhssMcW8+XF7Kd8BzoAXYUtn51nYSzUFRhMQigACAKzkVo8m5gCYLGY5bKD1lWUQMhdgL3u/gcATGnSJYAEZX1eALJmzivucoAXyazrlAOyZs4r7u0d8AfcG0xQF263twAAAABJRU5ErkJggg==
// @grant        none
// ==/UserScript==
'use strict';
(() => {
    const ListerUIScript = async () => {
        if (typeof ClientLib === 'undefined' || typeof qx === 'undefined' || !qx.core.Init.getApplication().initDone || !ClientLib.Data.MainData.GetInstance().get_EndGame().GetCenter()) {
            setTimeout(ListerUIScript, 100); // Retry after 100ms if liraries (ClientLib or qx) are not loaded
            return;
        }
        window.Lister = { // Exposing Lister globally
            db: null,
            async init(dbName = "Lister") {
                if (this.db) return;
                const request = indexedDB.open(dbName, 1);
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains("storage")) {
                        db.createObjectStore("storage");
                    }
                };
                return new Promise((resolve, reject) => {
                    request.onsuccess = (event) => {
                        this.db = event.target.result;
                        resolve();
                    };
                    request.onerror = (event) => reject(`Error initializing database: ${event.target.error}`);
                });
            },
            async performTransaction(operation, key, value = null) {
                await this.init();
                return new Promise((resolve, reject) => {
                    const transaction = this.db.transaction(["storage"], operation === "get" ? "readonly" : "readwrite");
                    const store = transaction.objectStore("storage");
                    let request;
                    transaction.onerror = (event) => reject(`Transaction failed: ${event.target.error}`);
                    transaction.oncomplete = () => console.log(`Transaction completed: ${operation} on ${key}`);
                    switch (operation) {
                        case "get":
                            request = store.get(key);
                            request.onsuccess = () => resolve(request.result || null);
                            break;
                        case "set":
                            request = store.put(value, key);
                            request.onsuccess = () => resolve(true);
                            break;
                        case "remove":
                            request = store.delete(key);
                            request.onsuccess = () => resolve(true);
                            break;
                        case "clear":
                            request = store.clear();
                            request.onsuccess = () => resolve(true);
                            break;
                        default:
                            reject(`Unsupported operation: ${operation}`);
                    }
                    request.onerror = (event) => reject(`Request failed: ${event.target.error}`);
                });
            },
            get(key) {
                return this.performTransaction("get", key);
            },
            set(key, value) {
                return this.performTransaction("set", key, value);
            },
            remove(key) {
                return this.performTransaction("remove", key);
            },
            clear() {
                return this.performTransaction("clear");
            },
        };
        const scriptName = 'CnC-TA Lister UI';
        const qxApp = qx.core.Init.getApplication();
        const cfg = ClientLib.Config.Main;
        const region = ClientLib.Vis.VisMain.GetInstance().get_Region();
        const mainData = ClientLib.Data.MainData.GetInstance();
        const wid = mainData.get_Server().get_WorldId();
        const defaultPoint = mainData.get_EndGame().GetCenter();
        const [centerX, centerY] = [defaultPoint.get_X() + defaultPoint.get_SizeX() / 2, defaultPoint.get_Y() + defaultPoint.get_SizeY() / 2];
        const sectorNames = ['south', 'southwest', 'west', 'northwest', 'north', 'northeast', 'east', 'southeast'];
        const clockPositions = Array(12).fill().map((_, i) => `${i || 12} o'clock`);
        const AllianceCitiesTemplate = {
            Server_Name: null,
            Alliance_Name: null,
            Alliance_Id: null,
            Player_Name: null,
            Player_Id: null,
            Player_Faction: null,
            Player_Ranking: null,
            Player_Score: null,
            Player_Bases_Count: null,
            Player_Distance_to_Center: null,
            Player_has_Code: null,
            Player_versus_Bases: null,
            Player_versus_Environment: null,
            Player_versus_Player: null,
            Player_is_Inactive: null,
            Player_Endgame_Won_Count: null,
            Player_Challange_Won_Count: null,
            Player_Other_Won_Count: null,
            Endgame_Won_Server_Name: null,
            Endgame_Won_Rank: null,
            Endgame_Won_Alliance: null,
            Endgame_Won_Timestamp: null,
            Endgame_Won_Member_Role: null,
            Base_Name: null,
            Base_Id: null,
            Base_Score: null,
            Base_Coords: null,
            Base_Sector: null,
            Base_Distance_from_Center: null,
            Base_Found_Step: null,
            Base_is_Ghost: null,
            Base_Tiberium_per_Hour: null,
            Base_Crystal_per_Hour: null,
            Base_Power_per_Hour: null,
            Base_Credit_per_Hour: null,
            Base_Base_Level: null,
            Base_Defense_Level: null,
            Base_Offense_Level: null,
            Base_Construction_Yard_Level: null,
            Base_Command_Center_Level: null,
            processedTimestamp: null
        };
        const poiTemplate = {
            Level: null,
            Name: null,
            Coords: null,
            Alliance: null,
            Score: null,
            Type: null,
            Sector: null,
            Distance: null
        };
        const Icons = {
            Refresh: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAaBJREFUOE+l0j1ok1EUxvHf25amiUJKvzeXUmhxUOiqmw6CrgFxdfNjE1fBwUVFcVM3HbSTkyI6qDiJFCnFWgVxsKXV1BjTpE3e3FdaqSb2I4IXLhcu5zyc53+eyH+eaJv+6PLHEN4XEwuVxHKNxwc6tqzd9Hlhppq8nF81nY99LuwiH1OpEdeNTl059PbBxSe9974n+Vx2vbdJ4NRkObmxP3MMs0g7/mxSHH6V9Y4SYkKVUOH22CaBHixtYWlM7tG09nYG9iIQxVzds3mCHXiOOP38nUyKwRE6Es70tCHZDmKz1vkXicE+0im6Ohno50jqnwX6cBCVhruKN40TRMOzcSjNxxYXY2Emz5dvXN83iMWdorJhIco8DaE8VWSuylKRW8NDWGiVs98Crq0EcwmlH1QKVIvcGW/J6E/BuXyiFFNbob5CeY56jYnDW4l0o9AcpJMfEjeHM068KqsvE2p0drH6lSihVqaS5+HZHO5vWGtUb0cdbY7era+nLZ0lO8TuftLdXBoax+tGLjt5zGAN5Npbwqe1tf0NtSWkVlv4CYSGmRHjxxGoAAAAAElFTkSuQmCC',
            DownloadCSV: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAWNJREFUOE+lk8Erg3EYxz+blKImGeGqdvNHUC6OFGo5KIc5zVFaIrbDUo4sl+XgJBzHCSlSUlxMLdTMLG3v3u3du3d730fiIl68ea6/5/d5nt/3+/25+Ge5frofvBDZjOZ52Wqz7bM9mLsTqRahuwK5FETGXd/22gLm0yK6+g54SkJk1CFgIfsBqMLjFUTGHAIWcyJ6Aboq8HAJ0QmHgPlHEV0BrwqZJKz4/wgIF0XCk88EVzuoadCah8Y+CPszWKpGYb/3k25fRAwrIoYBdR3eNvD0QOoEdmNptMNTqsrIz4C3XISyIoYK5QJUFNhZz1E6OMbID38ZaGtj8FpEy8N2TEHZTVBXR53lwDsrMtQP8cE1RAJ/T2J7wJTCRhzLzCCSBopAC263D9Oc+f0JU+citTLoJTDKcJTQwLKwSmWWljuZ9n2203Y1z8CNNHi9uJuboF6jenuPdraHaYZ+d8HJD38FkCelEdQP/XcAAAAASUVORK5CYII=',
            ClearCache: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAYZJREFUOE+1k0FrE0EUx38zm5g22WAa0zY0uB9ACOLFi+lVqqHgQXop1kMp8ahfQA1CIz0YNGIPFcSvUJAam+zBQ2svaQrSox6EklAQPQjBbPbJLqgsaUyg+JjDm5n3/zHvPzzFKUOdUs8/AZe/fBUtLh+s1MC6wYCj78LMWf/+wreOHCbGTqwNHGbrOzJ26aLfVafrcMbQaK356eXhEC6QcoVqyvyjC1I/fpbEZBINKBRhEVztZd4eHAHLUDRS8QEAYL7cEZSH8EL89dsphbB5N9hKX1+31kXMCJz7dJ+j80Ve7+1SX+ry5CDHVNTg5YoKaPoAiy9E4hHkYb6tStVpKltvsO+YrO7nyEQNXhWGABaei0yMQzHfxgfUatjL4dEBNyuOJKMGxestHr9LU3m7hV2I8qhxBSsWGv6CG08dSccNHlxrsbad5pn9ntptl1JzFsscwYO5ck8ypsbpwWQMjn9AdhqaLRgPwcYwE73Pu1p25K+7glIaEaF6L9Rn+v8dplEm9Rcp/HsRO0tPngAAAABJRU5ErkJggg==',
            Power: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAAXNSR0IArs4c6QAAAzdJREFUOE+VlFtvVFUYht+19tqzp51DO6XgNM7YmQotVAoxMZomSkCbmFZAsFITDWiNgVgi4eSNN265MPbCSNCQFIoXNdFmkNYTSEKglYQCoaSN0ZY0pZhyGDul7DJ2Zp/XMvvCRO2AuH7Ak+d7v/V+BP/jqULQ2hEwhCEZMqh/BvbIUTiqSjh5UE4qJSRjFfxmPhe0wUqlRfJ6mqFduovZHUuI+UAgtU+wshiKmWRWkAirv3Z1Yt/EpSsPN2xueiuvSd27YzD+E9QnBBudRMjH7ITjl1ZphvZRx7uf+fceeS9L0+KZDPGNqUlyf1DHoJDtKMLUtRMkRDYOXxjaPnr6cmlpMioat6xvp7N2ZySuXG8hxLqnkQcpiiHyh+lUkwBfO3RucOfEwC9KtLwcJcviU3W1K3dQwS9A86e3PUHseSAhBDkKyLnfUGYwZykW0DcHevo3mjduB5ufr0d7x9dobX97kOXkA9RxBsCU9LYK6PNAXiZjaZSCO3V2kLed7jqxzm84yq7WtfhpaBzfnzyHZQ2PI1ZbaQbkwO6IFfzyjQSy/wB5Nl9MoVjXrbiIyp8c2/9VQzxYwlpeXINAwA9dNzGjZZH69gyu/z6Nl/e8uv8hlH9QEHRwBAEe1Bt/7PkhpV2bworaxXjk0UrUVFfBdl1c7DuPscy0tW7XK+clzX1f5Nnw1qoCRocuo8iJ2tV37dmDruBJKpGy4wd6fdvbNuNY93cwZYLntrzQ67OLOhXD+rnEKsq0PFZga962aBxlrmEs52HW1N9zqq2YM//MrQyUWMRYvaHhG6bTTuKwEZ+A1pokhteOeWF7VdCqEOQLneVzLLfvZEfvs0bexJPNT2Px0iVdNEsPMZeNl+jQPJO/KjYP5BUzeRORfMBtGh3+9fDZ7lNKffPq2bqnVn4u3REpWMbViBPK/h1S0MgbjS3KLzQW+D79eOuHL7Xsfe1mIlF5RLrLu4lkTN0YD2fVNcT5d9kL/qNbkwhdmZ58J5+ba6xZUXOYzjlnXUuZTk8iVwhS0EhVBa18HT6LQ+GBOUW2ueNKYSNdAUMlhN/r7BTsmpcT+kErQiCRCfBNm8AJIeJ+t+tPo7JxHFEeK5MAAAAASUVORK5CYII=',
            Credit: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAAXNSR0IArs4c6QAAA2pJREFUOE+tlG9sU1UYxp9z723v7d1Gt9La4pCOtS4hBkHd0EZxjKIyZSRD5wfMIGQYcMliyKISHWYNIUr8gExJ3NBkcUjMBqMDgkFEcGMfdOoyMsJYGWPD0bAV7rb+ub29/8wlqUE698nz9bznd573yfs+BP/TIfNxdF0ngYug3WvApOsKAGUNoBJC9Affzglq1HXKdh0mxgyeaEmrBjWXsrA2StamUnHlLmXjZ2sdSBBCtDQsA2RAFoXBKRIWUIy8hPC0L8Vq/htXR5c+/sTSEWZaa01JGIpr5vCzhYiXEaIYsAxQU0hnVVPCxvHM6nti7PXB34eW93ReKrIwNM1Ys2K+8pJQie+p44goXbJuHq/zImYoywA1j9yzqmz2sllabNhfe6Cc0kDZ83LwbaAGFbuakJRkvFztH/f7n2+iRDVY9Bg7Zqj6F8gw9/OxhIujmbVdwbP7Q79dy29trIHbmXffipSsoLN7AAc7zssNX793Vr8jNlqW8Fe2EZLMAH05hgLwybdbPjtSW+RycHtrKtj6g+1aWJiV1z7pZSv9xdj8YTO27Nk8sDjX1TATp3t2e8jMvCCP087Vb61gPz5wVBsP3yUz01FizeERTaXkD5rf7bfEmU+UeKq3zpsdmRNE0/JLwRM/BIb7hl176qvhyM0Gx7H32xsavY1D3wRRWOyZ2Phm+aeaKHU5ei23/xN09Ejnvuv9I3a3Ox+TdyIwmRgsdi3Ezu2bcOJUN85d+lMOHH5/H5lW2+y/smOZoFtYRExSZdvhYwFZkBbuqHsLfd19EGUFWRYWTz+3EsHjP+Ly4LD00Re79qYE5bv8Pu7WHHMUdZg5U8n5cz1NP3X1eta/VopVpav+2YbQ4DC+bzuJsqrVN/2vvNCoCNKZDI+M6kOTerYyGyvQrHT1hdO9b/T/MvBofDrGrSt/EWdO/qw77Lmqd4UnXLl9Q4c6JbVas7JuVDuRyFDU3q7TEyXIseiyGxx8sDGvfrW7Zd3N0TD7TOmKyKZ3Nl6m4topLYluVTRNLP8LQlnZQwNpKDKGsuUPMMgTeBm8k+EZr2pWlk1NCd5HnPaQHlUHVWCEldkIBCR2FBN5zl1Lm2Eogw/myViUJwsYniiUidZVUVD5RGEhxCpAfjBK5s2jtMIOgEp/UAVoD2eRcfc36WeHHqkkmHYAAAAASUVORK5CYII=',
            Tiberium: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAAXNSR0IArs4c6QAAA6hJREFUOE+tlFtMXFUYhdc++1zmcmCG+zAQGS5DDSXEVIwVY2xNtJqYlvQy+kBqkyYa++AjsVUjPkiMRqM11tTEmhptBR60GjHVkrSgTWk1tmmLIEUqIJcZGGDu58zZ5zdQxKImvLhf915fVva/1s/wPx22HoeI2CsAqwOW3w4A1MaY/U/dGtCKiOMm5FINkjUPSfdAEwyutG1oskkmV81Ebiw3EdrIzNthf4OIWOcAlLQHOWQbXkvVnJaZdUhgBaRQ0M6X9kpx6kGavrANY3SmWo+2MWb9BVsFtRFJ5RPwcjlbnckR7WPzQ0W1nvrLQqaK0YW+u/rmvvT6Ew3JBze0HKc4jpFTGTpQhCRjjJZgq6DDw6S5uREgr/LUheg3B3+mbuwqfBE9E8cRqqpBpwhj7GwvdtcdRKWn/ulsgn9VdAmRUIiJNaAPByM5wu3dlNZT7d8nX2py5jXAiLtw7YeLkPQF1JTV4sLNfgSmyrEv9M4JsWC/ZZnx4b6a/GQXY+KWIyJ2bDpRCO586LfMr29/HuvwsUgMizcWkOtxIuyIwRweB8UyaKx+GDt3HBpkGfqMm64TLgWTe0uQWgYd/ZEUyjMCXFeaz1/peL2j+wNodwdgh+Pg0TlksgnIleWg2TC23/cY4nIKwardZlCt30cwe2ZK9Fm29MnFY/Co3NrE8/iB/l++e/zTw8+rUqAc8P0BazEJ0S/gqfehJBDEC0+04JIYwcB1W2yv2/+qlpE/6u7DODtKpPDRjN8ulp/9aaSj9fT5kyw6bsBxRxR8GwOldCQ7BaxJE+6mIKr8BWjaeCc6Tp3Gyy1dR7SU8obbh3HWdp3UMrdZHVXn2l97s7lZ6IWQ8nX4ixVUbQ3i2vwE5t6/AtvlhVyqQoRnkV+Qi3sqd4ltW/a30qJ5cqrCNbPsyBoxKqLy5Lsfv3fo0UkpCsmvQe6dgbvcjcxWF4yvJ5CejcJ5bwCbdzyJRwr3hHXLc4QLdmo+oYy0bkCCdRLxxdFkoe10NJqu7HO9Zz9p8tfWJ4pyS42rg2cqhq5eBIUN5FT78MD9e8YDxQ3nWEb6loS4nGXqpDKN2DONLMuWRt8JOBZvpAuEW/bJTKrMGkLlKnMRY2W2zjZzCykQpuyY6OGM/W5J1rTEnfNnSmEsZWg1kEtl7QKU+BC0NMVVTZNk05ZUrkkOIqYpACymGsJKxpFyJyJhZNq2QGClHmuS/a91csupVLRSowhAIcC+Xfzf7V9vMa1z/yem2KPLWChEcAAAAABJRU5ErkJggg==',
            Crystal: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAAXNSR0IArs4c6QAAA5FJREFUOE+tlG1oW2UUx//PfZ57b15uetsm6ctWm1JRSalTaEGZUgbTgmLdHFql2DkVJo5NxlAUJy5DRMHh1LFBqygT/DD9sA8OxE5pNwVh00ynri5N1y5ZUpJ0Se7N6829uY/El+IQVj94vh7Oj3P4//+H4H8qshqHcy5M/gDa0g5WssB7FmGd2gA7RIj9z9lrQJxzMgPQzBWIhRKY1QYBetklUZdiEdNLGTivifFqAfqOPpQIIfxv2DWgie+5KKporjmMZpHRLoHDIgJpMQR+a8rM7rbKVf0GZe0uGOasGnAkRgmp/QsUCnGhcxwe6jB70SS8ejoS2zzUHzhXLpR5olINhiM5p3Y5hbFNt806LedupcrOzn0ELRT688SVjaY5Z5ElrGGK/Uh4KXZgPtsElksj91sUm4fX4/OZPJYyCXT7F/Do+NhBQa8fKXfJ8V1ArXHiCujtOHc28dqNopc9fyKceKJN9uC7s0lw7RIiP+oIdMuAs4jc5Z/x4sHQt1Je3O+wzZ9MTck/MwBrBTQxz1XZbQ0uGOmvJvdOQSsSWFc1dAYZ0lddgJUERwX963vw2FNbdGoKU6qovmHqmN/eC52AczIBMCtZ6ZCZtGEhNffWm4+/0k5dgxBoHbJfQ0VPgEgDkDvqGN86goq3ikyMWw/c3f8CLPHYkg8p0pD8w2Uo3DKDgirsubi8/ODhnfucVkqCY9NdoIFmaJOfwdXqBhd6sP+lMWSdCo4dn+J7nht5h+WsQ2rAESOfck61BfjEVnvLyfnZ92Y++Zpp0TIcGwPwjdyPQpZj+d2jqP96DmLPMKhs4N6td+L01Cm8Hnr6sFwWD7g7ECcNtaIJdBSdpdfe/+DjbXNfxCG2BOFpzWDdQ/fhl6QDuW+Ow74SBfUGQFQVXWs13DF4e3po6J6XYdATiTZkSMOEkhfeqs/Ye34xtvPoviMA8UHtVpENfwlXcCNKixEI9SzENevw8LNPYqDPe4YVcUiw+RlTkpM7/CiREOdC5yV4JDe6bdkejqbj47LLzXv93kxc03tnw+e7DC3DZX975Zabb7ro9/imxYp90jJZjDmR9kyjPDpK6n+oNg3QxTyUWgVNxDZbJULcNoXMJOIwynDZqBNS4wZ10wxFPS1W5Wwxg+L2hn/+ytuKjxqb9V0AQxNoVYSQL4AyCZSYRdGtKKjYsJkIo+RDLQuY103/ai/lev1V/9F/hf8O1jSTcwWrPEMAAAAASUVORK5CYII=',
            Production: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAZJJREFUOE9jZKAQMFKon4E2BphnT+gS5ONNZ2ZmBjvw79+/DB8+f2s9MSW3C93FWF1gnjVhVntBVKqmrDBY/aX7Lxnqp69pOzE5r5poA5pywlLVZMXB6s/dfMTQvXAzaQZUZEekykhAXHDz0QuGKfPWEzbANLPvvZ6KHD8zCzODspwU4+Pnbxn8fe0Y7j98zjBr6ebqM9OL2vB6walo2qd5jam8jIyQoJmy+iCDoa0xw7uXbxnWrNn59OfvX89//vr97tysUneYQSiBaFcw5VN9SQIvSJKLnZVh9caDDCoWRgwfP39j0GRnYNBVkWJIrJvx+dCEHD6sBlhkT/iUUwAxAOSI4/tOMciY6DO8fvuRQenfNwYFNQWG5p4Fn09MLcBugFlW38fAlGi45PWDJxjkLU0YPr95x8DO8I9BQVGaYf7URZ9OTSvix+oC4/TuT1qWZmAXgMDHB48Y+GSkGP7+/s3AwsLCwC3Ay3B6z6HPZ2eWYneBekzjmj9//ojgyx8sLCxvbi6pD8HqAnIyFsWZCQAHS5MRrpL/9AAAAABJRU5ErkJggg==',
            Lister: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAGZJREFUOE9jZKAQMFKonwGrAd2Hvf6X2m5jBNG4LADJg+TgBqBrgikg5EIUA2CKidWM4gIQB+YKmEEkeQHZqegG4fMGwTDA5QqsgYgtDIg2AFsYEIoBjEBEDryRng6ICTyYGopzIwAF2VQRfJD3EwAAAABJRU5ErkJggg=='
        }
        let AllianceCitiesArr = localStorage.getItem(wid + 'cacheCleared') === 'true' ? (localStorage.removeItem(wid + 'cacheCleared'), []) : (await Lister.get(wid + 'AllianceCitiesArr')) || [];
        let processedCityIds = JSON.parse(localStorage.getItem(wid + 'processedCityIds')) || [];
        let AllPOIs = (await Lister.get(wid + 'AllPOIs')) || []; // Fetch from IndexedDB
        let timestamp;
        // Allow different parts of the application to communicate with each other without tight coupling.
        class EventBus {
            // Initializes an empty listeners object that will hold arrays of callbacks for each event.
            constructor() {
                this.listeners = {};
            }
            // Checks if an event already has a list of subscribers; if not, it initializes an empty array for that event name. Adds the provided callback function to the list of listeners for that specific event.
            subscribe(eventName, callback) {
                if (!this.listeners[eventName]) {
                    this.listeners[eventName] = [];
                }
                this.listeners[eventName].push(callback);
            }
            // Remove specific callbacks, especially for cleanup purposes
            unsubscribe(eventName, callback) {
                if (this.listeners[eventName]) {
                    this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback);
                }
            }
            // Allow listeners to automatically unsubscribe after the first event dispatch.
            once(eventName, callback) {
                const wrapper = (event) => {
                    callback(event);
                    this.unsubscribe(eventName, wrapper);
                };
                this.subscribe(eventName, wrapper);
            }
            // Checks if there are any listeners for the provided event. Calls each callback with an object that provides a getData(), eventName or a timestamp method, allowing listeners to retrieve the data associated with the event.
            dispatch(eventName, data) {
                if (this.listeners[eventName]) {
                    this.listeners[eventName].forEach(callback => callback({
                        getData: () => data,
                        eventName,
                        timestamp: performance.now()
                    }));
                }
            }
        }
        const eventBus = new EventBus(); // Create an instance of the EventBus
        /*
         * Alliance Cities
         */
        // Start alliance cities scan (logic: get alliance member IDs --> get alliance cities IDs --> load and grab each city data)
        async function getAllianceCities() {
            timestamp = performance.now();
            for (const memberId of mainData.get_Alliance().getMemberIds().l) {
                await getPublicPlayerInfoByIdAC(memberId);
            }
            AllianceCitiesArr.sort((a, b) => b.Base_Score - a.Base_Score).sort((a, b) => a.Player_Id - b.Player_Id);
            await processCityIDs(AllianceCitiesArr.map(item => item.Base_Id));
            await Lister.set(wid + 'AllianceCitiesArr', AllianceCitiesArr);
        }
        // Get public member info (about 75% of each alliance city data)
        async function getPublicPlayerInfoByIdAC(playerId) {
            try {
                const data = await new Promise((resolve, reject) => {
                    ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand('GetPublicPlayerInfo', {
                        id: playerId
                    }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, (context, data) => {
                        resolve(data);
                    }), reject);
                });
                const s = mainData.get_Server().get_Name();
                for (const city of data.c) {
                    let cityData = {
                        ...AllianceCitiesTemplate
                    };
                    Object.assign(cityData, {
                        Server_Name: s,
                        Alliance_Name: data.an,
                        Alliance_Id: data.a,
                        Player_Name: data.n,
                        Player_Id: data.i,
                        Player_Faction: data.f,
                        Player_Ranking: data.r,
                        Player_Score: data.p,
                        Player_Bases_Count: data.c.length,
                        Player_Distance_to_Center: data.dccc,
                        Player_has_Code: data.hchc,
                        Player_versus_Bases: data.bd,
                        Player_versus_Environment: data.bde,
                        Player_versus_Player: data.d,
                        Player_is_Inactive: data.ii,
                        Player_Endgame_Won_Count: data.ew.length,
                        Player_Challange_Won_Count: data.cw.length,
                        Player_Other_Won_Count: data.mw.length,
                        Endgame_Won_Server_Name: data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).n : '',
                        Endgame_Won_Rank: data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).r : '0',
                        Endgame_Won_Alliance: data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).an : '',
                        Endgame_Won_Timestamp: data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).ws : '',
                        Endgame_Won_Member_Role: data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).mr : '',
                        Base_Name: city.n,
                        Base_Id: city.i,
                        Base_Score: city.p,
                        Base_Coords: `${city.x}:${city.y}`,
                        Base_Sector: calculateMetric(city.x, city.y, 'sector'),
                        Base_Distance_from_Center: calculateMetric(city.x, city.y, 'distance')
                    });
                    //ghost bases values fix
                    ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand('GetPublicCityInfoById', {
                        id: city.i
                    }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, async (context, data) => {
                        if (data.g === true) {
                            Object.assign(cityData, {
                                Base_Found_Step: -1,
                                Base_is_Ghost: data.g,
                                Base_Tiberium_per_Hour: 0,
                                Base_Crystal_per_Hour: 0,
                                Base_Power_per_Hour: 0,
                                Base_Credit_per_Hour: 0,
                                Base_Base_Level: -1,
                                Base_Defense_Level: -1,
                                Base_Offense_Level: -1,
                                Base_Construction_Yard_Level: -1,
                                Base_Command_Center_Level: -1,
                                processedTimestamp: new Date().toISOString()
                            });
                            processedCityIds.push(city.i);
                            await Lister.set(wid + 'AllianceCitiesArr', AllianceCitiesArr);
                            localStorage.setItem(wid + 'processedCityIds', JSON.stringify(processedCityIds));
                            eventBus.dispatch("cityDataAdded", cityData);
                            progressBar(processedCityIds.length, AllianceCitiesArr.length, "Alliance Cities");
                        }
                    }), null)
                    const cityExists = AllianceCitiesArr.some(existingCity => existingCity.Base_Id === cityData.Base_Id); // Check if cityData already exists in AllianceCitiesArr
                    if (!cityExists) {
                        AllianceCitiesArr.push(cityData);
                    }
                }
            } catch (error) {
                console.error(`Error fetching player info for ID ${playerId}:`, error);
            }
        }
        // Set the play area view on the selected ID and wait for it's data to be loaded
        function loadCity(id) {
            return new Promise((resolve) => {
                ClientLib.API.Util.SetPlayAreaView(ClientLib.Data.PlayerAreaViewMode.pavmNone, id, 0, 0); // Set the play area view for the current city
                const checkLoading = setInterval(() => {
                    const loadedCity = mainData.get_Cities().get_CurrentCity();
                    // Check if the loaded city's ID matches the requested city ID
                    if (loadedCity && loadedCity.get_Id() === id && loadedCity.get_FoundStep()) {
                        clearInterval(checkLoading);
                        resolve(loadedCity);
                    }
                }, 200);
            });
        }
        // Get more data for each alliance city (about 25%) with ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity()
        async function processCityIDs(remainingCityIds) {
            remainingCityIds = remainingCityIds.filter(cityId => !processedCityIds.includes(cityId));
            while (remainingCityIds.length > 0) {
                const cityId = remainingCityIds.shift(); // Take the first city ID
                try {
                    const loadedCity = await loadCity(cityId);
                    let cityData = AllianceCitiesArr.find(city => city.Base_Id === cityId); // Find the existing city object in AllianceCitiesArr and update its properties
                    if (cityData) {
                        Object.assign(cityData, {
                            Base_Found_Step: loadedCity.get_FoundStep(),
                            Base_is_Ghost: loadedCity.get_IsGhostMode(),
                            Base_Tiberium_per_Hour: loadedCity.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Tiberium, true, true),
                            Base_Crystal_per_Hour: loadedCity.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Crystal, true, true),
                            Base_Power_per_Hour: loadedCity.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Power, true, true),
                            Base_Credit_per_Hour: (loadedCity.get_CityCreditsProduction().Delta + loadedCity.get_CityCreditsProduction().ExtraBonusDelta) * 3600,
                            Base_Base_Level: loadedCity.get_LvlBase(),
                            Base_Defense_Level: loadedCity.get_LvlDefense(),
                            Base_Offense_Level: loadedCity.get_LvlOffense(),
                            Base_Construction_Yard_Level: loadedCity.get_ConstructionYardLevel(),
                            Base_Command_Center_Level: loadedCity.get_CommandCenterLevel(),
                            processedTimestamp: new Date().toISOString()
                        });
                    }
                    processedCityIds.push(cityId);
                    await Lister.set(wid + 'AllianceCitiesArr', AllianceCitiesArr);
                    localStorage.setItem(wid + 'processedCityIds', JSON.stringify(processedCityIds));
                    eventBus.dispatch("cityDataAdded", cityData);
                    progressBar(processedCityIds.length, AllianceCitiesArr.length, "Alliance Cities");
                } catch (error) {
                    console.error(`Error loading City ID ${cityId}:`, error);
                }
            }
            if (remainingCityIds.length === 0) {
                localStorage.removeItem(wid + 'processedCityIds'); // Clear processedCityIds from localStorage on completion to allow refresh
            }
        }
        /*
         * Points Of Interest
         */
        function getPOIs() {
            timestamp = performance.now();
            qxApp.showMainOverlay(false); // Switch to region view
            webfrontend.gui.UtilView.centerCoordinatesOnRegionViewWindow(Math.floor(mainData.get_Server().get_WorldWidth() / 2), Math.floor(mainData.get_Server().get_WorldHeight() / 2)); // Center map on region view
            waitForMapAreaResize(region).then(() => {
                return processPOIs(region, timestamp)
            }); // Wait for the map area resize to complete and process all RegionPointOfInterest (except tunnel exit)
        }
        // Calculate ZoomFactor for your window width and height. The bigger ZoomFactor is chosen to ensure the map fills the window and crops off whatever doesn't fit... get_VisAreaComplete() will return 'false' otherwise.
        function calculateZoomFactor() {
            const fullMapWidth = region.get_MaxXPosition(); // 102400
            const fullMapHeight = region.get_MaxYPosition(); // 76800
            const viewableWidth = window.innerWidth;
            const viewableHeight = window.innerHeight;
            const zoomFactorWidth = Math.ceil(viewableWidth / fullMapWidth * 1000) / 1000;
            const zoomFactorHeight = Math.ceil(viewableHeight / fullMapHeight * 1000) / 1000;
            return Math.max(zoomFactorWidth, zoomFactorHeight);
        }
        // Set the proper zoom on region view and wait for objects to be available... get_VisAreaComplete() must return "true"
        function waitForMapAreaResize(region) {
            cfg.GetInstance().SetConfig(cfg.CONFIG_VIS_REGION_MINZOOM, false); // Uncheck 'Allow max zoom out' in game video options
            cfg.GetInstance().SaveToDB(); //Save settings
            const getMinZoomMethod = region.get_MinZoomFactor.toString().match(/\$I\.[A-Z]{6}\.([A-Z]{6});?}/)?.[1]; // Extract the `getMinZoomFactor` method dynamically.
            ClientLib.Vis.Region.Region[getMinZoomMethod] = calculateZoomFactor(); // Modify the MinZoomFactor to be able to zoom out further
            region.set_ZoomFactor(calculateZoomFactor()); // Zoom out the region view to visualize the entire world... bird's eye view
            return new Promise((resolve) => {
                const checkResizeComplete = setInterval(() => {
                    if (region.get_VisAreaComplete()) {
                        clearInterval(checkResizeComplete);
                        resolve();
                    }
                }, 100);
            });
        }

        async function processPOIs(region, timestamp) {
            const rangeX = mainData.get_Server().get_WorldWidth();
            const rangeY = mainData.get_Server().get_WorldHeight();
            const maxLevel = mainData.get_Server().get_MaxCenterLevel();
            const POIScore = Array.from({
                length: maxLevel + 1
            }, (_, i) => ClientLib.Base.PointOfInterestTypes.GetScoreByLevel(i));
            const gridWidth = region.get_GridWidth();
            const gridHeight = region.get_GridHeight();
            AllPOIs = [];
            for (let x = -rangeX; x <= rangeX; x++) {
                for (let y = -rangeY; y <= rangeY; y++) {
                    const xPos = x * gridWidth;
                    const yPos = y * gridHeight;
                    const visObject = region.GetObjectFromPosition(xPos, yPos);
                    if (!visObject || visObject.get_VisObjectType() !== ClientLib.Vis.VisObject.EObjectType.RegionPointOfInterest || visObject.get_Name() === 'Tunnel exit') {
                        continue;
                    }
                    const poi = Object.assign({}, poiTemplate, {
                        Level: visObject.get_Level(),
                        Name: visObject.get_Name().split(' ')[0],
                        Coords: `${x}:${y}`,
                        Alliance: visObject.get_OwnerAllianceName(),
                        Score: POIScore[visObject.get_Level()],
                        Type: visObject.get_Type(),
                        Sector: calculateMetric(x, y, 'sector'),
                        Distance: calculateMetric(x, y, 'distance')
                    });
                    AllPOIs.push(poi);
                }
            }
            AllPOIs.sort((a, b) => b.Level - a.Level || a.Type - b.Type);
            console.log(`%cPoints of Interest (${AllPOIs.length}) list done in ${Math.round(performance.now() - timestamp) / 1000} seconds`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
            region.set_ZoomFactor(1);
            await Lister.set(wid + 'AllPOIs', AllPOIs); // Save to IndexedDB
            eventBus.dispatch('POIs_Refreshed', AllPOIs);
            return AllPOIs;
        }
        /*
         * Build UI
         */
        function mainUI() {
            const listerWindow = new qx.ui.window.Window("Lister");
            listerWindow.setLayout(new qx.ui.layout.VBox());
            const tabView = new qx.ui.tabview.TabView();
            listerWindow.add(tabView, {
                flex: 1
            });
            // Add tabs
            const allianceTab = tabAllianceCities();
            tabView.add(allianceTab);
            tabPointsOfInterest(tabView, AllPOIs);
            // Display the window
            qx.core.Init.getApplication().getRoot().add(listerWindow);
            listerWindow.open();
        }
        // Alliance cities scan UI
        function tabAllianceCities() {
            const allianceCitiesTab = new qx.ui.tabview.Page("Alliance Cities"); // Create Alliance Cities tab
            allianceCitiesTab.setLayout(new qx.ui.layout.VBox());
            // Table setup
            const columnNames = Object.keys(AllianceCitiesTemplate);
            const tableModel = new qx.ui.table.model.Simple();
            tableModel.setColumns(columnNames);
            const allianceCitiesTable = new qx.ui.table.Table(tableModel).set({
                width: 1250,
                height: 600,
                decorator: "main",
                showCellFocusIndicator: false,
            });
            allianceCitiesTable.getChildControl("statusbar").setTextColor("darkgreen");
            allianceCitiesTable.setAdditionalStatusBarText(` / ${getAllianceCitiesCount()} cities`);
            const tableColumnModel = allianceCitiesTable.getTableColumnModel();
            const cityRowMap = {}; // Map to track row indices by City ID
            // Default visible columns
            const defaultVisibleColumns = ["Player_Name", "Player_Faction", "Base_Name", "Base_Coords", "Base_Tiberium_per_Hour", "Base_Crystal_per_Hour", "Base_Power_per_Hour", "Base_Credit_per_Hour", "Base_Base_Level", "Base_Defense_Level", "Base_Offense_Level", "processedTimestamp"];
            columnNames.forEach((columnName, index) => {
                tableColumnModel.setColumnVisible(index, defaultVisibleColumns.includes(columnName));
            });
            // Renderer setup
            const createRenderer = (formatter) => {
                const renderer = new qx.ui.table.cellrenderer.Default();
                renderer._getContentHtml = formatter;
                return renderer;
            };
            const booleanColumns = [10, 14, 30];
            const compactNumberColumns = [6, 7, 8, 9, 11, 12, 13, 15, 16, 17, 19, 25, 31, 32, 33, 34];
            const allianceLinkColumns = [1, 20];
            booleanColumns.forEach(index => tableColumnModel.setDataCellRenderer(index, new qx.ui.table.cellrenderer.Boolean()));
            compactNumberColumns.forEach(index => tableColumnModel.setDataCellRenderer(index, createRenderer(cellInfo => webfrontend.phe.cnc.gui.util.Numbers.formatNumbersCompact(cellInfo.value))));
            allianceLinkColumns.forEach(index => tableColumnModel.setDataCellRenderer(index, createRenderer(cellInfo => webfrontend.gui.util.BBCode.createAllianceLinkText(cellInfo.value))));
            tableColumnModel.setDataCellRenderer(3, createRenderer(cellInfo => webfrontend.gui.util.BBCode.createPlayerLinkText(cellInfo.value)));
            tableColumnModel.setDataCellRenderer(26, createRenderer(cellInfo => {
                const [x, y] = cellInfo.value.split(":");
                return webfrontend.gui.util.BBCode.createCoordsLinkText(cellInfo.value, parseInt(x), parseInt(y));
            }));
            tableColumnModel.setDataCellRenderer(5, createRenderer(cellInfo => {
                const factionImages = {
                    "0": "https://eaassets-a.akamaihd.net/cncalliancesgame/cdn/data/851b7bd703fac31ba86a8b5ece008f4d.png",
                    "1": "https://eaassets-a.akamaihd.net/cncalliancesgame/cdn/data/b72c8e05f0cd8dc0a37618c644112143.png",
                    "2": "https://eaassets-a.akamaihd.net/cncalliancesgame/cdn/data/13d0feaa973172ea7c55622c314feea2.png"
                };
                return factionImages[cellInfo.value] ? `<img src="${factionImages[cellInfo.value]}" style="height:20px;width:20px;">` : cellInfo.value;
            }));
            allianceCitiesTab.add(allianceCitiesTable, {
                flex: 1
            });
            allianceCitiesTab.add(setupAllianceCitiesFooterContainer());
            //Production window
            function createPlayerResourceWindow() {
                const resourceWindow = new qx.ui.window.Window("Alliance members total resource production per hour by type").set({
                    width: 550,
                    height: 600,
                    layout: new qx.ui.layout.VBox(),
                    showStatusbar: false
                });
                resourceWindow.center();
                const columnData = [{
                    label: "Player",
                    icon: "webfrontend/battleview/neutral/gui/player_icn_own_alliance.png"
                }, {
                    label: "Power",
                    icon: Icons.Power
                }, {
                    label: "Credit",
                    icon: Icons.Credit
                }, {
                    label: "Tiberium",
                    icon: Icons.Tiberium
                }, {
                    label: "Crystal",
                    icon: Icons.Crystal
                }];
                const playerData = {};
                AllianceCitiesArr.forEach(city => {
                    const playerName = city.Player_Name;
                    if (!playerData[playerName]) {
                        playerData[playerName] = {
                            power: 0,
                            credits: 0,
                            tiberium: 0,
                            crystal: 0
                        };
                    }
                    playerData[playerName].power += city.Base_Power_per_Hour;
                    playerData[playerName].credits += city.Base_Credit_per_Hour;
                    playerData[playerName].tiberium += city.Base_Tiberium_per_Hour;
                    playerData[playerName].crystal += city.Base_Crystal_per_Hour;
                });
                const tableData = Object.entries(playerData).map(([player, resources]) => [player, resources.power, resources.credits, resources.tiberium, resources.crystal]);
                const tableModel = new qx.ui.table.model.Simple().set({
                    columns: columnData.map(col => col.label),
                    data: tableData
                });
                const table = new qx.ui.table.Table(tableModel).set({
                    showCellFocusIndicator: false
                });
                resourceWindow.add(table, {
                    flex: 1
                });
                const tableColumnModel = table.getTableColumnModel();
                tableColumnModel.setDataCellRenderer(0, createRenderer(cellInfo => webfrontend.gui.util.BBCode.createPlayerLinkText(cellInfo.value)));
                [1, 2, 3, 4].forEach(index => tableColumnModel.setDataCellRenderer(index, createRenderer(cellInfo => webfrontend.phe.cnc.gui.util.Numbers.formatNumbersCompact(cellInfo.value))));
                columnData.forEach((col, index) => {
                    const headerRenderer = new qx.ui.table.headerrenderer.Icon(col.icon, col.label);
                    tableColumnModel.setHeaderCellRenderer(index, headerRenderer);
                });
                qxApp.getRoot().add(resourceWindow);
                resourceWindow.open();
                return resourceWindow;
            }
            // UI Helper functions
            function setupAllianceCitiesFooterContainer() {
                const allianceCitiesFooterContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox());
                const buttons = [{
                    label: "Clear Cache",
                    icon: Icons.ClearCache,
                    handler: async () => {
                        sessionStorage.clear();
                        tableModel.setData([]);
                        localStorage.removeItem(wid + 'processedCityIds');
                        await Lister.remove(wid + 'AllianceCitiesArr');
                        localStorage.setItem(wid + 'cacheCleared', 'true');
                        processedCityIds = [];
                        AllianceCitiesArr = [];
                        Object.keys(cityRowMap).forEach(key => delete cityRowMap[key]);
                        updateFooterWithOldestTimestamp();
                    },
                    tip: "Clear table data."
                }, {
                    label: "Refresh",
                    icon: Icons.Refresh,
                    handler: async () => {
                        await getAllianceCities();
                        updateFooterWithOldestTimestamp();
                    },
                    tip: "Populate/Update table data."
                }, {
                    label: "Download CSV",
                    icon: Icons.DownloadCSV,
                    handler: () => {
                        getCSV(AllianceCitiesArr, "AllianceCities")
                    },
                    tip: "Download table data in CSV (comma-separated values) format."
                }, {
                    label: "Res Production",
                    icon: Icons.Production,
                    handler: createPlayerResourceWindow,
                    tip: "Total resource producton per hour for each alliance member... A full scan is needed for proper values."
                }];
                buttons.forEach(({
                    label,
                    icon,
                    handler,
                    tip
                }) => {
                    const button = new qx.ui.form.Button(label, icon);
                    button.setToolTipText(tip);
                    button.addListener("execute", handler);
                    allianceCitiesFooterContainer.add(button);
                });
                const offenseLevelFilterSelectBox = new qx.ui.form.SelectBox().set({
                    width: 150,
                    toolTipText: "Filter Base Offense Level"
                });
                offenseLevelFilterSelectBox.add(new qx.ui.form.ListItem("Offense Level filter"));
                for (let i = 1; i <= 10; i++) {
                    offenseLevelFilterSelectBox.add(new qx.ui.form.ListItem(`Show ${i}${i === 1 ? "st" : i === 2 ? "nd" : i === 3 ? "rd" : "th"} highest OL`));
                }
                offenseLevelFilterSelectBox.addListener("changeSelection", (e) => {
                    const selectedRank = offenseLevelFilterSelectBox.getSelection()[0].getLabel().match(/\d+/);
                    if (selectedRank) {
                        filterCitiesByOffenseLevel(parseInt(selectedRank[0], 10));
                    } else {
                        tableModel.setData(AllianceCitiesArr.map(city => Object.values(city)));
                    }
                });
                allianceCitiesFooterContainer.add(offenseLevelFilterSelectBox);

                function updateFooterWithOldestTimestamp() {
                    const validTimestamps = AllianceCitiesArr.map(city => new Date(city.processedTimestamp)).filter(date => date instanceof Date && !isNaN(date.getTime()) && date.getTime() > 0);
                    const oldestTimestamp = validTimestamps.length > 0 ? new Date(Math.min(...validTimestamps)) : null;
                    let footnoteAtom = allianceCitiesFooterContainer.getUserData("footnoteAtom");
                    if (!footnoteAtom) {
                        footnoteAtom = new qx.ui.basic.Atom();
                        allianceCitiesFooterContainer.add(footnoteAtom);
                        allianceCitiesFooterContainer.setUserData("footnoteAtom", footnoteAtom);
                    }
                    if (oldestTimestamp) {
                        const timeDifference = Date.now() - oldestTimestamp.getTime();
                        const formattedTime = msToTime(timeDifference);
                        footnoteAtom.setLabel(`Oldest Processed Timestamp: ${formattedTime} ago`);
                    } else {
                        footnoteAtom.setLabel("Oldest Processed Timestamp: No data available");
                    }
                    footnoteAtom.setTextColor("darkgreen");
                }
                updateFooterWithOldestTimestamp();
                return allianceCitiesFooterContainer;
            }

            function filterCitiesByOffenseLevel(levelRank) {
                const filteredCities = Object.values(AllianceCitiesArr.reduce((map, city) => {
                    (map[city.Player_Id] = map[city.Player_Id] || []).push(city);
                    return map;
                }, {})).map(cities => {
                    cities.sort((a, b) => b.Base_Offense_Level - a.Base_Offense_Level);
                    return cities[levelRank - 1] && cities[levelRank - 1].Base_Offense_Level > 0 ? cities[levelRank - 1] : null;
                }).filter(Boolean);
                tableModel.setData(filteredCities.map(city => Object.values(city)));
            }

            function addCityRow(cityData) {
                const cityId = cityData.Base_Id;
                if (Object.values(cityData).every(value => value !== null)) {
                    if (cityRowMap.hasOwnProperty(cityId)) {
                        tableModel.setRows([Object.values(cityData)], cityRowMap[cityId]);
                    } else {
                        cityRowMap[cityId] = tableModel.getRowCount();
                        tableModel.addRows([Object.values(cityData)]);
                    }
                }
            }
            AllianceCitiesArr.forEach(addCityRow);
            eventBus.subscribe("cityDataAdded", (e) => addCityRow(e.getData()));
            return allianceCitiesTab;
        }
        // Points Of Interest UI
        async function tabPointsOfInterest(tabView, data) {
            const existingTab = tabView.getChildren().find(tab => tab.getLabel() === "Points of Interest");
            if (existingTab) {
                const tableModel = existingTab.getUserData("tableModel");
                updateTableData(data, tableModel);
                updateSelectBoxes(poiNameSelectBox, poiOwnerSelectBox, data);
                return;
            }
            const poiTimestampKey = wid + 'poiTimestampLabel';
            const poiTab = new qx.ui.tabview.Page("Points of Interest");
            poiTab.setLayout(new qx.ui.layout.VBox());
            const tableModel = new qx.ui.table.model.Simple();
            tableModel.setColumns(Object.keys(poiTemplate));
            poiTab.setUserData("tableModel", tableModel);
            const storedTimestamp = await Lister.get(poiTimestampKey);
            const poiTimestamp = new qx.ui.basic.Atom().set({
                label: storedTimestamp ? `Last POI scan age: ${msToTime(Date.now() - storedTimestamp)}` : "No data available... Refresh required.",
                textColor: "darkgreen"
            });
            const poiNameSelectBox = new qx.ui.form.SelectBox().set({
                toolTipText: "Filter POIs by name/type"
            });
            const poiOwnerSelectBox = new qx.ui.form.SelectBox().set({
                width: 170,
                toolTipText: "Filter POIs by owner"
            });
            updateTableData(data, tableModel);
            updateSelectBoxes(poiNameSelectBox, poiOwnerSelectBox, data);
            const poiTable = new qx.ui.table.Table(tableModel);
            poiTable.getChildControl("statusbar").setTextColor("darkgreen");
            [0, 2, 3, 4, 5, 7].forEach(index =>
                poiTable.getTableColumnModel().setDataCellRenderer(index, new qx.ui.table.cellrenderer.Html())
            );
            const poiFooterContainer = buildPoiFooterContainer(data, tableModel, poiNameSelectBox, poiOwnerSelectBox);
            poiTab.add(poiTable, {
                flex: 1
            });
            poiTab.add(poiFooterContainer);
            tabView.add(poiTab);
            eventBus.subscribe("POIs_Refreshed", async (e) => {
                const refreshedData = e.getData();
                tabView.setUserData("poiData", refreshedData);
                updateTableData(refreshedData, tableModel);
                updateSelectBoxes(poiNameSelectBox, poiOwnerSelectBox, refreshedData);
                await Lister.set(poiTimestampKey, Date.now()); // Save timestamp to IndexedDB
                poiTimestamp.setLabel(`Last POI scan age: ${msToTime(Date.now() - (await Lister.get(poiTimestampKey)))}`);
            });

            function updateTableData(filteredData, tableModel) {
                const tableData = filteredData.map(poi =>
                    Object.keys(poiTemplate).map(key => poi[key])
                );
                tableModel.setData(tableData);
                filteredData.forEach((poi, index) => {
                    const formattedScore = webfrontend.phe.cnc.gui.util.Numbers.formatNumbers(poi.Score);
                    const formattedDistance = Math.round(poi.Distance);
                    const [x, y] = poi.Coords.split(":");
                    const coordsLink = webfrontend.gui.util.BBCode.createCoordsLinkText(poi.Coords, parseInt(x), parseInt(y));
                    const allianceLink = poi.Alliance && poi.Alliance.trim() ? webfrontend.gui.util.BBCode.createAllianceLinkText(poi.Alliance) : "No Alliance";
                    const formattedValues = {
                        Coords: coordsLink,
                        Alliance: allianceLink,
                        Score: formattedScore,
                        Distance: formattedDistance,
                    };
                    Object.keys(formattedValues).forEach(key => {
                        const col = Object.keys(poiTemplate).indexOf(key);
                        if (col !== -1) {
                            tableModel.setValue(col, index, formattedValues[key]);
                        }
                    });
                });
            }

            function buildPoiFooterContainer(data, tableModel, poiNameSelectBox, poiOwnerSelectBox) {
                const refreshButton = new qx.ui.form.Button("Refresh", Icons.Refresh).set({
                    toolTipText: "Refresh POIs"
                });
                const downloadButton = new qx.ui.form.Button("Download CSV", Icons.DownloadCSV).set({
                    toolTipText: "Download POIs as CSV"
                });
                refreshButton.addListener("execute", getPOIs);
                downloadButton.addListener("execute", () => {
                    getCSV(AllPOIs, "POIs");
                });
                poiNameSelectBox.addListener("changeSelection", applyFilters);
                poiOwnerSelectBox.addListener("changeSelection", applyFilters);
                updateSelectBoxes(poiNameSelectBox, poiOwnerSelectBox, data);
                const container = new qx.ui.container.Composite(new qx.ui.layout.HBox());
                container.add(refreshButton);
                container.add(downloadButton);
                container.add(poiNameSelectBox);
                container.add(poiOwnerSelectBox);
                container.add(poiTimestamp);
                return container;
            }

            function updateSelectBoxes(poiNameSelectBox, poiOwnerSelectBox, data) {
                const uniqueNames = Array.from(new Set(data.map(poi => poi.Name)));
                const uniqueAlliances = Array.from(new Set(data.map(poi => poi.Alliance || "No Alliance")));
                poiNameSelectBox.removeAll();
                poiNameSelectBox.add(new qx.ui.form.ListItem("All Names"));
                uniqueNames.forEach(name => poiNameSelectBox.add(new qx.ui.form.ListItem(name)));
                poiOwnerSelectBox.removeAll();
                poiOwnerSelectBox.add(new qx.ui.form.ListItem("All Alliances"));
                uniqueAlliances.forEach(alliance => {
                    const listItem = new qx.ui.form.ListItem(alliance);
                    if (alliance === "No Alliance") {
                        listItem.setIcon("webfrontend/battleview/neutral/gui/icn_mutants.png");
                        listItem.setTextColor("yellow");
                    }
                    poiOwnerSelectBox.add(listItem);
                });
            }

            function applyFilters() {
                const nameSelection = poiNameSelectBox.getSelection()[0];
                const allianceSelection = poiOwnerSelectBox.getSelection()[0];
                const selectedName = nameSelection ? nameSelection.getLabel() : "All Names";
                const selectedAlliance = allianceSelection ? allianceSelection.getLabel() : "All Alliances";
                let filteredData = tabView.getUserData("poiData") || data;
                if (selectedName !== "All Names") {
                    filteredData = filteredData.filter(poi => poi.Name === selectedName);
                }
                if (selectedAlliance === "No Alliance") {
                    filteredData = filteredData.filter(poi => !poi.Alliance || poi.Alliance.trim() === "");
                } else if (selectedAlliance !== "All Alliances") {
                    filteredData = filteredData.filter(poi => poi.Alliance === selectedAlliance);
                }
                updateTableData(filteredData, tableModel);
            }
        }
        /*
         * Helper functions
         */
        // List to CSV
        function getCSV(data, name) {
            if (!data || data.length === 0) {
                console.warn("No data available for CSV export.");
                return;
            }
            const headers = Object.keys(data[0]).join(",");
            const rows = data.map(item => Object.values(item).join(",")).join("\n");
            const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
            const encodedUri = encodeURI(csvContent);
            const downloadLink = document.createElement("a");
            downloadLink.href = encodedUri;
            downloadLink.download = new Date().toISOString().slice(0, 10) + "_" + wid + "_" + name + ".csv";
            downloadLink.dispatchEvent(new MouseEvent('click'));
        }
        // Progress bar
        function progressBar(pbIndex, pbLength, pbName, targetContainer = null) {
            const optionsBar = qxApp.getOptionsBar().getLayoutParent().getChildren()[0].getChildren()[2];
            const container = targetContainer ? targetContainer : optionsBar;
            let pbContainer = container.getChildren().find(child => child.getUserData("pbContainer"));
            if (!pbContainer) {
                pbContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
                    padding: 0,
                    width: 115,
                    decorator: new qx.ui.decoration.Decorator().set({
                        width: 1,
                        style: "solid",
                        color: "black",
                        backgroundColor: "transparent",
                    }),
                });
                pbContainer.setUserData("pbContainer", true);
                targetContainer ? container.add(pbContainer) : optionsBar.addAt(pbContainer, 1);
            }
            let pb = pbContainer.getChildren()[0];
            if (!pb) {
                pb = new qx.ui.basic.Label();
                pb.set({
                    value: `${pbIndex} / ${pbLength} ${pbName}`,
                    width: 0,
                    height: 11,
                    maxWidth: 113,
                    textColor: "black",
                    font: qx.bom.Font.fromString("9px tahoma"),
                    backgroundColor: "white",
                    decorator: "main",
                });
                pbContainer.add(pb);
            }
            pb.set({
                value: `${pbIndex} / ${pbLength} ${pbName}`,
                width: pbIndex / pbLength * pb.getMaxWidth()
            });
            if (pbIndex === pbLength) {
                pbContainer.getLayoutParent().remove(pbContainer);
            }
        }
        // Convert milliseconds to time format "hh:mm:ss:mmm"
        function msToTime(milliseconds) {
            const hours = Math.floor(milliseconds / (1000 * 60 * 60));
            const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
            const millisecondsLeft = Math.floor(milliseconds % 1000);
            return `${hours.toString().padStart(2, '0')}h:${minutes.toString().padStart(2, '0')}m:${seconds.toString().padStart(2, '0')}s:${millisecondsLeft.toString().padStart(3, '0')}ms`;
        }
        // Returns angle, distance, clock position (the relative direction of your object coords (1st and 2nd arguments) described using the analogy of a 12-hour clock to describe angles and directions) or sector between 2 points... The 2nd point (4th and 5th arguments) is the center by default... can be replaced with any other object coords. Example usage: calculateMetric(407, 390, 'clock', 400, 400); or calculateMetric(407, 390, 'sector');
        function calculateMetric(xB, yB, metricType, xA = centerX, yA = centerY) {
            const deltaX = xB - xA;
            const deltaY = yB - yA;
            const calculations = {
                angle: () => (360 + Math.atan2(deltaY, deltaX) * (180 / Math.PI)) % 360,
                distance: () => Math.hypot(deltaX, deltaY),
                sector: () => {
                    if (xA !== centerX || yA !== centerY) {
                        throw new Error("The 'sector' metric can only be calculated from the default center coordinates.");
                    }
                    const angle = (Math.atan2(centerX - xB, yB - centerY) * sectorNames.length) / (2 * Math.PI) + sectorNames.length + 0.5;
                    return qxApp.tr(`tnf:${sectorNames[Math.floor(angle) % sectorNames.length]} abbr`);
                },
                clock: () => {
                    const angle = Math.atan2(yA - yB, xA - xB);
                    const normalizedAngle = (angle * 180 / Math.PI + 90 + 360) % 360; // Shift by 90 degrees for clock alignment
                    const clockIndex = Math.round((normalizedAngle / 360) * 12) % 12;
                    return clockPositions[clockIndex];
                },
            };
            if (!calculations[metricType]) {
                throw new Error("Invalid metricType. Use 'angle', 'distance', 'sector', or 'clock'.");
            }
            return calculations[metricType]();
        }
        // Get number of alliance bases
        function getAllianceCitiesCount() {
            const allianceData = mainData.get_Alliance().get_MemberData().d;
            const memberIds = mainData.get_Alliance().getMemberIds().l;
            const numAllianceBases = memberIds.reduce((acc, memberId) => {
                return acc + allianceData[memberId].Bases;
            }, 0);
            return numAllianceBases;
        }
        /*
         * Initialization logic
         */
        // Add Scripts menu entries
        function init() {
            const ScriptsButton = qxApp.getMenuBar().getScriptsButton();
            const children = ScriptsButton.getMenu().getChildren();
            ScriptsButton.Add("Lister UI", Icons.Lister);
            qx.event.Timer.once(() => {
                const children = ScriptsButton.getMenu().getChildren();
                children[children.length - 1].addListener("execute", () => {
                    mainUI();
                });
            }, null, 50); // Use a timer to delay adding listeners until the menu items are fully added
        }
        init();
        console.log(`%c${scriptName} loaded`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
    }
    ListerUIScript();
})();
