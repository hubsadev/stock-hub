# SAV / Maintenance / Ticketing - Diagnostic et intervention

## Périmètre

Affecter le ticket, déclencher une intervention terrain si nécessaire, et consigner le diagnostic et les actions réalisées.

## Écran / action

### Action 1 - Affecter le ticket et créer un OT

- Écran : Fiche ticket
- Action : Affecter un technicien et générer un OT

### Action 2 - Saisir le diagnostic et l'intervention

- Écran : Fiche OT / Intervention
- Action : Renseigner diagnostic, temps, pièces

## Input

### Action 1 - Affecter le ticket et créer un OT

- Champ / donnée : technicien, date planifiée, priorité, site
- Source : support ou superviseur SAV
- Caractère obligatoire : technicien, date planifiée
- Remarque : l'OT doit être lié au ticket

### Action 2 - Saisir le diagnostic et l'intervention

- Champ / donnée : diagnostic, actions réalisées, temps passé, pièces remplacées, photos
- Source : technicien
- Caractère obligatoire : diagnostic, temps passé
- Remarque : les pièces remplacées doivent être tracées

## Traitement système

### Action 1 - Affecter le ticket et créer un OT

1. Vérifier les droits et la disponibilité du technicien.
2. Créer un OT lié au ticket.
3. Passer le ticket en statut "Affecté" ou "En intervention".
4. Notifier le technicien et le support.
5. Tracer l'affectation et la date planifiée.

### Action 2 - Saisir le diagnostic et l'intervention

1. Vérifier que l'OT est en cours et affecté.
2. Enregistrer le diagnostic et les actions.
3. Enregistrer les pièces remplacées et le temps passé.
4. Mettre à jour le statut de l'intervention.
5. Historiser les éléments de preuve.

## Output

### Action 1 - Affecter le ticket et créer un OT

- Résultat visible : OT créé et lié au ticket
- Statut affiché : Ticket affecté / OT planifié
- Trace créée : historique d'affectation
- Notification éventuelle : alerte technicien

### Action 2 - Saisir le diagnostic et l'intervention

- Résultat visible : diagnostic visible sur la fiche
- Statut affiché : intervention en cours / terminée
- Trace créée : journal d'intervention
- Notification éventuelle : notification au support

## Règle métier

### Action 1 - Affecter le ticket et créer un OT

- Un ticket peut générer un ordre d'intervention.
- L'OT doit rester rattaché au ticket d'origine.

### Action 2 - Saisir le diagnostic et l'intervention

- Les pièces remplacées doivent être tracées.
- Le diagnostic doit être enregistré avant clôture.

## Exception

### Action 1 - Affecter le ticket et créer un OT

- Cas : technicien indisponible
  Effet attendu : replanification ou escalade
- Cas : site inaccessible
  Effet attendu : suspension du ticket et trace

### Action 2 - Saisir le diagnostic et l'intervention

- Cas : pièce indisponible
  Effet attendu : ticket en attente et notification achat
- Cas : intervention résolue à distance
  Effet attendu : OT non requis, ticket mis à jour
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

- Relation -> [02-execution-terrain.md](../../07-execution-terrain-ordres-de-travail/02-execution-terrain.md) : le diagnostic terrain alimente directement l’exécution de l’OT
- Relation -> [01-planning-ressources.md](../../15-planning-coordination-operationnelle/01-planning-ressources.md) : l’intervention requiert une affectation de ressources planifiées
- Relation -> [02-modes-contractuels-specifiques.md](../../12-facturation/02-modes-contractuels-specifiques.md) : la couverture contrat ou garantie conditionne la suite comptable

