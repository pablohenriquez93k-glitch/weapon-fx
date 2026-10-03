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
    var EQUIPO_GRIS = '/pa/effects/specs/wfx_equipo_gris';   // con skin: colores en gris (ver equipo())
    var escena = (location.pathname.split('/').slice(-2, -1)[0]) || '?';

    function log(m) { console.log('[Weapon FX] ' + escena + ': ' + m); }
    function error(m) { console.error('[Weapon FX] ERROR ' + escena + ': ' + m); }

    // jQuery 2.1.4 (el del juego): una excepcion dentro de .then NO rechaza la promesa, la deja colgada para siempre
    // (y con ella todo el montaje). Por eso cada .then que puede fallar pasa por seguro(): la excepcion = rechazo.
    function seguro(f) {
        return function () {
            try { return f.apply(this, arguments); } catch (e) { return $.Deferred().reject(e).promise(); }
        };
    }
    function leer(ruta) {
        return $.ajax({ url: 'coui:/' + ruta, dataType: 'text', cache: false }).then(seguro(function (t) { return JSON.parse(t); }));
    }

    // ---------- ajustes: {base, fam: {familia: nivel}, uni: {unidad: nivel}, uf: {'unidad|familia': nivel}, efe: {id: nivel}} ----------
    // Nivel: Settings > Weapon FX (grupo weapon_fx, clave level), guardado por el juego solo con Save.
    // "personalizado": base y excepciones en weapon_fx.custom (texto JSON de editor_personalizado.js; se guarda con Save).
    // Skin (1.0.1): mismo esquema en a.skin = {base, fam, uni, uf, efe}; 'ninguna' = efectos Weapon FX sin skin.
    // Fuera de Personalizado: grupo weapon_fx, clave skin. En Personalizado la skin se elige en el editor (Settings oculta
    // la global); si el editor no la trae (guardado antes de 1.1.0), vale la global. Un efecto compartido (p. ej. Dox y Manhattan) tiene un solo id.
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
        out.skin = mapa(a.skin, skin);        out.equipo = equipo;
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
            .then(seguro(function (t) { catalogo = JSON.parse(t); return catalogo; }));
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

    function poner(d, fus, ruta, v) {
        var nodo = d, her = fus;
        for (var i = 0; i < ruta.length - 1; i++) {
            var k = ruta[i];
            her = her && typeof her === 'object' ? her[k] : null;
            if (!nodo[k] || typeof nodo[k] !== 'object') {
                nodo[k] = her && typeof her === 'object' ? JSON.parse(JSON.stringify(her)) : {};
            }
            nodo = nodo[k];
        }
        nodo[ruta[ruta.length - 1]] = v;
    }

    function armar(ruta, cambios, cat, a, cache, pfx) {
        return (cache[ruta] || (cache[ruta] = leer(ruta))).then(function (orig) {
            return fusion(ruta, cache).then(seguro(function (fus) {
                var d = JSON.parse(JSON.stringify(orig));
                $.each(cambios, function (_, c) {
                    var valores = $.map(c.efectos, function (e) {
                        var r = WFX.rutaDe(e, cat, a);
                        if (!a.equipo || !r) { return [r]; }
                        // con skin el color es saturado (dom: rojo 6.7/0.1/0.1) y el del ejercito lo multiplica: va en gris
                        var gris = WFX.skinDe(e.id, cat, a) !== SIN_SKIN;
                        pfx[(gris ? EQUIPO_GRIS : EQUIPO) + r] = r;
                        return [(gris ? EQUIPO_GRIS : EQUIPO) + r];
                    });
                    var texto = c.plantilla.replace(/\{(\d+)\}/g, function (_, i) { return valores[+i]; }).split(/\s+/).join(' ').trim();
                    poner(d, fus, c.ruta, texto);
                });
                // claves visuales de una skin externa (More Pew Pew: effect_scale, fx_trail.offset): solo si el efecto
                // de al lado usa esa skin; con otra skin o sin skin queda el valor del juego
                $.each(cat.claves || {}, function (s, fichas) {
                    $.each(fichas[ruta] || [], function (_, c) {
                        var ef = cat.efectos[c.id], i = cat.rutas.indexOf(s + '/' + WFX.nivelDe(c.id, cat, a));
                        // y el efecto trae pfx de la skin en ese nivel (si no, montaje usa el vanilla: no tocar)
                        if (WFX.skinDe(c.id, cat, a) === s && ef && i >= 0 && ef.r[i] !== null && ef.r[i] !== undefined) { poner(d, fus, c.ruta, JSON.parse(JSON.stringify(c.v))); }
                    });
                });
                return JSON.stringify(d);
            }));
        });
    }

    // ---------- color de equipo ----------
    // Lee cada .pfx elegido (del mod o del juego), pone useArmyColor en cada emisor y lo agrega a archivos con la ruta EQUIPO.
    // Si un .pfx no se puede leer, el efecto queda sin dibujarse: se avisa en el log.
    // Gris = el canal mas alto en cada instante (curvas se muestrean en la union de sus tiempos): el efecto
    // conserva su intensidad y toma el tono del ejercito. Curva de PA: numero, [[t, v], ...] o {keys: [[t, v], ...], stepped}.
    function puntos(v) { return $.isArray(v) ? v : (v && typeof v === 'object' && $.isArray(v.keys) ? v.keys : null); }
    function enCurva(v, t) {
        var ps = puntos(v), escalon = !!(v && v.stepped);
        if (!ps) { return +v; }
        if (!ps.length) { return 0; }
        if (t <= ps[0][0]) { return ps[0][1]; }
        for (var i = 1; i < ps.length; i++) {
            if (t < ps[i][0]) { var a = ps[i - 1], b = ps[i]; return escalon ? a[1] : a[1] + (b[1] - a[1]) * (t - a[0]) / ((b[0] - a[0]) || 1); }
        }
        return ps[ps.length - 1][1];
    }
    function agrisar(o) {
        if (o.red === undefined && o.green === undefined && o.blue === undefined) { return; }
        var cs = $.map(['red', 'green', 'blue'], function (k) { return [o[k] === undefined ? 1 : o[k]]; });   // canal ausente = 1 (defecto de PA)
        var curvas = $.grep(cs, function (v) { return !!puntos(v); }), g;
        if (!curvas.length) { g = Math.max(+cs[0], +cs[1], +cs[2]); }
        else {
            var ts = {}, escalon = true;
            $.each(curvas, function (_, v) { escalon = escalon && !!v.stepped; $.each(puntos(v), function (_, p) { ts[p[0]] = true; }); });
            g = $.map(Object.keys(ts).map(Number).sort(function (x, y) { return x - y; }), function (t) {
                return [[t, Math.max(enCurva(cs[0], t), enCurva(cs[1], t), enCurva(cs[2], t))]];
            });
            if (escalon) { g = { keys: g, stepped: true }; }
        }
        o.red = o.green = o.blue = g;
    }
    function equipo(pfx, archivos, fallidos) {
        var rutas = Object.keys(pfx);
        if (!rutas.length) { return $.Deferred().resolve().promise(); }
        return $.when.apply($, $.map(rutas, function (destino) {
            var r = pfx[destino];
            return leer(r).then(seguro(function (d) {
                $.each(d && d.emitters || [], function (_, em) {
                    em.useArmyColor = 1;
                    if (destino.indexOf(EQUIPO_GRIS) === 0) { agrisar(em); if (em.spec) { agrisar(em.spec); } }
                });
                archivos[destino] = JSON.stringify(d);
            })).then(null, function () { fallidos.push(r + ' (color de equipo)'); return $.Deferred().resolve().promise(); });
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
                    log('montado nivel "' + a.base + '", skin "' + a.skin.base + '"' + (a.equipo ? ' con color de equipo' : '') + ' en ' + n + ' archivo(s) en ' + (Date.now() - t0) + ' ms');
                    return { ok: true, archivos: n, fallidos: fallidos };
                });
            });
        }, function () {
            error('no pude leer el catalogo ' + BASE + 'efectos.json: quedan los efectos del juego');
            return $.Deferred().resolve({ ok: false }).promise();   // en jQuery 2 un valor devuelto aqui seguiria rechazado
        });
    };

    // ¿La memoria ya tiene los ajustes actuales?
    WFX.vigente = function () {
        return WFX.catalogo().then(function (cat) {
            var f = firma(cat, WFX.ajustes());
            return leer(MARCA).then(function (m) { return m && m.firma === f; }, function () { return $.Deferred().resolve(false).promise(); });
        }, function () { return $.Deferred().resolve(false).promise(); });   // sin catalogo: montar() lo deja en el log
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
