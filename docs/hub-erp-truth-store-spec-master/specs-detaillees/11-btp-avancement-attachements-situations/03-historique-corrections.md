# BTP / Avancement / Attachements / Situations - Historique et corrections

## Périmètre

Consulter l'historique des avancements / attachements / situations et gérer les corrections.

## Écran / action

### Action 1 - Consulter l'historique

- Écran : Historique chantier / affaire
- Action : Ouvrir l'historique

### Action 2 - Corriger une quantité valorisée

- Écran : Attachement / Situation
- Action : Appliquer une correction

## Input

### Action 1 - Consulter l'historique

- Champ / donnée : affaire, chantier, période
- Source : sélection utilisateur
- Caractère obligatoire : affaire ou chantier
- Remarque : filtres additionnels possibles

### Action 2 - Corriger une quantité valorisée

- Champ / donnée : quantité corrigée, motif, période
- Source : saisie utilisateur
- Caractère obligatoire : quantité, motif
- Remarque : correction tracée

## Traitement système

### Action 1 - Consulter l'historique

1. Vérifier les droits de consultation.
2. Charger les avancements, attachements et situations.
3. Ordonner les données par période.
4. Afficher l'historique consolidé.

### Action 2 - Corriger une quantité valorisée

1. Vérifier le statut de la situation (facturée ou non).
2. Enregistrer une ligne de correction.
3. Revaloriser les montants impactés.
4. Tracer le lien entre correction et document d'origine.

## Output

### Action 1 - Consulter l'historique

- Résultat visible : historique complet par période
- Statut affiché : n/a
- Trace créée : aucune
- Notification éventuelle : aucune

### Action 2 - Corriger une quantité valorisée

- Résultat visible : nouvelle valeur et correction visible
- Statut affiché : situation recalculée
- Trace créée : historique de correction
- Notification éventuelle : alerte aux parties prenantes

## Règle métier

### Action 1 - Consulter l'historique

- Règle 1 : les attachements et situations doivent rester historisés par période.
- Règle 2 : le suivi doit rester consultable après correction.

### Action 2 - Corriger une quantité valorisée

- Règle 1 : une même quantité ne doit pas être valorisée plusieurs fois.
- Règle 2 : les corrections doivent être explicitement tracées.

## Exception

### Action 1 - Consulter l'historique

- Cas : période inexistante
  Effet attendu : message explicite, aucun résultat.
- Cas : accès non autorisé
  Effet attendu : refus d'accès.

### Action 2 - Corriger une quantité valorisée

- Cas : situation déjà facturée
  Effet attendu : correction via mécanisme d'ajustement ou blocage.
- Cas : correction contradictoire
  Effet attendu : validation supplémentaire requise.

## Liens documentaires

- Relation -> [README du module](./README.md) : rattache l'historique et les corrections au module BTP.
- Relation -> [Matrice du module](../../matrices/11-btp-avancement-attachements-situations.md) : consolide les règles de traçabilité et de correction.
- Relation -> [state-transitions.md](../../state-transitions.md) : décrit les effets des corrections sur les états.
- Relation -> [edge-cases.md](../../edge-cases.md) : couvre les corrections contradictoires et les documents déjà facturés.
- Relation -> [business-rules.md](../../business-rules.md) : rappelle qu'une même quantité ne peut pas être valorisée deux fois.

## Liens inter-modules

- Relation -> [10-couts-analytiques-rentabilite/02-consolidation-cout-complet.md](../10-couts-analytiques-rentabilite/02-consolidation-cout-complet.md) : une correction BTP peut modifier les coûts consolidés.
- Relation -> [12-facturation/03-consultation-correction-facture.md](../12-facturation/03-consultation-correction-facture.md) : la correction de situation doit rester alignée avec les corrections de facture.
