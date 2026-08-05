# Gouvernance / Validation / Contrôle interne - Circuits de validation

## Périmètre

Définition et application des circuits de validation pour offres, budgets et demandes d'achat.

## Écran / action

### Action 1 - Configurer un circuit de validation

- Écran : Paramétrage des validations
- Action : Enregistrer un circuit de validation

### Action 2 - Soumettre un objet à validation

- Écran : Fiche offre / budget / demande d'achat
- Action : Soumettre à validation

## Input

### Action 1 - Configurer un circuit de validation

- Champ / donnée : Type d'objet (offre, budget, demande d'achat) ; Source : administrateur fonctionnel ; Caractère obligatoire : oui ; Remarque : un circuit par type d'objet.
- Champ / donnée : Niveaux de validation et rôles ; Source : administrateur fonctionnel ; Caractère obligatoire : oui ; Remarque : ordre et seuils éventuels.
- Champ / donnée : Règles de seuil ; Source : administrateur fonctionnel ; Caractère obligatoire : non ; Remarque : active des niveaux supplémentaires.

### Action 2 - Soumettre un objet à validation

- Champ / donnée : Objet à valider ; Source : utilisateur habilité ; Caractère obligatoire : oui ; Remarque : doit être en statut soumettable.
- Champ / donnée : Commentaire de soumission ; Source : utilisateur habilité ; Caractère obligatoire : non ; Remarque : visible aux valideurs.

## Traitement système

### Action 1 - Configurer un circuit de validation

1. Vérifier que l'utilisateur a le rôle d'administrateur fonctionnel.
2. Vérifier la cohérence des niveaux et des seuils.
3. Enregistrer le circuit et l'associer au type d'objet.
4. Historiser la configuration et la date d'effet.
5. Rendre le circuit actif pour les nouvelles soumissions.

### Action 2 - Soumettre un objet à validation

1. Vérifier les droits de soumission et l'état de l'objet.
2. Contrôler les prérequis (champs obligatoires, pièces requises).
3. Changer le statut de l'objet en "Soumis" ou "En validation".
4. Créer les tâches de validation par niveau.
5. Notifier les valideurs concernés.

## Output

### Action 1 - Configurer un circuit de validation

- Résultat visible : Circuit enregistré et listé.
- Statut affiché : Circuit actif.
- Trace créée : Historique de configuration.
- Notification éventuelle : Aucun par défaut.

### Action 2 - Soumettre un objet à validation

- Résultat visible : Objet soumis.
- Statut affiché : Soumis / En validation.
- Trace créée : Journal de soumission avec auteur et date.
- Notification éventuelle : Valideurs informés.

## Règle métier

### Action 1 - Configurer un circuit de validation

- Règle 1 : Les circuits sont définis par type d'objet.
- Règle 2 : Un seuil peut imposer un niveau de validation supplémentaire.

### Action 2 - Soumettre un objet à validation

- Règle 1 : Un objet ne peut être soumis que s'il est complet.
- Règle 2 : Une action dépendante d'une validation préalable est bloquée tant que la validation n'est pas obtenue.

## Exception

### Action 1 - Configurer un circuit de validation

- Cas : Rôle non autorisé ; Effet attendu : accès refusé.
- Cas : Circuit incohérent (niveau manquant) ; Effet attendu : sauvegarde bloquée avec message d'erreur.

### Action 2 - Soumettre un objet à validation

- Cas : Objet incomplet ; Effet attendu : soumission refusée et champs en erreur.
- Cas : Circuit absent ; Effet attendu : soumission bloquée, alerte à l'administrateur.
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

- Relation -> [03-validation-et-envoi-offre.md](../../02-avant-vente/03-validation-et-envoi-offre.md) : les offres suivent un circuit avant diffusion au client
- Relation -> [02-validation-revision-budget.md](../../04-budget-pilotage-financier-projet/02-validation-revision-budget.md) : les budgets et révisions doivent passer par un circuit d’approbation
- Relation -> [02-da-validation.md](../../05-achats/02-da-validation.md) : les demandes d’achat sont soumises au même principe de validation contrôlée

