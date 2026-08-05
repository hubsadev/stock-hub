# Coûts analytiques / Rentabilité - Coût réel d'une intervention

## Périmètre

Calculer et consulter le coût réel d'une intervention à partir des imputations validées (temps, matériels, déplacements, moyens, sous-traitance).

## Écran / action

### Action 1 - Lancer le calcul du coût réel

- Écran : Fiche intervention / onglet Coût analytique
- Action : Lancer le calcul

### Action 2 - Consulter le coût réel

- Écran : Fiche intervention / onglet Coût analytique
- Action : Ouvrir la synthèse

## Input

### Action 1 - Lancer le calcul du coût réel

- Champ / donnée : intervention, période analytique, option "recalculer"
- Source : sélection utilisateur
- Caractère obligatoire : intervention, période
- Remarque : la période sert au découpage analytique si applicable

### Action 2 - Consulter le coût réel

- Champ / donnée : intervention
- Source : sélection utilisateur
- Caractère obligatoire : oui
- Remarque : peut afficher le dernier calcul disponible

## Traitement système

### Action 1 - Lancer le calcul du coût réel

1. Vérifier les droits d'accès au coût analytique.
2. Vérifier la disponibilité des imputations validées (pointages, consommations, déplacements, sous-traitance).
3. Agréger les coûts par catégorie et par intervention.
4. Enregistrer le coût réel et le détail par composante.
5. Mettre à jour la trace de calcul (date, auteur, version).

### Action 2 - Consulter le coût réel

1. Vérifier les droits d'accès.
2. Récupérer le dernier coût calculé et son détail.
3. Afficher la synthèse et les composantes.
4. Afficher l'état de fraîcheur du calcul.

## Output

### Action 1 - Lancer le calcul du coût réel

- Résultat visible : coût réel calculé par composante
- Statut affiché : calculé / mis à jour
- Trace créée : entrée d'historique de calcul
- Notification éventuelle : alerte si données incomplètes

### Action 2 - Consulter le coût réel

- Résultat visible : synthèse coût réel et détail par composante
- Statut affiché : dernier calcul + date
- Trace créée : aucune
- Notification éventuelle : indicateur "données partielles" si besoin

## Règle métier

### Action 1 - Lancer le calcul du coût réel

- Règle 1 : le coût réel agrège au minimum main-d'œuvre, matériel consommé, sous-traitance, déplacement et moyens utilisés.
- Règle 2 : les coûts consolidés s'appuient sur les données validées en amont.

### Action 2 - Consulter le coût réel

- Règle 1 : le coût analytique dépend de la qualité des imputations.
- Règle 2 : toute composante de coût doit être rattachée à un objet analytique identifiable.

## Exception

### Action 1 - Lancer le calcul du coût réel

- Cas : imputations manquantes ou non validées
  Effet attendu : calcul partiel avec avertissement.
- Cas : intervention non autorisée pour l'utilisateur
  Effet attendu : action bloquée avec message d'accès.

### Action 2 - Consulter le coût réel

- Cas : coût jamais calculé
  Effet attendu : message "aucun calcul disponible".
- Cas : intervention clôturée mais données incomplètes
  Effet attendu : affichage partiel avec indicateur.

## Liens documentaires

- Relation -> [README du module](./README.md) : situe ce calcul comme brique d'entrée du coût analytique.
- Relation -> [Matrice du module](../../matrices/10-couts-analytiques-rentabilite.md) : relie les sources de coût et les règles d'agrégation.
- Relation -> [user-stories.md](../../user-stories.md) : formalise le besoin métier de lecture du coût réel par intervention.
- Relation -> [state-transitions.md](../../state-transitions.md) : décrit l'actualisation du calcul après validation de nouvelles données.
- Relation -> [edge-cases.md](../../edge-cases.md) : couvre les imputations manquantes et les calculs partiels.

## Liens inter-modules

- Relation -> [07-execution-terrain-ordres-de-travail/02-execution-terrain.md](../07-execution-terrain-ordres-de-travail/02-execution-terrain.md) : l'exécution terrain alimente les coûts consommés.
- Relation -> [09-temps-ressources-pointage/03-validation-consultation-pointage.md](../09-temps-ressources-pointage/03-validation-consultation-pointage.md) : seuls les pointages validés doivent entrer dans le calcul.
- Relation -> [09-temps-ressources-pointage/02-imputation-ressources.md](../09-temps-ressources-pointage/02-imputation-ressources.md) : les heures et ressources imputées sont agrégées au coût réel.
