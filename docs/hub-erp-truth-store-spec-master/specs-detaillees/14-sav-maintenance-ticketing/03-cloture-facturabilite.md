# SAV / Maintenance / Ticketing - Clôture et facturabilité

## Périmètre

Clôturer le ticket après résolution, enregistrer la cause racine et décider de la facturabilité.

## Écran / action

### Action 1 - Clôturer le ticket

- Écran : Fiche ticket
- Action : Clôturer

### Action 2 - Déterminer la facturabilité

- Écran : Fiche ticket / Résolution
- Action : Définir couvert par contrat / facturable

## Input

### Action 1 - Clôturer le ticket

- Champ / donnée : cause racine, résolution, temps total, pièces remplacées
- Source : technicien ou support
- Caractère obligatoire : cause racine, résolution
- Remarque : la résolution doit être documentée

### Action 2 - Déterminer la facturabilité

- Champ / donnée : statut de garantie, contrat, décision facturable, commentaire
- Source : support ou gestionnaire contrat
- Caractère obligatoire : décision facturable
- Remarque : la décision doit être tracée

## Traitement système

### Action 1 - Clôturer le ticket

1. Vérifier que l'intervention est terminée.
2. Contrôler la présence des informations obligatoires.
3. Mettre à jour le statut en "Résolu" puis "Clos".
4. Enregistrer la cause racine et les temps.
5. Historiser la clôture.

### Action 2 - Déterminer la facturabilité

1. Vérifier l'existence d'un contrat ou d'une garantie.
2. Appliquer les règles de couverture.
3. Enregistrer la décision de facturabilité.
4. Si facturable, préparer la transmission à la facturation.
5. Tracer la décision et l'utilisateur.

## Output

### Action 1 - Clôturer le ticket

- Résultat visible : ticket clos
- Statut affiché : Clos
- Trace créée : historique de clôture
- Notification éventuelle : information client si prévu

### Action 2 - Déterminer la facturabilité

- Résultat visible : décision visible sur le ticket
- Statut affiché : Facturable / Non facturable
- Trace créée : journal de décision
- Notification éventuelle : comptabilité si facturable

## Règle métier

### Action 1 - Clôturer le ticket

- La cause racine doit être enregistrable à la clôture.
- La résolution doit être documentée pour tout ticket clos.

### Action 2 - Déterminer la facturabilité

- Une intervention couverte par maintenance incluse n'est pas facturée à l'unité.
- Une intervention hors périmètre ou hors garantie est facturable.

## Exception

### Action 1 - Clôturer le ticket

- Cas : SLA suspendu par attente client
  Effet attendu : statut "Suspendu" et recalcul SLA
- Cas : informations de résolution incomplètes
  Effet attendu : blocage de la clôture

### Action 2 - Déterminer la facturabilité

- Cas : contrat expiré
  Effet attendu : facturabilité proposée par défaut
- Cas : contestation client
  Effet attendu : ticket marqué en litige
## Liens documentaires

- Relation -> [README du module](./README.md) : porte d’entrée du module SAV / Maintenance / Ticketing
- Relation -> [Matrice 14-sav-maintenance-ticketing.md](../../matrices/14-sav-maintenance-ticketing.md) : correspondance consolidée entre concept, user story, règle métier et flux
- Relation -> [use-cases.md](../../use-cases.md) : cas d’usage de référence du module appliqués à cette fiche
- Relation -> [user-stories.md](../../user-stories.md) : attentes exprimées côté utilisateur appliqués à cette fiche
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences fonctionnelles à décliner appliqués à cette fiche
- Relation -> [business-rules.md](../../business-rules.md) : règles métier structurantes appliqués à cette fiche
- Relation -> [permissions.md](../../permissions.md) : habilitations et rôles associés appliqués à cette fiche
- Relation -> [state-transitions.md](../../state-transitions.md) : transitions d’état concernées appliqués à cette fiche
- Relation -> [edge-cases.md](../../edge-cases.md) : cas limites à rejouer en recette appliqués à cette fiche
- Relation -> [user-flows.md](../../user-flows.md) : parcours opérationnels de référence appliqués à cette fiche

## Liens inter-modules

- Relation -> [03-pv-base-facturation.md](../../08-pv-preuves-de-realisation/03-pv-base-facturation.md) : la clôture SAV partage la logique de justification de facturation par preuve de réalisation
- Relation -> [02-modes-contractuels-specifiques.md](../../12-facturation/02-modes-contractuels-specifiques.md) : la facturabilité dépend du contrat, de la garantie ou du hors périmètre
- Relation -> [03-kpi-maintenance.md](../../17-reporting-kpi-direction/03-kpi-maintenance.md) : la clôture et la décision de facturation alimentent les KPI maintenance

