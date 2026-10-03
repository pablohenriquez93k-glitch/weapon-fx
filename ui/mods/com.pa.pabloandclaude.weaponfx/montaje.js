// Weapon FX: monta en memoria los .json de unidades y municion con los efectos del nivel elegido.
// Orden del sistema de archivos (confirmado 2026-09-25): mods > memoria > juego. Por eso el mod NO trae esos .json:
// se leen del juego en el momento, se cambian SOLO las claves de efecto y se montan con api.file.mountMemoryFiles.
// Escenas: new_game y connect_to_game montan antes de la partida (sin pantalla negra: al conectar el juego arma las
// fichas con la memoria). live_game comprueba; si la memoria se perdio, remonta + setUnitSpecTag + reloadScene (F5).
// Galactic War (1.3.0): GW (y GWO) desmonta la memoria y monta sus fichas con tag (.player, .ai...). En las escenas que
// montan esas fichas se envuelve api.file.mountMemoryFiles y se les ponen los efectos en ese mismo montaje (ver abajo).
// Si algo falla, quedan los efectos del juego original y el error queda en el log con "[Weapon FX]".
(function () {
    'use strict';
    var WFX = window.WeaponFX = window.WeaponFX || {};
    var BASE = 'coui://ui/mods/com.pa.pabloandclaude.weaponfx/';
    var MARCA = '/ui/mods/com.pa.pabloandclaude.weaponfx/montado.json';   // ruta que no existe en el mod: solo vive en memoria
    var MARCA_GW = '/ui/mods/com.pa.pabloandclaude.weaponfx/montado_gw.json';   // igual, para las fichas con tag de GW
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
        // GW: si una carta (GWO) cambio un efecto, OFF = gana la carta; ON = la version Weapon FX del efecto que eligio la carta
        var cartas = false;
        try { cartas = api.settings.value('weapon_fx', 'gw_cards') === 'ON'; } catch (e) { error('no pude leer las cartas de GW: ' + e); }
        if (nivel !== 'personalizado') { var r = mapa({}, nivel); r.skin = mapa({}, skin); r.equipo = equipo; r.cartas = cartas; return r; }
        var a = null;
        try { a = JSON.parse(api.settings.value('weapon_fx', 'custom') || 'null'); } catch (e) { error('personalizado ilegible: ' + e); }
        a = a && typeof a === 'object' ? a : {};
        var out = mapa(a, NIVEL_DEFECTO);
        out.skin = mapa(a.skin, skin);        out.equipo = equipo;        out.cartas = cartas;
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
    WFX.rutaDe = function (e, cat, a) { return rutaCon(e, cat, WFX.nivelDe(e.id, cat, a), WFX.skinDe(e.id, cat, a)); };
    function rutaCon(e, cat, n, s) {
        if (n === 'original' && (s === SIN_SKIN || !e.van)) { return e.van || ''; }
        if (!cat.indice) {
            cat.indice = {};
            $.each(cat.rutas, function (i, r) { cat.indice[r] = i; });
        }
        var d = cat.efectos[e.id], h = d && d.r[cat.indice[(s === SIN_SKIN ? '' : s + '/') + n]];
        return h === null || h === undefined ? (e.van || '') : cat.wfx + 'h/' + cat.pfx[h] + '.pfx';
    }
    function firma(cat, a) { return cat.version + '|' + JSON.stringify([a.base, a.fam, a.uni, a.uf, a.efe, a.skin, a.equipo]); }
    function firmaGW(cat, a) { return firma(cat, a) + '|gw|' + (a.cartas ? 'cartas' : ''); }

    // Montaje propio: marca no enumerable (JSON.stringify no la ve) para que el enganche de GW no lo vuelva a procesar,
    // aunque otro mod envuelva mountMemoryFiles encima y pase el mismo objeto.
    function montarPropio(archivos) {
        try { Object.defineProperty(archivos, '__wfx', { value: true }); } catch (e) { error('marca de montaje propio: ' + e); }
        return api.file.mountMemoryFiles(archivos);
    }

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
    // cache = {ruta: promesa del .json}. cache.fuente (GW) = {ruta: texto} ya en mano: se lee de ahi antes que de coui.
    function deCache(ruta, cache) {
        if (!cache[ruta]) {
            var f = cache.fuente;
            cache[ruta] = f && f.hasOwnProperty(ruta)
                ? $.Deferred().resolve().then(seguro(function () { return typeof f[ruta] === 'string' ? JSON.parse(f[ruta]) : f[ruta]; }))
                : leer(ruta);
        }
        return cache[ruta];
    }
    function fusion(ruta, cache) {
        if (!ruta) { return $.Deferred().resolve({}).promise(); }
        return deCache(ruta, cache).then(function (d) {
            return fusion(d.base_spec, cache).then(function (base) { return mezclar(base, d); });
        }, function () { return $.Deferred().resolve({}).promise(); });
    }
    function copia(v) { return JSON.parse(JSON.stringify(v)); }

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

    // Ruta con color de equipo: copia del pfx con useArmyColor (la arma equipo() con lo anotado en pfx).
    // Con skin el color es saturado (dom: rojo 6.7/0.1/0.1) y el del ejercito lo multiplica: va en gris.
    function conEquipo(r, gris, a, pfx) {
        if (!a.equipo || !r) { return r; }
        var p = gris ? EQUIPO_GRIS : EQUIPO;
        pfx[p + r] = r;
        return p + r;
    }
    // Valor de Weapon FX de una clave de efecto (plantilla del catalogo con la ruta de cada efecto).
    function valorWFX(c, cat, a, pfx) {
        var valores = $.map(c.efectos, function (e) { return [conEquipo(WFX.rutaDe(e, cat, a), WFX.skinDe(e.id, cat, a) !== SIN_SKIN, a, pfx)]; });
        return c.plantilla.replace(/\{(\d+)\}/g, function (_, i) { return valores[+i]; }).split(/\s+/).join(' ').trim();
    }
    // claves visuales de una skin externa (More Pew Pew: effect_scale, fx_trail.offset): solo si el efecto
    // de al lado usa esa skin y trae pfx de la skin en ese nivel (si no, montaje usa el vanilla: no tocar).
    // vale(c) (GW): false = no tocar esa clave.
    function ponerClaves(d, fus, ruta, cat, a, vale) {
        $.each(cat.claves || {}, function (s, fichas) {
            $.each(fichas[ruta] || [], function (_, c) {
                var ef = cat.efectos[c.id], i = cat.rutas.indexOf(s + '/' + WFX.nivelDe(c.id, cat, a));
                if (WFX.skinDe(c.id, cat, a) === s && ef && i >= 0 && ef.r[i] !== null && ef.r[i] !== undefined && (!vale || vale(c))) {
                    poner(d, fus, c.ruta, copia(c.v));
                }
            });
        });
    }

    function armar(ruta, cambios, cat, a, cache, pfx) {
        return deCache(ruta, cache).then(function (orig) {
            return fusion(ruta, cache).then(seguro(function (fus) {
                // en plena partida coui ya sirve la ficha montada antes: sus claves de skin vuelven al juego primero
                var d = sinClaves(copia(orig), ruta, cat);
                $.each(cambios, function (_, c) { poner(d, fus, c.ruta, valorWFX(c, cat, a, pfx)); });
                ponerClaves(d, fus, ruta, cat, a);
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
                montarPropio(archivos).then(function () { listo.resolve(true); }, function () { listo.resolve(false); });
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
    function puedoRecargar(motivo, pedidoJugador) {
        var ultima = +(sessionStorage.getItem('weaponfx.recarga') || 0);
        if (!pedidoJugador && Date.now() - ultima < 20000) {
            error('recarga pedida otra vez en menos de 20 s (' + motivo + '): no recargo, para no entrar en bucle');
            return false;
        }
        return true;
    }
    function recargar(motivo, tag) {
        sessionStorage.setItem('weaponfx.recarga', String(Date.now()));
        log('recargo la vista (' + motivo + '), tag "' + (tag || '') + '"');
        api.game.setUnitSpecTag(tag || '');
        setTimeout(function () { api.game.debug.reloadScene(api.Panel.pageId); }, 1000);
    }
    WFX.aplicarEnPartida = function (motivo, pedidoJugador) {
        if (!puedoRecargar(motivo, pedidoJugador)) { return; }
        WFX.montar().then(function (r) {
            if (!r.ok) { return; }
            api.game.getUnitSpecTag().then(function (tag) { recargar(motivo, tag); });
        });
    };

    // ---------- Galactic War ----------
    // GW (y GWO) arma las fichas con tag (ruta + '.player', '.ai', '.player1'... en co-op) leyendo las del juego, les aplica
    // las cartas y las monta: gw_play (referee: unmountAllMemoryFiles -> mountMemoryFiles), gw_lobby y gw_reconnect_loading
    // (co-op), replay_loading y live_game (handlers.memory_files, reconexion). Ahi se envuelve api.file.mountMemoryFiles: a las
    // fichas del catalogo con tag se les ponen los efectos en ese mismo montaje (+ color de equipo + MARCA_GW).
    // Una clave de efecto se cambia solo si sigue como el juego (o ya es de Weapon FX). Si una carta la cambio (GWO: Dox,
    // Kestrel, Ant, Gil-E), gana la carta; con gw_cards = ON va la version Weapon FX del pfx que eligio la carta.
    // Solo cambia lo que se monta en este cliente: config.files (lo que va al servidor) no se toca.
    var RE_TAG = /^(\/pa\/.+?\.json)(\.[^\/]+)$/;
    function norm(v) { return typeof v === 'string' ? v.split(/\s+/).join(' ').trim() : ''; }
    function valorEn(o, ruta) {
        for (var i = 0; i < ruta.length; i++) { if (!o || typeof o !== 'object') { return undefined; } o = o[ruta[i]]; }
        return o;
    }
    function esWFX(t, cat) { return t.indexOf(cat.wfx) === 0 || t.indexOf(EQUIPO) === 0; }   // EQUIPO tambien cubre EQUIPO_GRIS
    // ¿El valor sigue como el juego (o ya es de Weapon FX)? Cada {i} de la plantilla admite el pfx del juego o uno de WFX;
    // un efecto que agrega WFX (sin pfx en el juego) puede faltar.
    function comoJuego(v, c, cat) {
        var vt = norm(v) ? norm(v).split(' ') : [], pt = $.grep(c.plantilla.split(/\s+/), function (t) { return !!t; });
        function m(i, j) {
            if (i === pt.length) { return j === vt.length; }
            var s = /^\{(\d+)\}$/.exec(pt[i]);
            if (!s) { return j < vt.length && vt[j] === pt[i] && m(i + 1, j + 1); }
            var e = c.efectos[+s[1]] || {};
            if (j < vt.length && (vt[j] === e.van || esWFX(vt[j], cat)) && m(i + 1, j + 1)) { return true; }
            return !e.van && m(i + 1, j);
        }
        return m(0, 0);
    }
    // gw_cards = ON: pfx del juego que puso una carta -> efecto de WFX con ese vanilla. Se prefiere el de la misma unidad,
    // luego el de la unidad duena del pfx (/pa/units/.../<unidad>/), luego el de la misma ranura, luego el primero por id.
    function porVan(cat) {
        if (!cat.porVan) {
            cat.porVan = {};
            $.each(cat.fichas, function (_, cs) {
                $.each(cs, function (_, c) {
                    $.each(c.efectos, function (_, e) {
                        var l = e.van ? (cat.porVan[e.van] = cat.porVan[e.van] || []) : null;
                        if (l && !$.grep(l, function (x) { return x.id === e.id; }).length) { l.push(e); }
                    });
                });
            });
        }
        return cat.porVan;
    }
    function efectoPara(van, ref, cat) {
        var l = porVan(cat)[van] || [], dr = cat.efectos[ref.id] || {};
        function de(f) { var r = $.grep(l, function (e) { return f(cat.efectos[e.id] || {}); }); return r.length ? r : null; }
        var r = de(function (d) { return d.unidad === dr.unidad; }) || de(function (d) { return van.indexOf('/' + d.unidad + '/') >= 0; }) ||
            de(function (d) { return d.ranura === dr.ranura; }) || l;
        return r.slice().sort(function (x, y) { return x.id < y.id ? -1 : 1; })[0] || null;
    }
    // Nivel y skin: los del efecto que Weapon FX pone en esa clave (los de la unidad que dispara).
    function versionCarta(v, c, cat, a, pfx) {
        var ref = c.efectos[0], n = WFX.nivelDe(ref.id, cat, a), s = WFX.skinDe(ref.id, cat, a);
        return $.map(norm(v).split(' '), function (t) {
            if (!/\.pfx$/.test(t) || esWFX(t, cat)) { return [t]; }
            var e = efectoPara(t, ref, cat), r = e ? rutaCon(e, cat, n, s) : '';
            return [r ? conEquipo(r, s !== SIN_SKIN, a, pfx) : t];
        }).join(' ');
    }
    // Claves de efecto que una carta puede agregar donde el catalogo no tiene esa clave (Gil-E: fx_collision_spec):
    // todas las rutas de efecto del catalogo. El efecto de referencia (nivel, skin, unidad) es el de la misma ranura.
    function rutasEfecto(cat) {
        if (!cat.rutasEfecto) {
            var vistas = {};
            cat.rutasEfecto = [];
            $.each(cat.fichas, function (_, cs) {
                $.each(cs, function (_, c) { var k = c.ruta.join('.'); if (!vistas[k]) { vistas[k] = true; cat.rutasEfecto.push(c.ruta); } });
            });
        }
        return cat.rutasEfecto;
    }
    function refPara(cambios, ruta, cat) {
        var k = ruta.join('.'), quiero = /fx_trail|fx_beam/.test(k) ? 'estela' : /fired|sim_fire/.test(k) ? 'fogonazo' : 'impacto', todos = [];
        $.each(cambios, function (_, c) { todos = todos.concat(c.efectos); });
        return $.grep(todos, function (e) { return (cat.efectos[e.id] || {}).ranura === quiero; })[0] || todos[0];
    }
    // Valor original de cada clave de primer nivel que se toca ({v} o {} = no estaba): para rehacer en plena partida.
    function guardar(o, orig, k) { if (!o.hasOwnProperty(k)) { o[k] = orig.hasOwnProperty(k) ? { v: copia(orig[k]) } : {}; } }
    // Copia de la ficha sin rutas de Weapon FX: lo que montaria el juego. GW puede traer fichas ya con WFX (gw_lobby las
    // regenera leyendo por coui las fichas sin tag, y en la memoria pueden estar las de WFX de una partida anterior):
    // cada clave que sigue la plantilla vuelve a su pfx del juego (o se borra si el juego no trae ninguno).
    function sinWFX(orig, cambios, cat, base) {
        var d = copia(orig);
        $.each(cambios, function (_, c) {
            var v = valorEn(d, c.ruta), padre = valorEn(d, c.ruta.slice(0, -1)), k = c.ruta[c.ruta.length - 1];
            if (typeof v !== 'string' || !$.grep(norm(v).split(' '), function (t) { return esWFX(t, cat); }).length || !comoJuego(v, c, cat)) { return; }
            var van = norm(c.plantilla.replace(/\{(\d+)\}/g, function (_, i) { return (c.efectos[+i] || {}).van || ''; }));
            if (van) { padre[k] = van; } else { delete padre[k]; }
        });
        return sinClaves(d, base, cat);
    }
    // Claves de skin (More Pew Pew: effect_scale, fx_trail.offset) que traen el valor de la skin -> el del juego (van; vf en
    // una ficha aplanada sin base_spec; sin valor = se borra). ponerClaves las vuelve a poner si la skin las usa. Cambia d.
    function sinClaves(d, base, cat) {
        var plana = !d.hasOwnProperty('base_spec');
        $.each(cat.claves || {}, function (_, fichas) {
            $.each(fichas[base] || [], function (_, c) {
                var padre = valorEn(d, c.ruta.slice(0, -1)), k = c.ruta[c.ruta.length - 1], n = plana ? 'vf' : 'van';
                if (!padre || typeof padre !== 'object' || JSON.stringify(padre[k]) !== JSON.stringify(c.v)) { return; }
                if (c.hasOwnProperty(n)) { padre[k] = copia(c[n]); } else { delete padre[k]; }
            });
        });
        return d;
    }
    function restaurar(d, o) { $.each(o || {}, function (k, x) { if (x.hasOwnProperty('v')) { d[k] = x.v; } else { delete d[k]; } }); }

    // Pone los efectos en las fichas con tag de fuente ({ruta: texto}; se cambia ahi mismo) y le agrega el color de equipo
    // y MARCA_GW. Promesa con {fichas, tags, cartas, reemplazadas, fallidos, a}; fichas = 0: no habia nada de Weapon FX.
    WFX.parchearGW = function (fuente) {
        return WFX.catalogo().then(function (cat) {
            var a = WFX.ajustes(), cache = { fuente: fuente }, suelto = {}, pfx = {}, fallidos = [], trabajos = [], tags = {}, originales = {}, rutas = [];
            var r = { fichas: 0, cartas: 0, reemplazadas: 0, fallidos: fallidos, a: a };
            $.each(fuente, function (ruta) {
                var m = RE_TAG.exec(ruta), cambios = m && cat.fichas[m[1]];
                if (!cambios) { return; }
                trabajos.push(deCache(ruta, cache).then(function (orig) {
                    // con cartas ON tambien la ficha sin tag (la del juego, por coui) para ver claves de efecto que agrego una carta
                    var juego = a.cartas ? fusion(m[1], suelto) : $.Deferred().resolve(null).promise();
                    return $.when(fusion(ruta, cache), juego).then(seguro(function (fus, fusJuego) {
                        var d = sinClaves(copia(orig), m[1], cat), o = {}, aplicados = {}, propias = {}, limpio = sinWFX(orig, cambios, cat, m[1]);
                        $.each(cambios, function (_, c) { propias[c.ruta.join('.')] = true; });
                        $.each(cambios, function (_, c) {
                            var v = valorEn(fus, c.ruta), nuevo = null;
                            // libre = como el juego; o (antinuke: solo polvo) clave heredada de base_spec, sin pfx del juego en el catalogo,
                            // en una ficha que ninguna carta aplano (modSpecs aplana base_spec al cambiar una ficha)
                            var libre = comoJuego(v, c, cat) || (valorEn(orig, c.ruta) === undefined && orig.hasOwnProperty('base_spec') &&
                                !$.grep(c.efectos, function (e) { return !!e.van; }).length);
                            if (libre) {
                                nuevo = valorWFX(c, cat, a, pfx);
                                $.each(c.efectos, function (_, e) { aplicados[e.id] = true; });
                            } else {
                                r.cartas++;
                                if (a.cartas) {
                                    nuevo = versionCarta(v, c, cat, a, pfx);
                                    if (nuevo === norm(v)) { nuevo = null; } else { r.reemplazadas++; }
                                }
                            }
                            // el original se guarda aunque ya valga lo mismo (GW pudo traerlo con WFX): para rehacer sin WFX
                            if (nuevo !== null) { guardar(o, limpio, c.ruta[0]); if (nuevo !== v) { poner(d, fus, c.ruta, nuevo); } }
                        });
                        // cartas ON: clave de efecto propia de la ficha con tag (una carta aplana la ficha) que el catalogo no
                        // maneja aqui y que no es la del juego -> la puso una carta
                        if (fusJuego) {
                            $.each(rutasEfecto(cat), function (_, rr) {
                                var v = valorEn(orig, rr);
                                if (propias[rr.join('.')] || typeof v !== 'string' || !/\.pfx/.test(v) || norm(v) === norm(valorEn(fusJuego, rr))) { return; }
                                var nuevo = versionCarta(v, { efectos: [refPara(cambios, rr, cat)] }, cat, a, pfx);
                                r.cartas++;
                                if (nuevo !== norm(v)) { guardar(o, limpio, rr[0]); poner(d, fus, rr, nuevo); r.reemplazadas++; }
                            });
                        }
                        ponerClaves(d, fus, m[1], cat, a, function (c) {
                            if (!aplicados[c.id]) { return false; }   // la carta cambio ese efecto: su escala/offset tampoco
                            guardar(o, limpio, c.ruta[0]);
                            return true;
                        });
                        fuente[ruta] = typeof fuente[ruta] === 'string' ? JSON.stringify(d) : d;
                        if (!$.isEmptyObject(o)) { originales[ruta] = o; }
                        tags[m[2]] = true;
                        rutas.push(ruta);
                        r.fichas++;
                    }));
                }).then(null, function () { fallidos.push(ruta); return $.Deferred().resolve().promise(); }));
            });
            return $.when.apply($, trabajos).then(function () {
                if (!r.fichas) { return r; }
                return equipo(pfx, fuente, fallidos).then(seguro(function () {
                    r.tags = Object.keys(tags).sort();
                    fuente[MARCA_GW] = JSON.stringify({ firma: firmaGW(cat, a), escena: escena, hora: new Date().toString(),
                        tags: r.tags, fichas: rutas.sort(), originales: originales });
                    return r;
                }));
            });
        });
    };
    function informeGW(r, t0) {
        log('Galactic War: nivel "' + r.a.base + '", skin "' + r.a.skin.base + '"' + (r.a.equipo ? ' con color de equipo' : '') + ' en ' +
            r.fichas + ' ficha(s) con tag ' + r.tags.join(', ') + ' en ' + (Date.now() - t0) + ' ms' + (r.cartas ? '; ' + r.cartas +
            ' efecto(s) cambiados por cartas: ' + (r.a.cartas ? r.reemplazadas + ' con la version Weapon FX' : 'quedan como la carta') : ''));
        if (r.fallidos.length) { error('Galactic War: ' + r.fallidos.length + ' archivo(s) quedan como el juego: ' + r.fallidos.join(', ')); }
    }

    // El enganche. Pase lo que pase, el montaje de GW sigue: si algo falla o tarda mas de 12 s, monta sin los efectos.
    function engancharGW() {
        var original = api.file && api.file.mountMemoryFiles;
        if (!original || original.weaponFX) { return; }
        var envuelta = function (archivos) {
            var self = this, args = arguments;
            var conTag = archivos && typeof archivos === 'object' && !archivos.__wfx &&
                $.grep(Object.keys(archivos), function (k) { return RE_TAG.test(k); }).length;
            if (!conTag) { return original.apply(self, args); }
            var listo = $.Deferred(), t0 = Date.now(), hecho = false;
            function seguir() {
                if (hecho) { return; }
                hecho = true;
                var p = original.apply(self, args);
                if (p && p.then) { p.then(function (v) { listo.resolve(v); }, function (e) { listo.reject(e); }); } else { listo.resolve(p); }
            }
            setTimeout(function () {
                if (!hecho) { error('Galactic War: los efectos tardan demasiado: monto sin ellos (live_game lo reintenta)'); seguir(); }
            }, 12000);
            WFX.parchearGW(archivos).then(seguro(function (r) {
                if (r.fichas && !hecho) { informeGW(r, t0); }
                seguir();
            })).then(null, function (e) {
                error('Galactic War: no pude poner los efectos (quedan los del juego): ' + (e && e.message || e));
                seguir();
            });
            return listo.promise();
        };
        envuelta.weaponFX = true;
        api.file.mountMemoryFiles = envuelta;
    }

    WFX.vigenteGW = function () {
        return WFX.catalogo().then(function (cat) {
            var f = firmaGW(cat, WFX.ajustes());
            return leer(MARCA_GW).then(function (m) { return !!m && m.firma === f; }, function () { return $.Deferred().resolve(false).promise(); });
        }, function () { return $.Deferred().resolve(false).promise(); });
    };
    // En plena partida con tag: relee de la memoria las fichas con tag, les devuelve los valores originales (MARCA_GW), les
    // pone los efectos de los ajustes de ahora, monta y recarga (como aplicarEnPartida). Sin MARCA_GW prueba tag, .player y .ai.
    WFX.aplicarGW = function (tag, motivo, pedidoJugador) {
        if (!puedoRecargar(motivo, pedidoJugador)) { return; }
        var t0 = Date.now();
        $.when(WFX.catalogo(), leer(MARCA_GW).then(null, function () { return $.Deferred().resolve(null).promise(); })).then(function (cat, marca) {
            var rutas = marca && $.isArray(marca.fichas) ? marca.fichas : [], fuente = {};
            if (!rutas.length) {
                var tags = [];
                $.each([tag, '.player', '.ai'], function (_, t) { if (t && $.inArray(t, tags) < 0) { tags.push(t); } });
                $.each(cat.fichas, function (ruta) { $.each(tags, function (_, t) { rutas.push(ruta + t); }); });
            }
            return $.when.apply($, $.map(rutas, function (ruta) {
                return $.ajax({ url: 'coui:/' + ruta, dataType: 'text', cache: false }).then(
                    function (t) { fuente[ruta] = t; }, function () { return $.Deferred().resolve().promise(); });
            })).then(seguro(function () {
                $.each((marca && marca.originales) || {}, function (ruta, o) {
                    if (typeof fuente[ruta] === 'string') { var d = JSON.parse(fuente[ruta]); restaurar(d, o); fuente[ruta] = JSON.stringify(d); }
                });
                return WFX.parchearGW(fuente).then(function (r) { return { r: r, fuente: fuente }; });
            }));
        }).then(function (x) {
            if (!x.r.fichas) { error('Galactic War: no hay fichas con tag en memoria (tag "' + tag + '"): quedan los efectos de ahora'); return; }
            montarPropio(x.fuente).then(function () {
                informeGW(x.r, t0);
                recargar(motivo, tag);
            }, function () { error('Galactic War: no pude montar los archivos en memoria: quedan los efectos de ahora'); });
        }, function (e) { error('Galactic War: no pude rehacer los efectos: ' + (e && e.message || e)); });
    };

    // ---------- arranque por escena ----------
    var ESCENAS_GW = { gw_play: true, gw_lobby: true, gw_reconnect_loading: true, replay_loading: true };
    if (escena === 'live_game') {
        engancharGW();   // memory_files del servidor (reconexion, GW co-op)
        api.game.getUnitSpecTag().then(function (tag) {
            // con tag = Galactic War (o repeticion de GW): fichas con tag y MARCA_GW
            var vigente = tag ? WFX.vigenteGW : WFX.vigente;
            var aplicar = function (motivo, pedido) { if (tag) { WFX.aplicarGW(tag, motivo, pedido); } else { WFX.aplicarEnPartida(motivo, pedido); } };
            vigente().then(function (ok) {
                if (ok) { log('memoria vigente' + (tag ? ' (Galactic War, tag "' + tag + '")' : '') + ': efectos listos'); return; }
                error('la memoria no esta (o es de otros ajustes) al entrar a la partida' + (tag ? ' (Galactic War, tag "' + tag + '")' : '') + ': remonto y recargo la vista');
                aplicar('memoria ausente al entrar');
            });
            // Menu Settings dentro de la partida: al cerrarlo, releer lo guardado. Save -> cambio -> aplicar.
            // Cancel no guarda nada: lo guardado sigue igual y no se toca nada (pedido de Pablo 2026-09-25).
            if (window.model && model.showSettings && model.showSettings.subscribe) {
                model.showSettings.subscribe(function (abierto) {
                    if (abierto) { return; }
                    try { api.settings.loadLocalData(); } catch (e) { error('loadLocalData: ' + e); }
                    vigente().then(function (ok) {
                        if (!ok) { aplicar('ajustes guardados en el menu', true); }
                    });
                });
            }
        });
    } else if (ESCENAS_GW[escena]) {
        engancharGW();
        WFX.catalogo();   // listo de antemano: el montaje de GW no espera el catalogo
        log('enganche de Galactic War listo');
    } else {
        // Batalla de GW (connect_to_game ?mode=gw, o ya con tag): las fichas sin tag no se usan, y si quedan con WFX en la
        // memoria, gw_lobby las lee al regenerar las fichas con tag y GW recibe valores de WFX como si fueran los suyos.
        var tagAhora = $.Deferred();
        if (/[?&]mode=gw(&|$)/.test((window.location && location.search) || '')) { tagAhora.resolve('?mode=gw'); }
        try { api.game.getUnitSpecTag().then(function (t) { tagAhora.resolve(t || ''); }, function () { tagAhora.resolve(''); }); }
        catch (e) { tagAhora.resolve(''); }
        tagAhora.then(function (tag) {
            if (tag) { log('Galactic War (tag "' + tag + '"): sin montaje normal; los efectos van en las fichas con tag'); return; }
            WFX.vigente().then(function (ok) {
                if (ok) { log('memoria vigente: nada que hacer'); return; }
                WFX.montar();
            });
        });
    }
})();
