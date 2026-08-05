# Temps / Ressources / Pointage - Imputation des ressources

## Périmètre

Imputer le temps et les ressources utilisées sur les objets métier.

## Écran / action

### Action 1 - Imputer les heures

- Écran : Pointage quotidien / détail
- Action : Affecter heures à affaire/OT/tâche

### Action 2 - Déclarer les ressources

- Écran : Pointage quotidien / ressources
- Action : Enregistrer engins, véhicules, outils utilisés

## Input

### Action 1 - Imputer les heures

- Champ / donnée : affaire / chantier / OT / tâche
- Source : sélection utilisateur
- Caractère obligatoire : oui
- Remarque : objet doit être actif

- Champ / donnée : heures par ligne
- Source : saisie utilisateur
- Caractère obligatoire : oui
- Remarque : total doit correspondre au jour

### Action 2 - Déclarer les ressources

- Champ / donnée : engin / véhicule / outil
- Source : sélection utilisateur
- Caractère obligatoire : non
- Remarque : selon usage réel

- Champ / donnée : durée d'utilisation
- Source : saisie utilisateur
- Caractère obligatoire : oui
- Remarque : sert au coût analytique

## Traitement système

### Action 1 - Imputer les heures

1. Vérifier les droits d'imputation sur l'objet.
2. Vérifier que l'objet est actif et accessible.
3. Enregistrer les lignes d'imputation.
4. Préparer la donnée pour coût analytique.

### Action 2 - Déclarer les ressources

1. Vérifier disponibilité et affectation des ressources si requis.
2. Enregistrer l'utilisation des ressources.
3. Lier l'usage au pointage et à l'objet métier.
4. Historiser l'utilisation.

## Output

### Action 1 - Imputer les heures

- Résultat visible : lignes d'imputation visibles
- Statut affiché : Brouillon / Soumis
- Trace créée : historique d'imputation
- Notification éventuelle : aucune

### Action 2 - Déclarer les ressources

- Résultat visible : ressources déclarées
- Statut affiché : Brouillon / Soumis
- Trace créée : historique d'utilisation
- Notification éventuelle : aucune

## Règle métier

### Action 1 - Imputer les heures

- Règle 1 : chaque heure doit être imputée à un objet analytique.
- Règle 2 : l'objet d'imputation doit être valide et actif.

### Action 2 - Déclarer les ressources

- Règle 1 : les ressources non humaines doivent être imputées si utilisées.
- Règle 2 : l'imputation alimente le coût réel.

## Exception

### Action 1 - Imputer les heures

- Cas : OT ou affaire clos
  Effet attendu : imputation refusée.
- Cas : total d'heures incohérent
  Effet attendu : alerte et correction requise.

### Action 2 - Déclarer les ressources

- Cas : ressource non affectée au chantier
  Effet attendu : alerte ou blocage selon règle.
- Cas : ressource inconnue
  Effet attendu : saisie refusée.

## Liens documentaires

- Relation -> [README du module](./README.md) : situe l'imputation des ressources dans le module de pointage.
- Relation -> [Matrice du module](../../matrices/09-temps-ressources-pointage.md) : relie la ventilation des heures aux objets métier.
- Relation -> [business-rules.md](../../business-rules.md) : formalise l'obligation de rattachement à un objet actif.
- Relation -> [state-transitions.md](../../state-transitions.md) : précise le moment où l'imputation passe de brouillon à validable.
- Relation -> [edge-cases.md](../../edge-cases.md) : couvre les objets inactifs, les durées incohérentes et les ressources non disponibles.

## Liens inter-modules

- Relation -> [07-execution-terrain-ordres-de-travail/02-execution-terrain.md](../07-execution-terrain-ordres-de-travail/02-execution-terrain.md) : les heures imputées reprennent l'exécution réelle de l'OT.
- Relation -> [10-couts-analytiques-rentabilite/01-cout-reel-intervention.md](../10-couts-analytiques-rentabilite/01-cout-reel-intervention.md) : les heures et ressources imputées alimentent le coût réel.
