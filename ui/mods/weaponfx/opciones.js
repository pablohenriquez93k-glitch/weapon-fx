// Weapon FX: opcion del menu Settings (grupo "weapon_fx"). Se carga en settings (arma la pestaña con ajustes_menu.js)
// y en new_game / connect_to_game / live_game (montaje.js lee el nivel con api.settings.value).
// El juego guarda los valores en localStorage (<uberName>.paSettings) SOLO al presionar Save: Cancel no cambia nada.
// local_only = no se sube a PlayFab. Textos en ingles con traduccion (Conocimiento Unificado/motor/settings_menu_traducciones.md).
(function () {
    'use strict';
    var WFX = window.WeaponFX = window.WeaponFX || {};
    var GRUPO = 'weapon_fx';
    var L = function (s) { return '!LOC:' + s; };

    // Traducciones propias. La clave es el texto en ingles (loc). Pablo revisa el español; el resto de idiomas esta en idiomas.js.
    var TRAD = {
        'es': {
            'Skin': 'Skin',
            'No skin': 'Sin skin',
            '(Global skin)': '(Skin global)',
            '(Base skin)': '(Skin base)',
            '(Family skin)': '(Skin de la familia)',
            '(Unit skin)': '(Skin de la unidad)',
            'Weapon FX': 'Weapon FX',
            'Weapon effects': 'Efectos de armas',
            'Effects level': 'Nivel de efectos',
            'Low': 'Bajo',
            'Original': 'Original',
            'High': 'Alto',
            'Uber': 'Uber',
            'Custom': 'Personalizado',
            'Team color': 'Color de equipo',
            'Cryogenic': 'Criogénico',
            'Toxic': 'Tóxico',
            'Inferno': 'Infierno',
            'Void': 'Vacío',
            'Holo': 'Holo',
            'Plasma': 'Plasma',
            'Robotic': 'Robótico',
            'Team color: every effect takes the color of the army that fires it, over the chosen skin and level.':
                'Color de equipo: cada efecto toma el color del ejército que dispara, sobre la skin y el nivel elegidos.',
            'Low: lighter than the original game, for slower computers. Original: the game effects, unchanged. High: stronger, richer effects. Uber: the strongest.':
                'Bajo: más livianos que los del juego, para computadores lentos. Original: los efectos del juego, sin cambios. Alto: efectos más fuertes y ricos. Uber: los más fuertes.',
            'Changes apply when you press Save. During a match the screen goes black for a moment while the effects reload.':
                'Los cambios se aplican al presionar Guardar. En plena partida la pantalla se pone negra un momento mientras se recargan los efectos.',
            'Base level': 'Nivel base',
            'By weapon family': 'Por familia de armas',
            'By unit and effect': 'Por unidad y efecto',
            'Share': 'Compartir',
            '(Base level)': '(Nivel base)',
            '(Family level)': '(Nivel de la familia)',
            '(Unit level)': '(Nivel de la unidad)',
            'Unit level': 'Nivel de la unidad',
            'Unit type': 'Tipo de unidad',
            'Unit': 'Unidad',
            '(Choose a unit)': '(Elige una unidad)',
            '(By family)': '(Por familia)',
            'Land units': 'Unidades terrestres',
            'Structures': 'Estructuras',
            'Air units': 'Unidades aéreas',
            'Naval units': 'Unidades navales',
            'Orbital units': 'Unidades orbitales',
            'Commanders': 'Comandantes',
            'Laser commanders': 'Comandantes con láser',
            'also:': 'también:',
            'Shared with': 'Compartido con',
            'shared with': 'compartido con',
            'Changing these also changes them in': 'Cambiarlos aquí también los cambia en',
            'Level in': 'Nivel en',
            'Nuke explosion': 'Explosión nuclear',
            'Mine explosion': 'Explosión de mina',
            'shared by __n__ commanders': 'compartido por __n__ comandantes',
            'Other (explosions)': 'Otros (explosiones)',
            'Units with their own settings:': 'Unidades con ajustes propios:',
            'Ballistic (bullets and shells)': 'Balística (balas y proyectiles)',
            'Explosive (artillery, bombs)': 'Explosiva (artillería, bombas)',
            'Laser': 'Láser',
            'Energy (Tesla, cold lasers)': 'Energía (Tesla, láseres fríos)',
            'Missiles': 'Misiles',
            'Anti-air': 'Antiaérea',
            'Torpedoes': 'Torpedos',
            'Flamethrowers': 'Lanzallamas',
            'Muzzle flash': 'Fogonazo',
            'Trail / beam': 'Estela / haz',
            'Impact': 'Impacto',
            'Ground blast when firing': 'Golpe en el suelo al disparar',
            'Export': 'Exportar',
            'Import': 'Importar',
            'Reset custom': 'Restablecer personalizado',
            'Paste a code here and press Import': 'Pega un código aquí y presiona Importar',
            'Code ready: select it and copy it with Ctrl+C.': 'Código listo: selecciónalo y cópialo con Ctrl+C.',
            'That code is not valid. Nothing was changed.': 'Ese código no es válido. No se cambió nada.',
            'Code imported. Press Save to apply it.': 'Código importado. Presiona Guardar para aplicarlo.',
            'Settings ignored (unknown here):': 'Ajustes ignorados (no existen aquí):',
            'Custom reset. Press Save to apply it.': 'Personalizado restablecido. Presiona Guardar para aplicarlo.'
        }
    };
    for (var idioma in (WFX.TRAD || {})) { if (!TRAD[idioma]) { TRAD[idioma] = WFX.TRAD[idioma]; } } // idiomas.js (solo settings)
    function traducir() {
        try {
            if (!window.i18n || !i18n.addResourceBundle || !i18n.lng) { return; }
            var lng = i18n.lng(), t = TRAD[lng] || TRAD[String(lng).split('-')[0]];
            if (t) { i18n.addResourceBundle(lng, 'translation', t); }
        } catch (e) { console.error('[Weapon FX] ERROR traduccion: ' + (e && e.message || e)); }
    }

    WFX.GRUPO = GRUPO;
    WFX.NIVELES_MENU = ['bajo', 'original', 'alto', 'uber', 'personalizado'];
    WFX.definicion = {
        title: 'Weapon FX',
        local_only: true,
        settings: {
            level: {
                title: L('Effects level'), type: 'select', default: 'alto',
                options: WFX.NIVELES_MENU,
                optionsText: [L('Low'), L('Original'), L('High'), L('Uber'), L('Custom')]
            },
            skin: {
                title: L('Skin'), type: 'select', default: 'ninguna',
                // listas escritas por generar_mod.py desde skins/*.json: no editar a mano
                options: ["ninguna", "criogenico", "holo", "infierno", "plasma", "robotico", "toxico", "vacio"], // SKINS
                optionsText: [L('No skin'), L("Cryogenic"), L("Holo"), L("Inferno"), L("Plasma"), L("Robotic"), L("Toxic"), L("Void")] // SKINS
            },
            // Color de equipo: montaje.js pone useArmyColor en cada emisor al montar (sin archivos extra en el mod)
            team_color: {
                title: L('Team color'), type: 'select', default: 'OFF',
                options: ['OFF', 'ON'], optionsText: ['!LOC:OFF', '!LOC:ON']   // como las opciones ON/OFF del juego
            }
        }
    };
    WFX.NOTAS = [
        'Low: lighter than the original game, for slower computers. Original: the game effects, unchanged. High: stronger, richer effects. Uber: the strongest.',
        'Team color: every effect takes the color of the army that fires it, over the chosen skin and level.',
        'Changes apply when you press Save. During a match the screen goes black for a moment while the effects reload.'
    ];

    // Registrar en todas las escenas: api.settings.value() da el default correcto si el jugador nunca guardo.
    try { if (window.api && api.settings && api.settings.definitions) { api.settings.definitions[GRUPO] = WFX.definicion; } }
    catch (e) { console.error('[Weapon FX] ERROR definicion: ' + (e && e.message || e)); }
    if (typeof model !== 'undefined' && model && model.settingDefinitions) { traducir(); }
})();
