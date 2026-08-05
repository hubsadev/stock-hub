# Graphe des liens

Ce fichier donne une vue synthétique des relations entre :

- les documents sources du cadrage
- les matrices de synthèse
- les modules de spécification détaillée
- les principaux flux inter-modules

- Relation -> [GRAPHE-DOCUMENTAIRE.md](./GRAPHE-DOCUMENTAIRE.md) : version plus compacte centrée sur les liens forts entre modules.

## Légende des relations

- `S'appuie sur` : le contenu métier est dérivé ou précisé à partir du fichier source.
- `Contraint par` : le fichier cible porte une règle, un droit ou un changement d'état imposé.
- `Déclenche` : l'action décrite produit un objet ou une étape dans un autre module.
- `Alimente` : la donnée produite sert d'entrée métier à un autre module.
- `Dépend de` : le module a besoin du fichier cible comme prérequis.
- `Est consolidé dans` : la donnée est visible dans un cockpit, une vue transverse ou un reporting.
- `Partage le workflow avec` : la logique traverse plusieurs modules dans un même parcours.

## Graphe documentaire

```mermaid
flowchart LR
    PG["problems-goals.md"] --> MAT["matrices/*.md"]
    UC["use-cases.md"] --> MAT
    US["user-stories.md"] --> MAT
    FR["functionnal-requirements.md"] --> MAT
    AC["acceptance-criteria.md"] --> MAT
    BR["business-rules.md"] --> MAT
    PM["permissions.md"] --> MAT
    ST["state-transitions.md"] --> MAT
    EC["edge-cases.md"] --> MAT
    UF["user-flows.md"] --> MAT
    MAT --> MOD["specs-detaillees/*/README.md"]
    MOD --> FCH["specs-detaillees/*/*.md"]
```

## Graphe inter-modules

```mermaid
flowchart LR
    M01["01 Référentiel"] -- "fournit les données de base" --> M02["02 Avant-vente"]
    M01 -- "fournit les données de base" --> M03["03 Contrats / Affaires / Projets"]
    M01 -- "fournit articles, tiers, sites" --> M05["05 Achats"]
    M01 -- "fournit articles, dépôts, ressources" --> M06["06 Stock / Logistique / Magasin"]
    M01 -- "fournit ressources et équipements" --> M07["07 Exécution terrain / OT"]
    M01 -- "fournit parc et tiers" --> M14["14 SAV / Maintenance / Ticketing"]

    M02 -- "déclenche" --> M03
    M03 -- "cadre" --> M04["04 Budget / Pilotage financier projet"]
    M03 -- "cadre" --> M05
    M03 -- "cadre" --> M07
    M03 -- "cadre" --> M11["11 BTP / Avancement / Attachements / Situations"]
    M03 -- "cadre" --> M12["12 Facturation"]

    M04 -- "autorise / contraint" --> M05
    M04 -- "alimente" --> M10["10 Coûts analytiques / Rentabilité"]
    M04 -- "alimente" --> M17["17 Reporting / KPI / Direction"]

    M05 -- "déclenche réceptions et réservations" --> M06
    M06 -- "alimente pièces et sorties" --> M07
    M06 -- "alimente pièces SAV" --> M14

    M07 -- "produit preuves" --> M08["08 PV / Preuves de réalisation"]
    M07 -- "alimente temps terrain" --> M09["09 Temps / Ressources / Pointage"]
    M07 -- "alimente coûts" --> M10
    M07 -- "alimente facturation" --> M12

    M08 -- "autorise ou bloque" --> M12
    M09 -- "alimente coûts" --> M10
    M10 -- "alimente pilotage" --> M17

    M11 -- "alimente situations" --> M12
    M12 -- "génère échéances" --> M13["13 Encaissement / Recouvrement"]
    M13 -- "alimente trésorerie et KPI" --> M17

    M14 -- "peut déclencher OT" --> M07
    M14 -- "alimente coûts et temps" --> M09
    M14 -- "alimente coûts" --> M10
    M14 -- "alimente facturation SAV" --> M12

    M15["15 Planning / Coordination opérationnelle"] -- "planifie" --> M07
    M15 -- "planifie" --> M11
    M15 -- "planifie" --> M14

    M16["16 Gouvernance / Validation / Contrôle interne"] -- "contrôle" --> M05
    M16 -- "contrôle" --> M08
    M16 -- "contrôle" --> M12
    M16 -- "contrôle" --> M13
    M16 -- "contrôle" --> M14

    M03 -- "est consolidé dans" --> M18["18 Vue transverse Affaire / Projet"]
    M04 -- "est consolidé dans" --> M18
    M07 -- "est consolidé dans" --> M18
    M10 -- "est consolidé dans" --> M18
    M12 -- "est consolidé dans" --> M18
    M13 -- "est consolidé dans" --> M18
    M14 -- "est consolidé dans" --> M18
    M15 -- "est consolidé dans" --> M18
    M17 -- "agrège les indicateurs de" --> M18
```

## Lecture recommandée

- Lire d'abord les `README.md` de module pour comprendre les dépendances globales.
- Descendre ensuite dans les fiches de flow pour voir les liens précis entre objets et écrans.
- Utiliser les matrices comme niveau de synthèse entre sources racines et spécifications détaillées.
