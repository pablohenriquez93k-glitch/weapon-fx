// Weapon FX: monta en memoria los .json de unidades y municion con los efectos del nivel elegido.
// Orden del sistema de archivos (confirmado 2026-09-25): mods > memoria > juego. Por eso el mod NO trae esos .json:
// se leen del juego en el momento, se cambian SOLO las claves de efecto y se montan con api.file.mountMemoryFiles.
// Escenas: new_game y connect_to_game montan antes de la partida (sin pantalla negra: al conectar el juego arma las
// fichas con la memoria). live_game comprueba; si la memoria se perdio, remonta + setUnitSpecTag + reloadScene (F5).
// Si algo falla, quedan los efectos del juego original y el error queda en el log con "[Weapon FX]".
(function () {
    'use strict';
    var WFX = window.WeaponFX = window.WeaponFX || {};
    var BASE = 'coui://ui/mods/com.pa.pabloandclaude.weaponfx/';
    var MARCA = '/ui/mods/com.pa.pabloandclaude.weaponfx/montado.json';   // ruta que no existe en el mod: solo vive en memoria
    var NIVEL_DEFECTO = 'alto';
    var SIN_SKIN = 'ninguna';
    // Color de equipo: copia de cada .pfx elegido con "useArmyColor": 1 en cada emisor (clave de EMISOR, como fab_spray.pfx;
    // probado en la estela 2026-09-26). Vive solo en memoria bajo esta carpeta: el mod no trae archivos extra.
    var EQUIPO = '/pa/effects/specs/wfx_equipo';
    var escena = (location.pathname.split('/').slice(-2, -1)[0]) || '?';

    function log(m) { console.log('[Weapon FX] ' + escena + ': ' + m); }
    function error(m) { console.error('[Weapon FX] ERROR ' + escena + ': ' + m); }

    function leer(ruta) {
        return $.ajax({ url: 'coui:/' + ruta, dataType: 'text', cache: false }).then(function (t) { return JSON.parse(t); });
    }

    // ---------- ajustes: {base, fam: {familia: nivel}, uni: {unidad: nivel}, uf: {'unidad|familia': nivel}, efe: {id: nivel}} ----------
    // Nivel: Settings > Weapon FX (grupo weapon_fx, clave level), guardado por el juego solo con Save.
    // "personalizado": base y excepciones en weapon_fx.custom (texto JSON de editor_personalizado.js; se guarda con Save).
    // Skin (1.0.1): mismo esquema en a.skin = {base, fam, uni, uf, efe}; 'ninguna' = efectos Weapon FX sin skin.
    // Fuera de Personalizado: grupo weapon_fx, clave skin. Un efecto compartido (p. ej. Dox y Manhattan) tiene un solo id.
    function mapa(m, base) { m = m && typeof m === 'object' ? m : {}; return { base: m.base || base, fam: m.fam || {}, uni: m.uni || {}, uf: m.uf || {}, efe: m.efe || {} }; }
    WFX.ajustes = function () {
        var nivel = NIVEL_DEFECTO, skin = SIN_SKIN;
        try { nivel = api.settings.value('weapon_fx', 'level') || NIVEL_DEFECTO; } catch (e) { error('no pude leer el nivel: ' + e); }
        try { skin = api.settings.value('weapon_fx', 'skin') || SIN_SKIN; } catch (e) { error('no pude leer la skin: ' + e); }
        var equipo = false;
        try { equipo = api.settings.value('weapon_fx', 'team_color') === 'ON'; } catch (e) { error('no pude leer el color de equipo: ' + e); }
        if (nivel !== 'personalizado') { var r = mapa({}, nivel); r.skin = mapa({}, skin); r.equipo = equipo; return r; }
        var a = null;
        try { a = JSON.parse(api.settings.value('weapon_fx', 'custom') || 'null'); } catch (e) { error('personalizado ilegible: ' + e); }
        a = a && typeof a === 'object' ? a : {};
        var out = mapa(a, NIVEL_DEFECTO);
        out.skin = mapa(a.skin, skin);
        out.equipo = equipo;
        return out;
    };
    function elegir(m, id, cat) {
        var d = cat.efectos[id] || {};
        // efecto -> familia dentro de la unidad -> unidad -> familia general -> base
        return m.efe[id] || m.uf[d.unidad + '|' + d.familia] || m.uni[d.unidad] || m.fam[d.familia] || m.base;
    }
    WFX.nivelDe = function (id, cat, a) { return elegir(a, id, cat); };
    WFX.skinDe = function (id, cat, a) {
        var s = a.skin ? elegir(a.skin, id, cat) : SIN_SKIN;
        return s !== SIN_SKIN && cat.skins && cat.skins[s] ? s : SIN_SKIN;   // skin borrada del mod -> sin skin
    };
    // ruta del efecto: sin skin, Original = el del juego; con skin, Original = wfx/<skin>/original (si el juego lo tiene).
    // El mod trae cada pfx distinto una vez (wfx/h/<huella>.pfx): el indice del catalogo dice cual toca a <skin>/<nivel>.
    WFX.rutaDe = function (e, cat, a) {
        var n = WFX.nivelDe(e.id, cat, a), s = WFX.skinDe(e.id, cat, a);
        if (n === 'original' && (s === SIN_SKIN || !e.van)) { return e.van || ''; }
        if (!cat.indice) {
            cat.indice = {};
            $.each(cat.rutas, function (i, r) { cat.indice[r] = i; });
        }
        var d = cat.efectos[e.id], h = d && d.r[cat.indice[(s === SIN_SKIN ? '' : s + '/') + n]];
        return h === null || h === undefined ? (e.van || '') : cat.wfx + 'h/' + cat.pfx[h] + '.pfx';
    };
    function firma(cat, a) { return cat.version + '|' + JSON.stringify([a.base, a.fam, a.uni, a.uf, a.efe, a.skin, a.equipo]); }

    // ---------- catalogo ----------
    var catalogo = null;
    WFX.catalogo = function () {
        if (catalogo) { return $.Deferred().resolve(catalogo).promise(); }
        return $.ajax({ url: BASE + 'efectos.json', dataType: 'text', cache: false })
            .then(function (t) { catalogo = JSON.parse(t); return catalogo; });
    };

    // ---------- armar un .json ----------
    // Si el archivo no trae el objeto padre de la clave (fx_trail, events.fired...), se copia de la fusion de su
    // cadena base_spec (igual que scripts/verificar_catalogo.py): si no, se pierden campos heredados (offset, audio_cue).
    function mezclar(a, b) {
        var r = JSON.parse(JSON.stringify(a || {}));
        $.each(b || {}, function (k, v) {
            r[k] = (v && typeof v === 'object' && !$.isArray(v) && r[k] && typeof r[k] === 'object' && !$.isArray(r[k])) ? mezclar(r[k], v) : v;
        });
        return r;
    }
    function fusion(ruta, cache) {
        if (!ruta) { return $.Deferred().resolve({}).promise(); }
        return (cache[ruta] || (cache[ruta] = leer(ruta))).then(function (d) {
            return fusion(d.base_spec, cache).then(function (base) { return mezclar(base, d); });
        }, function () { return $.Deferred().resolve({}).promise(); });
    }

    function armar(ruta, cambios, cat, a, cache, pfx) {
        return (cache[ruta] || (cache[ruta] = leer(ruta))).then(function (orig) {
            return fusion(ruta, cache).then(function (fus) {
                var d = JSON.parse(JSON.stringify(orig));
                $.each(cambios, function (_, c) {
                    var valores = $.map(c.efectos, function (e) {
                        var r = WFX.rutaDe(e, cat, a);
                        if (!a.equipo || !r) { return [r]; }
                        pfx[r] = true;
                        return [EQUIPO + r];
                    });
                    var texto = c.plantilla.replace(/\{(\d+)\}/g, function (_, i) { return valores[+i]; }).split(/\s+/).join(' ').trim();
                    var nodo = d, her = fus;
                    for (var i = 0; i < c.ruta.length - 1; i++) {
                        var k = c.ruta[i];
                        her = her && typeof her === 'object' ? her[k] : null;
                        if (!nodo[k] || typeof nodo[k] !== 'object') {
                            nodo[k] = her && typeof her === 'object' ? JSON.parse(JSON.stringify(her)) : {};
                        }
                        nodo = nodo[k];
                    }
                    nodo[c.ruta[c.ruta.length - 1]] = texto;
                });
                return JSON.stringify(d);
            });
        });
    }

    // ---------- color de equipo ----------
    // Lee cada .pfx elegido (del mod o del juego), pone useArmyColor en cada emisor y lo agrega a archivos con la ruta EQUIPO.
    // Si un .pfx no se puede leer, el efecto queda sin dibujarse: se avisa en el log.
    function equipo(pfx, archivos, fallidos) {
        var rutas = Object.keys(pfx);
        if (!rutas.length) { return $.Deferred().resolve().promise(); }
        return $.when.apply($, $.map(rutas, function (r) {
            return leer(r).then(function (d) {
                $.each(d && d.emitters || [], function (_, em) { em.useArmyColor = 1; });
                archivos[EQUIPO + r] = JSON.stringify(d);
            }, function () { fallidos.push(r + ' (color de equipo)'); return $.Deferred().resolve().promise(); });
        }));
    }

    // ---------- montar ----------
    // Devuelve una promesa con {ok, archivos, fallidos}.
    WFX.montar = function () {
        var t0 = Date.now();
        return WFX.catalogo().then(function (cat) {
            var a = WFX.ajustes(), cache = {}, archivos = {}, fallidos = [], trabajos = [], pfx = {};
            $.each(cat.fichas, function (ruta, cambios) {
                trabajos.push(armar(ruta, cambios, cat, a, cache, pfx).then(
                    function (texto) { archivos[ruta] = texto; },
                    function () { fallidos.push(ruta); return $.Deferred().resolve().promise(); }));
            });
            return $.when.apply($, trabajos).then(function () {
                return equipo(pfx, archivos, fallidos);
            }).then(function () {
                archivos[MARCA] = JSON.stringify({ firma: firma(cat, a), escena: escena, hora: new Date().toString() });
                var listo = $.Deferred();
                api.file.mountMemoryFiles(archivos).then(function () { listo.resolve(true); }, function () { listo.resolve(false); });
                return listo.then(function (montado) {
                    if (!montado) {
                        error('no pude montar los archivos en memoria: quedan los efectos del juego');
                        return { ok: false };
                    }
                    var n = Object.keys(archivos).length - 1;
                    if (fallidos.length) { error(fallidos.length + ' archivo(s) no se pudieron armar (quedan como el juego): ' + fallidos.join(', ')); }
                    log('montado nivel "' + a.base + '"' + (a.equipo ? ' con color de equipo' : '') + ' en ' + n + ' archivo(s) en ' + (Date.now() - t0) + ' ms');
                    return { ok: true, archivos: n, fallidos: fallidos };
                });
            });
        }, function () {
            error('no pude leer el catalogo ' + BASE + 'efectos.json: quedan los efectos del juego');
            return { ok: false };
        });
    };

    // ¿La memoria ya tiene los ajustes actuales?
    WFX.vigente = function () {
        return WFX.catalogo().then(function (cat) {
            var f = firma(cat, WFX.ajustes());
            return leer(MARCA).then(function (m) { return m && m.firma === f; }, function () { return $.Deferred().resolve(false).promise(); });
        }, function () { return false; });
    };

    // Aplicar en plena partida: montar + rehacer fichas (setUnitSpecTag) + recargar la vista (lo mismo que F5).
    // Probado 2026-09-25 (Dox violeta <-> calor, ida y vuelta). Seguro anti-bucle: una recarga cada 20 s como maximo.
    WFX.aplicarEnPartida = function (motivo, pedidoJugador) {
        var ultima = +(sessionStorage.getItem('weaponfx.recarga') || 0);
        if (!pedidoJugador && Date.now() - ultima < 20000) {
            error('recarga pedida otra vez en menos de 20 s (' + motivo + '): no recargo, para no entrar en bucle');
            return;
        }
        WFX.montar().then(function (r) {
            if (!r.ok) { return; }
            sessionStorage.setItem('weaponfx.recarga', String(Date.now()));
            api.game.getUnitSpecTag().then(function (tag) {
                log('recargo la vista (' + motivo + '), tag "' + (tag || '') + '"');
                api.game.setUnitSpecTag(tag || '');
                setTimeout(function () { api.game.debug.reloadScene(api.Panel.pageId); }, 1000);
            });
        });
    };

    // ---------- arranque por escena ----------
    if (escena === 'live_game') {
        api.game.getUnitSpecTag().then(function (tag) {
            if (tag) { log('tag "' + tag + '" (Galactic War u otro modo con fichas propias): Weapon FX no se aplica aqui'); return; }
            WFX.vigente().then(function (ok) {
                if (ok) { log('memoria vigente: efectos listos'); return; }
                error('la memoria no esta (o es de otros ajustes) al entrar a la partida: remonto y recargo la vista');
                WFX.aplicarEnPartida('memoria ausente al entrar');
            });
            // Menu Settings dentro de la partida: al cerrarlo, releer lo guardado. Save -> cambio -> aplicar.
            // Cancel no guarda nada: lo guardado sigue igual y no se toca nada (pedido de Pablo 2026-09-25).
            if (window.model && model.showSettings && model.showSettings.subscribe) {
                model.showSettings.subscribe(function (abierto) {
                    if (abierto) { return; }
                    try { api.settings.loadLocalData(); } catch (e) { error('loadLocalData: ' + e); }
                    WFX.vigente().then(function (ok) {
                        if (!ok) { WFX.aplicarEnPartida('ajustes guardados en el menu', true); }
                    });
                });
            }
        });
    } else {
        WFX.vigente().then(function (ok) {
            if (ok) { log('memoria vigente: nada que hacer'); return; }
            WFX.montar();
        });
    }
})();
