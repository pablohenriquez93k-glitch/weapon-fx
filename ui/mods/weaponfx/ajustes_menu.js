// Weapon FX: pestaña propia en Settings (scene "settings", tambien el menu dentro de la partida).
// settings.js vanilla carga los mods ANTES de ko.applyBindings: el HTML agregado aqui queda enlazado.
// Estructura calcada de Gameplay y de AtmosphereWeather: UN form-group con sub-group-title + sub-group
// (.option-list es columna flex de alto fijo: con varios hijos directos Coherent los encoge y se enciman).
// Textos con data-bind "text: loc(...)" (los <loc> del documento ya se tradujeron antes de este HTML).
(function () {
    try {
        var WFX = window.WeaponFX, G = WFX.GRUPO;
        model.settingDefinitions(api.settings.definitions);   // las computadas ya se evaluaron: forzar recalculo
        var item = '$root.settingsItemMap()[\'' + G + '.level\']';
        var itemSkin = '$root.settingsItemMap()[\'' + G + '.skin\']';
        var itemEquipo = '$root.settingsItemMap()[\'' + G + '.team_color\']';
        var L = function (s) { return 'loc(\'!LOC:' + s + '\')'; };
        var NOTA = 'style="opacity:0.7; margin:0 0 10px;"';
        var texto = function (s, estilo, visible) {
            return '<div ' + estilo + ' data-bind="' + (visible ? 'visible: ' + visible + ', ' : '') + 'text: ' + L(s) + '"></div>';
        };
        var html =
            texto('Weapon effects', 'class="sub-group-title"') +
            '<div class="sub-group top" style="flex-wrap:wrap; min-height:0;">' +
            '<div class="option" data-bind="template: { name: \'setting-template\', data: ' + item + ' }"></div>' +
            '<div class="option" data-bind="template: { name: \'setting-template\', data: ' + itemSkin + ' }"></div>' +
            '<div class="option" data-bind="template: { name: \'setting-template\', data: ' + itemEquipo + ' }"></div></div>' +
            WFX.NOTAS.map(function (n) { return texto(n, NOTA); }).join('') +
            '<div id="wfx_editor" data-bind="visible: ' + item + '.value() === \'personalizado\'"></div>';
        $('head').append('<style>' +
            '#wfx_editor .wfx-fila{display:flex;align-items:center;flex-wrap:wrap;margin:3px 0;}' +
            '#wfx_editor .wfx-etq{width:300px;}' +
            '#wfx_editor .wfx-sel{width:220px;background:#111;color:#fff;border:1px solid #666;padding:2px;}' +
            '#wfx_editor .wfx-nota{opacity:0.7;margin:2px 0 6px 10px;}' +
            '#wfx_editor .wfx-titulo{font-size:16px;color:#8fd3ff;margin:10px 0 4px;}' +
            '#wfx_editor .wfx-codigo{width:90%;height:48px;background:#111;color:#fff;border:1px solid #666;margin:4px 0;}' +
            '#wfx_editor .wfx-boton{margin:3px 8px 3px 0;padding:4px 12px;background:#284654;border:1px solid #66828f;color:#fff;cursor:pointer;}' +
            '#wfx_editor .wfx-boton:hover{background:#396272;}' +
            '#wfx_editor .wfx-familia{margin-top:8px;padding-left:16px;font-weight:bold;}' +
            '#wfx_editor .wfx-efecto{padding-left:36px;}' +
            '</style>');
        $('.container_settings').append(
            '<div class="option-list" style="max-height:100%; overflow-y:auto; overflow-x:hidden;" data-bind="visible: $root.activeSettingsGroup() === \'' +
            G + '\', deferBindingsUntilVisible: true"><div class="form-group" style="flex-shrink:0;">' + html + '</div></div>');
        console.log('[Weapon FX] settings: pestaña lista');
        WFX.editor();
    } catch (e) {
        console.error('[Weapon FX] ERROR settings: ' + (e && e.message || e));
    }
}());
