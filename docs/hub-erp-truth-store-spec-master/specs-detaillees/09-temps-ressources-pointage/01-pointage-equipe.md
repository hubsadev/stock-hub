# Temps / Ressources / Pointage - Pointage équipe

## Périmètre

Saisir le pointage quotidien d'une équipe et soumettre la feuille de temps.

## Écran / action

### Action 1 - Saisir le pointage

- Écran : Pointage quotidien / équipe
- Action : Enregistrer le pointage

### Action 2 - Soumettre le pointage

- Écran : Pointage quotidien / récapitulatif
- Action : Soumettre à validation

## Input

### Action 1 - Saisir le pointage

- Champ / donnée : date
- Source : sélection utilisateur
- Caractère obligatoire : oui
- Remarque : une date par feuille de temps

- Champ / donnée : équipe / employés
- Source : sélection utilisateur
- Caractère obligatoire : oui
- Remarque : membres actifs uniquement

- Champ / donnée : heures normales et supplémentaires
- Source : saisie utilisateur
- Caractère obligatoire : oui
- Remarque : séparées pour calculs

- Champ / donnée : affaire / chantier / OT / tâche
- Source : sélection utilisateur
- Caractère obligatoire : oui
- Remarque : au moins un rattachement requis

### Action 2 - Soumettre le pointage

- Champ / donnée : commentaire éventuel
- Source : saisie utilisateur
- Caractère obligatoire : non
- Remarque : utile pour validation

## Traitement système

### Action 1 - Saisir le pointage

1. Vérifier droits de saisie du chef d'équipe.
2. Vérifier champs obligatoires et cohérence des heures.
3. Enregistrer le pointage au statut "Brouillon".
4. Calculer les totaux journaliers.
5. Historiser la saisie.

### Action 2 - Soumettre le pointage

1. Vérifier que les imputations sont complètes.
2. Passer le statut à "Soumis".
3. Notifier le responsable valideur.
4. Verrouiller la saisie si requis.

## Output

### Action 1 - Saisir le pointage

- Résultat visible : pointage enregistré
- Statut affiché : Brouillon
- Trace créée : historique de saisie
- Notification éventuelle : aucune

### Action 2 - Soumettre le pointage

- Résultat visible : pointage soumis
- Statut affiché : Soumis
- Trace créée : historique de soumission
- Notification éventuelle : valideur informé

## Règle métier

### Action 1 - Saisir le pointage

- Règle 1 : chaque heure pointée doit être rattachée à un objet métier.
- Règle 2 : heures normales et supplémentaires doivent être distinguées.

### Action 2 - Soumettre le pointage

- Règle 1 : un pointage non rattaché ne peut pas être soumis.
- Règle 2 : la soumission déclenche la validation hiérarchique.

## Exception

### Action 1 - Saisir le pointage

- Cas : date déjà clôturée
  Effet attendu : saisie bloquée.
- Cas : chevauchement horaire
  Effet attendu : alerte et correction demandée.

### Action 2 - Soumettre le pointage

- Cas : imputation manquante
  Effet attendu : soumission refusée.
- Cas : utilisateur non autorisé
  Effet attendu : action refusée.

## Liens documentaires

- Relation -> [README du module](./README.md) : rattache la feuille de temps au module pointage.
- Relation -> [Matrice du module](../../matrices/09-temps-ressources-pointage.md) : aligne la saisie quotidienne avec les règles consolidées.
- Relation -> [user-flows.md](../../user-flows.md) : situe la saisie et la soumission dans le flux terrain.
- Relation -> [permissions.md](../../permissions.md) : borne les droits du chef d'équipe et du valideur.
- Relation -> [state-transitions.md](../../state-transitions.md) : formalise le passage brouillon -> soumis.

## Liens inter-modules

- Relation -> [07-execution-terrain-ordres-de-travail/01-creation-planification-ot.md](../07-execution-terrain-ordres-de-travail/01-creation-planification-ot.md) : le pointage reprend des OT et tâches planifiés.
- Relation -> [10-couts-analytiques-rentabilite/01-cout-reel-intervention.md](../10-couts-analytiques-rentabilite/01-cout-reel-intervention.md) : les heures soumises deviennent une base de coût réel.
