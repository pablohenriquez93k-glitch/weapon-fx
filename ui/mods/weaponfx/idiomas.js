// Weapon FX: traducciones extra (escena settings, antes de opciones.js). El español vive en opciones.js.
// K = textos en ingles (clave loc); cada idioma es una lista en el MISMO orden. Codigo del juego: i18n.lng()
// (se busca el codigo entero y luego la parte antes del guion: pl-PL -> pl, pt-BR -> pt, zh-TW/zh-HK -> zh).
(function () {
    'use strict';
    var WFX = window.WeaponFX = window.WeaponFX || {};
    var K = [
        "Skin", "No skin", "(Global skin)", "(Base skin)", "(Family skin)", "(Unit skin)",
        "Weapon FX", "Weapon effects", "Effects level", "Low", "Original", "High", "Uber", "Custom",
        "Low: lighter than the original game, for slower computers. Original: the game effects, unchanged. High: stronger, richer effects. Uber: the strongest.",
        "Changes apply when you press Save. During a match the screen goes black for a moment while the effects reload.",
        "Base level", "By weapon family", "By unit and effect", "Share", "(Base level)", "(Family level)", "(Unit level)",
        "Unit level", "Unit type", "Unit", "(Choose a unit)", "(By family)", "Land units", "Structures", "Air units",
        "Naval units", "Orbital units", "Commanders", "Laser commanders", "also:", "Shared with", "shared with",
        "Changing these also changes them in", "Level in", "Nuke explosion", "Mine explosion",
        "shared by __n__ commanders", "Other (explosions)", "Units with their own settings:",
        "Ballistic (bullets and shells)", "Explosive (artillery, bombs)", "Laser", "Energy (Tesla, cold lasers)",
        "Missiles", "Anti-air", "Torpedoes", "Flamethrowers", "Muzzle flash", "Trail / beam", "Impact",
        "Ground blast when firing", "Export", "Import", "Reset custom", "Paste a code here and press Import",
        "Code ready: select it and copy it with Ctrl+C.", "That code is not valid. Nothing was changed.",
        "Code imported. Press Save to apply it.", "Settings ignored (unknown here):", "Custom reset. Press Save to apply it."
    ];
    var IDIOMAS = {
        'fr': [
            "Apparence", "Sans apparence", "(Apparence globale)", "(Apparence de base)", "(Apparence de la famille)", "(Apparence de l’unité)",
            "Weapon FX", "Effets d'armes", "Niveau des effets", "Bas", "Original", "Élevé", "Uber", "Personnalisé",
            "Bas : plus légers que le jeu d'origine, pour les ordinateurs lents. Original : les effets du jeu, sans changement. Élevé : des effets plus forts et plus riches. Uber : les plus forts.",
            "Les changements s'appliquent quand vous appuyez sur Enregistrer. En pleine partie, l'écran devient noir un instant pendant le rechargement des effets.",
            "Niveau de base", "Par famille d'armes", "Par unité et effet", "Partager", "(Niveau de base)", "(Niveau de la famille)", "(Niveau de l'unité)",
            "Niveau de l'unité", "Type d'unité", "Unité", "(Choisissez une unité)", "(Par famille)", "Unités terrestres", "Structures", "Unités aériennes",
            "Unités navales", "Unités orbitales", "Commandants", "Commandants à laser", "aussi :", "Partagé avec", "partagé avec",
            "Les modifier ici les modifie aussi dans", "Niveau dans", "Explosion nucléaire", "Explosion de mine",
            "partagé par __n__ commandants", "Autres (explosions)", "Unités avec leurs propres réglages :",
            "Balistique (balles et obus)", "Explosive (artillerie, bombes)", "Laser", "Énergie (Tesla, lasers froids)",
            "Missiles", "Antiaérien", "Torpilles", "Lance-flammes", "Flash de bouche", "Traînée / faisceau", "Impact",
            "Souffle au sol au tir", "Exporter", "Importer", "Réinitialiser le personnalisé", "Collez un code ici et appuyez sur Importer",
            "Code prêt : sélectionnez-le et copiez-le avec Ctrl+C.", "Ce code n'est pas valide. Rien n'a été modifié.",
            "Code importé. Appuyez sur Enregistrer pour l'appliquer.", "Réglages ignorés (inconnus ici) :", "Personnalisé réinitialisé. Appuyez sur Enregistrer pour l'appliquer."
        ],
        'de': [
            "Skin", "Kein Skin", "(Globaler Skin)", "(Basis-Skin)", "(Skin der Familie)", "(Skin der Einheit)",
            "Weapon FX", "Waffeneffekte", "Effektstufe", "Niedrig", "Original", "Hoch", "Uber", "Benutzerdefiniert",
            "Niedrig: leichter als im Originalspiel, für langsamere Computer. Original: die Effekte des Spiels, unverändert. Hoch: stärkere, reichere Effekte. Uber: die stärksten.",
            "Änderungen werden übernommen, wenn du auf Speichern drückst. Während eines Spiels wird der Bildschirm kurz schwarz, während die Effekte neu geladen werden.",
            "Grundstufe", "Nach Waffenfamilie", "Nach Einheit und Effekt", "Teilen", "(Grundstufe)", "(Stufe der Familie)", "(Stufe der Einheit)",
            "Stufe der Einheit", "Einheitentyp", "Einheit", "(Einheit wählen)", "(Nach Familie)", "Landeinheiten", "Gebäude", "Lufteinheiten",
            "Marineeinheiten", "Orbitaleinheiten", "Kommandanten", "Laser-Kommandanten", "auch:", "Geteilt mit", "geteilt mit",
            "Eine Änderung hier ändert sie auch in", "Stufe in", "Atomexplosion", "Minenexplosion",
            "geteilt von __n__ Kommandanten", "Andere (Explosionen)", "Einheiten mit eigenen Einstellungen:",
            "Ballistisch (Kugeln und Granaten)", "Explosiv (Artillerie, Bomben)", "Laser", "Energie (Tesla, kalte Laser)",
            "Raketen", "Flugabwehr", "Torpedos", "Flammenwerfer", "Mündungsfeuer", "Spur / Strahl", "Einschlag",
            "Bodendruckwelle beim Feuern", "Exportieren", "Importieren", "Benutzerdefiniert zurücksetzen", "Code hier einfügen und Importieren drücken",
            "Code bereit: markiere ihn und kopiere ihn mit Strg+C.", "Dieser Code ist ungültig. Nichts wurde geändert.",
            "Code importiert. Drücke Speichern, um ihn anzuwenden.", "Ignorierte Einstellungen (hier unbekannt):", "Benutzerdefiniert zurückgesetzt. Drücke Speichern, um es anzuwenden."
        ],
        'ru': [
            "Облик", "Без облика", "(Общий облик)", "(Базовый облик)", "(Облик семейства)", "(Облик юнита)",
            "Weapon FX", "Эффекты оружия", "Уровень эффектов", "Низкий", "Оригинал", "Высокий", "Uber", "Свой",
            "Низкий: легче, чем в оригинальной игре, для слабых компьютеров. Оригинал: эффекты игры без изменений. Высокий: более мощные и насыщенные эффекты. Uber: самые мощные.",
            "Изменения применяются после нажатия «Сохранить». Во время матча экран на мгновение станет чёрным, пока эффекты перезагружаются.",
            "Базовый уровень", "По семействам оружия", "По юнитам и эффектам", "Поделиться", "(Базовый уровень)", "(Уровень семейства)", "(Уровень юнита)",
            "Уровень юнита", "Тип юнита", "Юнит", "(Выберите юнит)", "(По семейству)", "Наземные юниты", "Сооружения", "Воздушные юниты",
            "Морские юниты", "Орбитальные юниты", "Командиры", "Командиры с лазером", "также:", "Общий с", "общий с",
            "Изменение здесь меняет их и в", "Уровень в", "Ядерный взрыв", "Взрыв мины",
            "общий для __n__ командиров", "Прочее (взрывы)", "Юниты со своими настройками:",
            "Баллистическое (пули и снаряды)", "Взрывное (артиллерия, бомбы)", "Лазер", "Энергетическое (Тесла, холодные лазеры)",
            "Ракеты", "ПВО", "Торпеды", "Огнемёты", "Дульная вспышка", "След / луч", "Попадание",
            "Удар по земле при выстреле", "Экспорт", "Импорт", "Сбросить свои настройки", "Вставьте код сюда и нажмите «Импорт»",
            "Код готов: выделите его и скопируйте с помощью Ctrl+C.", "Этот код недействителен. Ничего не изменено.",
            "Код импортирован. Нажмите «Сохранить», чтобы применить.", "Пропущенные настройки (здесь неизвестны):", "Свои настройки сброшены. Нажмите «Сохранить», чтобы применить."
        ],
        'zh': [
            "皮肤", "无皮肤", "（全局皮肤）", "（基础皮肤）", "（武器类别皮肤）", "（单位皮肤）",
            "Weapon FX", "武器特效", "特效等级", "低", "原版", "高", "Uber", "自定义",
            "低：比原版更轻量，适合较慢的电脑。原版：游戏自带特效，不做改动。高：更强、更丰富的特效。Uber：最强。",
            "按下保存后生效。对局中重新加载特效时，屏幕会短暂变黑。",
            "基础等级", "按武器类别", "按单位和特效", "分享", "（基础等级）", "（类别等级）", "（单位等级）",
            "单位等级", "单位类型", "单位", "（选择一个单位）", "（按类别）", "陆地单位", "建筑", "空中单位",
            "海军单位", "轨道单位", "指挥官", "激光指挥官", "另见：", "共用于", "共用于",
            "在此修改也会修改：", "等级：", "核爆炸", "地雷爆炸",
            "由 __n__ 个指挥官共用", "其他（爆炸）", "有独立设置的单位：",
            "弹道（子弹和炮弹）", "爆炸（火炮、炸弹）", "激光", "能量（特斯拉、冷色激光）",
            "导弹", "防空", "鱼雷", "火焰喷射器", "枪口焰", "尾迹 / 光束", "命中",
            "开火时的地面冲击", "导出", "导入", "重置自定义", "在此粘贴代码并按导入",
            "代码已就绪：选中它并用 Ctrl+C 复制。", "该代码无效。未做任何更改。",
            "代码已导入。按保存以应用。", "已忽略的设置（此处不存在）：", "自定义已重置。按保存以应用。"
        ],
        'ja': [
            "スキン", "スキンなし", "（全体のスキン）", "（基本スキン）", "（ファミリーのスキン）", "（ユニットのスキン）",
            "Weapon FX", "武器エフェクト", "エフェクトレベル", "低", "オリジナル", "高", "Uber", "カスタム",
            "低：元のゲームより軽く、低スペックPC向け。オリジナル：ゲームのエフェクトそのまま。高：より強く豊かなエフェクト。Uber：最も強い。",
            "変更は「保存」を押すと適用されます。試合中はエフェクトの再読み込みのため、画面が一瞬暗くなります。",
            "基本レベル", "武器ファミリー別", "ユニット・エフェクト別", "共有", "（基本レベル）", "（ファミリーのレベル）", "（ユニットのレベル）",
            "ユニットのレベル", "ユニットの種類", "ユニット", "（ユニットを選択）", "（ファミリー別）", "地上ユニット", "建造物", "航空ユニット",
            "海軍ユニット", "軌道ユニット", "コマンダー", "レーザー装備のコマンダー", "他にも：", "共有先", "共有先",
            "ここで変更すると次でも変わります：", "レベル：", "核爆発", "地雷の爆発",
            "__n__ 体のコマンダーで共有", "その他（爆発）", "個別設定のあるユニット：",
            "実弾（弾丸・砲弾）", "爆発（砲撃・爆弾）", "レーザー", "エネルギー（テスラ・冷色レーザー）",
            "ミサイル", "対空", "魚雷", "火炎放射器", "マズルフラッシュ", "軌跡 / ビーム", "着弾",
            "発射時の地面衝撃", "エクスポート", "インポート", "カスタムをリセット", "ここにコードを貼り付けて「インポート」を押してください",
            "コードの準備完了：選択して Ctrl+C でコピーしてください。", "このコードは無効です。何も変更されていません。",
            "コードをインポートしました。「保存」を押すと適用されます。", "無視された設定（ここには存在しません）：", "カスタムをリセットしました。「保存」を押すと適用されます。"
        ],
        'ko': [
            "스킨", "스킨 없음", "(전체 스킨)", "(기본 스킨)", "(무기 계열 스킨)", "(유닛 스킨)",
            "Weapon FX", "무기 효과", "효과 수준", "낮음", "원본", "높음", "Uber", "사용자 지정",
            "낮음: 원래 게임보다 가벼워 느린 컴퓨터에 적합합니다. 원본: 게임 효과 그대로입니다. 높음: 더 강하고 풍부한 효과. Uber: 가장 강함.",
            "저장을 누르면 변경 사항이 적용됩니다. 경기 중에는 효과를 다시 불러오는 동안 화면이 잠시 검게 변합니다.",
            "기본 수준", "무기 계열별", "유닛 및 효과별", "공유", "(기본 수준)", "(계열 수준)", "(유닛 수준)",
            "유닛 수준", "유닛 유형", "유닛", "(유닛 선택)", "(계열별)", "지상 유닛", "구조물", "공중 유닛",
            "해군 유닛", "궤도 유닛", "사령관", "레이저 사령관", "또한:", "공유 대상", "공유 대상",
            "여기서 바꾸면 다음에서도 바뀝니다:", "수준:", "핵폭발", "지뢰 폭발",
            "사령관 __n__명이 공유", "기타(폭발)", "개별 설정이 있는 유닛:",
            "탄도(총알 및 포탄)", "폭발(포병, 폭탄)", "레이저", "에너지(테슬라, 차가운 레이저)",
            "미사일", "대공", "어뢰", "화염방사기", "총구 섬광", "궤적 / 빔", "착탄",
            "발사 시 지면 충격", "내보내기", "가져오기", "사용자 지정 초기화", "여기에 코드를 붙여넣고 가져오기를 누르세요",
            "코드 준비 완료: 선택한 뒤 Ctrl+C로 복사하세요.", "유효하지 않은 코드입니다. 아무것도 바뀌지 않았습니다.",
            "코드를 가져왔습니다. 저장을 눌러 적용하세요.", "무시된 설정(여기에는 없음):", "사용자 지정을 초기화했습니다. 저장을 눌러 적용하세요."
        ],
        'it': [
            "Skin", "Nessuna skin", "(Skin globale)", "(Skin di base)", "(Skin della famiglia)", "(Skin dell’unità)",
            "Weapon FX", "Effetti delle armi", "Livello degli effetti", "Basso", "Originale", "Alto", "Uber", "Personalizzato",
            "Basso: più leggeri del gioco originale, per computer lenti. Originale: gli effetti del gioco, invariati. Alto: effetti più forti e ricchi. Uber: i più forti.",
            "Le modifiche si applicano quando premi Salva. Durante una partita lo schermo diventa nero per un attimo mentre gli effetti si ricaricano.",
            "Livello base", "Per famiglia di armi", "Per unità ed effetto", "Condividi", "(Livello base)", "(Livello della famiglia)", "(Livello dell'unità)",
            "Livello dell'unità", "Tipo di unità", "Unità", "(Scegli un'unità)", "(Per famiglia)", "Unità terrestri", "Strutture", "Unità aeree",
            "Unità navali", "Unità orbitali", "Comandanti", "Comandanti laser", "anche:", "Condiviso con", "condiviso con",
            "Modificarli qui li modifica anche in", "Livello in", "Esplosione nucleare", "Esplosione di mina",
            "condiviso da __n__ comandanti", "Altro (esplosioni)", "Unità con impostazioni proprie:",
            "Balistica (proiettili e granate)", "Esplosiva (artiglieria, bombe)", "Laser", "Energia (Tesla, laser freddi)",
            "Missili", "Antiaerea", "Siluri", "Lanciafiamme", "Vampata di bocca", "Scia / raggio", "Impatto",
            "Onda d'urto a terra allo sparo", "Esporta", "Importa", "Ripristina personalizzato", "Incolla qui un codice e premi Importa",
            "Codice pronto: selezionalo e copialo con Ctrl+C.", "Questo codice non è valido. Non è stato cambiato nulla.",
            "Codice importato. Premi Salva per applicarlo.", "Impostazioni ignorate (qui non esistono):", "Personalizzato ripristinato. Premi Salva per applicarlo."
        ],
        'pl': [
            "Skórka", "Bez skórki", "(Skórka globalna)", "(Skórka bazowa)", "(Skórka rodziny)", "(Skórka jednostki)",
            "Weapon FX", "Efekty broni", "Poziom efektów", "Niski", "Oryginalny", "Wysoki", "Uber", "Własny",
            "Niski: lżejsze niż w oryginalnej grze, dla wolniejszych komputerów. Oryginalny: efekty z gry, bez zmian. Wysoki: mocniejsze, bogatsze efekty. Uber: najmocniejsze.",
            "Zmiany zostaną zastosowane po naciśnięciu Zapisz. W trakcie meczu ekran na chwilę zrobi się czarny podczas przeładowania efektów.",
            "Poziom bazowy", "Według rodziny broni", "Według jednostki i efektu", "Udostępnij", "(Poziom bazowy)", "(Poziom rodziny)", "(Poziom jednostki)",
            "Poziom jednostki", "Typ jednostki", "Jednostka", "(Wybierz jednostkę)", "(Według rodziny)", "Jednostki lądowe", "Budynki", "Jednostki powietrzne",
            "Jednostki morskie", "Jednostki orbitalne", "Dowódcy", "Dowódcy z laserem", "także:", "Wspólne z", "wspólne z",
            "Zmiana tutaj zmienia je też w", "Poziom w", "Wybuch nuklearny", "Wybuch miny",
            "wspólne dla __n__ dowódców", "Inne (wybuchy)", "Jednostki z własnymi ustawieniami:",
            "Balistyczna (pociski i granaty)", "Wybuchowa (artyleria, bomby)", "Laser", "Energia (Tesla, zimne lasery)",
            "Rakiety", "Przeciwlotnicza", "Torpedy", "Miotacze ognia", "Błysk wylotowy", "Smuga / wiązka", "Trafienie",
            "Podmuch przy ziemi przy strzale", "Eksportuj", "Importuj", "Resetuj własne", "Wklej tutaj kod i naciśnij Importuj",
            "Kod gotowy: zaznacz go i skopiuj za pomocą Ctrl+C.", "Ten kod jest nieprawidłowy. Nic nie zmieniono.",
            "Kod zaimportowany. Naciśnij Zapisz, aby go zastosować.", "Pominięte ustawienia (tu nieznane):", "Własne ustawienia zresetowane. Naciśnij Zapisz, aby je zastosować."
        ],
        'pt': [
            "Skin", "Sem skin", "(Skin global)", "(Skin base)", "(Skin da família)", "(Skin da unidade)",
            "Weapon FX", "Efeitos de armas", "Nível dos efeitos", "Baixo", "Original", "Alto", "Uber", "Personalizado",
            "Baixo: mais leves que os do jogo original, para computadores mais lentos. Original: os efeitos do jogo, sem mudanças. Alto: efeitos mais fortes e ricos. Uber: os mais fortes.",
            "As mudanças são aplicadas quando você pressiona Salvar. Durante uma partida, a tela fica preta por um instante enquanto os efeitos recarregam.",
            "Nível base", "Por família de armas", "Por unidade e efeito", "Compartilhar", "(Nível base)", "(Nível da família)", "(Nível da unidade)",
            "Nível da unidade", "Tipo de unidade", "Unidade", "(Escolha uma unidade)", "(Por família)", "Unidades terrestres", "Estruturas", "Unidades aéreas",
            "Unidades navais", "Unidades orbitais", "Comandantes", "Comandantes com laser", "também:", "Compartilhado com", "compartilhado com",
            "Mudar aqui também muda em", "Nível em", "Explosão nuclear", "Explosão de mina",
            "compartilhado por __n__ comandantes", "Outros (explosões)", "Unidades com ajustes próprios:",
            "Balística (balas e projéteis)", "Explosiva (artilharia, bombas)", "Laser", "Energia (Tesla, lasers frios)",
            "Mísseis", "Antiaérea", "Torpedos", "Lança-chamas", "Clarão do disparo", "Rastro / feixe", "Impacto",
            "Impacto no solo ao disparar", "Exportar", "Importar", "Redefinir personalizado", "Cole um código aqui e pressione Importar",
            "Código pronto: selecione-o e copie com Ctrl+C.", "Esse código não é válido. Nada foi alterado.",
            "Código importado. Pressione Salvar para aplicá-lo.", "Ajustes ignorados (não existem aqui):", "Personalizado redefinido. Pressione Salvar para aplicá-lo."
        ]
    };
    WFX.TRAD = WFX.TRAD || {};
    for (var lng in IDIOMAS) {
        if (IDIOMAS[lng].length !== K.length) { console.error('[Weapon FX] ERROR idioma ' + lng + ': ' + IDIOMAS[lng].length + ' textos, se esperaban ' + K.length); continue; }
        var t = WFX.TRAD[lng] = {};
        for (var i = 0; i < K.length; i++) { t[K[i]] = IDIOMAS[lng][i]; }
    }
})();
