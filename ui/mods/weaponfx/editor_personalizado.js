// Weapon FX: editor de "Personalizado" (scene settings). Capas que heredan, de la mas fina a la mas gruesa:
//   efecto -> familia de armas dentro de la unidad -> unidad -> familia de armas (general) -> nivel base.
// Se guarda en api.settings.data.weapon_fx.custom (texto JSON {base, fam, uni, uf, efe, skin}): el juego lo escribe a disco
// SOLO con Save (api.settings.save); Cancel/Cerrar lo descarta. Editar marca isDirty -> se habilita GUARDAR.
// Unidades por ramas (pedido de Pablo 2026-09-25): tipo -> unidad -> sus familias (solo las que tiene) -> sus efectos.
// Codigo para compartir: "WFX2:" + base64(JSON); importar tambien acepta WFX1 sin skin.
(function () {
    'use strict';
    var WFX = window.WeaponFX, G = WFX.GRUPO;
    var NIVELES = ['bajo', 'original', 'alto', 'uber'];
    var TXT_NIVEL = { bajo: 'Low', original: 'Original', alto: 'High', uber: 'Uber' };
    var FAMILIAS = ['balistica', 'explosiva', 'laser', 'energia', 'misil', 'antiaereo', 'torpedo', 'fuego'];
    var TXT_FAM = { balistica: 'Ballistic (bullets and shells)', explosiva: 'Explosive (artillery, bombs)', laser: 'Laser',
        energia: 'Energy (Tesla, cold lasers)', misil: 'Missiles', antiaereo: 'Anti-air', torpedo: 'Torpedoes', fuego: 'Flamethrowers' };
    var TIPOS = ['tierra', 'estructura', 'aerea', 'naval', 'orbital', 'comandante', 'otros'];
    var TXT_TIPO = { tierra: 'Land units', estructura: 'Structures', aerea: 'Air units', naval: 'Naval units', orbital: 'Orbital units',
        comandante: 'Commanders', otros: 'Other (explosions)' };
    var TXT_RANURA = { fogonazo: 'Muzzle flash', estela: 'Trail / beam', impacto: 'Impact', suelo: 'Ground blast when firing' };
    var cat = null, est = null, tipoSel = 'tierra', unidadSel = null;
    var t = function (s) { return loc('!LOC:' + s); };

    function log(m) { console.log('[Weapon FX] editor: ' + m); }
    function error(m) { console.error('[Weapon FX] ERROR editor: ' + m); }

    // ---------- estado ----------
    function leerEstado() {
        var a = null;
        try { a = JSON.parse(api.settings.value(G, 'custom') || 'null'); } catch (e) { error('personalizado ilegible: ' + e); }
        a = a && typeof a === 'object' ? a : {};
        return { base: NIVELES.indexOf(a.base) >= 0 ? a.base : 'alto', fam: a.fam || {}, uni: a.uni || {}, uf: a.uf || {}, efe: a.efe || {}, skin: estadoSkin(a.skin) };
    }
    function estadoSkin(s) {
        s = s && typeof s === 'object' ? s : {};
        return { base: s.base || '', fam: s.fam || {}, uni: s.uni || {}, uf: s.uf || {}, efe: s.efe || {} };
    }
    function guardarBorrador() {
        // como api.settings.set (sin exigir definicion): queda en memoria hasta Save
        api.settings.data[G] = api.settings.data[G] || {};
        api.settings.data[G].custom = JSON.stringify(est);
        api.settings.isDirty(true);
    }
    function nivelFam(f) { return est.fam[f] || est.base; }
    function nivelUni(u) { return est.uni[u] || nivelFam(cat.unidades[u].familia); }
    function nivelUF(u, f) { return est.uf[u + '|' + f] || est.uni[u] || nivelFam(f); }

    // ---------- piezas ----------
    function selectSkin(capa, clave, primera) {
        var mapa = capa === 'base' ? est.skin : est.skin[capa];
        var k = capa === 'base' ? 'base' : clave;
        var s = $('<select class="wfx-sel"></select>').attr('aria-label', t('Skin')).attr('title', t('Skin'));
        s.append($('<option value=""></option>').text(t(primera)));
        $.each(['ninguna'].concat(Object.keys(cat.skins || {})), function (_, id) {
            s.append($('<option></option>').attr('value', id).text(id === 'ninguna' ? t('No skin') : cat.skins[id]));
        });
        s.val(mapa[k] || '');
        s.on('change', function () {
            if (s.val()) { mapa[k] = s.val(); } else { delete mapa[k]; }
            guardarBorrador(); pintarCambiadas(); pintarUnidad();
        });
        return s;
    }
    function select(valor, primera, alCambiar) {
        var s = $('<select class="wfx-sel"></select>');
        if (primera) { s.append($('<option value=""></option>').text(primera)); }
        $.each(NIVELES, function (_, n) { s.append($('<option></option>').attr('value', n).text(t(TXT_NIVEL[n]))); });
        s.val(valor || '');
        s.on('change', function () { alCambiar(s.val()); guardarBorrador(); pintarCambiadas(); });
        return s;
    }
    function fila(texto, control, nota, clase) {
        var f = $('<div class="wfx-fila"></div>').addClass(clase || '');
        f.append($('<div class="wfx-etq"></div>').text(texto));
        f.append(control);
        if (nota) { f.append($('<div class="wfx-nota"></div>').text(nota)); }
        return f;
    }
    function boton(texto, f) { return $('<button class="wfx-boton"></button>').text(texto).on('click', function (ev) { ev.preventDefault(); f(); }); }
    function nombre(u) {
        var d = cat.unidades[u];
        if (!d) { return u; }
        // skins de comandante: comparten armas y efectos; el menu dice cuantas usan este grupo
        return t(d.nombre) + (d.comparten ? ' (' + loc('!LOC:shared by __n__ commanders', { n: d.comparten }) + ')' : '') +
            (d.con ? ' (' + t('also:') + ' ' + d.con.map(function (x) { return t(x); }).join(', ') + ')' : '');
    }
    function hereda(texto, nivel) { return texto + ': ' + t(TXT_NIVEL[nivel]); }

    // ---------- pintar ----------
    function pintar() {
        var r = $('#wfx_editor').empty();
        r.append($('<div class="sub-group-title"></div>').text(t('Custom')));
        r.append(fila(t('Base level'), select(est.base, null, function (v) { est.base = v; pintarUnidad(); }))
            .append(selectSkin('base', null, '(Global skin)')));

        r.append($('<div class="sub-group-title"></div>').text(t('By weapon family')));
        $.each(FAMILIAS, function (_, f) {
            r.append(fila(t(TXT_FAM[f]), select(est.fam[f], t('(Base level)'), function (v) {
                if (v) { est.fam[f] = v; } else { delete est.fam[f]; }
                pintarUnidad();
            })).append(selectSkin('fam', f, '(Base skin)')));
        });

        r.append($('<div class="sub-group-title"></div>').text(t('By unit and effect')));
        var tipos = $('<select class="wfx-sel"></select>'), unidades = $('<select class="wfx-sel"></select>');
        $.each(TIPOS, function (_, tp) {
            if (Object.keys(cat.unidades).some(function (u) { return cat.unidades[u].tipo === tp; })) {
                tipos.append($('<option></option>').attr('value', tp).text(t(TXT_TIPO[tp])));
            }
        });
        tipos.val(tipoSel);
        function llenarUnidades() {
            var lista = Object.keys(cat.unidades).filter(function (u) { return cat.unidades[u].tipo === tipoSel; })
                .sort(function (a, b) { return nombre(a) < nombre(b) ? -1 : 1; });
            unidades.empty().append($('<option value=""></option>').text(t('(Choose a unit)')));
            $.each(lista, function (_, u) { unidades.append($('<option></option>').attr('value', u).text(nombre(u))); });
            unidades.val(lista.indexOf(unidadSel) >= 0 ? unidadSel : '');
        }
        tipos.on('change', function () { tipoSel = tipos.val(); unidadSel = null; llenarUnidades(); pintarCambiadas(); pintarUnidad(); });
        unidades.on('change', function () { unidadSel = unidades.val() || null; pintarCambiadas(); pintarUnidad(); });
        llenarUnidades();
        r.append(fila(t('Unit type'), tipos), fila(t('Unit'), unidades),
            $('<div id="wfx_cambiadas" class="wfx-nota"></div>'), $('<div id="wfx_unidad"></div>'));

        r.append($('<div class="sub-group-title"></div>').text(t('Share')));
        var codigo = $('<textarea id="wfx_codigo" class="wfx-codigo"></textarea>').attr('placeholder', t('Paste a code here and press Import'));
        r.append(codigo, $('<div class="wfx-fila"></div>').append(
            boton(t('Export'), exportar), boton(t('Import'), importar), boton(t('Reset custom'), restablecer)),
            $('<div id="wfx_msg" class="wfx-nota"></div>'));
        pintarCambiadas();
        pintarUnidad();
    }

    // aviso solo mientras se elige unidad, y solo con las del tipo elegido (con una unidad abierta no aporta)
    function pintarCambiadas() {
        if (unidadSel) { $('#wfx_cambiadas').text(''); return; }
        var us = {};
        $.each(est.uni, function (u) { us[u] = 1; });
        $.each(est.uf, function (k) { us[k.split('|')[0]] = 1; });
        $.each(est.efe, function (id) { if (cat.efectos[id]) { us[cat.efectos[id].unidad] = 1; } });
        $.each(est.skin.uni, function (u) { us[u] = 1; });
        $.each(est.skin.uf, function (k) { us[k.split('|')[0]] = 1; });
        $.each(est.skin.efe, function (id) { if (cat.efectos[id]) { us[cat.efectos[id].unidad] = 1; } });
        var lista = Object.keys(us).filter(function (u) { return cat.unidades[u] && cat.unidades[u].tipo === tipoSel; }).map(nombre).sort();
        $('#wfx_cambiadas').text(lista.length ? t('Units with their own settings:') + ' ' + lista.join(', ') : '');
    }

    function pintarUnidad() {
        var r = $('#wfx_unidad').empty();
        if (!unidadSel || !cat.unidades[unidadSel]) { return; }
        var u = unidadSel;
        r.append($('<div class="wfx-titulo"></div>').text(nombre(u)));
        r.append(fila(t('Unit level'), select(est.uni[u], hereda(t('(By family)'), nivelUni(u)), function (v) {
            if (v) { est.uni[u] = v; } else { delete est.uni[u]; }
            pintarUnidad();
        })).append(selectSkin('uni', u, '(Family skin)')));
        // solo las familias que la unidad tiene; dentro, sus efectos
        var ids = Object.keys(cat.efectos).filter(function (id) { return cat.efectos[id].unidad === u; }).sort();
        $.each(FAMILIAS, function (_, f) {
            var suyos = ids.filter(function (id) { return cat.efectos[id].familia === f; });
            if (!suyos.length) { return; }
            var k = u + '|' + f;
            r.append(fila(t(TXT_FAM[f]), select(est.uf[k], hereda(t('(Unit level)'), est.uni[u] || nivelFam(f)), function (v) {
                if (v) { est.uf[k] = v; } else { delete est.uf[k]; }
                pintarUnidad();
            }), null, 'wfx-familia').append(selectSkin('uf', k, '(Unit skin)')));
            $.each(suyos, function (_, id) { r.append(filaEfecto(id, hereda(t('(Family level)'), nivelUF(u, f)))); });
        });
        // efectos de OTRA unidad que esta tambien usa (Manhattan dispara la bala del Dox): mismo ajuste, en ambos lados
        var ajenos = cat.unidades[u].compartidos || [];
        var duenos = {};
        $.each(ajenos, function (_, id) { (duenos[cat.efectos[id].unidad] = duenos[cat.efectos[id].unidad] || []).push(id); });
        $.each(duenos, function (d, lista) {
            r.append($('<div class="wfx-fila wfx-familia"></div>').text(t('Shared with') + ' ' + t(cat.unidades[d].nombre)));
            r.append($('<div class="wfx-nota wfx-efecto"></div>').text(t('Changing these also changes them in') + ' ' + t(cat.unidades[d].nombre) + '.'));
            $.each(lista, function (_, id) {
                var e = cat.efectos[id];
                r.append(filaEfecto(id, hereda('(' + t('Level in') + ' ' + t(cat.unidades[d].nombre) + ')', nivelUF(d, e.familia))));
            });
        });
    }
    function filaEfecto(id, textoHereda) {
        var e = cat.efectos[id], origen = e.origen ? e.origen.split('/').pop() : '';
        var nota = origen + (e.con ? '  —  ' + t('shared with') + ' ' + e.con.map(function (x) {
            return cat.unidades[x] ? t(cat.unidades[x].nombre) : x; }).join(', ') : '');
        return fila(t(TXT_RANURA[e.ranura] || e.ranura), select(est.efe[id], textoHereda,
            function (v) { if (v) { est.efe[id] = v; } else { delete est.efe[id]; } }), nota, 'wfx-efecto')
            .append(selectSkin('efe', id, '(Family skin)'));
    }

    // ---------- compartir ----------
    function exportar() {
        var datos = { b: est.base, f: est.fam, u: est.uni, x: est.uf, e: est.efe, skin: est.skin };
        var c = 'WFX2:' + btoa(unescape(encodeURIComponent(JSON.stringify(datos))));
        $('#wfx_codigo').val(c).focus().select();
        $('#wfx_msg').text(t('Code ready: select it and copy it with Ctrl+C.'));
    }
    function importar() {
        var c = String($('#wfx_codigo').val() || '').replace(/\s+/g, '');
        var d = null;
        try {
            if (!/^WFX[12]:/.test(c)) { throw new Error('prefijo'); }
            d = JSON.parse(decodeURIComponent(escape(atob(c.slice(5)))));
            if (!d || typeof d !== 'object' || Array.isArray(d)) { throw new Error('datos'); }
        } catch (e) { $('#wfx_msg').text(t('That code is not valid. Nothing was changed.')); return; }
        var nuevo = { base: NIVELES.indexOf(d.b) >= 0 ? d.b : 'alto', fam: {}, uni: {}, uf: {}, efe: {}, skin: estadoSkin() }, ignorados = 0;
        var copiar = function (desde, hacia, existe, valores) {
            $.each(desde || {}, function (k, v) { if (existe(k) && (valores || NIVELES).indexOf(v) >= 0) { hacia[k] = v; } else { ignorados++; } });
        };
        copiar(d.f, nuevo.fam, function (k) { return FAMILIAS.indexOf(k) >= 0; });
        copiar(d.u, nuevo.uni, function (k) { return !!cat.unidades[k]; });
        copiar(d.x, nuevo.uf, function (k) { return !!cat.unidades[k.split('|')[0]] && FAMILIAS.indexOf(k.split('|')[1]) >= 0; });
        copiar(d.e, nuevo.efe, function (k) { return !!cat.efectos[k]; });
        if (c.indexOf('WFX2:') === 0 && d.skin) {
            var skins = ['ninguna'].concat(Object.keys(cat.skins || {}));
            if (skins.indexOf(d.skin.base) >= 0) { nuevo.skin.base = d.skin.base; }
            else if (d.skin.base) { ignorados++; }
            copiar(d.skin.fam, nuevo.skin.fam, function (k) { return FAMILIAS.indexOf(k) >= 0; }, skins);
            copiar(d.skin.uni, nuevo.skin.uni, function (k) { return Object.prototype.hasOwnProperty.call(cat.unidades, k); }, skins);
            copiar(d.skin.uf, nuevo.skin.uf, function (k) { var p = k.split('|'); return p.length === 2 && Object.prototype.hasOwnProperty.call(cat.unidades, p[0]) && FAMILIAS.indexOf(p[1]) >= 0; }, skins);
            copiar(d.skin.efe, nuevo.skin.efe, function (k) { return Object.prototype.hasOwnProperty.call(cat.efectos, k); }, skins);
        }
        est = nuevo;
        guardarBorrador();
        pintar();
        $('#wfx_msg').text(t('Code imported. Press Save to apply it.') + (ignorados ? ' ' + t('Settings ignored (unknown here):') + ' ' + ignorados : ''));
        if (ignorados) { log(ignorados + ' ajuste(s) del codigo ignorados'); }
    }
    function restablecer() {
        est = { base: 'alto', fam: {}, uni: {}, uf: {}, efe: {}, skin: estadoSkin() };
        unidadSel = null;
        guardarBorrador();
        pintar();
        $('#wfx_msg').text(t('Custom reset. Press Save to apply it.'));
    }

    // ---------- arranque ----------
    WFX.editor = function () {
        $.ajax({ url: 'coui://ui/mods/weaponfx/efectos.json', dataType: 'text', cache: false }).then(function (txt) {
            cat = JSON.parse(txt);
            est = leerEstado();
            pintar();
            // al volver a elegir Personalizado (o tras Restore tab defaults) se relee lo que haya en los datos
            var item = model.settingsItemMap()[G + '.level'];
            if (item) { item.value.subscribe(function (v) { if (v === 'personalizado') { est = leerEstado(); pintar(); } }); }
            log('listo (' + Object.keys(cat.unidades).length + ' unidades, ' + Object.keys(cat.efectos).length + ' efectos)');
        }, function () { error('no pude leer efectos.json'); });
    };
})();
