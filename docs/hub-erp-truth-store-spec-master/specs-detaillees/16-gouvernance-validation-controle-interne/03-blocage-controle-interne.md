# Gouvernance / Validation / Contrôle interne - Blocage et contrôle interne

## Périmètre

Blocage des actions sensibles tant que la validation requise n'est pas obtenue.

## Écran / action

### Action 1 - Tenter une action bloquée

- Écran : Fiche d'objet (offre, budget, demande d'achat)
- Action : Exécuter l'action dépendante (envoyer, commander, engager)

### Action 2 - Reprendre l'action après validation

- Écran : Fiche d'objet
- Action : Reprendre l'action une fois validé

## Input

### Action 1 - Tenter une action bloquée

- Champ / donnée : Objet concerné ; Source : utilisateur habilité ; Caractère obligatoire : oui ; Remarque : doit être en état validé.
- Champ / donnée : Action cible ; Source : utilisateur habilité ; Caractère obligatoire : oui ; Remarque : dépend du type d'objet.

### Action 2 - Reprendre l'action après validation

- Champ / donnée : Objet validé ; Source : utilisateur habilité ; Caractère obligatoire : oui ; Remarque : validation complète exigée.

## Traitement système

### Action 1 - Tenter une action bloquée

1. Vérifier l'état de validation de l'objet.
2. Vérifier les droits de l'utilisateur.
3. Bloquer l'action si la validation est incomplète.
4. Afficher la raison du blocage et l'étape manquante.
5. Tracer l'événement de blocage.

### Action 2 - Reprendre l'action après validation

1. Vérifier que toutes les validations requises sont obtenues.
2. Autoriser l'action demandée.
3. Mettre à jour le statut lié à l'action.
4. Tracer l'action exécutée.

## Output

### Action 1 - Tenter une action bloquée

- Résultat visible : Action refusée.
- Statut affiché : Statut inchangé avec motif.
- Trace créée : Log de blocage.
- Notification éventuelle : Aucune par défaut.

### Action 2 - Reprendre l'action après validation

- Résultat visible : Action exécutée.
- Statut affiché : Statut mis à jour.
- Trace créée : Historique de l'action.
- Notification éventuelle : Acteurs concernés informés si applicable.

## Règle métier

### Action 1 - Tenter une action bloquée

- Règle 1 : Une action dépendante d'une validation préalable doit être bloquée tant que cette validation n'est pas obtenue.
- Règle 2 : Les contrôles internes empêchent les engagements hors procédure.

### Action 2 - Reprendre l'action après validation

- Règle 1 : L'action devient possible uniquement après validation complète.
- Règle 2 : La reprise doit conserver la traçabilité du blocage initial.

## Exception

### Action 1 - Tenter une action bloquée

- Cas : Validation partielle ; Effet attendu : blocage avec indication de l'étape manquante.
- Cas : Valideur absent ; Effet attendu : action bloquée jusqu'à décision.

### Action 2 - Reprendre l'action après validation

- Cas : Validation expirée ; Effet attendu : resoumission requise.
- Cas : Objet annulé après validation ; Effet attendu : action refusée.
## Liens documentaires

- Relation -> [README du module](./README.md) : porte d’entrée du module Gouvernance / Validation / Contrôle interne
- Relation -> [Matrice 16-gouvernance-validation-controle-interne.md](../../matrices/16-gouvernance-validation-controle-interne.md) : correspondance consolidée entre concept, user story, règle métier et flux
- Relation -> [use-cases.md](../../use-cases.md) : cas d’usage de référence du module appliqués à cette fiche
- Relation -> [user-stories.md](../../user-stories.md) : attentes exprimées côté utilisateur appliqués à cette fiche
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences fonctionnelles à décliner appliqués à cette fiche
- Relation -> [business-rules.md](../../business-rules.md) : règles métier structurantes appliqués à cette fiche
- Relation -> [permissions.md](../../permissions.md) : habilitations et rôles associés appliqués à cette fiche
- Relation -> [state-transitions.md](../../state-transitions.md) : transitions d’état concernées appliqués à cette fiche
- Relation -> [edge-cases.md](../../edge-cases.md) : cas limites à rejouer en recette appliqués à cette fiche
- Relation -> [user-flows.md](../../user-flows.md) : parcours opérationnels de référence appliqués à cette fiche

## Liens inter-modules

- Relation -> [02-da-validation.md](../../05-achats/02-da-validation.md) : une DA non validée doit être bloquée par le contrôle interne
- Relation -> [03-consultation-correction-facture.md](../../12-facturation/03-consultation-correction-facture.md) : la correction de facture peut être bloquée sans autorisation explicite
- Relation -> [03-risques-cockpit-projet.md](../../18-vue-transverse-affaire-projet/03-risques-cockpit-projet.md) : les blocages critiques doivent apparaître dans le cockpit projet

