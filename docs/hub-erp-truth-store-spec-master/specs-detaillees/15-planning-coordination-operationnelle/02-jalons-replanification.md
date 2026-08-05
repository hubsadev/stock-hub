# Planning / Coordination opérationnelle - Jalons et replanification

## Périmètre

Définir les jalons et replanifier les activités en cas de contrainte ou de retard.

## Écran / action

### Action 1 - Définir ou modifier un jalon

- Écran : Planning projet
- Action : Ajouter / modifier un jalon

### Action 2 - Replanifier une activité

- Écran : Détail activité
- Action : Replanifier

## Input

### Action 1 - Définir ou modifier un jalon

- Champ / donnée : jalon, date cible, responsable
- Source : chef de projet
- Caractère obligatoire : jalon, date
- Remarque : les jalons structurent la vue globale

### Action 2 - Replanifier une activité

- Champ / donnée : nouvelle date, motif, impact sur dépendances
- Source : planificateur
- Caractère obligatoire : nouvelle date, motif
- Remarque : peut nécessiter validation

## Traitement système

### Action 1 - Définir ou modifier un jalon

1. Vérifier droits et rattachement au projet.
2. Enregistrer le jalon avec date cible.
3. Mettre à jour les indicateurs de suivi.
4. Notifier les parties prenantes si requis.
5. Historiser la modification.

### Action 2 - Replanifier une activité

1. Vérifier les dépendances et conflits.
2. Mettre à jour les dates et les ressources associées.
3. Recalculer les impacts sur les jalons.
4. Mettre à jour la vue planning.
5. Tracer le motif de replanification.

## Output

### Action 1 - Définir ou modifier un jalon

- Résultat visible : jalon ajouté ou modifié
- Statut affiché : jalon actif
- Trace créée : historique de jalon
- Notification éventuelle : notification projet

### Action 2 - Replanifier une activité

- Résultat visible : nouvelle date affichée
- Statut affiché : activité replanifiée
- Trace créée : journal de replanification
- Notification éventuelle : alerte aux équipes impactées

## Règle métier

### Action 1 - Définir ou modifier un jalon

- Les jalons doivent être suivables dans le temps.
- Le jalon doit être rattaché à un projet.

### Action 2 - Replanifier une activité

- Une activité peut être replanifiée en cas de contrainte ou de retard.
- Les changements doivent rester traçables.

## Exception

### Action 1 - Définir ou modifier un jalon

- Cas : jalon en doublon
  Effet attendu : avertissement et refus si non autorisé
- Cas : jalon atteint administrativement mais pas terrain
  Effet attendu : alerte d'écart

### Action 2 - Replanifier une activité

- Cas : replanification répétée
  Effet attendu : alerte et validation requise
- Cas : conflit de ressource
  Effet attendu : proposition de nouvel horaire
## Liens documentaires

- Relation -> [README du module](./README.md) : porte d’entrée du module Planning / Coordination opérationnelle
- Relation -> [Matrice 15-planning-coordination-operationnelle.md](../../matrices/15-planning-coordination-operationnelle.md) : correspondance consolidée entre concept, user story, règle métier et flux
- Relation -> [use-cases.md](../../use-cases.md) : cas d’usage de référence du module appliqués à cette fiche
- Relation -> [user-stories.md](../../user-stories.md) : attentes exprimées côté utilisateur appliqués à cette fiche
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences fonctionnelles à décliner appliqués à cette fiche
- Relation -> [business-rules.md](../../business-rules.md) : règles métier structurantes appliqués à cette fiche
- Relation -> [permissions.md](../../permissions.md) : habilitations et rôles associés appliqués à cette fiche
- Relation -> [state-transitions.md](../../state-transitions.md) : transitions d’état concernées appliqués à cette fiche
- Relation -> [edge-cases.md](../../edge-cases.md) : cas limites à rejouer en recette appliqués à cette fiche
- Relation -> [user-flows.md](../../user-flows.md) : parcours opérationnels de référence appliqués à cette fiche

## Liens inter-modules

- Relation -> [03-anomalies-cloture-ot.md](../../07-execution-terrain-ordres-de-travail/03-anomalies-cloture-ot.md) : les retards d’OT peuvent imposer une replanification des jalons
- Relation -> [03-blocage-controle-interne.md](../../16-gouvernance-validation-controle-interne/03-blocage-controle-interne.md) : certaines replanifications peuvent être bloquées par les règles de contrôle interne
- Relation -> [03-risques-cockpit-projet.md](../../18-vue-transverse-affaire-projet/03-risques-cockpit-projet.md) : les retards et jalons glissants doivent remonter dans le cockpit projet

