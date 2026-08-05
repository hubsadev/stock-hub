# Reporting / KPI / Direction - KPI commerciaux

## Périmètre

Consultation des indicateurs commerciaux liés aux offres et au carnet de commandes.

## Écran / action

### Action 1 - Consulter le dashboard commercial

- Écran : Dashboard KPI commerciaux
- Action : Ouvrir le tableau de bord

### Action 2 - Filtrer par période et périmètre

- Écran : Dashboard KPI commerciaux
- Action : Appliquer un filtre

## Input

### Action 1 - Consulter le dashboard commercial

- Champ / donnée : Périmètre par défaut ; Source : système ; Caractère obligatoire : oui ; Remarque : basé sur les droits utilisateur.

### Action 2 - Filtrer par période et périmètre

- Champ / donnée : Période ; Source : utilisateur habilité ; Caractère obligatoire : non ; Remarque : mois, trimestre, année.
- Champ / donnée : Périmètre (client, projet, zone) ; Source : utilisateur habilité ; Caractère obligatoire : non ; Remarque : dépend des droits.

## Traitement système

### Action 1 - Consulter le dashboard commercial

1. Vérifier les droits de consultation.
2. Agréger les données d'offres et contrats.
3. Calculer les KPI (taux de transformation, carnet de commandes).
4. Charger les graphiques et tableaux de synthèse.

### Action 2 - Filtrer par période et périmètre

1. Vérifier la validité des filtres.
2. Recalculer les KPI avec le filtre appliqué.
3. Rafraîchir les visuels.

## Output

### Action 1 - Consulter le dashboard commercial

- Résultat visible : Dashboard affiché.
- Statut affiché : Période et périmètre actifs.
- Trace créée : Aucune.
- Notification éventuelle : Aucune.

### Action 2 - Filtrer par période et périmètre

- Résultat visible : KPI filtrés.
- Statut affiché : Filtres actifs visibles.
- Trace créée : Aucune.
- Notification éventuelle : Aucune.

## Règle métier

### Action 1 - Consulter le dashboard commercial

- Règle 1 : Les KPI sont calculés à partir des données opérationnelles réellement enregistrées.
- Règle 2 : La granularité dépend des droits.

### Action 2 - Filtrer par période et périmètre

- Règle 1 : Un utilisateur ne peut filtrer que dans son périmètre autorisé.
- Règle 2 : Les KPI doivent rester cohérents avec les définitions officielles.

## Exception

### Action 1 - Consulter le dashboard commercial

- Cas : Aucune donnée disponible ; Effet attendu : dashboard vide avec message.
- Cas : Droits insuffisants ; Effet attendu : accès refusé.

### Action 2 - Filtrer par période et périmètre

- Cas : Filtre invalide ; Effet attendu : message d'erreur et filtre ignoré.
- Cas : Périmètre hors droits ; Effet attendu : filtre refusé.
## Liens documentaires

- Relation -> [README du module](./README.md) : porte d’entrée du module Reporting / KPI / Direction
- Relation -> [Matrice 17-reporting-kpi-direction.md](../../matrices/17-reporting-kpi-direction.md) : correspondance consolidée entre concept, user story, règle métier et flux
- Relation -> [use-cases.md](../../use-cases.md) : cas d’usage de référence du module appliqués à cette fiche
- Relation -> [user-stories.md](../../user-stories.md) : attentes exprimées côté utilisateur appliqués à cette fiche
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences fonctionnelles à décliner appliqués à cette fiche
- Relation -> [business-rules.md](../../business-rules.md) : règles métier structurantes appliqués à cette fiche
- Relation -> [permissions.md](../../permissions.md) : habilitations et rôles associés appliqués à cette fiche
- Relation -> [state-transitions.md](../../state-transitions.md) : transitions d’état concernées appliqués à cette fiche
- Relation -> [edge-cases.md](../../edge-cases.md) : cas limites à rejouer en recette appliqués à cette fiche
- Relation -> [user-flows.md](../../user-flows.md) : parcours opérationnels de référence appliqués à cette fiche

## Liens inter-modules

- Relation -> [04-decision-client-historique.md](../../02-avant-vente/04-decision-client-historique.md) : les KPI commerciaux se basent sur les décisions et le pipeline des offres
- Relation -> [03-affaire-rattachement-vue-consolidee.md](../../03-contrats-affaires-projets/03-affaire-rattachement-vue-consolidee.md) : la consolidation commerciale doit se faire par affaire ou projet
- Relation -> [01-facturation-par-origine.md](../../12-facturation/01-facturation-par-origine.md) : les commandes et chiffres d’affaires dérivent de la facturation émise

